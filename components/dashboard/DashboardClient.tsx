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

interface DashboardProps {
    userId: string;
    initialTarget: number;
    initialProgress: number;
    stats: any;
}

export default function DashboardClient({
    userId,
    initialTarget,
    initialProgress,
    stats
}: DashboardProps) {
    const [showForm, setShowForm] = useState(false);
    const [showSecondaryForm, setShowSecondaryForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lostBadges, setLostBadges] = useState<any[]>([]);
    const [showOnboarding, setShowOnboarding] = useState(!stats.hasSeenOnboarding);
    const [recentBatches, setRecentBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
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
    };
    
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
                            marginBottom: "1.5rem", 
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

            {/* LOST BADGE TOASTS */}
            {lostBadges.length > 0 && (
                <div style={{ position: "fixed", top: "80px", right: "20px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 9999 }}>
                    {lostBadges.map(alert => (
                        <div key={alert.id} className="glass" style={{ padding: "1rem", borderLeft: "4px solid #ef4444", background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(10px)", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", borderRadius: "12px", width: "300px", animation: "slideInRight 0.3s ease-out" }}>
                            <div style={{ fontWeight: 900, color: "#ef4444", marginBottom: "4px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Flame size={16} /> 🚨 BADGE VOLÉ !
                            </div>
                            <p style={{ fontSize: "0.80rem", margin: "0 0 10px 0", color: "white", lineHeight: 1.4 }}>On vient de t'arracher le titre : <br/><strong>{alert.badge?.icon} {alert.badge?.name}</strong>.</p>
                            <button onClick={() => dismissLostBadge(alert.id)} style={{ width: "100%", background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 8px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: 800, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"} onMouseOut={e => e.currentTarget.style.background = "none"}>Ça ne se passera pas comme ça !</button>
                        </div>
                    ))}
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
                        <div style={{ color: "var(--accent)" }}>{stats.activeEvent.star.nickname} : {stats.activeEvent.star.reps} RP</div>
                        <div style={{ color: "var(--text-muted)" }}>Meilleur Challenger : {stats.activeEvent.topChallenger?.value || 0} RP</div>
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

            {/* 1. Daily Hero Section - Circular Impact */}
            <section className="hero-card">
                <div className="hero-header">
                    <div className="target-label">OBJECTIF DU JOUR</div>
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

                    <div className="progress-display" style={{ zIndex: 1, position: "relative" }}>
                        <div className="progress-value">{initialProgress}</div>
                        <div className="progress-total">SUR {initialTarget}sec</div>
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
                                onClick={() => setShowForm(true)}
                            >
                                LOGGER UNE SÉANCE
                            </button>
                            <button
                                className="glass-hover"
                                style={{ 
                                    width: "100%", borderRadius: "16px", padding: "0.85rem", fontSize: "0.85rem", fontWeight: "900", 
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,0,0,0.05)", color: "var(--foreground)",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer"
                                }}
                                onClick={() => setShowSecondaryForm(true)}
                            >
                                <PlusCircle size={16} className="text-primary" /> Pour en faire plus ✨
                            </button>
                        </div>
                    ) : showForm ? (
                        <div className="form-portal glass-premium" style={{ padding: "1.5rem", borderRadius: "24px", border: "1px solid var(--primary)" }}>
                            <header style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: "900" }}>Enregistrer une séance</h3>
                                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Qu'as-tu accompli aujourd'hui ?</p>
                            </header>
                            <ExerciseBatchForm onSuccess={() => setShowForm(false)} />
                            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                                <button className="btn-ghost" style={{ fontSize: "0.75rem" }} onClick={() => setShowForm(false)}>Plus tard</button>
                            </div>
                        </div>
                    ) : (
                        <div className="form-portal glass-premium" style={{ padding: "1.5rem", borderRadius: "24px", border: "1px solid var(--secondary)" }}>
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
            </section>

            {/* 2. Stat Bar - Horizontal Impact */}
            <div className="stats-grid" style={{ marginTop: "-1rem" }}>
                <Link href="/faq#niveaux" className="glass-premium stat-card nature-rank clickable-card" style={{ padding: "1.25rem", textDecoration: "none", color: "inherit" }}>
                    <div className="stat-info" style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "1.2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>{levelInfo.emoji}</span>
                            <span style={{ fontSize: "0.8rem", fontWeight: "900", color: "var(--text-muted)" }}>NV. {levelInfo.level}</span>
                        </div>
                        <span style={{ fontSize: "1rem", fontWeight: "800", display: "block" }}>{levelInfo.name}</span>
                        <div className="level-mini-bar" style={{ height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "3px", marginTop: "10px" }}>
                            <div className="level-fill" style={{ width: `${levelProgress}%`, height: "100%", background: "var(--secondary)", borderRadius: "3px", boxShadow: "0 0 10px rgba(5, 150, 105, 0.2)" }} />
                        </div>
                    </div>
                </Link>

                <Link href="/faq#niveaux" className="glass-premium stat-card clickable-card" style={{ padding: "1.25rem", flexDirection: "column", alignItems: "flex-start", textDecoration: "none", color: "inherit" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "8px" }}>
                        <Award className="text-primary" size={18} />
                        <div className={`streak-badge ${stats.streak > 0 ? 'active' : ''}`} style={{ margin: 0, padding: "2px 8px" }}>
                            <Flame size={12} fill={stats.streak > 0 ? "currentColor" : "none"} />
                            <span style={{ fontSize: "0.65rem" }}>{stats.streak}j</span>
                        </div>
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: "900", color: "var(--text-muted)" }}>EXP TOTAL</span>
                    <span className="stat-number" style={{ fontSize: "1.5rem", color: "var(--primary)" }}>{stats.totalXP} ✨</span>
                </Link>
            </div>

            {/* 3. Economy & Ligue Focus */}
            <div className="secondary-grid">
                <Link href="/faq#cagnotte" className={`glass-premium info-card clickable-card ${!isEligible ? 'locked' : ''}`} style={{ border: isEligible ? "1px solid var(--secondary)" : "", textDecoration: "none", color: "inherit" }}>
                    <div className="card-header">
                        <Wallet size={16} className={isEligible ? "text-secondary" : "text-muted"} />
                        <span>Cagnotte Pot</span>
                    </div>
                    <div className="cagnotte-status">
                        {isEligible ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                                <div className="status-active" style={{ fontSize: "1rem" }}>{stats.unpaidAmount}€ <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>à payer</span></div>
                                {stats.unpaidPenalties && stats.unpaidPenalties.length > 0 && (
                                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}>
                                        {stats.unpaidPenalties.map((p: any, idx: number) => (
                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span>{new Date(p.date).toLocaleDateString()}</span>
                                                <span style={{ color: "var(--foreground)" }}>{p.amount}€</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="status-locked">
                                <Lock size={12} style={{ marginRight: '4px' }} />
                                {stats.cagnotteProgress.successfulDays}/{stats.cagnotteProgress.totalDays}j
                            </div>
                        )}
                    </div>
                </Link>

                <div className="glass-premium info-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Link href="/league" className="card-header clickable-card" style={{ marginBottom: "0.5rem", textDecoration: "none", color: "inherit", padding: "4px", borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Trophy size={16} className="text-primary" />
                            <span>Top Ligue</span>
                        </div>
                        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--primary)", opacity: 0.8 }}>VOIR TOUT ➔</span>
                    </Link>
                    <div className="league-preview" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {stats.top3.map((player: any, i: number) => (
                            <Link href={`/profile/${player.nickname}`} key={i} className="league-row clickable-card" style={{ 
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                opacity: i === 0 ? 1 : i === 1 ? 0.8 : 0.6,
                                background: "rgba(255,255,255,0.02)", 
                                padding: "6px 10px", 
                                borderRadius: "8px",
                                textDecoration: "none",
                                color: "inherit"
                            }}>
                                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {player.nickname}</span>
                                <span className="xp-small" style={{ fontWeight: 900, color: i === 0 ? "var(--primary)" : "inherit" }}>{player.totalXP}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Recent History */}
            <section className="glass history-card">
                <div className="card-header">
                    <History size={18} />
                    <span>Historique Récent</span>
                </div>
                <div className="history-list">
                    {recentBatches.length > 0 ? recentBatches.map((batch: any) => (
                        <div 
                            key={batch.id} 
                            className="history-item clickable-card"
                            onClick={() => setSelectedBatch(batch)}
                            style={{ cursor: "pointer" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <div className="history-icon" style={{ fontSize: "1.2rem" }}>
                                        {batch.exercises.length > 1 ? '📦' : (batch.exercises[0]?.type === 'PUSHUP' ? '💪' : batch.exercises[0]?.type === 'SQUAT' ? '🦵' : '🛡️')}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "800", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            {batch.exercises.length > 1 ? `${batch.exercises.length} EXERCICES` : (batch.exercises[0]?.type === 'PUSHUP' ? 'Pompes' : batch.exercises[0]?.type === 'SQUAT' ? 'Squats' : 'Gainage')}
                                        </div>
                                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>
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
                        <p className="empty-text" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>Chargement de l'historique...</p>
                    )}
                </div>

                {selectedBatch && (
                    <HistoryDetailsModal 
                        isOpen={!!selectedBatch}
                        batch={selectedBatch}
                        onClose={() => setSelectedBatch(null)}
                    />
                )}
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
