"use client"

import { useState } from "react";
import { User, Award, Flame, Calendar, Medal, Mail } from "lucide-react";
import { getLevelInfo } from "@/lib/constants/levels";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import BadgeModal from "@/components/badges/BadgeModal";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import Link from "next/link";
import NudgeModal from "@/components/social/NudgeModal";
import { useSession } from "next-auth/react";

export default function PublicProfileClient({ profile }: { profile: any }) {
    const [selectedBadge, setSelectedBadge] = useState<any>(null);
    const [showNudgeModal, setShowNudgeModal] = useState(false);
    const { data: session } = useSession();
    const levelInfo = getLevelInfo(profile.totalXP);

    // Compute Chart Data
    let totalPompes = 0;
    let totalSquats = 0;
    let totalGainage = 0;
    let xpSessions = 0;

    profile.sessions.forEach((s: any) => {
        xpSessions += s.xpGained;
        if (s.type === 'PUSHUP') totalPompes += s.value;
        else if (s.type === 'SQUAT') totalSquats += s.value;
        else totalGainage += s.value; // VENTRAL, LATERAL
    });

    const xpBadges = Math.max(0, profile.totalXP - xpSessions);

    // Radar Data
    const radarData = [
        { subject: 'Force (Pompes)', A: totalPompes || 0 },
        { subject: 'Base (Squats)', A: totalSquats || 0 },
        { subject: 'Résistance (Gainage)', A: totalGainage || 0 }
    ];

    // Pie Data
    const pieData = [
        { name: 'Entraînement', value: xpSessions, color: '#3b82f6' }, // Blue
        { name: 'Distinctions & Records', value: xpBadges, color: '#f59e0b' } // Amber
    ];

    // Get active records count
    const recordCount = profile.records?.length || 0;

    return (
        <div className="container dashboard-container" style={{ maxWidth: "100%" }}>
            {/* 1. Header Hero Card (Pompes entre potes style) */}
            <header className="public-hero-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", marginBottom: "2rem" }}>
                    <div className="big-avatar">
                        {profile.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="sub-role">NV. {levelInfo.level} - {levelInfo.name.toUpperCase()}</div>
                        <h2 className="big-nickname">{profile.nickname}</h2>
                        
                        <div className="since-date">
                            <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
                            MEMBRE DEPUIS LE {new Date(profile.joinedAt).toLocaleDateString()}
                        </div>

                        {/* Pop up Action Button */}
                        <div style={{ marginTop: "1rem" }}>
                            <button 
                                onClick={() => setShowNudgeModal(true)}
                                className="popup-hero-btn"
                            >
                                <Mail size={18} />
                                <span>Lui envoyer un Pop up</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4 Stats Boxes */}
                <div className="public-stats-grid">
                    <div className="public-stat-box">
                        <span className="stat-box-title">EXP TOTAL</span>
                        <div className="stat-box-value">{profile.totalXP} <span className="stat-box-unit">XP</span></div>
                    </div>
                    <div className="public-stat-box" style={{ background: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.3)" }}>
                        <span className="stat-box-title" style={{ color: "#3b82f6" }}>REPS TOTALES</span>
                        <div className="stat-box-value" style={{ color: "white" }}>{totalPompes + totalSquats} <span className="stat-box-unit">REPS</span></div>
                    </div>
                    <div className="public-stat-box">
                        <span className="stat-box-title">DISTINCTIONS</span>
                        <div className="stat-box-value">{profile.badges.length} <span className="stat-box-unit">BADGES</span></div>
                    </div>
                    <div className="public-stat-box" style={{ borderColor: profile.currentStreak >= 7 ? "rgba(239, 68, 68, 0.4)" : "rgba(255,255,255,0.1)" }}>
                        <span className="stat-box-title">ASSIDUITÉ</span>
                        <div className="stat-box-value" style={{ color: profile.currentStreak >= 7 ? "#ef4444" : "inherit" }}>
                            {profile.currentStreak} <span className="stat-box-unit">JOURS STREAK</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. STATISTIQUES & ANALYTICS */}
            <section className="glass white-bg-section" style={{ padding: "2rem", marginBottom: "1.5rem", borderRadius: "32px" }}>
                <h3 className="section-super-title">📊 STATISTIQUES & ANALYTICS</h3>
                
                <div className="charts-container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around", gap: "2rem", marginTop: "2rem" }}>
                    
                    {/* Radar Chart */}
                    <div className="chart-box" style={{ flex: "1 1 300px", minWidth: "300px", height: "250px", position: "relative" }}>
                        <h4 style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: "900", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                            Profil Physiologique
                        </h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid gridType="polygon" stroke="rgba(0,0,0,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 800 }} />
                                <Radar name="Joueur" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="chart-box" style={{ flex: "1 1 300px", minWidth: "300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <h4 style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: "900", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Origine du Prestige (XP)
                        </h4>
                        
                        <div style={{ width: "220px", height: "220px", position: "relative" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [`${value} XP`, '']} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", fontWeight: 800 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                                <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--foreground)" }}>{profile.totalXP}</div>
                                <div style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-muted)" }}>TOTAL XP</div>
                            </div>
                        </div>
                        
                        {/* Legend */}
                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                            {pieData.map(d => (
                                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", fontWeight: "800", color: "var(--text-muted)" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color }}></div>
                                    {d.name.toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* 3. VITRINE (Badges) */}
            <h3 className="section-super-title" style={{ color: "white", paddingLeft: "1rem", marginBottom: "1rem", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                🏆 VITRINE DE {profile.nickname.toUpperCase()}
            </h3>
            
            <section className="glass-premium white-bg-section" style={{ padding: "1.5rem", borderRadius: "32px", marginBottom: "3rem" }}>
                <div className="showcase-grid">
                    {profile.badges.length > 0 ? profile.badges.map((b: any) => {
                        const def = BADGE_DEFINITIONS.find(d => d.id === b.badgeId || d.name === b.badge?.name);
                        
                        const enrichedBadge = def ? {
                            ...def,
                            users: [b] // Mock the single ownership for the viewer Modal
                        } : null;

                        return (
                            <div key={b.id} title={def?.description} className="trophy-case-item" onClick={() => enrichedBadge && setSelectedBadge(enrichedBadge)} style={{ cursor: "pointer" }}>
                                <div className={`trophy-icon-wrapper ${def?.type === "FIRST_COME" ? 'first-come-glow' : ''}`}>
                                    <span style={{ fontSize: "1.75rem" }}>{def?.icon}</span>
                                </div>
                                <span className="trophy-name">{def?.name}</span>
                            </div>
                        )
                    }) : (
                        <div style={{ gridColumn: "span 4", padding: "3rem 0", textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "800" }}>Cette vitrine est encore vide.</p>
                        </div>
                    )}
                </div>
            </section>

            {selectedBadge && <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}
            
            {showNudgeModal && (
                <NudgeModal 
                    receiverId={profile.id}
                    receiverName={profile.nickname}
                    onClose={() => setShowNudgeModal(false)}
                />
            )}

            {/* Floating Nav Bar - Improved 5-User Carousel */}
            {profile.leagueContext && profile.leagueContext.length > 0 && (
                <div style={{ 
                    position: "fixed", 
                    bottom: "110px", 
                    left: "50%", 
                    transform: "translateX(-50%)", 
                    background: "rgba(15, 23, 42, 0.95)", 
                    backdropFilter: "blur(12px)", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    borderRadius: "100px", 
                    padding: "8px 16px", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    zIndex: 100, 
                    boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
                    width: "fit-content",
                    maxWidth: "90vw"
                }}>
                    {(() => {
                        const users = profile.leagueContext;
                        const currentIndex = users.findIndex((u: any) => u.nickname.toLowerCase() === profile.nickname.toLowerCase());
                        if (currentIndex === -1) return null;

                        const getCircularIndex = (idx: number, len: number) => (idx + len) % len;
                        const offsets = [-2, -1, 0, 1, 2];
                        const windowIndices = offsets.map(offset => getCircularIndex(currentIndex + offset, users.length));
                        
                        // Handle cases with < 5 users
                        const uniqueIndices = Array.from(new Set(windowIndices));
                        const displayUsers = uniqueIndices.map(i => users[i]);

                        return displayUsers.map((u, i) => {
                            const isCurrent = u.nickname.toLowerCase() === profile.nickname.toLowerCase();
                            return (
                                <Link 
                                    key={u.id} 
                                    href={`/profile/${encodeURIComponent(u.nickname)}`}
                                    style={{ 
                                        textDecoration: "none",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        opacity: isCurrent ? 1 : 0.6,
                                        transform: isCurrent ? "scale(1.1)" : "scale(0.9)",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    <div style={{ 
                                        width: "36px", 
                                        height: "36px", 
                                        borderRadius: "50%", 
                                        background: isCurrent ? "var(--primary)" : "#1e293b",
                                        border: isCurrent ? "2px solid white" : "1px solid rgba(255,255,255,0.1)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.8rem",
                                        fontWeight: 900,
                                        color: "white"
                                    }}>
                                        {u.nickname.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ 
                                        fontSize: "0.5rem", 
                                        fontWeight: 900, 
                                        color: "white", 
                                        textTransform: "uppercase",
                                        marginTop: "4px",
                                        maxWidth: "50px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {u.nickname}
                                    </span>
                                </Link>
                            );
                        });
                    })()}
                </div>
            )}

            <style jsx>{`
                /* Hero Card Styling */
                .public-hero-card {
                    background: #0f172a; /* Deep navy blue to match screenshot */
                    border-radius: 32px;
                    padding: 2.5rem;
                    color: white;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
                    position: relative;
                    overflow: hidden;
                }
                .public-hero-card::before {
                    content: '';
                    position: absolute;
                    top: -50%; left: -50%; width: 200%; height: 200%;
                    background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 60%);
                    pointer-events: none;
                }

                .big-avatar {
                    width: 90px;
                    height: 90px;
                    background: #1e293b;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-weight: 900;
                    color: white;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                }

                .sub-role {
                    font-size: 0.65rem;
                    font-weight: 900;
                    color: #3b82f6;
                    background: rgba(59, 130, 246, 0.15);
                    padding: 4px 10px;
                    border-radius: 100px;
                    display: inline-block;
                    margin-bottom: 8px;
                    letter-spacing: 0.05em;
                }

                .big-nickname {
                    font-size: 2.2rem;
                    font-weight: 950;
                    line-height: 1.1;
                    margin: 0 0 4px 0;
                    text-transform: uppercase;
                    letter-spacing: -0.02em;
                }

                .popup-hero-btn {
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 8px 16px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
                }
                .popup-hero-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(217, 119, 6, 0.4);
                    filter: brightness(1.1);
                }

                .since-date {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .public-stats-grid {
                    display: flex;
                    gap: 1rem;
                    overflow-x: auto;
                    scrollbar-width: none;
                    margin-top: 2rem;
                    padding-bottom: 0.5rem;
                }
                .public-stat-box {
                    flex: 1;
                    min-width: 110px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .stat-box-title {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .stat-box-value {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: white;
                }
                .stat-box-unit {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                .section-super-title {
                    font-size: 0.9rem;
                    font-weight: 900;
                    color: var(--foreground);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .white-bg-section {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.05);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                }

                /* Vitrine Inherited Grid */
                .showcase-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
                    gap: 1.5rem;
                    justify-items: center;
                }
                .trophy-case-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    transition: transform 0.3s ease;
                }
                .trophy-case-item:hover {
                    transform: translateY(-5px) scale(1.05);
                }
                .trophy-icon-wrapper {
                    width: 70px;
                    height: 70px;
                    background: white;
                    border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .first-come-glow {
                    background: linear-gradient(135deg, #fef3c7, #fffbeb);
                    border-color: rgba(217, 119, 6, 0.4);
                    box-shadow: 0 8px 20px rgba(217, 119, 6, 0.15);
                }
                .trophy-name {
                    font-size: 0.55rem;
                    font-weight: 950;
                    color: var(--text-muted);
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    line-height: 1.2;
                }
            `}</style>
        </div>
    );
}
