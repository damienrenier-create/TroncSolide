"use client"

import { useState, useEffect } from "react";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, Cell 
} from "recharts";
import { useRouter } from "next/navigation";
import { 
    Flame, TrendingUp, Award, ChevronLeft, ChevronRight, Share2, Filter,
    Twitter, MessageSquare 
} from "lucide-react";
import NudgeModal from "@/components/social/NudgeModal";
import { useSession } from "next-auth/react";

interface User {
    id: string;
    nickname: string;
    currentStreak: number;
    highestStreak: number;
    totalXP: number;
    level: number;
}

interface RankingsProps {
    evolutionData: {
        chartData: any[];
        users: { id: string, nickname: string }[];
        currentNickname?: string;
    };
    streakRankings: User[];
    leagueInfo: any;
}

const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
    "#ec4899", "#06b6d4", "#f43f5e", "#14b8a6", "#6366f1"
];

export default function LeagueRankingsClient({ evolutionData, streakRankings, leagueInfo }: RankingsProps) {
    const views = ["STREAKS", "LEVELS", "XP", "EVO_LEVELS", "EVO_XP"] as const;
    const [viewIndex, setViewIndex] = useState(0);
    const view = views[viewIndex];
    const [hiddenUsers, setHiddenUsers] = useState<Set<string>>(() => {
        const { users, currentNickname } = evolutionData;
        const hidden = new Set<string>();
        users.forEach(u => {
            if (u.nickname !== currentNickname) {
                hidden.add(u.nickname);
            }
        });
        return hidden;
    });
    const router = useRouter();
    const { data: session } = useSession();

    const [selectedUser, setSelectedUser] = useState<{ id: string, nickname: string } | null>(null);

    const nextView = () => setViewIndex(prev => (prev + 1) % views.length);
    const prevView = () => setViewIndex(prev => (prev - 1 + views.length) % views.length);

    const toggleUser = (nickname: string) => {
        setHiddenUsers(prev => {
            const next = new Set(prev);
            if (next.has(nickname)) next.delete(nickname);
            else next.add(nickname);
            return next;
        });
    };

    const activeUsers = evolutionData.users.filter(u => !hiddenUsers.has(u.nickname));

    const renderChart = () => {
        switch (view) {
            case "STREAKS":
            case "LEVELS":
            case "XP":
                const barDataKey = view === "STREAKS" ? "currentStreak" : view === "LEVELS" ? "level" : "totalXP";
                const sortedRankings = [...streakRankings].sort((a, b) => (b as any)[barDataKey] - (a as any)[barDataKey]);
                
                return (
                    <div style={{ height: "400px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedRankings} layout="vertical" margin={{ left: 40, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="nickname" 
                                    type="category" 
                                    tick={{ fontSize: 12, fontWeight: 700 }} 
                                    width={100}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="glass" style={{ padding: "10px", border: "1px solid var(--primary)" }}>
                                                    <p style={{ fontWeight: 900, fontSize: "0.9rem", margin: 0 }}>{data.nickname}</p>
                                                    <p style={{ fontSize: "0.8rem", margin: "4px 0", color: "var(--secondary)" }}>
                                                        {view === "STREAKS" ? `🔥 Série : ${data.currentStreak} jours` : 
                                                         view === "LEVELS" ? `⭐ Niveau : ${data.level}` : 
                                                         `✨ Total : ${data.totalXP} XP`}
                                                    </p>
                                                    {view === "STREAKS" && <p style={{ fontSize: "0.7rem", margin: 0, opacity: 0.7 }}>Record : {data.highestStreak}j</p>}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey={barDataKey} radius={[0, 10, 10, 0]}>
                                    {sortedRankings.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
            case "EVO_LEVELS":
            case "EVO_XP":
                const dataKeySuffix = view === "EVO_LEVELS" ? "_lvl" : "";
                return (
                    <div style={{ height: "400px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={evolutionData.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 10 }} 
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('fr', { day: 'numeric', month: 'short' })}
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip 
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="glass" style={{ padding: "12px", border: "1px solid var(--primary)", backdropFilter: "blur(10px)" }}>
                                                    <p style={{ fontWeight: 900, fontSize: "0.8rem", marginBottom: "8px" }}>
                                                        {label ? new Date(label).toLocaleDateString('fr', { dateStyle: 'long' }) : ''}
                                                    </p>
                                                    {payload.map((p: any, i: number) => (
                                                        <div key={i} style={{ fontSize: "0.75rem", color: p.color, fontWeight: 800, display: "flex", justifyContent: "space-between", gap: "20px" }}>
                                                            <span>{p.name.replace('_lvl', '')}</span>
                                                            <span>{p.value} {view === "EVO_LEVELS" ? "NV" : "XP"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                {evolutionData.users.map((u, i) => (
                                    <Line 
                                        key={u.id}
                                        type="monotone" 
                                        dataKey={`${u.nickname}${dataKeySuffix}`}
                                        name={u.nickname}
                                        stroke={COLORS[i % COLORS.length]} 
                                        strokeWidth={3}
                                        dot={false}
                                        hide={hiddenUsers.has(u.nickname)}
                                        animationDuration={1000}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );
        }
    };

    return (
        <div className="container" style={{ paddingBottom: "100px" }}>
            <header style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "1.5rem", padding: "1rem 0" }}>
                <button 
                    onClick={() => router.back()} 
                    style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: "1.25rem", fontWeight: 900, margin: 0 }}>CLASSEMENT {leagueInfo?.name?.toUpperCase()}</h1>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, fontWeight: 700 }}>Performances & Évolution</p>
                </div>
            </header>

            {/* TAB SELECTOR */}
            <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "16px", padding: "4px", marginBottom: "1.5rem", overflowX: "auto", scrollbarWidth: "none" }}>
                <button 
                    onClick={() => setViewIndex(0)}
                    style={{ flex: "0 0 auto", minWidth: "120px", padding: "10px", borderRadius: "12px", border: "none", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", background: view === "STREAKS" ? "white" : "none", color: view === "STREAKS" ? "var(--primary)" : "var(--text-muted)", boxShadow: view === "STREAKS" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}
                >
                    🔥 SÉRIES
                </button>
                <button 
                    onClick={() => setViewIndex(1)}
                    style={{ flex: "0 0 auto", minWidth: "120px", padding: "10px", borderRadius: "12px", border: "none", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", background: view === "LEVELS" ? "white" : "none", color: view === "LEVELS" ? "var(--secondary)" : "var(--text-muted)", boxShadow: view === "LEVELS" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}
                >
                    ⭐ NIVEAUX
                </button>
                <button 
                    onClick={() => setViewIndex(2)}
                    style={{ flex: "0 0 auto", minWidth: "120px", padding: "10px", borderRadius: "12px", border: "none", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", background: view === "XP" ? "white" : "none", color: view === "XP" ? "var(--primary)" : "var(--text-muted)", boxShadow: view === "XP" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}
                >
                    ✨ XP TOTAL
                </button>
                <button 
                    onClick={() => setViewIndex(3)}
                    style={{ flex: "0 0 auto", minWidth: "120px", padding: "10px", borderRadius: "12px", border: "none", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", background: view === "EVO_LEVELS" ? "white" : "none", color: view === "EVO_LEVELS" ? "var(--secondary)" : "var(--text-muted)", boxShadow: view === "EVO_LEVELS" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}
                >
                    📈 EVO. NIVEAUX
                </button>
                <button 
                    onClick={() => setViewIndex(4)}
                    style={{ flex: "0 0 auto", minWidth: "120px", padding: "10px", borderRadius: "12px", border: "none", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", background: view === "EVO_XP" ? "white" : "none", color: view === "EVO_XP" ? "var(--primary)" : "var(--text-muted)", boxShadow: view === "EVO_XP" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}
                >
                    📈 EVO. XP
                </button>
            </div>

            {/* CHART CARD */}
            <div className="glass-premium" style={{ padding: "1.5rem", borderRadius: "24px", marginBottom: "1.5rem", background: "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px" }}>
                        {(view === "STREAKS" || view === "LEVELS" || view === "XP") ? <Award size={18} className="text-secondary"/> : <TrendingUp size={18} className="text-primary"/>}
                        {view === "STREAKS" ? "Classement des Séries" : 
                         view === "LEVELS" ? "Niveaux Actuels" : 
                         view === "XP" ? "XP Totale Accumulée" :
                         view === "EVO_LEVELS" ? "Évolution des Niveaux" : "Évolution de l'XP"}
                    </h3>
                </div>
                
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <button onClick={prevView} className="carousel-btn left"><ChevronLeft size={20}/></button>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        {renderChart()}
                    </div>
                    <button onClick={nextView} className="carousel-btn right"><ChevronRight size={20}/></button>
                </div>

                {/* LEGEND TOGGLER (For Evolution Charts only) */}
                {(view === "EVO_LEVELS" || view === "EVO_XP") && (
                    <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                        {evolutionData.users.map((u, i) => (
                            <button 
                                key={u.id}
                                onClick={() => toggleUser(u.nickname)}
                                style={{ 
                                    padding: "6px 12px", borderRadius: "100px", border: "none", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", 
                                    background: hiddenUsers.has(u.nickname) ? "rgba(0,0,0,0.05)" : COLORS[i % COLORS.length],
                                    color: hiddenUsers.has(u.nickname) ? "var(--text-muted)" : "white",
                                    opacity: hiddenUsers.has(u.nickname) ? 0.5 : 1,
                                    textDecoration: hiddenUsers.has(u.nickname) ? "line-through" : "none",
                                    transition: "all 0.2s"
                                }}
                            >
                                {u.nickname}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* TABLE VIEW (Always visible as reference) */}
            <div className="glass" style={{ padding: "0" }}>
                <div style={{ padding: "1rem", fontWeight: 900, fontSize: "0.8rem", borderBottom: "1px solid rgba(0,0,0,0.03)", textTransform: "uppercase", color: "var(--text-muted)" }}>Détails de la Ligue</div>
                {streakRankings.map((u, i) => (
                    <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: i < streakRankings.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "1rem", width: "24px", textAlign: "center", fontWeight: 900 }}>{i + 1}</span>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: COLORS[i % COLORS.length], color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 900 }}>{u.nickname.charAt(0)}</div>
                            <div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 900 }}>{u.nickname}</div>
                                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)" }}>NV {u.level} • Record : {u.highestStreak}j</div>
                            </div>
                        </div>
                        <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "1rem", fontWeight: 900, color: "var(--secondary)" }}>{u.currentStreak}j 🔥</div>
                                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)" }}>{u.totalXP.toLocaleString()} XP</div>
                            </div>
                            
                            {session?.user?.id !== u.id && (
                                <button 
                                    onClick={() => setSelectedUser({ id: u.id, nickname: u.nickname })}
                                    className="tweet-action-btn"
                                    title={`Envoyer un tweet à ${u.nickname}`}
                                >
                                    <Twitter size={18} fill="currentColor" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedUser && (
                <NudgeModal 
                    receiverId={selectedUser.id}
                    receiverName={selectedUser.nickname}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            <style jsx>{`
                .glass-premium { box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .text-primary { color: var(--primary); }
                .text-secondary { color: var(--secondary); }
                .carousel-btn {
                    background: rgba(0,0,0,0.03); 
                    border: none; 
                    width: 36px; 
                    height: 36px; 
                    border-radius: 50%; 
                    display: flex; 
                    alignItems: center; 
                    justifyContent: center; 
                    cursor: pointer;
                    z-index: 10;
                    transition: all 0.2s;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                }
                .carousel-btn:hover { background: rgba(0,0,0,0.1); }
                .carousel-btn.left { left: -10px; }
                .carousel-btn.right { right: -10px; }
                .tweet-action-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    background: #F0F7FF;
                    color: #1DA1F2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .tweet-action-btn:hover {
                    background: #1DA1F2;
                    color: white;
                    transform: scale(1.1) rotate(-10deg);
                }
            `}</style>
        </div>
    );
}
