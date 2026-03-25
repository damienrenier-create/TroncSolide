"use client"

import { useEffect, useState } from "react";
import ExerciseBatchForm from "@/components/exercises/ExerciseBatchForm";
import SecondaryExerciseForm from "@/components/exercises/SecondaryExerciseForm";
import { Flame, Trophy, TrendingUp, History, Wallet, Award, Lock, TreePine, Calendar, Trash2, PlusCircle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { getLevelInfo } from "@/lib/constants/levels";
import { deleteSession } from "@/lib/actions/moderation";
import { useRouter } from "next/navigation";
import OnboardingModal from "./OnboardingModal";
import HistoryDetailsModal from "./HistoryDetailsModal";
import { getRecentBatches } from "@/lib/actions/exercise";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import BadgeModal from "@/components/badges/BadgeModal";

interface DashboardProps {
    userId: string;
    initialTarget: number;
    initialProgress: number;
    stats: any;
    trophiesData?: any;
    feedItems?: any[];
}

export default function DashboardClient({
    userId,
    initialTarget,
    initialProgress,
    stats,
    trophiesData,
    feedItems = []
}: DashboardProps) {
    const [showForm, setShowForm] = useState(false);
    const [showSecondaryForm, setShowSecondaryForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lostBadges, setLostBadges] = useState<any[]>([]);
    const [showOnboarding, setShowOnboarding] = useState(!stats.hasSeenOnboarding);
    const [recentBatches, setRecentBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
    const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({});
    const [swipingId, setSwipingId] = useState<string | null>(null);
    const [startX, setStartX] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (stats.recentLostBadges?.length > 0) {
            const seen = JSON.parse(localStorage.getItem("seenLostBadges") || "[]");
            const unseen = stats.recentLostBadges.filter((b: any) => !seen.includes(b.id));
            if (unseen.length > 0) {
                setLostBadges(unseen);
            }
        }
    }, [stats.recentLostBadges]);

    const dismissLostBadge = (id: string) => {
        setLostBadges(prev => prev.filter(b => b.id !== id));
        const seen = JSON.parse(localStorage.getItem("seenLostBadges") || "[]");
        localStorage.setItem("seenLostBadges", JSON.stringify([...seen, id]));
        setSwipeOffsets(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const handleSwipeStart = (e: React.PointerEvent, id: string) => {
        setSwipingId(id);
        setStartX(e.clientX);
    };

    const handleSwipeMove = (e: React.PointerEvent) => {
        if (!swipingId) return;
        const diff = e.clientX - startX;
        if (diff > 0) {
            setSwipeOffsets(prev => ({ ...prev, [swipingId]: diff }));
        }
    };

    const handleSwipeEnd = () => {
        if (!swipingId) return;
        const offset = swipeOffsets[swipingId] || 0;
        if (offset > 150) {
            dismissLostBadge(swipingId);
        } else {
            setSwipeOffsets(prev => ({ ...prev, [swipingId]: 0 }));
        }
        setSwipingId(null);
    };

    // 3. Logic for Next Objectives
    const getNextObjectives = () => {
        if (!trophiesData || !trophiesData.userStats) return [];
        
        const userStats = trophiesData.userStats;
        const myBadgeIds = new Set(stats.badges?.map((b: any) => b.badgeId) || []);

        const milestones = BADGE_DEFINITIONS.filter(b => 
            b.type === "FIRST_COME" && 
            !b.id.startsWith("RECORD_") && 
            !myBadgeIds.has(b.id)
        );

        const objectives = milestones.map(badge => {
            const match = badge.id.match(/\d+/);
            const targetValue = match ? parseInt(match[0]) : 0;
            let currentValue = 0;
            let unit = "";

            if (badge.id.includes("PUMP") || badge.id.includes("PUSHUP")) {
                unit = "pompes";
                if (badge.id.startsWith("SERIE_")) currentValue = userStats.allTime?.maxPushups || 0;
                else currentValue = userStats.allTime?.pushups || 0;
            } else if (badge.id.includes("SQUAT")) {
                unit = "squats";
                if (badge.id.startsWith("SERIE_")) currentValue = userStats.allTime?.maxSquats || 0;
                else currentValue = userStats.allTime?.squats || 0;
            } else if (badge.id.includes("PLANK")) {
                unit = "s";
                if (badge.id.startsWith("SERIE_")) currentValue = userStats.allTime?.maxPlank || 0;
                else currentValue = userStats.allTime?.plank || 0;
            }

            const percent = targetValue > 0 ? Math.min(100, Math.floor((currentValue / targetValue) * 100)) : 0;
            return { ...badge, currentValue, targetValue, unit, percent };
        });

        return objectives
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 3);
    };

    const nextObjectives = getNextObjectives();
    
    // Chargement initial des lots groupés
    useEffect(() => {
        async function loadBatches() {
            const res = await getRecentBatches();
            if (res.success && res.batches) {
                setRecentBatches(res.batches);
            }
        }
        loadBatches();
    }, []);

    const actualPercent = Math.round((initialProgress / initialTarget) * 100);
    const progressPercent = Math.min(actualPercent, 100);
    const isGoalReached = initialProgress >= initialTarget;

    let circleColor = "var(--primary)";
    let reactionTitle = "OBJECTIF ATTEINT ! 🏆";
    let reactionSub = `${actualPercent}% de l'objectif 🔥`;
    let reactionColor = "var(--secondary)";

    if (actualPercent >= 1000) {
        circleColor = "#ef4444"; // Red
        reactionTitle = "LÉGENDE VIVANTE ! 👑";
        reactionSub = `${actualPercent}% de l'objectif 🌌`;
        reactionColor = "#ef4444";
    } else if (actualPercent >= 500) {
        circleColor = "#8b5cf6"; // Purple
        reactionTitle = "MODE DIVIN ACTIVÉ ! ⚡";
        reactionSub = `${actualPercent}% de l'objectif 🌋`;
        reactionColor = "#8b5cf6";
    } else if (actualPercent >= 200) {
        circleColor = "#3b82f6"; // Blue
        reactionTitle = "OBJECTIF PULVÉRISÉ ! 🚀";
        reactionSub = `${actualPercent}% de l'objectif 💎`;
        reactionColor = "#3b82f6";
    } else if (actualPercent >= 100) {
        circleColor = "var(--secondary)"; // Green
        reactionTitle = "OBJECTIF ATTEINT ! 🏆";
        reactionSub = `${actualPercent}% de l'objectif 🔥`;
        reactionColor = "var(--secondary)";
    }
    const isEligible = stats.cagnotteProgress.isEligible && stats.inCagnotte;

    const levelInfo = getLevelInfo(stats.totalXP);
    const levelProgress = (levelInfo.progressXP / levelInfo.requiredXP) * 100;

    const currentUserId = userId;

    async function handleDeleteSession(id: string) {
        if (!confirm("Supprimer cette séance ? L'EXP sera retiré.")) return;
        setLoading(true);
        const res = await deleteSession(id);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error || "Erreur lors de la suppression");
        }
        setLoading(false);
    }

    return (
        <div className="container dashboard-container">
            {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}

            {/* NEW USER FAQ NOTIFICATION */}
            {(() => {
                const joinedAt = new Date(stats.joinedAt);
                const diffDays = Math.floor((new Date().getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 3) {
                    return (
                        <div className="glass-premium" style={{ 
                            padding: "1rem 1.5rem", 
                            background: "linear-gradient(90deg, var(--primary) 0%, #3b82f6 100%)", 
                            color: "white", 
                            borderRadius: "16px", 
                            marginBottom: "1rem", 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)",
                            animation: "pulseShadow 2s infinite"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "10px" }}>
                                    <HelpCircle size={20} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: "0.9rem", fontWeight: "900", margin: 0 }}>BIENVENUE SUR TRONC SOLIDE ! 🌳</h4>
                                    <p style={{ fontSize: "0.75rem", margin: 0, opacity: 0.9, fontWeight: "600" }}>Pense à lire les règles dans la FAQ pour bien commencer.</p>
                                </div>
                            </div>
                            <Link href="/faq" style={{ background: "white", color: "var(--primary)", padding: "8px 16px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "900", textDecoration: "none" }}>
                                LIRE LA FAQ
                            </Link>
                        </div>
                    );
                }
                return null;
            })()}

            {/* 1. COMPACT USER BANNER [NEW] */}
            <div className="glass-premium" style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: "1rem 1.25rem", 
                borderRadius: "20px", 
                marginBottom: "0.75rem", 
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.85)",
                border: "1px solid rgba(0,0,0,0.03)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)"
            }}>
                <Link href={`/profile/${encodeURIComponent(stats.nickname)}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                    <div style={{ fontSize: "1.75rem", background: "rgba(0,0,0,0.03)", width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {levelInfo.emoji}
                    </div>
                    <div>
                        <div style={{ fontSize: "0.65rem", fontWeight: "900", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>NV. {levelInfo.level}</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: "900" }}>{levelInfo.name}</div>
                    </div>
                </Link>
                <div style={{ textAlign: "right", display: "flex", gap: "1.25rem", alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.55rem", fontWeight: "900", color: "var(--text-muted)", letterSpacing: "0.5px" }}>XP TOTAL</div>
                        <div style={{ fontSize: "1rem", fontWeight: "900", color: "var(--primary)" }}>{stats.totalXP} ✨</div>
                    </div>
                    <Link href="/league" className={`streak-badge ${stats.streak > 0 ? 'active' : ''}`} style={{ margin: 0, padding: "5px 12px", borderRadius: "12px", textDecoration: "none" }}>
                        <Flame size={14} fill={stats.streak > 0 ? "currentColor" : "none"} />
                        <span style={{ fontSize: "0.8rem", fontWeight: "900" }}>{stats.streak}j</span>
                    </Link>
                </div>
            </div>

            {/* 2. USER GAZETTE (Filtered) [NEW] */}
            {(() => {
                const userEvents = feedItems?.filter((item: any) => item.user.id === userId).slice(0, 2) || [];
                if (userEvents.length === 0) return null;
                return (
                    <section className="glass" style={{ padding: "0.85rem", marginBottom: "0.75rem", background: "rgba(255,255,255,0.4)" }}>
                        <div className="card-header" style={{ marginBottom: "0.65rem", fontSize: "0.65rem" }}>
                            <TrendingUp size={14} className="text-primary" />
                            <span>Tes dernières activités</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {userEvents.map((event: any) => (
                                <div key={event.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8rem", background: "rgba(255,255,255,0.3)", padding: "8px 12px", borderRadius: "12px" }}>
                                    <div style={{ opacity: 0.8 }}>
                                        {event.type === "LEVEL_UP" ? "✨" : event.type === "BADGE_LOST" ? "🚨" : "🏆"}
                                    </div>
                                    <div style={{ flex: 1, fontWeight: 700, fontSize: "0.75rem" }}>
                                        {event.type === "LEVEL_UP" ? `Niveau ${event.level} atteint !` : 
                                         event.type === "BADGE_LOST" ? `Trophée perdu : ${event.badge?.name}` : 
                                         `Nouveau trophée : ${event.badge?.name}`}
                                    </div>
                                    {event.badgeId && (
                                        <Link href={`/badges?highlight=${event.badgeId}`} style={{ fontSize: "1.2rem", textDecoration: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>
                                            {event.badge?.icon || "🏆"}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })()}

            {/* LOST BADGE TOASTS */}
            {lostBadges.length > 0 && (
                <div 
                    style={{ position: "fixed", top: "80px", right: "20px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 9999 }}
                    onPointerMove={handleSwipeMove}
                    onPointerUp={handleSwipeEnd}
                    onPointerLeave={handleSwipeEnd}
                >
                    {lostBadges.map(alert => {
                        const offset = swipeOffsets[alert.id] || 0;
                        const opacity = Math.max(0, 1 - (offset / 300));

                        return (
                            <div 
                                key={alert.id} 
                                className="glass" 
                                onPointerDown={(e) => handleSwipeStart(e, alert.id)}
                                style={{ 
                                    padding: "1rem", 
                                    borderLeft: "4px solid #ef4444", 
                                    background: "rgba(15, 23, 42, 0.95)", 
                                    backdropFilter: "blur(10px)", 
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)", 
                                    borderRadius: "12px", 
                                    width: "300px", 
                                    animation: "slideInRight 0.3s ease-out",
                                    transform: `translateX(${offset}px)`,
                                    opacity: opacity,
                                    touchAction: "none",
                                    position: "relative",
                                    transition: swipingId === alert.id ? "none" : "transform 0.3s ease, opacity 0.3s ease"
                                }}
                            >
                                <button 
                                    onClick={() => dismissLostBadge(alert.id)}
                                    style={{ 
                                        position: "absolute", 
                                        top: "8px", 
                                        right: "8px", 
                                        background: "none", 
                                        border: "none", 
                                        color: "white", 
                                        opacity: 0.5, 
                                        cursor: "pointer", 
                                        fontSize: "1.2rem" 
                                    }}
                                >
                                    ×
                                </button>

                                <div style={{ fontWeight: 900, color: "#ef4444", marginBottom: "4px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Flame size={16} /> 🚨 TROPHÉE VOLÉ !
                                </div>
                                <p style={{ fontSize: "0.80rem", margin: "0 0 10px 0", color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>
                                    {alert.thief ? (
                                        <>
                                            <Link href={`/u/${alert.thief.id}`} className="text-primary" style={{ fontWeight: 900, textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>
                                                @{alert.thief.nickname}
                                            </Link>{" "}
                                            vient de t'arracher le titre :
                                        </>
                                    ) : (
                                        "On vient de t'arracher le titre :"
                                    )}
                                    <br/>
                                    <Link href={`/badges?highlight=${alert.badge?.id}`} style={{ color: "white", fontWeight: 800, textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                                        <strong>{alert.badge?.icon} {alert.badge?.name}</strong>
                                    </Link>.
                                </p>
                                <button onClick={() => dismissLostBadge(alert.id)} style={{ width: "100%", background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 8px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: 800, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"} onMouseOut={e => e.currentTarget.style.background = "none"}>Ça ne se passera pas comme ça !</button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 0. Active Event Banner (Anniversary Duel) */}
            {stats.activeEvent && stats.activeEvent.type === "ANNIVERSARY" && (
                <section className="glass event-banner anniversary-duel-card" style={{ marginBottom: "1.5rem", padding: "1.5rem", border: "2px solid var(--accent)", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)", borderRadius: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                            <div style={{ background: "var(--accent)", padding: "8px", borderRadius: "12px", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Award size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: "1rem", fontWeight: "900", color: "#1e293b", margin: 0 }}>DUEL D'ANNIVERSAIRE 🎂</h4>
                                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", margin: 0 }}>{stats.activeEvent.star.nickname} vs Le Reste du Monde</p>
                            </div>
                        </div>
                        <div style={{ background: "var(--accent)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "900", boxShadow: "0 4px 10px rgba(139, 92, 246, 0.3)" }}>
                            X5 XP SI ELLE GAGNE
                        </div>
                    </div>

                    <div style={{ position: "relative", height: "12px", background: "rgba(0,0,0,0.05)", borderRadius: "6px", overflow: "hidden", marginBottom: "0.5rem" }}>
                        <div style={{ 
                            position: "absolute", 
                            left: 0, 
                            height: "100%", 
                            width: `${Math.min(100, (stats.activeEvent.star.reps / Math.max(1, (stats.activeEvent.topChallenger?.value || 0) + stats.activeEvent.star.reps)) * 100)}%`, 
                            background: "var(--accent)",
                            transition: "width 1s ease-out"
                        }} />
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "800" }}>
                        <div style={{ color: "var(--accent)" }}>{stats.activeEvent.star.nickname} : {stats.activeEvent.star.reps} reps</div>
                        <div style={{ color: "var(--text-muted)" }}>Meilleur Challenger : {stats.activeEvent.topChallenger?.value || 0} reps</div>
                    </div>

                    <p style={{ fontSize: "0.7rem", marginTop: "1rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", fontWeight: "600", margin: "1rem 0 0" }}>
                        {stats.activeEvent.star.reps >= (stats.activeEvent.topChallenger?.value || 0) 
                            ? "👑 La Star domine actuellement ! Battez-la pour l'XP x3 !" 
                            : "🏹 La Star est talonnée ! Les chasseurs profitent de l'XP x3 !"}
                    </p>
                </section>
            )}

            {/* Other Events Banner */}
            {stats.activeEvent && stats.activeEvent.type !== "ANNIVERSARY" && (
                <section className="glass event-banner" style={{ marginBottom: "1.5rem", padding: "1rem", borderColor: "var(--accent)", borderLeftWidth: "4px" }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <Calendar className="text-accent" size={24} />
                        <div>
                            <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--accent)" }}>ÉVÉNEMENT ACTIF : {stats.activeEvent.title}</h4>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{stats.activeEvent.description}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Daily Hero Section - Circular Impact */}
            <Link href="/faq#volume" className="hero-card" style={{ display: "block", textDecoration: "none", color: "inherit", cursor: "pointer", marginBottom: "1rem" }}>
                <div className="hero-header">
                    <div className="target-label">OBJECTIF DU JOUR</div>
                    <div style={{ fontSize: "0.6rem", fontWeight: "900", opacity: 0.6, marginTop: "2px", textTransform: "uppercase", letterSpacing: "1px" }}>volume d'effort</div>
                </div>

                <div className="progress-circular-container">
                    <svg style={{ position: "absolute", width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                        <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="12" />
                        <circle
                            cx="110" cy="110" r="100" fill="none" stroke={circleColor} strokeWidth="12"
                            strokeDasharray="628" strokeDashoffset={628 - (628 * progressPercent) / 100}
                            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease-in-out, stroke 0.5s ease" }}
                        />
                    </svg>

                    <div className="progress-display" style={{ zIndex: 1, position: "relative", textAlign: "center" }}>
                        <div className="progress-value" style={{ fontSize: "3rem" }}>{initialProgress} / {initialTarget}</div>
                        <div className="progress-total" style={{ fontSize: "1rem", marginTop: "-5px", fontWeight: "900" }}>
                            {Math.abs(initialProgress) <= 1 ? "EFFORT" : "EFFORTS"}
                        </div>
                    </div>
                </div>

                {isGoalReached && (
                    <div className="goal-reached" style={{ marginTop: "1.5rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px", animation: "slideDown 0.3s ease-out" }}>
                        <div style={{ color: reactionColor, fontWeight: 900, fontSize: "1.15rem", textTransform: "uppercase", letterSpacing: "1px", filter: `drop-shadow(0 2px 8px ${reactionColor}40)` }}>
                            {reactionTitle}
                        </div>
                        <div style={{ color: "var(--foreground)", fontWeight: 800, fontSize: "0.9rem", opacity: 0.9 }}>
                            {reactionSub}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: "2rem" }}>
                    {!showForm && !showSecondaryForm ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button
                                className={`btn-primary start-button ${!isGoalReached ? 'btn-pulse' : ''}`}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowForm(true); }}
                            >
                                LOGGER UNE SÉANCE
                            </button>
                            <button
                                className="glass-hover"
                                style={{ 
                                    width: "100%", borderRadius: "16px", padding: "0.85rem", fontSize: "0.85rem", fontWeight: "900", 
                                    background: "rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.05)", color: "var(--foreground)",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer"
                                }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSecondaryForm(true); }}
                            >
                                <PlusCircle size={16} className="text-primary" /> Pour en faire plus ✨
                            </button>
                        </div>
                    ) : showForm ? (
                        <div className="form-portal glass-premium" style={{ padding: "0", borderRadius: "24px", border: "1px solid var(--primary)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: "1.5rem" }}>
                                <ExerciseBatchForm onSuccess={() => setShowForm(false)} />
                            </div>
                            <div style={{ textAlign: "center", paddingBottom: "1rem" }}>
                                <button className="btn-ghost" style={{ fontSize: "0.75rem" }} onClick={() => setShowForm(false)}>Plus tard</button>
                            </div>
                        </div>
                    ) : (
                        <div className="form-portal glass-premium" style={{ padding: "1.5rem", borderRadius: "24px", border: "1px solid var(--secondary)" }} onClick={e => e.stopPropagation()}>
                            <header style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--secondary)" }}>Pour en faire plus</h3>
                                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Tractions, Course, Étirements...</p>
                            </header>
                            <SecondaryExerciseForm onSuccess={() => setShowSecondaryForm(false)} />
                            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                                <button className="btn-ghost" style={{ fontSize: "0.75rem" }} onClick={() => setShowSecondaryForm(false)}>Plus tard</button>
                            </div>
                        </div>
                    )}
                </div>
            </Link>

            {/* PROCHAINS OBJECTIFS - Motivation Booster */}
            {nextObjectives.length > 0 && (
                <section className="glass" style={{ marginBottom: "1rem", padding: "1.25rem" }}>
                    <div className="card-header" style={{ marginBottom: "1rem" }}>
                        <TrendingUp size={18} className="text-secondary" />
                        <span>Prochains objectifs</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {nextObjectives.map((badge: any) => (
                            <div 
                                key={badge.id} 
                                className="glass-premium clickable-card"
                                onClick={() => setSelectedBadge(badge)}
                                style={{ padding: "0.85rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "12px" }}
                            >
                                <div style={{ fontSize: "1.5rem", width: "45px", height: "45px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {badge.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                                        <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>{badge.name}</div>
                                        <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--text-muted)" }}>{badge.currentValue} / {badge.targetValue} {badge.unit}</div>
                                    </div>
                                    <div className="level-mini-bar">
                                        <div className="level-fill" style={{ width: `${badge.percent}%`, background: "var(--secondary)", transition: "width 1s ease-out" }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 4. Recent History */}
            <section className="glass history-card" style={{ marginBottom: "1rem" }}>
                <div className="card-header">
                    <History size={18} />
                    <span>Historique Récent</span>
                </div>
                <div className="history-list" style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                    {recentBatches.length > 0 ? recentBatches.map((batch: any) => (
                        <div 
                            key={batch.id} 
                            className="history-item clickable-card"
                            onClick={() => setSelectedBatch(batch)}
                            style={{ cursor: "pointer", marginBottom: "8px" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <div className="history-icon" style={{ fontSize: "1.2rem" }}>
                                        {batch.exercises.length > 1 ? '📦' : (batch.exercises[0]?.type === 'PUSHUP' ? '💪' : batch.exercises[0]?.type === 'SQUAT' ? '🦵' : '🛡️')}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            {batch.exercises.length > 1 ? `${batch.exercises.length} EXERCICES` : (batch.exercises[0]?.type === 'PUSHUP' ? 'Pompes' : batch.exercises[0]?.type === 'SQUAT' ? 'Squats' : 'Gainage')}
                                        </div>
                                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "600" }}>
                                            {new Date(batch.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • {batch.exercises.reduce((acc: number, ex: any) => acc + ex.value, 0)} {batch.exercises[0]?.type === 'PUSHUP' || batch.exercises[0]?.type === 'SQUAT' ? 'reps' : 's'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <div style={{ fontSize: "0.85rem", fontWeight: "900", color: "var(--primary)" }}>+{batch.xpTotal} XP</div>
                                    <div className="text-muted" style={{ opacity: 0.3 }}><History size={14} /></div>
                                </div>
                            </div>
                            {batch.mood && (
                                <div style={{ marginTop: "0.4rem", paddingLeft: "3rem", fontSize: "0.7rem", fontStyle: "italic", color: "var(--text-muted)", opacity: 0.7 }}>
                                    "{batch.mood}"
                                </div>
                            )}
                        </div>
                    )) : (
                        <p className="empty-text" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>L'historique est vide.</p>
                    )}
                </div>

                {selectedBatch && (
                    <HistoryDetailsModal 
                        isOpen={!!selectedBatch}
                        batch={selectedBatch}
                        onClose={() => setSelectedBatch(null)}
                    />
                )}

                {selectedBadge && (
                    <BadgeModal 
                        badge={selectedBadge} 
                        onClose={() => setSelectedBadge(null)} 
                        userStats={trophiesData?.userStats}
                        records={trophiesData?.records}
                    />
                )}
            </section>

            {/* TOP LIGUE [MOVED TO BOTTOM] */}
            <section className="glass" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
                <Link href="/league" className="card-header clickable-card" style={{ marginBottom: "1rem", textDecoration: "none", color: "inherit", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Trophy size={18} className="text-primary" />
                        <span>Top Ligue</span>
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: "900", color: "var(--primary)" }}>VOIR TOUT ➔</span>
                </Link>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {stats.top3.map((player: any, i: number) => (
                        <Link href={`/profile/${player.nickname}`} key={i} className="glass-premium clickable-card" style={{ 
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: i === 0 ? "rgba(217, 119, 6, 0.05)" : "rgba(255,255,255,0.02)", 
                            padding: "10px 15px", 
                            borderRadius: "16px",
                            textDecoration: "none",
                            color: "inherit",
                            border: i === 0 ? "1px solid rgba(217, 119, 6, 0.2)" : "1px solid transparent"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "1.1rem" }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{player.nickname}</span>
                            </div>
                            <span style={{ fontWeight: 900, color: i === 0 ? "var(--primary)" : "var(--text-muted)" }}>{player.totalXP} XP</span>
                        </Link>
                    ))}
                </div>
            </section>

            <style jsx>{`
                .level-mini-bar {
                    height: 4px;
                    background: rgba(0,0,0,0.05);
                    border-radius: 2px;
                    margin-top: 4px;
                    overflow: hidden;
                }
                .level-fill {
                    height: 100%;
                    background: var(--primary);
                    box-shadow: 0 0 10px var(--primary);
                }
                .locked {
                    position: relative;
                    opacity: 0.6;
                    filter: grayscale(1);
                }
                .status-locked {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                }
                .event-banner {
                    box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
                }
                .clickable-card {
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .clickable-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
