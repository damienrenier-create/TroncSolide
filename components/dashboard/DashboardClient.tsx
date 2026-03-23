"use client"

import { useEffect, useState } from "react";
import ExerciseBatchForm from "@/components/exercises/ExerciseBatchForm";
import { Flame, Trophy, TrendingUp, History, Wallet, Award, Lock, TreePine, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { getLevelInfo } from "@/lib/constants/levels";
import { deleteSession } from "@/lib/actions/moderation";
import { useRouter } from "next/navigation";

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
    const [loading, setLoading] = useState(false);
    const [lostBadges, setLostBadges] = useState<any[]>([]);
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

    const progressPercent = Math.min((initialProgress / initialTarget) * 100, 100);
    const isGoalReached = initialProgress >= initialTarget;
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

            {/* 0. Active Event Banner (Anniversary) */}
            {stats.activeEvent && (
                <section className="glass event-banner" style={{ marginBottom: "1rem", padding: "1rem", borderColor: "var(--accent)", borderLeftWidth: "4px" }}>
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
                            cx="110" cy="110" r="100" fill="none" stroke="var(--primary)" strokeWidth="12"
                            strokeDasharray="628" strokeDashoffset={628 - (628 * progressPercent) / 100}
                            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }}
                        />
                    </svg>

                    <div className="progress-display" style={{ zIndex: 1, position: "relative" }}>
                        <div className="progress-value">{initialProgress}</div>
                        <div className="progress-total">SUR {initialTarget}s</div>
                    </div>
                </div>

                {isGoalReached && (
                    <div className="goal-reached" style={{ marginTop: "1.5rem", color: "var(--secondary)", fontWeight: 800 }}>
                        OBJECTIF ATTEINT ! 🏆
                    </div>
                )}

                <div style={{ marginTop: "2rem" }}>
                    {!showForm ? (
                        <button
                            className={`btn-primary start-button ${!isGoalReached ? 'btn-pulse' : ''}`}
                            onClick={() => setShowForm(true)}
                        >
                            Loguer ma séance
                        </button>
                    ) : (
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
                    {stats.sessions.length > 0 ? stats.sessions.map((s: any) => (
                        <div key={s.id} className="history-item">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <div className="history-icon">{s.type === 'PUSHUP' ? '💪' : s.type === 'SQUAT' ? '🦵' : '🛡️'}</div>
                                    <div>
                                        <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>
                                            {s.type === 'PUSHUP' ? 'Pompes' : s.type === 'SQUAT' ? 'Squats' : 'Gainage'}
                                        </div>
                                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>
                                            {s.value} {s.type === 'PUSHUP' || s.type === 'SQUAT' ? 'reps' : 's'} • {new Date(s.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <div style={{ fontSize: "0.75rem", fontWeight: "900", color: "var(--primary)" }}>+{s.xpGained} XP</div>
                                    {(s.userId === currentUserId || stats.role === "MODERATOR") && (
                                        <button
                                            onClick={() => handleDeleteSession(s.id)}
                                            disabled={loading}
                                            style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: loading ? "#ccc" : "#ef4444", opacity: 0.6 }}
                                            title={s.userId === currentUserId ? "Supprimer mon erreur" : "Supprimer (Modérateur)"}
                                        >
                                            {s.userId === currentUserId ? <Trash2 size={16} /> : <Lock size={14} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {s.mood && (
                                <div style={{ marginTop: "0.5rem", paddingLeft: "3rem", fontSize: "0.7rem", fontStyle: "italic", color: "var(--text-muted)", opacity: 0.8 }}>
                                    "{s.mood}"
                                </div>
                            )}
                        </div>
                    )) : (
                        <p className="empty-text" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>Aucune séance récente.</p>
                    )}
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
