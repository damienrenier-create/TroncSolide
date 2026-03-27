"use client";

import React from "react";
import { X, Trophy, TrendingUp, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function BadgeModal({ badge, onClose, userStats, records }: { badge: any, onClose: () => void, userStats?: any, records?: any[] }) {
    const router = useRouter();
    if (!badge) return null;

    const isRecord = badge.id?.startsWith("RECORD_");
    const isFirstCome = badge.type === "FIRST_COME";
    const isMilestone = isFirstCome && !isRecord;

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return "#38bdf8"; // Platine
            case 2: return "#fbbf24"; // Or
            case 3: return "#94a3b8"; // Argent
            case 4: return "#b45309"; // Bronze
            case 5: return "#78716c"; // Argile
            default: return "var(--text-muted)";
        }
    };

    const getRankName = (rank: number) => {
        switch (rank) {
            case 1: return "💎 Platine";
            case 2: return "🥇 Or";
            case 3: return "🥈 Argent";
            case 4: return "🥉 Bronze";
            case 5: return "🏺 Argile";
            default: return `Classé #${rank}`;
        }
    };

    // --- LOGIQUE DE PROGRESSION ---
    const getProgressionData = () => {
        if (!userStats) return null;

        let currentValue = 0;
        let targetValue = 0;
        let unit = "";

        // 1. Déterminer le seuil (Target)
        if (isMilestone) {
            const match = badge.id.match(/\d+/);
            targetValue = match ? parseInt(match[0]) : 0;
        } else if (isRecord && records) {
            const exercise = badge.id.includes("PUSHUP") ? "pushups" : badge.id.includes("SQUAT") ? "squats" : "plank";
            const timeframe = badge.id.includes("DAY") ? "today" : badge.id.includes("WEEK") ? "week" : badge.id.includes("MONTH") ? "month" : "allTime";
            
            const recordObj = records.find((r: any) => r.type === timeframe.toUpperCase() || (timeframe === "today" && r.type === "DAY"));
            targetValue = recordObj?.[exercise] || 0;
        }

        // 2. Déterminer la valeur actuelle de l'utilisateur (Utilise la nouvelle structure allTime, week, today...)
        if (badge.id.startsWith("HOLISTIC_")) {
            unit = "/exo";
            if (badge.id.includes("_LOG_")) {
                currentValue = userStats.allTime?.maxHolisticSession || 0;
            } else if (badge.id.includes("_MILESTONE_")) {
                const allTime = userStats.allTime || {};
                currentValue = Math.min(
                    allTime.pushups || 0,
                    allTime.squats || 0,
                    allTime.ventral || 0,
                    allTime.lateral_l || 0,
                    allTime.lateral_r || 0
                );
            }
        } else if (badge.id.includes("PUMP") || badge.id.includes("PUSHUP")) {
            unit = "pompes";
            if (badge.id.startsWith("SERIE_") || badge.id.includes("SERIES")) currentValue = userStats.allTime?.maxPushups || 0;
            else if (badge.id.includes("DAY")) currentValue = userStats.today?.pushups || 0;
            else if (badge.id.includes("WEEK")) currentValue = userStats.week?.pushups || 0;
            else if (badge.id.includes("MONTH")) currentValue = userStats.month?.pushups || 0;
            else currentValue = userStats.allTime?.pushups || 0;
        } else if (badge.id.includes("SQUAT")) {
            unit = "squats";
            if (badge.id.startsWith("SERIE_") || badge.id.includes("SERIES")) currentValue = userStats.allTime?.maxSquats || 0;
            else if (badge.id.includes("DAY")) currentValue = userStats.today?.squats || 0;
            else if (badge.id.includes("WEEK")) currentValue = userStats.week?.squats || 0;
            else if (badge.id.includes("MONTH")) currentValue = userStats.month?.squats || 0;
            else currentValue = userStats.allTime?.squats || 0; // FIX: Was pushups!
        } else if (badge.id.includes("PLANK")) {
            unit = badge.id.includes("SERIE") ? "secondes" : "s";
            if (badge.id.startsWith("SERIE_") || badge.id.includes("SERIES")) currentValue = userStats.allTime?.maxPlank || 0;
            else if (badge.id.includes("DAY")) currentValue = userStats.today?.plank || 0;
            else if (badge.id.includes("WEEK")) currentValue = userStats.week?.plank || 0;
            else if (badge.id.includes("MONTH")) currentValue = userStats.month?.plank || 0;
            else currentValue = userStats.allTime?.plank || 0;
        }

        if (targetValue === 0) return null;
        const gap = Math.max(0, targetValue - currentValue);
        const percent = Math.min(100, Math.floor((currentValue / targetValue) * 100));

        return { currentValue, targetValue, gap, unit, percent };
    };

    const prog = getProgressionData();
    const isOwnedByMe = badge.users?.some((ub: any) => ub.userId === userStats?.userId);
    const faqAnchor = isRecord ? "#records" : isMilestone ? "#pionniers" : "#xp-trophees";

    const modalOverlayStyle: React.CSSProperties = {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        zIndex: 100000,
        padding: "1rem",
        animation: "fadeIn 0.3s ease-out"
    };

    const modalContentStyle: React.CSSProperties = {
        background: "white",
        width: "100%", 
        maxWidth: "380px",
        borderRadius: "32px",
        padding: "2rem",
        position: "relative",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        animation: "modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button className="badge-modal-close" onClick={onClose}><X size={20} /></button>

                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div className="modal-icon-wrapper">
                        <span>{badge.icon}</span>
                        {isFirstCome && <Zap size={14} className="modal-spark" />}
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "900", marginBottom: "0.25rem" }}>{badge.name}</h2>
                    <div style={{ fontSize: "0.7rem", fontWeight: 900, color: isRecord ? "var(--primary)" : "var(--secondary)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "0.75rem" }}>
                        {isRecord ? "🏆 Record de Ligue" : isMilestone ? "🎯 Palier Pionnier" : "✨ Succès Personnel"}
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.4" }}>{badge.description}</p>
                </div>

                {badge.xpValue > 0 && (
                    <div className="badge-xp-badge" style={{ background: isRecord ? "rgba(217,119,6,0.1)" : "rgba(37,99,235,0.1)", color: isRecord ? "var(--primary)" : "var(--secondary)" }}>
                        <Zap size={14} /> <strong>+{badge.xpValue} XP</strong>
                    </div>
                )}

                {/* PROGRESSION */}
                {prog && !isOwnedByMe && (
                    <div className="badge-prog-box">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase" }}>Ta Progression</div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 900 }}>{prog.currentValue} / {prog.targetValue} {prog.unit}</div>
                        </div>
                        <div className="badge-mini-bar"><div className="badge-mini-fill" style={{ width: `${prog.percent}%`, background: isRecord ? "var(--primary)" : "var(--secondary)" }} /></div>
                        {prog.gap > 0 && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "8px" }}>Encore <strong>{prog.gap} {prog.unit}</strong> pour l'obtenir ! 🚀</div>}
                    </div>
                )}

                {/* HOLDERS */}
                <div style={{ marginTop: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 900, color: "var(--text-muted)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Trophy size={14} className="text-primary"/> {isRecord ? "Champion actuel" : "Détenteurs"}
                    </h3>

                    {badge.users && badge.users.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {badge.users.slice(0, 5).map((ub: any, i: number) => (
                                <div key={i} className="owner-card-mini">
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div className="owner-avatar-mini" style={{ background: isRecord ? "var(--primary)" : "var(--secondary)" }}>{ub.user?.nickname?.charAt(0)}</div>
                                        <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{ub.user?.nickname}</div>
                                    </div>
                                    {ub.rank && (
                                        <div style={{ fontSize: "0.65rem", fontWeight: 900, color: getRankColor(ub.rank) }}>{getRankName(ub.rank)}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="owner-empty">Ce trophée n'a jamais été réclamé. <br/> <strong>Sois le premier !</strong></div>
                    )}
                </div>

                <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <Link 
                        href={`/trophies?highlight=${badge.id}`}
                        onClick={onClose}
                        className="btn-primary"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "900", width: "100%", padding: "12px", background: isRecord ? "var(--primary)" : "var(--secondary)" }}>
                        VOIR DANS LA SALLE DES TROPHÉES
                    </Link>
                    
                    <Link 
                        href={`/faq${faqAnchor}`}
                        onClick={onClose}
                        style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textDecoration: "none" }}>
                        Règlement & FAQ
                    </Link>
                </div>

                <style jsx>{`
                    .badge-modal-close {
                        position: absolute; top: 1.25rem; right: 1.25rem;
                        background: rgba(0,0,0,0.05); border: none;
                        width: 32px; height: 32px; border-radius: 50%;
                        cursor: pointer; display: flex; align-items: center; justify-content: center;
                    }
                    .badge-xp-badge {
                        display: inline-flex; align-items: center; gap: 6px;
                        padding: 6px 12px; border-radius: 100px;
                        font-size: 0.8rem; margin: 0 auto 1.5rem; width: fit-content;
                        display: block; margin-left: auto; margin-right: auto;
                    }
                    .badge-prog-box {
                        background: rgba(0,0,0,0.03); padding: 1rem; border-radius: 20px;
                    }
                    .badge-mini-bar { height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden; }
                    .badge-mini-fill { height: 100%; transition: width 1.5s ease; }
                    .owner-card-mini {
                        display: flex; justify-content: space-between; align-items: center;
                        background: rgba(0,0,0,0.02); padding: 8px 12px; border-radius: 12px;
                    }
                    .owner-avatar-mini {
                        width: 24px; height: 24px; border-radius: 6px; color: white;
                        display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.75rem;
                    }
                    .owner-empty {
                        padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem; line-height: 1.5;
                        background: rgba(0,0,0,0.02); border-radius: 20px; border: 1px dashed rgba(0,0,0,0.1);
                    }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes modalPop { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
                `}</style>
            </div>
        </div>
    );
}
