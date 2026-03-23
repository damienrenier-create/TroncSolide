"use client"

import { useState } from "react";
import { ChevronDown, ChevronUp, Star, Trophy, Target, TreePine, Calendar, Zap, Shield, TrendingUp } from "lucide-react";
import BadgeModal from "./BadgeModal";
import styles from "@/app/badges/badges.module.css";

export default function BadgeCatalogueClient({ groups, faqItems }: { groups: any[], faqItems: any[] }) {
    const [selectedBadge, setSelectedBadge] = useState<any>(null);
    const [openFaq, setOpenFaq] = useState(false);
    const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({ 0: true }); // Premier groupe ouvert par défaut

    const toggleGroup = (idx: number) => {
        setOpenGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div className="container" style={{ paddingBottom: "120px" }}>
            <header style={{ textAlign: "center", padding: "3rem 0 2rem" }}>
                <div style={{ display: "inline-flex", padding: "0.5rem 1rem", background: "rgba(217, 119, 6, 0.1)", borderRadius: "20px", color: "var(--primary)", fontSize: "0.75rem", fontWeight: "900", marginBottom: "1rem", letterSpacing: "0.1em" }}>
                    RÈGLES & RÉCOMPENSES
                </div>
                <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--foreground)" }}>Badges & FAQ</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "450px", margin: "0.5rem auto", fontWeight: "500" }}>
                    Découvre tous les exploits possibles et les secrets pour devenir un véritable Tronc Solide.
                </p>
            </header>

            <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)", marginBottom: "3rem" }} />

            {/* BADGES GROUPS - Accordions */}
            {groups.map((group, idx) => group.items.length > 0 && (
                <section key={idx} style={{ marginBottom: "1rem" }}>
                    <div 
                        onClick={() => toggleGroup(idx)}
                        className="glass-hover"
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "36px", height: "36px", background: group.color, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${group.color}44` }}>
                                {group.icon}
                            </div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--foreground)", margin: 0 }}>{group.title}</h3>
                        </div>
                        {openGroups[idx] ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                    </div>

                    {openGroups[idx] && (
                        <div className={styles.badgeVaultList} style={{ marginTop: "1rem", paddingBottom: "1.5rem", animation: "slideDown 0.3s ease-out" }}>
                        {group.items.map((badge: any) => {
                            const isOwned = badge.users.length > 0;
                            const isFirstCome = badge.type === "FIRST_COME";
                            const isRecord = badge.id?.startsWith("RECORD_");
                            
                            // For Record Badges, `isTaken` means there is at least one user holding it currently.
                            // For Standard First Come, it could have multiple users if tiered. We just check if it has winners.
                            const isTaken = isOwned;
                            const winnerName = badge.users[0]?.user?.nickname;

                            return (
                                <div 
                                    key={badge.id} 
                                    className={`glass-premium ${styles.badgeCollectItem} ${isTaken && !isOwned ? styles.taken : ''} ${isOwned ? styles.owned : ''} ${isFirstCome && !isTaken ? styles.rareAvail : ''}`}
                                    onClick={() => setSelectedBadge(badge)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className={`${styles.badgeIconWrapperSmall} ${isOwned ? styles.goldGlow : ''}`}>
                                        <span className={styles.badgeEmojiSmall}>{badge.icon}</span>
                                    </div>
                                    <div className={styles.badgeInfoList}>
                                        <h4>{badge.name}</h4>
                                        <p>{badge.description}</p>
                                    </div>
                                    <div className={styles.badgeMeta}>
                                        {isOwned ? (
                                            <div className={`${styles.statusBadge} ${styles.earned}`}>
                                                {isRecord ? "RECORD BATTU" : "DÉBLOQUÉ"}
                                            </div>
                                        ) : isFirstCome ? (
                                            <div className={`${styles.statusBadge} ${styles.rareTag}`}>DISPONIBLE</div>
                                        ) : (
                                            <div className={`${styles.statusBadge} ${styles.avail}`}>À DÉBLOQUER</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    )}
                </section>
            ))}

            {selectedBadge && <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}

            <style jsx>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
