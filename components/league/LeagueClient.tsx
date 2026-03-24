"use client"

import { useState } from "react";
import { ExerciseType, RecordType, RecordTimeframe } from "@prisma/client";
import { Trophy, Calendar, Filter, Zap, Target, Flame } from "lucide-react";
import Link from "next/link";
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
    onFilterChange: (exercise: ExerciseType, type: RecordType, timeframe: RecordTimeframe) => Promise<Ranking[]>;
}

export default function LeagueClient({
    initialRankings,
    leagueName,
    currentUserId,
    initialFeedItems,
    allRecords,
    top3AbsoluteRecords,
    onFilterChange
}: LeagueClientProps) {
    const [rankings, setRankings] = useState<Ranking[]>(initialRankings);
    const [exercise, setExercise] = useState<ExerciseType>("VENTRAL");
    const [type, setType] = useState<RecordType>("VOLUME");
    const [timeframe, setTimeframe] = useState<RecordTimeframe>("WEEK");
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"RANKINGS" | "GAZETTE" | "GLOBAL">("RANKINGS");

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

    return (
        <div className="container" style={{ padding: "1.5rem 1rem" }}>
            <header style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0 }}>{leagueName} 🏆</h2>
                
                <div className="segmented-control">
                    <button onClick={() => setView("RANKINGS")} className={view === "RANKINGS" ? 'active' : ''}>Podiums</button>
                    <button onClick={() => setView("GLOBAL")} className={view === "GLOBAL" ? 'active' : ''}>Vue Globale</button>
                    <button onClick={() => setView("GAZETTE")} className={view === "GAZETTE" ? 'active' : ''}>
                        Gazette <span className="gazette-tag" title="Flux d'actualités">News</span>
                    </button>
                </div>
            </header>

            {view === "RANKINGS" ? (
                <>
                    {/* Filters Hub - Premium Chips */}
                    <section style={{ marginBottom: "2.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {/* Exercise Chips */}
                            <div className="filter-group">
                                <div className="filter-scroll">
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
                                            className={`chip ${exercise === ex.id ? 'active' : ''}`}
                                        >
                                            <span style={{ fontSize: "1rem" }}>{ex.icon}</span>
                                            {ex.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                {/* Type Chips */}
                                <div className="filter-group mini">
                                    <div className="filter-scroll">
                                        {[
                                            { id: "VOLUME", label: "VOLUME" },
                                            { id: "SERIES", label: "RECORD" }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => handleUpdate(exercise, t.id as RecordType, timeframe)}
                                                className={`chip-small ${type === t.id ? 'active' : ''}`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Période Chips */}
                                <div className="filter-group mini">
                                    <div className="filter-scroll">
                                        {[
                                            { id: "DAY", label: "Jour" },
                                            { id: "WEEK", label: "Semaine" },
                                            { id: "MONTH", label: "Mois" }
                                        ].map(tf => (
                                            <button
                                                key={tf.id}
                                                onClick={() => handleUpdate(exercise, type, tf.id as RecordTimeframe)}
                                                className={`chip-small ${timeframe === tf.id ? 'active' : ''}`}
                                            >
                                                {tf.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Podium Prestige */}
                    <div className="podium-container" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                        {top3.length > 0 ? (
                            <div className="podium">
                                {/* Rank 2 (Silver) */}
                                {top3[1] && (
                                    <div className="podium-step rank-2">
                                        <div className="player-avatar-ring silver">
                                            <span>🥇</span>
                                        </div>
                                        <div className="player-name-pop">
                                            <Link href={`/profile/${encodeURIComponent(top3[1].nickname)}`} className="profile-link">{top3[1].nickname}</Link>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}><StreakFlame streak={top3[1].currentStreak} /></div>
                                        </div>
                                        <div className="step-bar-3d silver">
                                            <span className="rank-label">OR</span>
                                            <div className="val-badge">{top3[1].value}{exercise.includes('VENTRAL') || exercise.includes('LATERAL') ? 's' : ''}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Rank 1 (Gold) */}
                                <div className="podium-step rank-1">
                                    <div className="crown-premium">
                                        <Trophy size={28} className="gold-icon" />
                                    </div>
                                    <div className="player-avatar-ring gold">
                                        <span>💎</span>
                                    </div>
                                    <div className="player-name-pop" style={{ fontSize: "1rem" }}>
                                        <Link href={`/profile/${encodeURIComponent(top3[0].nickname)}`} className="profile-link">{top3[0].nickname}</Link>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}><StreakFlame streak={top3[0].currentStreak} /></div>
                                    </div>
                                    <div className="step-bar-3d gold">
                                        <span className="rank-label">DIAMANT</span>
                                        <div className="val-badge main">{top3[0].value}{exercise.includes('VENTRAL') || exercise.includes('LATERAL') ? 's' : ''}</div>
                                    </div>
                                </div>

                                {/* Rank 3 (Bronze) */}
                                {top3[2] && (
                                    <div className="podium-step rank-3">
                                        <div className="player-avatar-ring bronze">
                                            <span>🥈</span>
                                        </div>
                                        <div className="player-name-pop">
                                            <Link href={`/profile/${encodeURIComponent(top3[2].nickname)}`} className="profile-link">{top3[2].nickname}</Link>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}><StreakFlame streak={top3[2].currentStreak} /></div>
                                        </div>
                                        <div className="step-bar-3d bronze">
                                            <span className="rank-label">ARGENT</span>
                                            <div className="val-badge">{top3[2].value}{exercise.includes('VENTRAL') || exercise.includes('LATERAL') ? 's' : ''}</div>
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

                    {/* competitors list */}
                    <section className="ranking-list" style={{ marginTop: "3.5rem" }}>
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
                                            <Link href={`/profile/${encodeURIComponent(r.nickname)}`} className="profile-link" style={{ fontWeight: "800" }}>{r.nickname}</Link>
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
            ) : (
                <GazetteComponent initialItems={initialFeedItems} currentUserId={currentUserId} />
            )}

            <style jsx>{`
        /* Segmented Control Header */
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
        
        .gazette-tag {
            background: var(--primary);
            color: white;
            font-size: 0.55rem;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Streak Badges */
        .streak-badge {
            display: flex;
            align-items: center;
            gap: 2px;
            font-size: 0.7rem;
            background: rgba(0,0,0,0.03);
            padding: 2px 6px;
            border-radius: 6px;
        }
        .flame-warm {
            background: rgba(249, 115, 22, 0.1);
        }
        .flame-hot {
            background: rgba(239, 68, 68, 0.1);
            animation: pulse-hot 2s infinite;
        }
        .flame-mythic {
            background: rgba(12, 235, 235, 0.1);
            animation: pulse-mythic 1.5s infinite;
            box-shadow: 0 0 10px rgba(12, 235, 235, 0.2);
        }
        @keyframes pulse-hot {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(239,68,68,0.5)); }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 6px rgba(239,68,68,0.8)); }
        }
        @keyframes pulse-mythic {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(12,235,235,0.6)); }
            50% { transform: scale(1.1); filter: drop-shadow(0 0 12px rgba(32,227,178,0.9)); }
        }

        .profile-link {
            color: inherit;
            text-decoration: none;
            transition: color 0.2s;
        }
        .profile-link:hover {
            color: var(--primary);
            text-decoration: underline;
        }
        .profile-link-white {
            color: white;
            text-decoration: none;
        }
        .profile-link-white:hover {
            text-decoration: underline;
        }

        /* Legacy Filter Scroll */
        .filter-group {
          margin-bottom: 0.5rem;
        }
        .filter-scroll {
          display: flex;
          gap: 0.6rem;
          overflow-x: auto;
          padding: 4px 2px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .filter-scroll::-webkit-scrollbar { display: none; }

        .chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background: white;
          border: 1px solid rgba(0,0,0,0.05);
          padding: 0.6rem 1.1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-muted);
          white-space: nowrap;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .chip.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
        }

        .chip-small {
          background: rgba(0,0,0,0.03);
          border: none;
          padding: 0.4rem 0.9rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 900;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }
        .chip-small.active {
          background: var(--foreground);
          color: white;
        }

        .podium {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 0.5rem;
          height: 300px;
          margin-top: 1rem;
          padding-bottom: 20px;
        }

        .podium-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          max-width: 110px;
        }

        .player-avatar-ring {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border: 3px solid white;
          z-index: 2;
        }
        .player-avatar-ring.gold { border-color: #fbbf24; background: linear-gradient(135deg, #fef3c7, #fbbf24); }
        .player-avatar-ring.silver { border-color: #94a3b8; background: linear-gradient(135deg, #f1f5f9, #94a3b8); }
        .player-avatar-ring.bronze { border-color: #d97706; background: linear-gradient(135deg, #ffedd5, #d97706); }

        .player-name-pop {
          font-weight: 900;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
          text-align: center;
          color: var(--foreground);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-shadow: 0 1px 0 white;
        }

        .step-bar-3d {
          width: 100%;
          border-radius: 12px 12px 4px 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 1rem;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .step-bar-3d.gold { 
          height: 150px; 
          background: linear-gradient(180deg, #fbbf24 0%, #d97706 100%);
          border-top: 4px solid #fde68a;
        }
        .step-bar-3d.silver { 
          height: 100px; 
          background: linear-gradient(180deg, #94a3b8 0%, #475569 100%);
          border-top: 4px solid #cbd5e1;
        }
        .step-bar-3d.bronze { 
          height: 70px; 
          background: linear-gradient(180deg, #d97706 0%, #92400e 100%);
          border-top: 4px solid #fbbf24;
        }

        .rank-label {
          font-weight: 900;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: auto;
        }

        .val-badge {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          padding: 4px 8px;
          border-radius: 80px;
          color: white;
          font-weight: 900;
          font-size: 0.85rem;
          margin-bottom: 12px;
        }
        .val-badge.main {
          font-size: 1.1rem;
          padding: 6px 12px;
          background: rgba(255,255,255,0.3);
        }

        .crown-premium {
          position: absolute;
          top: -35px;
          z-index: 3;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }
        .gold-icon { color: #fbbf24; fill: #fbbf24; }

        .premium-rank-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          transition: transform 0.2s ease;
        }
        .premium-rank-card:active { transform: scale(0.98); }

        .rank-circle {
          width: 32px;
          height: 32px;
          background: rgba(0,0,0,0.03);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 900;
          color: var(--text-muted);
        }

        .user-letter {
          width: 40px;
          height: 40px;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.1rem;
        }

        .self-tag {
          font-size: 0.6rem;
          background: var(--primary);
          color: white;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 900;
        }

        .user-nick-row {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .rank-score {
          font-weight: 900;
          color: var(--foreground);
          font-size: 1.1rem;
          text-align: right;
        }
        .rank-score span {
            display: block;
            font-size: 0.65rem;
            color: var(--text-muted);
            font-weight: 700;
            margin-top: -2px;
        }
      `}</style>
        </div>
    );
}
