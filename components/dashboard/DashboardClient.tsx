"use client"

import { useEffect, useState } from "react";
import ExerciseBatchForm from "@/components/exercises/ExerciseBatchForm";
import SecondaryExerciseForm from "@/components/exercises/SecondaryExerciseForm";
import { Flame, Trophy, TrendingUp, History, Award, PlusCircle, HelpCircle, ChevronRight } from "lucide-react";
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
    const [welcomeDismissed, setWelcomeDismissed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (stats.recentLostBadges?.length > 0) {
            const seen = JSON.parse(localStorage.getItem("seenLostBadges") || "[]");
            const unseen = stats.recentLostBadges.filter((b: any) => !seen.includes(b.id));
            if (unseen.length > 0) {
                setLostBadges(unseen);
            }
        }
        setWelcomeDismissed(localStorage.getItem("welcomeBannerDismissed") === "true");
    }, [stats.recentLostBadges]);

    const dismissLostBadge = (id: string) => {
        if (id === "welcome") {
            setWelcomeDismissed(true);
            localStorage.setItem("welcomeBannerDismissed", "true");
        } else {
            setLostBadges(prev => prev.filter(b => b.id !== id));
            const seen = JSON.parse(localStorage.getItem("seenLostBadges") || "[]");
            localStorage.setItem("seenLostBadges", JSON.stringify([...seen, id]));
        }
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

    const getNextObjectives = () => {
        if (!trophiesData || !trophiesData.userStats) return [];
        const userStats = trophiesData.userStats;
        const myBadgeIds = new Set(stats.badges?.map((b: any) => b.badgeId || b.id) || []);

        const categories = [
            { key: "PUSHUP", tags: ["PUMP", "PUSHUP"] },
            { key: "SQUAT", tags: ["SQUAT"] },
            { key: "PLANK", tags: ["PLANK"] },
            { key: "RECORD", tags: ["RECORD_"] }
        ];

        const output: any[] = [];
        categories.forEach(cat => {
            const candidates = BADGE_DEFINITIONS.filter(b => 
                (cat.key === "RECORD" ? b.id.startsWith("RECORD_") : 
                 cat.tags.some(tag => b.id.includes(tag)) && !b.id.startsWith("RECORD_")) &&
                !myBadgeIds.has(b.id)
            );

            const processed = candidates.map(badge => {
                const match = badge.id.match(/\d+/);
                const targetValue = match ? parseInt(match[0]) : 0;
                let currentValue = 0;
                let unit = "reps";

                if (badge.id.includes("PUMP") || badge.id.includes("PUSHUP")) {
                    unit = "pompes";
                    currentValue = badge.id.startsWith("SERIE_") ? userStats.allTime?.maxPushups : userStats.allTime?.pushups;
                } else if (badge.id.includes("SQUAT")) {
                    unit = "squats";
                    currentValue = badge.id.startsWith("SERIE_") ? userStats.allTime?.maxSquats : userStats.allTime?.squats;
                } else if (badge.id.includes("PLANK")) {
                    unit = "s";
                    currentValue = badge.id.startsWith("SERIE_") ? userStats.allTime?.maxPlank : userStats.allTime?.plank;
                } else if (badge.id.startsWith("RECORD_")) {
                    const exercise = badge.id.includes("PUSHUP") ? "pushups" : badge.id.includes("SQUAT") ? "squats" : "plank";
                    const timeframe = (badge.id.includes("WEEK") ? "week" : badge.id.includes("MONTH") ? "month" : badge.id.includes("DAY") ? "today" : "allTime");
                    currentValue = userStats[timeframe]?.[exercise] || 0;
                    unit = exercise === "plank" ? "s" : "reps";
                }

                currentValue = currentValue || 0;
                const percent = targetValue > 0 ? Math.min(100, Math.floor((currentValue / targetValue) * 100)) : 0;
                return { ...badge, currentValue, targetValue, unit, percent };
            }).sort((a, b) => b.percent - a.percent);

            if (processed.length > 0) output.push(processed[0]);
        });

        return output.sort((a, b) => b.percent - a.percent).slice(0, 4);
    };

    const nextObjectives = getNextObjectives();
    
    useEffect(() => {
        async function loadBatches() {
            const res = await getRecentBatches();
            if (res.success && res.batches) {
                // Ne garder que les 3 derniers comme demandé
                setRecentBatches(res.batches.slice(0, 3));
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

    if (actualPercent >= 1000) circleColor = "#ef4444", reactionTitle = "LÉGENDE VIVANTE ! 👑", reactionSub = `${actualPercent}% de l'objectif 🌌`, reactionColor = "#ef4444";
    else if (actualPercent >= 500) circleColor = "#8b5cf6", reactionTitle = "MODE DIVIN ACTIVÉ ! ⚡", reactionSub = `${actualPercent}% de l'objectif 🌋`, reactionColor = "#8b5cf6";
    else if (actualPercent >= 200) circleColor = "#3b82f6", reactionTitle = "OBJECTIF PULVÉRISÉ ! 🚀", reactionSub = `${actualPercent}% de l'objectif 💎`, reactionColor = "#3b82f6";
    else if (actualPercent >= 100) circleColor = "var(--secondary)", reactionTitle = "OBJECTIF ATTEINT ! 🏆", reactionSub = `${actualPercent}% de l'objectif 🔥`, reactionColor = "var(--secondary)";

    const levelInfo = getLevelInfo(stats.totalXP);
    const streakEmoji = stats.streak >= 100 ? "💎" : stats.streak >= 30 ? "⚡" : stats.streak >= 7 ? "🔥" : "🌱";

    return (
        <div className="container dashboard-container" style={{ position: "relative" }}>
            {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}

            {/* LOST BADGE TOASTS (Top Level) */}
            {lostBadges.length > 0 && (
                <div style={{ position: "fixed", top: "20px", right: "20px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 10005 }} onPointerMove={handleSwipeMove} onPointerUp={handleSwipeEnd} onPointerLeave={handleSwipeEnd}>
                    {lostBadges.map(alert => {
                        const offset = swipeOffsets[alert.id] || 0;
                        return (
                            <div key={alert.id} className="glass" onPointerDown={(e) => handleSwipeStart(e, alert.id)} style={{ padding: "1rem", borderLeft: "4px solid #ef4444", background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(10px)", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", borderRadius: "12px", width: "300px", animation: "slideInRight 0.3s ease-out", transform: `translateX(${offset}px)`, opacity: Math.max(0, 1 - (offset / 300)), touchAction: "none", position: "relative", transition: swipingId === alert.id ? "none" : "transform 0.3s ease, opacity 0.3s ease" }}>
                                <button onClick={() => dismissLostBadge(alert.id)} style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "white", opacity: 0.5, cursor: "pointer", fontSize: "1.2rem" }}>×</button>
                                <div style={{ fontWeight: 900, color: "#ef4444", marginBottom: "4px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}><Flame size={16} /> 🚨 TROPHÉE VOLÉ !</div>
                                <p style={{ fontSize: "0.80rem", margin: "0 0 10px 0", color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>
                                    {alert.thief ? (<><Link href={`/profile/${encodeURIComponent(alert.thief.nickname)}`} className="text-primary" style={{ fontWeight: 900 }} onClick={(e) => e.stopPropagation()}>@{alert.thief.nickname}</Link> vient de t'arracher le titre :</>) : "On vient de t'arracher le titre :"}
                                    <br/><Link href={`/badges?highlight=${alert.badge?.id}`} style={{ color: "white", fontWeight: 800, textDecoration: "none" }} onClick={(e) => e.stopPropagation()}><strong>{alert.badge?.icon} {alert.badge?.name}</strong></Link>.
                                </p>
                                <button onClick={() => dismissLostBadge(alert.id)} style={{ width: "100%", background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 8px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: 800 }}>Ça ne se passera pas comme ça !</button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 1. BANNER : COMPACT USER BANNER */}
            <div className="glass-premium" style={{ display: "flex", justifyContent: "space-between", padding: "1rem 1.25rem", borderRadius: "20px", marginBottom: "0.75rem", alignItems: "center", background: "rgba(255, 255, 255, 0.85)", border: "1px solid rgba(0,0,0,0.03)", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <Link href={`/profile/${encodeURIComponent(stats.nickname)}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                    <div style={{ fontSize: "1.75rem", background: "rgba(0,0,0,0.03)", width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{levelInfo.emoji}</div>
                    <div>
                        <Link href="/faq#niveaux" style={{ fontSize: "0.65rem", fontWeight: "900", color: "var(--text-muted)", textTransform: "uppercase", textDecoration: "none" }}>NV. {levelInfo.level}</Link>
                        <div style={{ fontSize: "0.95rem", fontWeight: "900" }}>{levelInfo.name}</div>
                    </div>
                </Link>
                <div style={{ textAlign: "right", display: "flex", gap: "1.25rem", alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                        <Link href="/league" style={{ fontSize: "0.55rem", fontWeight: "900", color: "var(--text-muted)", textDecoration: "none" }}>XP TOTAL</Link>
                        <div style={{ fontSize: "1rem", fontWeight: "900", color: "var(--primary)" }}>{stats.totalXP} ✨</div>
                    </div>
                    <Link href="/faq#cagnotte" className={`streak-badge ${stats.streak > 0 ? 'active' : ''}`} style={{ margin: 0, padding: "5px 12px", borderRadius: "12px", textDecoration: "none" }}>
                        <span style={{ fontSize: "1.2rem", marginRight: "4px" }}>{streakEmoji}</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: "900" }}>{stats.streak}j</span>
                    </Link>
                </div>
            </div>

            {/* 2. WELCOME BANNER (SWIPEABLE) */}
            {!welcomeDismissed && (() => {
                const joinedAt = new Date(stats.joinedAt);
                const diffDays = Math.floor((new Date().getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 3) {
                    const offset = swipeOffsets["welcome"] || 0;
                    return (
                        <div 
                            onPointerDown={(e) => handleSwipeStart(e, "welcome")}
                            onPointerMove={handleSwipeMove}
                            onPointerUp={handleSwipeEnd}
                            onPointerLeave={handleSwipeEnd}
                            style={{ 
                                padding: "1rem 1.5rem", background: "linear-gradient(90deg, var(--primary) 0%, #3b82f6 100%)", color: "white", borderRadius: "16px", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)", transform: `translateX(${offset}px)`, touchAction: "none", transition: swipingId === "welcome" ? "none" : "transform 0.3s ease", opacity: Math.max(0, 1 - (offset / 300))
                            }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "10px" }}><HelpCircle size={20} /></div>
                                <div>
                                    <h4 style={{ fontSize: "0.9rem", fontWeight: "900", margin: 0 }}>BIENVENUE SUR TRONC SOLIDE ! 🌳</h4>
                                    <p style={{ fontSize: "0.72rem", margin: 0, opacity: 0.9, fontWeight: "600" }}>Pense à lire les règles dans la FAQ. (Swipe ⮕)</p>
                                </div>
                            </div>
                            <Link href="/faq#volume" style={{ background: "white", color: "var(--primary)", padding: "8px 16px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "900", textDecoration: "none" }}>LIRE LA FAQ</Link>
                        </div>
                    );
                }
                return null;
            })()}

            {/* 3. HERO : CORE APP (Daily Goal & Logger) */}
            <div className="hero-card" style={{ display: "block", textDecoration: "none", color: "inherit", marginBottom: "1rem", position: "relative", zIndex: 10 }}>
                <Link href="/faq#concept" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="hero-header">
                        <div className="target-label">OBJECTIF DU JOUR</div>
                        <div style={{ fontSize: "0.6rem", fontWeight: "900", opacity: 0.6, marginTop: "2px", textTransform: "uppercase", letterSpacing: "1px" }}>volume d'effort</div>
                    </div>
                    <div className="progress-circular-container">
                        <svg style={{ position: "absolute", width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                            <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="12" />
                            <circle cx="110" cy="110" r="100" fill="none" stroke={circleColor} strokeWidth="12" strokeDasharray="628" strokeDashoffset={628 - (628 * progressPercent) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
                        </svg>
                        <div className="progress-display">
                            <div className="progress-value" style={{ fontSize: "3rem" }}>{initialProgress} / {initialTarget}</div>
                            <div className="progress-total">{Math.abs(initialProgress) <= 1 ? "EFFORT" : "EFFORTS"}</div>
                        </div>
                    </div>
                </Link>

                <div style={{ marginTop: "1.5rem" }}>
                    {!showForm && !showSecondaryForm ? (
                        <>
                            <button className={`btn-primary start-button ${!isGoalReached ? 'btn-pulse' : ''}`} onClick={() => setShowForm(true)}>LOGGER UNE SÉANCE</button>
                            <button className="glass-hover" style={{ width: "100%", borderRadius: "16px", padding: "0.85rem", fontSize: "0.85rem", fontWeight: "900", background: "rgba(0,0,0,0.1)", border: "none", color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px", cursor: "pointer" }} onClick={() => setShowSecondaryForm(true)}><PlusCircle size={16} /> Pour en faire plus ✨</button>
                        </>
                    ) : showForm ? (
                        <div className="form-portal glass-premium" style={{ border: "1px solid var(--primary)", overflow: "hidden" }}><div style={{ padding: "1.25rem" }}><ExerciseBatchForm onSuccess={() => setShowForm(false)} /></div><button className="btn-ghost" onClick={() => setShowForm(false)} style={{ width: "100%", paddingBottom: "1rem" }}>Plus tard</button></div>
                    ) : (
                        <div className="form-portal glass-premium" style={{ border: "1px solid var(--secondary)", padding: "1.25rem" }}><header style={{ textAlign: "center", marginBottom: "1rem" }}><h3 style={{ fontSize: "1.1rem", color: "var(--secondary)" }}>Pour en faire plus</h3></header><SecondaryExerciseForm onSuccess={() => setShowSecondaryForm(false)} /><button className="btn-ghost" onClick={() => setShowSecondaryForm(false)} style={{ width: "100%", marginTop: "10px" }}>Plus tard</button></div>
                    )}
                </div>

                {/* MINI HISTORY [UNDER LOGGER] */}
                <div style={{ marginTop: "1.5rem", background: "rgba(0,0,0,0.03)", borderRadius: "16px", padding: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontWeight: 900, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}><span>Historique Récent (Top 3)</span> <History size={12}/></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {recentBatches.map(batch => (
                            <div key={batch.id} className="history-mini-item" onClick={() => setSelectedBatch(batch)} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.5)", padding: "8px 12px", borderRadius: "10px", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}><span>{batch.exercises.length > 1 ? '📦' : '💪'}</span> <span style={{ fontWeight: 800 }}>{new Date(batch.date).toLocaleDateString('fr', {day:'numeric', month:'short'})}</span></div>
                                <div style={{ fontWeight: 900, color: "var(--primary)" }}>+{batch.xpTotal} XP</div>
                            </div>
                        ))}
                        {recentBatches.length === 0 && <div style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", padding: "10px" }}>Aucune séance récente</div>}
                    </div>
                </div>
            </div>

            {/* 4. NEXT OBJECTIVES */}
            {nextObjectives.length > 0 && (
                <section className="glass" style={{ marginBottom: "1rem", padding: "1.25rem" }}>
                    <div className="card-header" style={{ marginBottom: "1rem" }}><TrendingUp size={18} className="text-secondary" /> <span>Prochains objectifs</span></div>
                    <div style={{ display: "grid", gap: "10px" }}>
                        {nextObjectives.map(badge => (
                            <div key={badge.id} className="glass-premium clickable-card" onClick={() => setSelectedBadge(badge)} style={{ padding: "0.85rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                                <div style={{ fontSize: "1.5rem", width: "45px", height: "45px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>{badge.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><div style={{ fontWeight: 800, fontSize: "0.85rem" }}>{badge.name}</div><div style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--text-muted)" }}>{badge.currentValue} / {badge.targetValue} {badge.unit}</div></div>
                                    <div className="level-mini-bar"><div className="level-fill" style={{ width: `${badge.percent}%`, background: "var(--secondary)" }} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 5. GAZETTE : VOTRE GAZETTE */}
            {(() => {
                const userEvents = feedItems?.filter((item: any) => item.user.id === userId).slice(0, 3) || [];
                if (userEvents.length === 0) return null;
                return (
                    <section className="glass" style={{ padding: "1rem", marginBottom: "1rem" }}>
                        <Link href="/league" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit", marginBottom: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 900, fontSize: "0.85rem" }}><Award size={18} className="text-primary"/> VOTRE GAZETTE</div>
                            <ChevronRight size={16} className="text-muted"/>
                        </Link>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {userEvents.map(event => (
                                <Link href={`/badges?highlight=${event.badgeId || ""}`} key={event.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "rgba(255,255,255,0.5)", borderRadius: "16px", textDecoration: "none", color: "inherit", transition: "all 0.2s" }}>
                                    <div style={{ fontSize: "1.25rem" }}>{event.badge?.icon || (event.type === "LEVEL_UP" ? "✨" : "📰")}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 800 }}>{event.type === "LEVEL_UP" ? `Tu es passé Niveau ${event.level} !` : event.type === "BADGE_LOST" ? `Perte d'un titre : ${event.badge?.name}` : `Nouveau succès : ${event.badge?.name}`}</div>
                                        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 700 }}>{new Date(event.createdAt).toLocaleDateString('fr')}</div>
                                    </div>
                                    <ChevronRight size={14} opacity={0.3}/>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            })()}

            {/* 6. TOP LIGUE */}
            <section className="glass" style={{ padding: "1.25rem" }}>
                <Link href="/league" className="card-header" style={{ marginBottom: "1rem", textDecoration: "none", color: "inherit", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Trophy size={18} className="text-primary" /> <span>Classement Ligue</span></div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--primary)" }}>VOIR TOUT ➔</span>
                </Link>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {stats.top3.map((player: any, i: number) => (
                        <div key={i} className="glass-premium" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 15px", borderRadius: "16px", background: i === 0 ? "rgba(217,119,6,0.05)" : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1rem" }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span> <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{player.nickname}</span></div>
                            <span style={{ fontWeight: 900, color: i === 0 ? "var(--primary)" : "var(--text-muted)" }}>{player.totalXP} XP</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* MODALS [FIXED Z-INDEX] */}
            {selectedBatch && <HistoryDetailsModal isOpen={!!selectedBatch} batch={selectedBatch} onClose={() => setSelectedBatch(null)} />}
            {selectedBadge && <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} userStats={trophiesData?.userStats} records={trophiesData?.records} />}

            <style jsx>{`
                .level-mini-bar { height: 4px; background: rgba(0,0,0,0.05); border-radius: 2px; margin-top: 4px; overflow: hidden; }
                .level-fill { height: 100%; background: var(--primary); transition: width 1s ease-out; }
                .clickable-card:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
                .btn-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(217, 119, 6, 0); } 100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); } }
                .hero-card { background: white; padding: 1.5rem; border-radius: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.02); }
                .progress-display { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1; }
                .progress-value { font-weight: 950; color: var(--foreground); }
                .progress-total { font-size: 0.8rem; font-weight: 900; color: var(--text-muted); margin-top: -5px; }
                .history-mini-item:hover { background: rgba(255,255,255,0.8) !important; }
            `}</style>
        </div>
    );
}
