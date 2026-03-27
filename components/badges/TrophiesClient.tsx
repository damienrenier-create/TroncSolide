"use client";

import React, { useMemo, useState } from "react";
import { Badge, ExerciseType, BadgeType, Record as LeagueRecord } from "@prisma/client";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import { Flame, CheckCircle, Trophy as TrophyIcon, ChevronDown, ChevronUp, Layers, Lock, Unlock, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import BadgeModal from "@/components/badges/BadgeModal";

interface TrophiesClientProps {
    initialBadges: any[];
    userStats: any;
    records?: LeagueRecord[];
    userId?: string;
}

export default function TrophiesClient({ initialBadges, userStats, records = [], userId }: TrophiesClientProps) {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get("highlight");
    const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
    const [openVitrines, setOpenVitrines] = useState<Record<string, boolean>>({ "holistic": true });

    // 1. Logique de calcul d'écart
    const getGapInfo = (badgeId: string, def: any, badgeInstance: any) => {
        let targetValue = 0;
        let userValue = 0;
        let unit = "";
        let label = "";

        const allTime = userStats.allTime || {};
        const today = userStats.today || {};
        const week = userStats.week || {};
        const month = userStats.month || {};

        const extractThreshold = (str: string) => {
            const matches = str.match(/(\d[\d\s]*)/);
            if (!matches) return 0;
            return parseInt(matches[0].replace(/\s/g, ''));
        };

        if (badgeId.startsWith("PUMP_")) {
            targetValue = extractThreshold(def.name);
            userValue = allTime.pushups || 0;
            unit = "reps";
            label = "Total all-time";
        } else if (badgeId.startsWith("SQUAT_")) {
            targetValue = extractThreshold(def.name);
            userValue = allTime.squats || 0;
            unit = "reps";
            label = "Total all-time";
        } else if (badgeId.startsWith("PLANK_")) {
            targetValue = extractThreshold(def.name);
            userValue = allTime.plank || 0;
            unit = "s";
            label = "Total gainage";
        } else if (badgeId.startsWith("SERIE_PUMP_")) {
            targetValue = extractThreshold(def.name);
            userValue = allTime.maxPushups || 0;
            unit = "reps";
            label = "Meilleure série";
        } else if (badgeId.startsWith("SERIE_PLANK_")) {
            const name = def.name.toLowerCase();
            if (name.includes("30s")) targetValue = 30;
            else if (name.includes("1m")) targetValue = 60;
            else if (name.includes("1m30")) targetValue = 90;
            else if (name.includes("2m")) targetValue = 120;
            else if (name.includes("3m")) targetValue = 180;
            else if (name.includes("5m")) targetValue = 300;
            else targetValue = extractThreshold(def.name);
            userValue = allTime.maxPlank || 0;
            unit = "s";
            label = "Meilleure série";
        } else if (badgeId.startsWith("RECORD_")) {
            const exercise = badgeId.includes("PUSHUP") ? "pushups" : badgeId.includes("SQUAT") ? "squats" : "plank";
            const timeframeStr = badgeId.includes("_DAY_") ? "DAY" : badgeId.includes("_WEEK_") ? "WEEK" : badgeId.includes("_MONTH_") ? "MONTH" : "SERIES";
            const leagueRecord = records.find(r => 
                r.exercise === (exercise === "plank" && timeframeStr !== "SERIES" ? "VENTRAL" : exercise.toUpperCase()) && 
                r.timeframe === (timeframeStr === "SERIES" ? "DAY" : timeframeStr) && 
                r.type === (timeframeStr === "SERIES" ? "SERIES" : "VOLUME")
            );
            targetValue = leagueRecord?.value || 0;
            if (timeframeStr === "DAY") userValue = today[exercise] || 0;
            else if (timeframeStr === "WEEK") userValue = week[exercise] || 0;
            else if (timeframeStr === "MONTH") userValue = month[exercise] || 0;
            else if (timeframeStr === "SERIES") userValue = allTime[`max${exercise.charAt(0).toUpperCase() + exercise.slice(1)}`] || 0;
            unit = exercise === "plank" ? "s" : "reps";
            label = timeframeStr === "SERIES" ? "Ton record" : "Ton volume";
        } else if (badgeId.startsWith("HOLISTIC_")) {
            const isSession = badgeId.includes("_SESSION_");
            targetValue = extractThreshold(def.name);
            unit = "efforts";
            label = isSession ? "Séance record" : "Total holistique";
            if (isSession) {
                userValue = allTime.maxHolisticSession || 0; 
            } else {
                userValue = (allTime.pushups || 0) + (allTime.squats || 0) + (allTime.plank || 0);
            }
        }

        const gap = Math.max(0, targetValue - userValue);
        const isDone = targetValue > 0 && userValue >= targetValue;
        const progress = targetValue > 0 ? Math.min(100, (userValue / targetValue) * 100) : 0;
        const isNear = targetValue > 0 && !isDone && progress >= 80;

        return { targetValue, userValue, gap, unit, label, isDone, progress, isNear };
    };

    // 2. Catégorisation des badges (Vitrines)
    const vitrines = useMemo(() => {
        const categories = [
            { id: "holistic", title: "La Vitrine Holistique 🧘", badgeIds: ["HOLISTIC_SESSION_5", "HOLISTIC_SESSION_10", "HOLISTIC_SESSION_30", "HOLISTIC_SESSION_100", "HOLISTIC_CUMULATIVE_50", "HOLISTIC_CUMULATIVE_500", "HOLISTIC_CUMULATIVE_5000"] },
            { id: "pushups", title: "Vitrine Pompes ⚓", badgeIds: ["PUMP_100", "PUMP_1000", "PUMP_2000", "PUMP_5000", "PUMP_10000", "PUMP_20000", "PUMP_50000", "PUMP_100000", "SERIE_PUMP_10", "SERIE_PUMP_50", "SERIE_PUMP_100", "SERIE_PUMP_150", "RECORD_DAY_PUSHUP", "RECORD_SERIES_PUSHUP"] },
            { id: "squats", title: "Vitrine Squats 🦵", badgeIds: ["SQUAT_100", "SQUAT_1000", "SQUAT_5000", "RECORD_DAY_SQUAT", "RECORD_SERIES_SQUAT"] },
            { id: "plank", title: "Vitrine Gainage 🛡️", badgeIds: ["PLANK_1000S", "PLANK_10000S", "PLANK_100000S", "SERIE_PLANK_30S", "SERIE_PLANK_1M", "SERIE_PLANK_1M30", "SERIE_PLANK_2M", "SERIE_PLANK_3M", "SERIE_PLANK_5M", "SERIE_PLANK_10M", "RECORD_DAY_PLANK", "RECORD_SERIES_PLANK"] },
            { id: "records", title: "Records Globaux 🏆", badgeIds: ["RECORD_WEEK_PUSHUP", "RECORD_MONTH_PUSHUP", "RECORD_WEEK_SQUAT", "RECORD_MONTH_SQUAT", "RECORD_WEEK_PLANK", "RECORD_MONTH_PLANK"] },
        ];

        return categories.map(cat => {
            const items = cat.badgeIds.map(id => {
                const def = BADGE_DEFINITIONS.find(b => b.id === id);
                const badge = initialBadges.find(b => b.id === id);
                const info = getGapInfo(id, def, badge);
                return { id, def, badge, info };
            }).filter(item => item.def);

            // Split into earned and to earn
            const earned = items.filter(i => i.info.isDone).sort((a, b) => {
                const dateA = a.badge?.users?.[0]?.awardedAt ? new Date(a.badge.users[0].awardedAt).getTime() : 0;
                const dateB = b.badge?.users?.[0]?.awardedAt ? new Date(b.badge.users[0].awardedAt).getTime() : 0;
                return dateB - dateA; // Most recent first
            });

            const toEarn = items.filter(i => !i.info.isDone).sort((a, b) => b.info.progress - a.info.progress);

            return { ...cat, earned, toEarn };
        });
    }, [initialBadges, userStats, records]);

    const toggleVitrine = (id: string) => {
        setOpenVitrines(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleAll = (open: boolean) => {
        if (!open) {
            setOpenVitrines({});
        } else {
            const newState: Record<string, boolean> = {};
            vitrines.forEach(v => newState[v.id] = true);
            setOpenVitrines(newState);
        }
    };

    const anyOpen = Object.values(openVitrines).some(v => v);

    React.useEffect(() => {
        if (highlightId) {
            const element = document.getElementById(`badge-${highlightId}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            // Optional: Auto-select it
            const b = initialBadges.find(b => b.id === highlightId);
            if (b) setSelectedBadge(b);
        }
    }, [highlightId, initialBadges]);

    return (
        <div className="trophies-room">
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "1.5rem" }}>
                <button 
                    onClick={() => toggleAll(!anyOpen)}
                    className="glass-hover"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: "800", color: "var(--text-muted)", cursor: "pointer", transition: "all 0.2s" }}
                >
                    {anyOpen ? "Tout réduire" : "Tout ouvrir"}
                </button>
            </div>

            {vitrines.map((cat) => (
                <section key={cat.id} className="vitrine-section" style={{ marginBottom: "1.5rem" }}>
                    <div 
                        onClick={() => toggleVitrine(cat.id)}
                        className="glass-hover"
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", cursor: "pointer", transition: "all 0.23s" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Layers size={20} color={openVitrines[cat.id] ? "var(--primary)" : "var(--text-muted)"} />
                            </div>
                            <h2 style={{ fontSize: "1.05rem", fontWeight: "900", color: "var(--foreground)", margin: 0 }}>{cat.title}</h2>
                        </div>
                        {openVitrines[cat.id] ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                    </div>

                    {openVitrines[cat.id] && (
                        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "slideDown 0.3s ease-out" }}>
                            
                            {/* ÉTAGE DU HAUT: ACQUIS */}
                            {cat.earned.length > 0 && (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", paddingLeft: "5px" }}>
                                        <Unlock size={14} color="var(--secondary)" />
                                        <span style={{ fontSize: "0.75rem", fontWeight: "900", color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Mes Exploits</span>
                                    </div>
                                    <div className="horizontal-scroll-container">
                                        {cat.earned.map(item => (
                                            <TrophyCard 
                                                key={item.id} 
                                                item={item} 
                                                highlightId={highlightId} 
                                                onSelect={setSelectedBadge} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ÉTAGE DU BAS: À OBTENIR */}
                            {cat.toEarn.length > 0 && (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", paddingLeft: "5px" }}>
                                        <Lock size={14} color="var(--primary)" />
                                        <span style={{ fontSize: "0.75rem", fontWeight: "900", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px" }}>Prochains Défis</span>
                                    </div>
                                    <div className="horizontal-scroll-container">
                                        {cat.toEarn.map(item => (
                                            <TrophyCard 
                                                key={item.id} 
                                                item={item} 
                                                highlightId={highlightId} 
                                                onSelect={setSelectedBadge} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </section>
            ))}

            <style jsx>{`
                .horizontal-scroll-container {
                    display: flex;
                    gap: 12px;
                    overflow-x: auto;
                    padding: 4px 4px 12px 4px;
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none;  /* IE and Edge */
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                }
                .horizontal-scroll-container::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {selectedBadge && <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} userStats={{...userStats, userId}} records={records} />}
        </div>
    );
}

function TrophyCard({ item, highlightId, onSelect }: { item: any, highlightId: string | null, onSelect: (b: any) => void }) {
    const { info, def, id, badge } = item;
    const holderNickname = badge?.users?.[0]?.user?.nickname;

    return (
        <div 
            id={`badge-${id}`} 
            onClick={() => onSelect(badge || { ...def, users: [] })}
            className={`trophy-card glass ${info.isDone ? 'done' : ''} ${highlightId === id ? 'highlighted-badge' : ''}`} 
            style={{
                flex: "0 0 160px",
                scrollSnapAlign: "center",
                padding: "1rem",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                position: "relative",
                cursor: "pointer",
                overflow: "hidden",
                background: info.isDone ? "rgba(5, 150, 105, 0.05)" : "rgba(255,255,255,1)",
                border: highlightId === id ? "2px solid var(--primary)" : (info.isNear ? "2px solid var(--primary)" : "1px solid rgba(0,0,0,0.05)"),
                transition: "transform 0.2s, box-shadow 0.3s"
            }}>
            {info.isNear && (
                <div style={{ position: "absolute", top: "5px", right: "5px", color: "var(--primary)" }}>
                    <Flame size={16} fill="currentColor" />
                </div>
            )}

            <div className="trophy-icon" style={{ fontSize: "2rem", textAlign: "center", margin: "0.4rem 0" }}>
                {def.icon}
            </div>

            <div className="trophy-info" style={{ flex: 1 }}>
                <h3 style={{ fontSize: "0.80rem", fontWeight: "900", marginBottom: "4px", lineHeight: "1.2", height: "1.2rem", overflow: "hidden" }}>{def.name}</h3>
                
                {holderNickname && (
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        👤 {holderNickname}
                    </p>
                )}

                {info.targetValue > 0 ? (
                    <>
                        <div className="progress-bar-bg" style={{ height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "2px", overflow: "hidden", marginBottom: "8px" }}>
                            <div className="progress-bar-fill" style={{ 
                                height: "100%", 
                                width: `${info.progress}%`, 
                                background: info.isDone ? "var(--secondary)" : "var(--primary)",
                                transition: "width 0.5s ease-out"
                            }}></div>
                        </div>

                        {!info.isDone ? (
                            <p style={{ fontSize: "0.7rem", fontWeight: "800", color: info.isNear ? "var(--primary)" : "var(--text-muted)" }}>
                                {info.gap > 0 ? `+${info.gap} ${info.unit}` : "Presque !"}
                            </p>
                        ) : (
                            <p style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                                <CheckCircle size={10} /> Acquis
                            </p>
                        )}
                    </>
                ) : (
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontStyle: "italic", lineHeight: "1.3" }}>
                        {def.description}
                    </p>
                )}
            </div>
            
            <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", fontSize: "0.6rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)" }}>
                <span>Stats</span>
                <span>{info.userValue}</span>
            </div>

            <style jsx>{`
                .trophy-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                .trophy-card.done {
                    border-color: rgba(5, 150, 105, 0.2) !important;
                }
                .highlighted-badge {
                    animation: pulseHighlight 2s infinite;
                    z-index: 10;
                    background: rgba(139, 92, 246, 0.05) !important;
                }
                @keyframes pulseHighlight {
                    0% { box-shadow: 0 0 0px rgba(139, 92, 246, 0); }
                    50% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.5); transform: scale(1.02); }
                    100% { box-shadow: 0 0 0px rgba(139, 92, 246, 0); }
                }
            `}</style>
        </div>
    );
}
