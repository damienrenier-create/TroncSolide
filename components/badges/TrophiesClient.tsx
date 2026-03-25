"use client";

import React, { useMemo } from "react";
import { Badge, ExerciseType, BadgeType, Record as LeagueRecord } from "@prisma/client";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import { Flame, CheckCircle, Trophy as TrophyIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface TrophiesClientProps {
    initialBadges: any[];
    userStats: any;
    records?: LeagueRecord[];
}

export default function TrophiesClient({ initialBadges, userStats, records = [] }: TrophiesClientProps) {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get("highlight");

    React.useEffect(() => {
        if (highlightId) {
            const element = document.getElementById(`badge-${highlightId}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [highlightId]);

    // 1. Catégorisation des badges (Vitrines)
    const vitrines = useMemo(() => {
        const categories = [
            { id: "pushups", title: "Vitrine Pompes ⚓", badgeIds: ["PUMP_100", "PUMP_1000", "PUMP_2000", "PUMP_5000", "PUMP_10000", "PUMP_20000", "PUMP_50000", "PUMP_100000", "SERIE_PUMP_10", "SERIE_PUMP_50", "SERIE_PUMP_100", "SERIE_PUMP_150", "RECORD_DAY_PUSHUP", "RECORD_SERIES_PUSHUP"] },
            { id: "squats", title: "Vitrine Squats 🦵", badgeIds: ["SQUAT_100", "SQUAT_1000", "SQUAT_5000", "RECORD_DAY_SQUAT", "RECORD_SERIES_SQUAT"] },
            { id: "plank", title: "Vitrine Gainage 🛡️", badgeIds: ["PLANK_1000S", "PLANK_10000S", "PLANK_100000S", "SERIE_PLANK_30S", "SERIE_PLANK_1M", "SERIE_PLANK_1M30", "SERIE_PLANK_2M", "SERIE_PLANK_3M", "SERIE_PLANK_5M", "SERIE_PLANK_10M", "RECORD_DAY_PLANK", "RECORD_SERIES_PLANK"] },
            { id: "records", title: "Records Globaux 🏆", badgeIds: ["RECORD_WEEK_PUSHUP", "RECORD_MONTH_PUSHUP", "RECORD_WEEK_SQUAT", "RECORD_MONTH_SQUAT", "RECORD_WEEK_PLANK", "RECORD_MONTH_PLANK"] },
        ];

        return categories.map(cat => ({
            ...cat,
            items: cat.badgeIds.map(id => {
                const def = BADGE_DEFINITIONS.find(b => b.id === id);
                const badge = initialBadges.find(b => b.id === id);
                return { id, def, badge };
            }).filter(item => item.def)
        }));
    }, [initialBadges]);

    // 2. Logique de calcul d'écart
    const getGapInfo = (badgeId: string, def: any, badgeInstance: any) => {
        const aggs = userStats.aggregates || [];
        const month = userStats.monthStats || [];
        const week = userStats.weekStats || [];
        const day = userStats.dayStats || [];

        const getSum = (stats: any[], type: ExerciseType) => stats.find(s => s.type === type)?._sum?.value || 0;
        const getMax = (stats: any[], type: ExerciseType) => stats.find(s => s.type === type)?._max?.value || 0;

        const extractThreshold = (str: string) => {
            const matches = str.match(/(\d[\d\s]*)/);
            if (!matches) return 0;
            return parseInt(matches[0].replace(/\s/g, ''));
        };

        let targetValue = 0;
        let userValue = 0;
        let unit = "";
        let label = "";

        // --- PALIERS DE VOLUME ---
        if (badgeId.startsWith("PUMP_")) {
            targetValue = extractThreshold(def.name);
            userValue = getSum(aggs, "PUSHUP");
            unit = "reps";
            label = "Total all-time";
        } else if (badgeId.startsWith("SQUAT_")) {
            targetValue = extractThreshold(def.name);
            userValue = getSum(aggs, "SQUAT");
            unit = "reps";
            label = "Total all-time";
        } else if (badgeId.startsWith("PLANK_")) {
            targetValue = extractThreshold(def.name);
            userValue = getSum(aggs, "VENTRAL") + getSum(aggs, "LATERAL_L") + getSum(aggs, "LATERAL_R");
            unit = "s";
            label = "Total gainage";
        }
        // --- PALIERS DE SÉRIE ---
        else if (badgeId.startsWith("SERIE_PUMP_")) {
            targetValue = extractThreshold(def.name);
            userValue = getMax(aggs, "PUSHUP");
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
            
            userValue = Math.max(getMax(aggs, "VENTRAL"), getMax(aggs, "LATERAL_L"), getMax(aggs, "LATERAL_R"));
            unit = "s";
            label = "Meilleure série";
        }
        // --- RECORDS DE LIGUE (DYNAMIQUES) ---
        else if (badgeId.startsWith("RECORD_")) {
            // Mapping ID -> Exercise & Timeframe pour chercher dans `records`
            const isPushup = badgeId.includes("PUSHUP");
            const isSquat = badgeId.includes("SQUAT");
            const isPlank = badgeId.includes("PLANK");
            const exercise = isPushup ? "PUSHUP" : isSquat ? "SQUAT" : "VENTRAL";

            const timeframe = badgeId.includes("_DAY_") ? "DAY" : badgeId.includes("_WEEK_") ? "WEEK" : badgeId.includes("_MONTH_") ? "MONTH" : "SERIES";
            
            const leagueRecord = records.find(r => r.exercise === (isPlank && timeframe !== "SERIES" ? "VENTRAL" : exercise) && r.timeframe === (timeframe === "SERIES" ? "DAY" : timeframe) && r.type === (timeframe === "SERIES" ? "SERIES" : "VOLUME"));
            
            targetValue = leagueRecord?.value || 0;
            
            if (timeframe === "DAY") userValue = getSum(day, exercise);
            else if (timeframe === "WEEK") userValue = getSum(week, exercise);
            else if (timeframe === "MONTH") userValue = getSum(month, exercise);
            else if (timeframe === "SERIES") userValue = getMax(aggs, exercise);

            unit = isPlank ? "s" : "reps";
            label = timeframe === "SERIES" ? "Ton record" : "Ton volume";
        }

        const gap = Math.max(0, targetValue - userValue);
        const isDone = targetValue > 0 && userValue >= targetValue;
        const progress = targetValue > 0 ? Math.min(100, (userValue / targetValue) * 100) : 0;
        const isNear = targetValue > 0 && !isDone && progress >= 80;

        return { targetValue, userValue, gap, unit, label, isDone, progress, isNear };
    };

    return (
        <div className="trophies-room">
            {vitrines.map((cat) => (
                <section key={cat.id} className="vitrine-section" style={{ marginBottom: "2.5rem" }}>
                    <div className="section-header" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--foreground)" }}>{cat.title}</h2>
                        <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.05)" }}></div>
                    </div>

                    <div className="trophy-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
                        {cat.items.map((item) => {
                            if (!item.def) return null;
                            const info = getGapInfo(item.id, item.def, item.badge);
                            const holderNickname = item.badge?.users?.[0]?.user?.nickname;

                            return (
                                <div key={item.id} id={`badge-${item.id}`} className={`trophy-card glass ${info.isDone ? 'done' : ''} ${highlightId === item.id ? 'highlighted-badge' : ''}`} style={{
                                    padding: "1rem",
                                    borderRadius: "20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                    position: "relative",
                                    overflow: "hidden",
                                    background: info.isDone ? "rgba(5, 150, 105, 0.05)" : "rgba(255,255,255,0.6)",
                                    border: highlightId === item.id ? "2px solid var(--primary)" : (info.isNear ? "2px solid var(--primary)" : "1px solid rgba(0,0,0,0.05)"),
                                    transition: "transform 0.2s, box-shadow 0.3s"
                                }}>
                                    {info.isNear && (
                                        <div style={{ position: "absolute", top: "5px", right: "5px", color: "var(--primary)" }}>
                                            <Flame size={16} fill="currentColor" />
                                        </div>
                                    )}

                                    <div className="trophy-icon" style={{ fontSize: "2rem", textAlign: "center", margin: "0.5rem 0" }}>
                                        {item.def.icon}
                                    </div>

                                    <div className="trophy-info">
                                        <h3 style={{ fontSize: "0.85rem", fontWeight: "900", marginBottom: "4px", lineHeight: "1.2" }}>{item.def.name}</h3>
                                        
                                        {holderNickname && (
                                            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "8px" }}>
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
                                                    <p style={{ fontSize: "0.75rem", fontWeight: "700", color: info.isNear ? "var(--primary)" : "var(--text-primary)" }}>
                                                        {info.gap > 0 ? `Encore ${info.gap} ${info.unit}` : "Bientôt à toi !"}
                                                    </p>
                                                ) : (
                                                    <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                        <CheckCircle size={12} /> Acquis
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                                                {item.def.description}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)" }}>
                                        <span>Tu as</span>
                                        <span>{info.userValue}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

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
