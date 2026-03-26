"use client"

import { useState, useEffect } from "react";
import { ExerciseType, RecordType, RecordTimeframe } from "@prisma/client";
import { Trophy, Calendar, Filter, Zap, Target, Flame, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GazetteComponent from "./GazetteComponent";

interface Ranking {
    userId: string;
    nickname: string;
    value: number;
    currentStreak?: number;
}

const StreakFlame = ({ streak }: { streak?: number }) => {
    if (!streak || streak === 0) return null;
    
    let color = "#94a3b8";
    let fill = "none";
    let size = 14;
    let effectClass = "";

    if (streak >= 30) {
        color = "#0cebeb";
        fill = "#20e3b2";
        size = 18;
        effectClass = "flame-mythic";
    } else if (streak >= 7) {
        color = "#ef4444";
        fill = "#f97316";
        size = 16;
        effectClass = "flame-hot";
    } else if (streak >= 3) {
        color = "#f97316";
        fill = "none";
        effectClass = "flame-warm";
    }

    return (
        <div className={`streak-badge ${effectClass}`} title={`${streak} jours consécutifs !`}>
            <Flame size={size} color={color} fill={fill !== "none" ? fill : undefined} />
            <span style={{ color, fontWeight: 900 }}>{streak}</span>
        </div>
    );
};

interface LeagueClientProps {
    initialRankings: Ranking[];
    leagueName: string;
    currentUserId: string;
    initialFeedItems: any[];
    allRecords: any[];
    top3AbsoluteRecords: Record<string, any[]>;
    trendData?: { chartData: any[], users: string[] };
    onFilterChange: (exercise: ExerciseType, type: RecordType, timeframe: RecordTimeframe) => Promise<Ranking[]>;
}

export default function LeagueClient({
    initialRankings,
    leagueName,
    currentUserId,
    initialFeedItems,
    allRecords,
    top3AbsoluteRecords,
    trendData,
    onFilterChange
}: LeagueClientProps) {
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get("tab") as any) || "RANKINGS";

    const [rankings, setRankings] = useState<Ranking[]>(initialRankings);
    const [exercise, setExercise] = useState<ExerciseType>("VENTRAL");
    const [type, setType] = useState<RecordType>("VOLUME");
    const [timeframe, setTimeframe] = useState<RecordTimeframe>("WEEK");
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"RANKINGS" | "GAZETTE" | "GLOBAL" | "TRENDS">(initialTab);

    // --- NEW: Reward Modal State ---
    const [rewardModal, setRewardModal] = useState<{ rank: number; label: string } | null>(null);

    async function handleUpdate(newExercise: ExerciseType, newType: RecordType, newTimeframe: RecordTimeframe) {
        setLoading(true);
        setExercise(newExercise);
        setType(newType);
        setTimeframe(newTimeframe);
        const newRankings = await onFilterChange(newExercise, newType, newTimeframe);
        setRankings(newRankings);
        setLoading(false);
    }

    const top3 = rankings.slice(0, 3);
    const others = rankings.slice(3);

    // --- REWARDS DATA ---
    const getRewardsForRank = (rank: number) => {
        if (type === "SERIES") {
            return { xp: rank === 1 ? 150 : rank === 2 ? 75 : 40, badge: rank === 1 ? "Recordman 🏆" : null };
        }
        // Volume rewards vary by timeframe
        const mult = timeframe === "MONTH" ? 10 : timeframe === "WEEK" ? 3 : 1;
        return { 
            xp: (rank === 1 ? 50 : rank === 2 ? 25 : 15) * mult, 
            badge: rank === 1 ? "Champion du Jour 👑" : null 
        };
    };

    return (
        <div className="container" style={{ padding: "1.5rem 1rem" }}>
            <header style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0 }}>{leagueName} 🏆</h2>
                
                <div className="segmented-control">
                    <button onClick={() => setView("RANKINGS")} className={view === "RANKINGS" ? 'active' : ''}>Podiums</button>
                    <button onClick={() => setView("GLOBAL")} className={view === "GLOBAL" ? 'active' : ''}>Records</button>
                    {/* Tendances only visible if already active (from homepage link) or if user is admin/debugging? 
                        User: "L'onglet tendance ne devrait pas etre affiché mais uniquement dispo via le lien de la homepage" */}
                    {view === "TRENDS" && (
                        <button onClick={() => setView("TRENDS")} className="active">📈 Tendances</button>
                    )}
                    <button onClick={() => setView("GAZETTE")} className={view === "GAZETTE" ? 'active' : ''}>
                        Gazette <span className="gazette-tag">News</span>
                    </button>
                </div>
            </header>

            {view === "RANKINGS" ? (
                <>
                    {/* 1. SWIPABLE EXERCISE NAV */}
                    <section style={{ marginBottom: "2rem" }}>
                        <div className="swipe-nav-container">
                            <div className="swipe-nav-track">
                                {[
                                    { id: "VENTRAL", label: "Ventral", icon: "🛡️" },
                                    { id: "LATERAL_L", label: "G", icon: "👈" },
                                    { id: "LATERAL_R", label: "D", icon: "👉" },
                                    { id: "PUSHUP", label: "Pompes", icon: "💪" },
                                    { id: "SQUAT", label: "Squats", icon: "🦵" }
                                ].map(ex => (
                                    <button
                                        key={ex.id}
                                        onClick={() => handleUpdate(ex.id as ExerciseType, type, timeframe)}
                                        className={`swipe-chip ${exercise === ex.id ? 'active' : ''}`}
                                    >
                                        <span className="swipe-icon">{ex.icon}</span>
                                        <span className="swipe-label">{ex.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 2. MODE SELECTOR (VOLUME | RECORD) */}
                    <div className="tab-control-bar" style={{ marginBottom: '1.5rem' }}>
                        <div className="segmented-control glass-premium">
                            <button 
                                onClick={() => handleUpdate(exercise, "VOLUME", timeframe)}
                                className={type === "VOLUME" ? 'active' : ''}
                            >
                                📊 Volume
                            </button>
                            <button 
                                onClick={() => handleUpdate(exercise, "SERIES", timeframe)}
                                className={type === "SERIES" ? 'active' : ''}
                            >
                                🏆 Record
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center", marginBottom: "2.5rem" }}>
                        {/* 3. PODIUM PRESTIGE */}
                        <div className="podium-area" style={{ width: '100%', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                            {top3.length > 0 ? (
                                <div className="podium">
                                    {/* Rank 2 (Argent) */}
                                    {top3[1] && (
                                        <div className="podium-step rank-2 interactive" onClick={() => setRewardModal({ rank: 2, label: "ARGENT" })}>
                                            <div className="player-meta">
                                                <div className="player-avatar-ring silver" onClick={(e) => { e.stopPropagation(); }}>
                                                    <Link href={`/profile/${encodeURIComponent(top3[1].nickname)}`} style={{ textDecoration: 'none' }}>
                                                        <span className="rank-emoji">🥈</span>
                                                    </Link>
                                                </div>
                                                <div className="player-name-bubble">
                                                    <Link href={`/profile/${encodeURIComponent(top3[1].nickname)}`} className="profile-link">{top3[1].nickname}</Link>
                                                    <div className="streak-cont"><StreakFlame streak={top3[1].currentStreak} /></div>
                                                </div>
                                            </div>
                                            <div className="step-bar-3d silver">
                                                <div className="val-badge">{top3[1].value}{exercise.includes('VENTRAL') || exercise.includes('LATERAL') ? 's' : ''}</div>
                                                <div className="click-hint">LOT 🎁</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Rank 1 (Or) */}
                                    <div className="podium-step rank-1 interactive" onClick={() => setRewardModal({ rank: 1, label: "OR" })}>
                                        <div className="player-meta">
                                            <div className="player-avatar-ring gold" onClick={(e) => { e.stopPropagation(); }}>
                                                <Link href={`/profile/${encodeURIComponent(top3[0].nickname)}`} style={{ textDecoration: 'none' }}>
                                                    <span className="rank-emoji">🥇</span>
                                                </Link>
                                            </div>
                                            <div className="player-name-bubble main">
                                                <Link href={`/profile/${encodeURIComponent(top3[0].nickname)}`} className="profile-link">{top3[0].nickname}</Link>
                                                <div className="streak-cont"><StreakFlame streak={top3[0].currentStreak} /></div>
                                            </div>
                                        </div>
                                        <div className="step-bar-3d gold">
                                            <div className="val-badge main">{top3[0].value}{exercise.includes('VENTRAL') || exercise.includes('LATERAL') ? 's' : ''}</div>
                                            <div className="click-hint">LOT ⭐️</div>
                                        </div>
                                    </div>

                                    {/* Rank 3 (Bronze) */}
                                    {top3[2] && (
                                        <div className="podium-step rank-3 interactive" onClick={() => setRewardModal({ rank: 3, label: "BRONZE" })}>
                                            <div className="player-meta">
                                                <div className="player-avatar-ring bronze" onClick={(e) => { e.stopPropagation(); }}>
                                                    <Link href={`/profile/${encodeURIComponent(top3[2].nickname)}`} style={{ textDecoration: 'none' }}>
                                                        <span className="rank-emoji">🥉</span>
                                                    </Link>
                                                </div>
                                                <div className="player-name-bubble">
                                                    <Link href={`/profile/${encodeURIComponent(top3[2].nickname)}`} className="profile-link">{top3[2].nickname}</Link>
                                                    <div className="streak-cont"><StreakFlame streak={top3[2].currentStreak} /></div>
                                                </div>
                                            </div>
                                            <div className="step-bar-3d bronze">
                                                <div className="val-badge">{top3[2].value}{exercise.includes('VENTRAL') || exercise.includes('LATERAL') ? 's' : ''}</div>
                                                <div className="click-hint">LOT 🥉</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="glass-premium" style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: "32px" }}>
                                    <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>😴</div>
                                    <p style={{ fontWeight: "900", color: "var(--foreground)" }}>Silence Radio</p>
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Personne n'a encore relevé ce défi.</p>
                                </div>
                            )}
                        </div>

                        {/* 4. TIMEFRAME SELECTOR (JOUR | SEM. | MOIS) */}
                        <div className="tab-control-bar">
                            <div className="segmented-control secondary glass-premium">
                                {[
                                    { id: "DAY", label: "Jour", icon: "☀️" },
                                    { id: "WEEK", label: "Sem.", icon: "🗓️" },
                                    { id: "MONTH", label: "Mois", icon: "🌙" }
                                ].map(tf => (
                                    <button
                                        key={tf.id}
                                        onClick={() => handleUpdate(exercise, type, tf.id as RecordTimeframe)}
                                        className={timeframe === tf.id ? 'active' : ''}
                                    >
                                        {tf.icon} {tf.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* competitors list */}
                    <section className="ranking-list" style={{ marginTop: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem", paddingLeft: "0.5rem" }}>
                            <Filter size={14} className="text-muted" />
                            <h4 style={{ fontSize: "0.75rem", fontWeight: "900", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Autres compétiteurs</h4>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {others.length > 0 ? others.map((r, i) => (
                                <div key={r.userId} className="premium-rank-card" style={{ border: r.userId === currentUserId ? "1.5px solid var(--primary)" : "1px solid rgba(0,0,0,0.03)" }}>
                                    <div className="rank-circle">#{i + 4}</div>
                                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div className="user-letter">{r.nickname.charAt(0).toUpperCase()}</div>
                                        <div className="user-nick-row">
                                            <Link href={`/profile/${encodeURIComponent(r.nickname)}`} className="profile-link" style={{ fontWeight: "800", display: "block", padding: "10px 0" }}>{r.nickname}</Link>
                                            {r.userId === currentUserId && <span className="self-tag">TOI</span>}
                                        </div>
                                        <StreakFlame streak={r.currentStreak} />
                                    </div>
                                    <div className="rank-score">
                                        {r.value}
                                        <span>{exercise.includes('VENTRAL') || exercise.includes('LATERAL') ? 's' : ' reps'}</span>
                                    </div>
                                </div>
                            )) : others.length === 0 && top3.length > 0 && (
                                <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", padding: "1rem" }}>C'est tout pour le moment !</p>
                            )}
                        </div>
                    </section>

                    {/* REWARD MODAL */}
                    {rewardModal && (
                        <div className="reward-modal-overlay" onClick={() => setRewardModal(null)}>
                            <div className="reward-modal-content" onClick={e => e.stopPropagation()}>
                                <header>
                                    <div className={`rank-medal ${rewardModal.label.toLowerCase()}`}>
                                        {rewardModal.rank === 1 ? '🥇' : rewardModal.rank === 2 ? '🥈' : '🥉'}
                                    </div>
                                    <h3>Marche de {rewardModal.label}</h3>
                                </header>
                                <div className="reward-body">
                                    <div className="reward-item">
                                        <Zap size={20} className="text-primary" />
                                        <div className="reward-text">
                                            <span className="reward-val">+{getRewardsForRank(rewardModal.rank).xp} XP</span>
                                            <span className="reward-desc">Fin de période</span>
                                        </div>
                                    </div>
                                    {getRewardsForRank(rewardModal.rank).badge && (
                                        <div className="reward-item">
                                            <Trophy size={20} className="text-primary" />
                                            <div className="reward-text">
                                                <span className="reward-val">{getRewardsForRank(rewardModal.rank).badge}</span>
                                                <span className="reward-desc">Badge exclusif</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button className="btn-close-reward" onClick={() => setRewardModal(null)}>FERMER</button>
                            </div>
                        </div>
                    )}
                </>
            ) : view === "GLOBAL" ? (
                <section className="global-records-view" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {[
                        { id: "VENTRAL", label: "Gainage Ventral", icon: "🛡️", unit: "s" },
                        { id: "PUSHUP", label: "Pompes", icon: "💪", unit: "" },
                        { id: "SQUAT", label: "Squats", icon: "🦵", unit: "" },
                        { id: "LATERAL_L", label: "Gainage Gauche", icon: "👈", unit: "s" },
                        { id: "LATERAL_R", label: "Gainage Droit", icon: "👉", unit: "s" }
                    ].map(ex => {
                        const getRec = (t: string, tf: string) => allRecords.find((r: any) => r.exercise === ex.id && r.type === t && r.timeframe === tf);
                        
                        return (
                            <div key={ex.id} className="glass-premium" style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "1.5rem", background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: "900", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px", color: "var(--foreground)" }}>
                                    <span>{ex.icon}</span> {ex.label}
                                </h3>
                                
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                                    {[
                                        { l: "Record Jour", r: getRec("VOLUME", "DAY") },
                                        { l: "Record Semaine", r: getRec("VOLUME", "WEEK") },
                                        { l: "Record Mois", r: getRec("VOLUME", "MONTH") }
                                    ].map((cell, idx) => (
                                        <div key={idx} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "6px" }}>
                                            <div style={{ fontSize: "0.65rem", fontWeight: "900", letterSpacing: "0.05em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                                                {cell.l}
                                            </div>
                                            {cell.r ? (
                                                <>
                                                    <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--foreground)" }}>
                                                        {cell.r.value}<span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{ex.unit}</span>
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "8px", marginTop: "4px", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        <Link href={`/profile/${encodeURIComponent(cell.r.user?.nickname || cell.r.user?.id || 'inconnu')}`} className="profile-link">
                                                            {cell.r.user?.nickname}
                                                        </Link>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "rgba(255,255,255,0.1)", marginTop: "10px" }}>-</div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Podium Absolu */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(217, 119, 6, 0.1)", border: "1px solid rgba(217, 119, 6, 0.3)", borderRadius: "16px", padding: "1rem", gridColumn: "1 / -1" }}>
                                        <div style={{ fontSize: "0.7rem", fontWeight: "900", letterSpacing: "0.05em", color: "var(--primary)", textTransform: "uppercase", textAlign: "center" }}>Podium Absolu (1 série)</div>
                                        <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-end" }}>
                                            {top3AbsoluteRecords[ex.id]?.slice(0, 3).map((r: any, idx: number) => {
                                                const colors = ["var(--primary)", "#94a3b8", "#d97706"];
                                                const icons = ["🥇", "🥈", "🥉"];
                                                return (
                                                    <div key={idx} style={{ flex: 1, minWidth: "100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "4px" }}>
                                                        <div style={{ fontSize: idx===0 ? "1.6rem" : "1.2rem", fontWeight: "900", color: "var(--foreground)", textShadow: idx===0 ? "0 2px 10px rgba(217, 119, 6, 0.3)" : "none" }}>
                                                            {r.value}<span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{ex.unit}</span>
                                                        </div>
                                                        <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "white", background: colors[idx], padding: "2px 8px", borderRadius: "8px", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            <Link href={`/profile/${encodeURIComponent(r.nickname)}`} className="profile-link-white">
                                                                {icons[idx]} {r.nickname}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {(!top3AbsoluteRecords[ex.id] || top3AbsoluteRecords[ex.id].length === 0) && (
                                                <div style={{ width: "100%", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>Aucun record</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>
            ) : view === "GAZETTE" ? (
                <GazetteComponent initialItems={initialFeedItems} currentUserId={currentUserId} />
            ) : (
                <section className="trends-view" style={{ marginTop: "1rem" }}>
                    <div className="glass-premium" style={{ padding: "1.5rem", borderRadius: "24px", minHeight: "450px" }}>
                        <div style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px" }}>
                                <TrendingUp size={20} className="text-primary"/> Évolution de l'XP de la Ligue
                            </h3>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", fontWeight: 700 }}>Progression cumulative sur les 14 derniers jours</p>
                        </div>

                        {trendData && trendData.chartData.length > 0 ? (
                            <div style={{ width: "100%", height: 350, marginTop: "1rem" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData.chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} 
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} 
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: "16px", 
                                                border: "none", 
                                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                                fontSize: "0.8rem",
                                                fontWeight: 800,
                                                padding: "12px"
                                            }}
                                            itemStyle={{ padding: "2px 0" }}
                                        />
                                        <Legend 
                                            verticalAlign="top" 
                                            align="right"
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: "0.7rem", fontWeight: 900, paddingBottom: "20px" }}
                                        />
                                        {trendData.users.map((nick: string, idx: number) => {
                                            const COLORS = ["#d97706", "#2563eb", "#10b981", "#8b5cf6", "#f43f5e", "#0ea5e9", "#f97316"];
                                            return (
                                                <Line 
                                                    key={nick} 
                                                    type="monotone" 
                                                    dataKey={nick} 
                                                    stroke={COLORS[idx % COLORS.length]} 
                                                    strokeWidth={3} 
                                                    dot={false}
                                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                                    animationDuration={1500}
                                                />
                                            );
                                        })}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", opacity: 0.5 }}>
                                <TrendingUp size={48} strokeWidth={1} />
                                <p style={{ marginTop: "1rem", fontWeight: 800 }}>Pas assez de données pour générer le graphique.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <style jsx>{`
        /* 1. SWIPE NAV EXERCISES */
        .swipe-nav-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 0.5rem;
          margin-bottom: -0.5rem;
          scrollbar-width: none;
        }
        .swipe-nav-container::-webkit-scrollbar { display: none; }
        .swipe-nav-track {
          display: flex;
          gap: 12px;
          padding-right: 1.5rem;
        }
        .swipe-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.8);
          border: 1.5px solid rgba(0,0,0,0.04);
          padding: 10px 18px;
          border-radius: 100px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
          scroll-snap-align: start;
        }
        .swipe-chip.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 8px 20px rgba(217, 119, 6, 0.3);
          transform: translateY(-2px);
        }
        .swipe-icon { font-size: 1.2rem; }
        .swipe-label { font-weight: 900; font-size: 0.85rem; letter-spacing: 0.02em; }

        /* 2. TAB CONTROL BARS (Horizontal Segmented) */
        .tab-control-bar {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .segmented-control {
          display: flex;
          background: rgba(0,0,0,0.04);
          padding: 4px;
          border-radius: 16px;
          gap: 4px;
          width: 100%;
          max-width: 320px;
        }
        .segmented-control.secondary {
          background: rgba(0,0,0,0.02);
          max-width: 280px;
        }
        .segmented-control button {
          flex: 1;
          padding: 10px 12px;
          border: none;
          background: transparent;
          font-weight: 950;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-radius: 12px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
        }
        .segmented-control button.active {
          background: white;
          color: var(--foreground);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: scale(1.02);
        }
        .segmented-control.secondary button.active {
          background: var(--foreground);
          color: white;
        }

        /* 3. PODIUM STYLING (Simplified) */
        .podium-area { max-width: 440px; margin: 0 auto; }
        .podium {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 12px;
          height: 280px;
          padding: 0 10px 1rem;
        }
        .podium-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          transition: transform 0.3s ease;
          position: relative;
        }
        .podium-step.interactive { cursor: pointer; }
        .podium-step.interactive:hover { transform: translateY(-5px); }
        .podium-step.interactive:hover .click-hint { opacity: 1; transform: translateY(0); }

        .player-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
          margin-bottom: -15px;
        }
        .player-avatar-ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          border: 3px solid white;
          position: relative;
          z-index: 2;
        }
        .rank-emoji { font-size: 1.6rem; }
        .player-avatar-ring.gold { border-color: #fbbf24; }
        .player-avatar-ring.silver { border-color: #94a3b8; }
        .player-avatar-ring.bronze { border-color: #ca8a04; }

        .player-name-bubble {
          background: white;
          padding: 4px 10px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          margin: 6px 0;
          text-align: center;
          max-width: 100px;
          position: relative;
          z-index: 1;
        }
        .player-name-bubble .profile-link {
          font-weight: 950;
          font-size: 0.8rem;
          color: var(--foreground);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .streak-cont { display: flex; justify-content: center; margin-top: 1px; }

        .step-bar-3d {
          width: 100%;
          border-radius: 20px 20px 12px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 0.5rem 0.5rem;
          position: relative;
          box-shadow: 0 15px 35px rgba(0,0,0,0.06);
          overflow: hidden;
        }
        .step-bar-3d.gold { height: 160px; background: linear-gradient(180deg, #fbbf24 0%, #d97706 100%); }
        .step-bar-3d.silver { height: 120px; background: linear-gradient(180deg, #94a3b8 0%, #475569 100%); }
        .step-bar-3d.bronze { height: 90px; background: linear-gradient(180deg, #ca8a04 0%, #854d0e 100%); }

        .val-badge { 
          background: rgba(255,255,255,0.2); 
          backdrop-filter: blur(4px); 
          padding: 4px 10px; 
          border-radius: 100px; 
          color: white; 
          font-weight: 950; 
          font-size: 0.8rem;
          border: 1px solid rgba(255,255,255,0.1);
          margin-top: auto;
          margin-bottom: 20px;
        }
        .val-badge.main { font-size: 1.1rem; padding: 6px 14px; background: rgba(255,255,255,0.3); }
        .click-hint { 
          position: absolute; bottom: 8px; font-size: 0.5rem; font-weight: 950; 
          color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 4px; 
          opacity: 0; transform: translateY(5px); transition: all 0.3s ease; 
        }

        /* REWARD MODAL (Ensuring High Contrast) */
        .reward-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          z-index: 100000;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.3s ease;
        }
        .reward-modal-content {
          background: white; width: 100%; max-width: 340px;
          border-radius: 32px; padding: 2rem;
          animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
        }
        .rank-medal { font-size: 3.5rem; margin-bottom: 0.5rem; }
        .reward-body { display: flex; flex-direction: column; gap: 12px; margin: 1.5rem 0; }
        .reward-item {
          display: flex; align-items: center; gap: 12px;
          background: #f8fafc; padding: 12px 18px; border-radius: 18px; text-align: left;
          border: 1px solid #f1f5f9;
        }
        .reward-val { display: block; font-weight: 950; color: #0f172a; font-size: 1rem; }
        .reward-desc { display: block; font-size: 0.7rem; color: #64748b; font-weight: 800; }
        .btn-close-reward {
          width: 100%; padding: 12px; border: none; border-radius: 100px;
          background: #0f172a; color: white; font-weight: 900;
          letter-spacing: 0.05em; cursor: pointer; transition: transform 0.2s;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPop { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

        /* General UI components */
        .premium-rank-card {
          display: flex; align-items: center; gap: 12px; padding: 1rem;
          background: white; border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          transition: transform 0.2s ease;
        }
        .rank-circle { width: 32px; height: 32px; background: rgba(0,0,0,0.03); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; color: var(--text-muted); }
        .user-letter { width: 40px; height: 40px; background: var(--primary-light); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.1rem; }
        .self-tag { font-size: 0.6rem; background: var(--primary); color: white; padding: 2px 6px; border-radius: 6px; font-weight: 900; }
        .rank-score { font-weight: 900; color: var(--foreground); font-size: 1.1rem; text-align: right; }
        .rank-score span { display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 700; margin-top: -2px; }
        
        .profile-link { color: inherit; text-decoration: none; }
        .profile-link:hover { color: var(--primary); text-decoration: underline; }
        .profile-link-white { color: white; text-decoration: none; }
        .profile-link-white:hover { text-decoration: underline; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPop { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

        /* Generic cleanup */
        .premium-rank-card {
          display: flex; align-items: center; gap: 12px; padding: 1rem;
          background: white; border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          transition: transform 0.2s ease;
        }
        .rank-circle { width: 32px; height: 32px; background: rgba(0,0,0,0.03); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; color: var(--text-muted); }
        .user-letter { width: 40px; height: 40px; background: var(--primary-light); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.1rem; }
        .self-tag { font-size: 0.6rem; background: var(--primary); color: white; padding: 2px 6px; border-radius: 6px; font-weight: 900; }
        .rank-score { font-weight: 900; color: var(--foreground); font-size: 1.1rem; text-align: right; }
        .rank-score span { display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 700; margin-top: -2px; }
        .segmented-control .gazette-tag { font-size: 0.5rem; background: #f97316; color: white; padding: 1px 4px; border-radius: 4px; font-weight: 900; vertical-align: middle; }

        .segmented-control {
            display: flex;
            background: rgba(0,0,0,0.04);
            padding: 4px;
            border-radius: 14px;
            position: relative;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .segmented-control::-webkit-scrollbar { display: none; }
        
        .segmented-control button {
            flex: 1;
            padding: 0.6rem 1rem;
            border: none;
            background: transparent;
            font-weight: 800;
            font-size: 0.85rem;
            color: var(--text-muted);
            border-radius: 10px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            z-index: 2;
            white-space: nowrap;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .segmented-control button.active {
            color: var(--foreground);
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .profile-link { color: inherit; text-decoration: none; transition: color 0.2s; }
        .profile-link:hover { color: var(--primary); text-decoration: underline; }
        .profile-link-white { color: white; text-decoration: none; }
        .profile-link-white:hover { text-decoration: underline; }
      `}</style>
        </div>
    );
}
