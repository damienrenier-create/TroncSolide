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
            
            // Correction matching type
            const recordObj = records.find((r: any) => r.type === timeframe.toUpperCase() || (timeframe === "today" && r.type === "DAY"));
            targetValue = recordObj?.[exercise] || 0;
        }

        // 2. Déterminer la valeur actuelle de l'utilisateur
        if (badge.id.includes("PUMP") || badge.id.includes("PUSHUP")) {
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
            else currentValue = userStats.allTime?.squats || 0;
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

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10020 }}>
            <div className="modal-content glass-premium" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

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

                {/* PROGRESSION ENCART */}
                {prog && !isOwnedByMe && (
                    <div className="progression-box glass-premium" style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase" }}>Ta Progression</div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--foreground)" }}>{prog.currentValue} / {prog.targetValue} {prog.unit}</div>
                        </div>
                        <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden", marginBottom: "10px" }}>
                            <div style={{ height: "100%", width: `${prog.percent}%`, background: isRecord ? "var(--primary)" : "var(--secondary)", transition: "width 1s ease-out" }} />
                        </div>
                        {prog.gap > 0 ? (
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", fontWeight: 700 }}>
                                Encore <span style={{ color: isRecord ? "var(--primary)" : "var(--secondary)", fontWeight: 900 }}>{prog.gap} {prog.unit}</span> pour l'obtenir {isRecord ? "🔥" : "🚀"}
                            </div>
                        ) : (
                            <div style={{ fontSize: "0.8rem", color: "#16a34a", textAlign: "center", fontWeight: 900 }}>
                                Objectif atteint ! En attente de validation...
                            </div>
                        )}
                    </div>
                )}

                {badge.xpValue > 0 && !isRecord && (
                    <Link href="/faq#xp-trophees" className="modal-stat-box" style={{ background: "rgba(217,119,6,0.1)", color: "var(--primary)", textDecoration: "none", cursor: "pointer", marginBottom: "1rem" }}>
                        <Zap size={16} />
                        <strong>Capital Fixe : +{badge.xpValue} XP</strong>
                    </Link>
                )}

                {/* HISTORIQUE / POSSÉSSEURS */}
                <div style={{ marginTop: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: isRecord ? "var(--primary)" : "var(--secondary)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                            <Trophy size={14} /> {isRecord ? "Détenteur actuel" : "Détenteurs"}
                        </h3>
                        {isMilestone && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800 }}>{badge.users?.length || 0} possesseurs</span>}
                    </div>

                    {badge.users && badge.users.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {badge.users.map((ub: any, i: number) => (
                                <div key={i} className="owner-card">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div className="owner-avatar" style={{ background: isRecord ? "var(--primary)" : "var(--secondary)" }}>{ub.user?.nickname?.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: "800", fontSize: "1rem" }}>{ub.user?.nickname}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                                    {formatDistanceToNow(new Date(ub.awardedAt), { addSuffix: true, locale: fr })}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {!isRecord && isFirstCome && ub.rank && (
                                            <div style={{ padding: "4px 8px", borderRadius: "8px", fontSize: "0.65rem", fontWeight: "900", background: `${getRankColor(ub.rank)}22`, color: getRankColor(ub.rank), border: `1px solid ${getRankColor(ub.rank)}44` }}>
                                                {getRankName(ub.rank)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats spécifiques Records */}
                                    {isRecord && (
                                        <div className="record-stats-grid" style={{ marginTop: "0.75rem" }}>
                                            <Link href="/faq#xp-trophees" className="r-stat" style={{ textDecoration: "none" }}>
                                                <span className="r-label">Trophée Forgé</span>
                                                <span className="r-val" style={{ color: "var(--primary)" }}>{ub.baseXP} XP</span>
                                            </Link>
                                            <Link href="/faq#xp-trophees" className="r-stat" style={{ textDecoration: "none" }}>
                                                <span className="r-label">Rente Générée</span>
                                                <span className="r-val" style={{ color: "var(--secondary)" }}>+{ub.rateXP}/j</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="owner-card" style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                            Ce trophée n'a jamais été réclamé.
                            <br /><br />
                            <strong style={{ color: isRecord ? "var(--primary)" : "var(--secondary)" }}>Sois le premier !</strong>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <Link 
                        href={`/trophies?highlight=${badge.id}`}
                        onClick={onClose}
                        className="btn-primary"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.85rem", fontWeight: "900", width: "100%", padding: "12px", background: isRecord ? "var(--primary)" : "var(--secondary)" }}>
                        <Trophy size={16} /> Voir dans la salle des trophées
                    </Link>
                    
                    <button 
                        onClick={() => { onClose(); router.push("/faq#volume"); }} 
                        className="btn-ghost"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "700", width: "100%", cursor: "pointer" }}>
                        <ExternalLink size={14} /> Règlement & FAQ
                    </button>
                </div>

                <style jsx>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.6);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10020;
                        padding: 1rem;
                        animation: fadeIn 0.2s ease-out;
                    }
                    .modal-content {
                        background: var(--background);
                        width: 100%;
                        max-width: 400px;
                        border-radius: 28px;
                        padding: 2rem;
                        position: relative;
                        max-height: 90vh;
                        overflow-y: auto;
                        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .modal-close-btn {
                        position: absolute;
                        top: 1.25rem;
                        right: 1.25rem;
                        background: rgba(0,0,0,0.05);
                        border: none;
                        width: 32px; height: 32px;
                        border-radius: 50%;
                        display: flex; alignItems: center; justifyContent: center;
                        cursor: pointer;
                        color: var(--text-muted);
                    }
                    .modal-icon-wrapper {
                        width: 80px; height: 80px;
                        margin: 0 auto 1rem;
                        background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 24px;
                        display: flex; alignItems: center; justifyContent: center;
                        font-size: 2.5rem;
                        position: relative;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    }
                    .modal-spark {
                        position: absolute;
                        top: -6px; right: -6px;
                        background: var(--background);
                        color: var(--primary);
                        padding: 4px;
                        border-radius: 50%;
                        border: 1px solid var(--primary);
                        box-shadow: 0 0 10px var(--primary);
                    }
                    .modal-stat-box {
                        display: flex; alignItems: center; justify-content: center; gap: 8px;
                        padding: 0.75rem;
                        border-radius: 12px;
                        font-size: 0.9rem;
                    }
                    .owner-card {
                        background: rgba(0,0,0,0.03);
                        border: 1px solid rgba(0,0,0,0.05);
                        border-radius: 16px;
                        padding: 1rem;
                    }
                    .owner-avatar {
                        width: 36px; height: 36px;
                        color: white;
                        border-radius: 10px;
                        display: flex; alignItems: center; justifyContent: center;
                        font-weight: 900;
                        font-size: 1.2rem;
                    }
                    .record-stats-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 0.5rem;
                        background: rgba(255,255,255,0.05);
                        padding: 0.75rem;
                        border-radius: 12px;
                    }
                    .r-stat {
                        display: flex; flexDirection: column;
                    }
                    .r-label {
                        font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;
                    }
                    .r-val {
                        font-size: 1.1rem; font-weight: 900;
                    }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                `}</style>
            </div>
        </div>
    );
}
