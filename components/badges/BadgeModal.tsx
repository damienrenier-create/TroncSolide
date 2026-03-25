import React from "react";
import { X, Trophy, TrendingUp, Calendar, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function BadgeModal({ badge, onClose }: { badge: any, onClose: () => void }) {
    if (!badge) return null;

    const isRecord = badge.id?.startsWith("RECORD_");
    const isFirstCome = badge.type === "FIRST_COME";

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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-premium" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div className="modal-icon-wrapper">
                        <span>{badge.icon}</span>
                        {isFirstCome && <Zap size={14} className="modal-spark" />}
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "900", marginBottom: "0.5rem" }}>{badge.name}</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.4" }}>{badge.description}</p>
                </div>

                {badge.xpValue > 0 && !isRecord && (
                    <div className="modal-stat-box" style={{ background: "rgba(217,119,6,0.1)", color: "var(--primary)" }}>
                        <Zap size={16} />
                        <strong>Capital Fixe : +{badge.xpValue} XP</strong>
                    </div>
                )}

                {/* HISTORIQUE / POSSÉSSEURS */}
                <div style={{ marginTop: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--secondary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Trophy size={14} /> {isRecord ? "Détenteur actuel" : "Joueurs sur ce palier"}
                    </h3>

                    {badge.users && badge.users.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {badge.users.map((ub: any, i: number) => (
                                <div key={i} className="owner-card">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div className="owner-avatar">{ub.user?.nickname?.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: "800", fontSize: "1rem" }}>{ub.user?.nickname}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                    Obtenu le {new Date(ub.awardedAt).toLocaleDateString("fr-FR")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats spécifiques */}
                                    {isRecord && (
                                        <div className="record-stats-grid">
                                            <div className="r-stat">
                                                <span className="r-label">Trophée Forgé</span>
                                                <span className="r-val" style={{ color: "var(--primary)" }}>{ub.baseXP} XP</span>
                                            </div>
                                            <div className="r-stat">
                                                <span className="r-label">Rente Générée</span>
                                                <span className="r-val" style={{ color: "var(--secondary)" }}>+{ub.rateXP}/jour</span>
                                            </div>
                                        </div>
                                    )}

                                    {!isRecord && isFirstCome && ub.rank && (
                                        <div style={{ display: "inline-block", padding: "4px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", background: `${getRankColor(ub.rank)}22`, color: getRankColor(ub.rank), marginTop: "0.5rem" }}>
                                            {getRankName(ub.rank)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="owner-card" style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                            Ce trophée n'a jamais été réclamé.
                            <br /><br />
                            <strong style={{ color: "var(--primary)" }}>Sois le premier !</strong>
                        </div>
                    )}
                </div>

                {isRecord && badge.feedItems && badge.feedItems.length > 1 && (
                    <div style={{ marginTop: "1.5rem" }}>
                        <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                            <TrendingUp size={14} /> Historique des Braquages
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "0.5rem", borderLeft: "2px solid rgba(255,255,255,0.1)" }}>
                            {badge.feedItems.slice(1).map((feed: any, i: number) => (
                                <div key={i} style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.25rem 0" }}>
                                    <strong>{feed.user?.nickname}</strong> a détenu ce record le <br/>
                                    {new Date(feed.createdAt).toLocaleDateString("fr-FR")} à {new Date(feed.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}.
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
                    <button 
                        onClick={() => { onClose(); window.location.hash = "faq"; }} 
                        className="btn-ghost"
                        style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--secondary)", fontWeight: "700" }}>
                        <ExternalLink size={14} /> Voir le règlement complet
                    </button>
                </div>
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
                    z-index: 1000;
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
                    background: var(--secondary);
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
    );
}
