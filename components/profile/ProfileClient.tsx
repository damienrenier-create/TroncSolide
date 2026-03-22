"use client"

import { useState } from "react";
import { submitMedicalCertificate, exitCagnotte } from "@/lib/actions/economy";
import { signOut } from "next-auth/react";
import { User, ShieldAlert, FileText, Wallet, LogOut, Award, TreePine, Zap, Info } from "lucide-react";
import { getLevelInfo } from "@/lib/constants/levels";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import BadgeModal from "@/components/badges/BadgeModal";

export default function ProfileClient({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<any>(null);
    const levelInfo = getLevelInfo(user.totalXP);

    async function handleAddCert(formData: FormData) {
        setLoading(true);
        await submitMedicalCertificate(formData);
        setLoading(false);
    }

    async function handleExit() {
        if (confirm("Es-tu sûr de vouloir quitter la cagnotte ? Cette action est définitive pour cette ligue.")) {
            setLoading(true);
            await exitCagnotte();
            setLoading(false);
        }
    }

    return (
        <div className="container dashboard-container">
            <header style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ width: "80px", height: "80px", background: "var(--primary)", borderRadius: "50%", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(217, 119, 6, 0.2)" }}>
                    <User size={40} color="white" />
                </div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--foreground)" }}>{user.nickname}</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--secondary)", fontWeight: "800", fontSize: "0.9rem" }}>
                    <TreePine size={16} />
                    <span>Niveau {levelInfo.level} : {levelInfo.name}</span>
                </div>
            </header>

            {/* 1. Badge Trophy Room */}
            <section className="glass-premium" style={{ padding: "1.5rem", marginBottom: "1.5rem", borderRadius: "28px" }}>
                <div className="card-header" style={{ marginBottom: "1.5rem" }}>
                    <Award size={18} className="text-primary" />
                    <span>Salle des Trophées</span>
                </div>
                <div className="showcase-grid">
                    {user.badges.length > 0 ? user.badges.map((b: any) => {
                        const def = BADGE_DEFINITIONS.find(d => d.id === b.badgeId || d.name === b.badge?.name);
                        
                        // We must reconstruct the badge definition with the specific user data so the Modal can display it correctly.
                        const enrichedBadge = def ? {
                            ...def,
                            users: [b] // Pass the specific UserBadge data as the single owner for this viewer's profile
                        } : null;

                        return (
                            <div key={b.id} title={def?.description} className="trophy-case-item" onClick={() => enrichedBadge && setSelectedBadge(enrichedBadge)} style={{ cursor: "pointer" }}>
                                <div className={`trophy-icon-wrapper ${def?.type === "FIRST_COME" ? 'first-come-glow' : ''}`}>
                                    <span style={{ fontSize: "1.75rem" }}>{def?.icon}</span>
                                    {def?.type === "FIRST_COME" && <Zap size={10} className="rare-spark" />}
                                </div>
                                <span className="trophy-name">{def?.name}</span>
                            </div>
                        )
                    }) : (
                        <div style={{ gridColumn: "span 4", padding: "2rem 0", textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "500" }}>Pas encore de trophées. Continue tes efforts ! 🌳</p>
                        </div>
                    )}
                </div>
            </section>
            
            {/* INJECT MODAL */}
            {selectedBadge && <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}

            <style jsx>{`
                .showcase-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.25rem;
                }
                .trophy-case-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    transition: transform 0.3s ease;
                }
                .trophy-case-item:hover {
                    transform: translateY(-5px);
                }
                .trophy-icon-wrapper {
                    width: 60px;
                    height: 60px;
                    background: #fef3c7;
                    border: 1px solid rgba(217, 119, 6, 0.2);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    box-shadow: 0 4px 15px rgba(217, 119, 6, 0.1);
                }
                .first-come-glow {
                    background: linear-gradient(135deg, #fef3c7, #fffbeb);
                    border-color: rgba(217, 119, 6, 0.4);
                    box-shadow: 0 8px 20px rgba(217, 119, 6, 0.15);
                    animation: gold-pulse 2s infinite ease-in-out;
                }
                @keyframes gold-pulse {
                    0% { border-color: rgba(217,119,6,0.4); }
                    50% { border-color: rgba(217,119,6,0.8); }
                    100% { border-color: rgba(217,119,6,0.4); }
                }
                .rare-spark {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    color: var(--primary);
                    filter: drop-shadow(0 0 6px var(--primary));
                    background: white;
                    border-radius: 50%;
                    padding: 2px;
                }
                .trophy-name {
                    font-size: 0.55rem;
                    font-weight: 950;
                    color: var(--foreground);
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    line-height: 1.2;
                }
            `}</style>

            {/* 2. Medical Certificates */}
            <section className="glass" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                <div className="card-header">
                    <FileText size={18} />
                    <span>Certificats Médicaux</span>
                </div>
                <div style={{ display: "flex", gap: "8px", background: "rgba(59, 130, 246, 0.1)", padding: "10px", borderRadius: "12px", marginTop: "1rem", color: "var(--primary)" }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontSize: "0.75rem", margin: 0, lineHeight: 1.4 }}>
                        Signale tes jours de maladie ou blessure ici. Les jours couverts par un certificat s'affichent comme réussis et **te protègent des pénalités financières** de la cagnotte.
                    </p>
                </div>
                <form action={handleAddCert} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                    {/* userId handled by server session */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <input name="startDate" type="date" required className="glass-input" />
                        <input name="endDate" type="date" required className="glass-input" />
                    </div>
                    <input name="reason" placeholder="Raison (optionnel)" className="glass-input" />
                    <button className="btn-primary" disabled={loading} style={{ fontSize: "0.8rem", padding: "0.5rem" }}>
                        Ajouter un certificat
                    </button>
                </form>

                <div style={{ marginTop: "1rem", maxHeight: "100px", overflowY: "auto" }}>
                    {user.certificates.map((cert: any) => (
                        <div key={cert.id} style={{ fontSize: "0.75rem", padding: "6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            Du {new Date(cert.startDate).toLocaleDateString()} au {new Date(cert.endDate).toLocaleDateString()}
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Economy Settings */}
            <section className="glass" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                <div className="card-header">
                    <Wallet size={18} />
                    <span>Gestion Cagnotte</span>
                </div>
                <div style={{ display: "flex", gap: "8px", background: "rgba(245, 158, 11, 0.1)", padding: "10px", borderRadius: "12px", marginTop: "1rem", color: "var(--accent)" }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontSize: "0.75rem", margin: 0, lineHeight: 1.4 }}>
                        La cagnotte pénalise les jours d'inactivité (2€ par échec). Être dans la cagnotte est optionnel, mais c'est le gage d'une motivation inébranlable. Si tu décides de la quitter, tu ne contribueras plus, mais ton palmarès restera.
                    </p>
                </div>
                <div style={{ marginTop: "1rem" }}>
                    {user.inCagnotte ? (
                        <button onClick={handleExit} className="btn-ghost" style={{ color: "#ef4444", textAlign: "left", padding: 0 }}>
                            <ShieldAlert size={14} style={{ marginRight: "6px" }} />
                            Quitter la cagnotte proprement
                        </button>
                    ) : (
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Tu n'es plus inscrit dans le système de cagnotte.</p>
                    )}
                </div>
            </section>

            <button onClick={() => signOut()} className="btn-ghost" style={{ marginTop: "1rem", color: "var(--text-muted)", width: "100%", justifyContent: "center" }}>
                <LogOut size={16} style={{ marginRight: "8px" }} />
                Déconnexion
            </button>

            <style jsx>{`
        .glass-input {
            background: rgba(0,0,0,0.03);
            border: 1px solid rgba(0,0,0,0.08);
            color: var(--foreground);
            padding: 0.75rem;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        .glass-input:focus {
            outline: none;
            border-color: var(--primary);
            background: white;
        }
        .badge-vault-item {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
      `}</style>
        </div>
    );
}
