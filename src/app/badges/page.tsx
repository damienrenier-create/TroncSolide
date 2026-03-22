import { getBadgeCatalogue } from "@/lib/actions/gamification";
import { Star, Trophy, Target, TreePine, Calendar, HelpCircle, Zap, Shield, TrendingUp } from "lucide-react";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import styles from "./badges.module.css";

export default async function BadgesPage() {
    const badges = await getBadgeCatalogue();
    if (!badges) return <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>Veuillez vous connecter.</div>;

    // Merge definitions with DB data (winner, user status)
    const catalogue = BADGE_DEFINITIONS.map(def => {
        const dbBadge = badges.find(b => b.name === def.name);
        return {
            ...def,
            dbId: dbBadge?.id,
            winner: dbBadge?.winner,
            winnerId: dbBadge?.winnerId,
            users: dbBadge?.users || []
        };
    });

    const groups = [
        {
            title: "Accomplissements Personnels",
            icon: <Star size={18} color="white" />,
            color: "var(--secondary)",
            items: catalogue.filter(b => b.type === "ACHIEVEMENT" && !["Graine", "Jeune", "Arbre", "Gardien", "Anniversaire", "Marvin"].some(k => b.name.includes(k)))
        },
        {
            title: "Pionniers : Milestones Cumulés",
            icon: <Target size={18} color="white" />,
            color: "var(--accent)",
            items: catalogue.filter(b => b.type === "FIRST_COME" && (b.name.includes("Pompages") || b.name.includes("Squats") || b.name.includes("Gainage")))
        },
        {
            title: "Pionniers : Meilleures Séries",
            icon: <Trophy size={18} color="white" />,
            color: "var(--primary)",
            items: catalogue.filter(b => b.type === "FIRST_COME" && !b.name.includes("Pompages") && !b.name.includes("Squats") && !b.name.includes("Gainage"))
        },
        {
            title: "Hiérarchie de la Nature",
            icon: <TreePine size={18} color="white" />,
            color: "#16a34a",
            items: catalogue.filter(b => ["Graine", "Jeune", "Arbre", "Gardien"].some(k => b.name.includes(k)))
        },
        {
            title: "Événements Spéciaux",
            icon: <Calendar size={18} color="white" />,
            color: "#8b5cf6",
            items: catalogue.filter(b => ["Anniversaire", "Marvin"].some(k => b.name.includes(k)))
        }
    ];

    const faqItems = [
        {
            q: "Comment gagner de l'EXP ?",
            a: "Chaque seconde de gainage et chaque répétition (Pompe/Squat) te rapporte 1 point d'EXP.",
            icon: <Zap size={20} className="text-primary" />
        },
        {
            q: "C'est quoi les badges 'Pionniers' ?",
            a: "Ce sont des badges uniques par Ligue. Seul le premier à atteindre l'objectif le décroche définitivement. Une fois pris, il n'est plus disponible pour les autres !",
            icon: <Shield size={20} className="text-accent" />
        },
        {
            q: "Comment monter de niveau ?",
            a: "Ton niveau dépend de ton EXP totale. Plus tu t'entraînes, plus ton arbre grandit : Graine > Jeune Pousse > Arbre Majestueux > Gardien.",
            icon: <TrendingUp size={20} className="text-secondary" />
        }
    ];

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

            {/* FAQ Logic */}
            <section style={{ marginBottom: "4rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                    {faqItems.map((item, i) => (
                        <div key={i} className="glass-premium" style={{ padding: "1.5rem", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", background: "white", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                                    {item.icon}
                                </div>
                                <h4 style={{ fontSize: "1rem", fontWeight: "800" }}>{item.q}</h4>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5", fontWeight: "500" }}>{item.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)", marginBottom: "4rem" }} />

            {groups.map((group, idx) => group.items.length > 0 && (
                <section key={idx} style={{ marginBottom: "3.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
                        <div style={{ width: "36px", height: "36px", background: group.color, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${group.color}44` }}>
                            {group.icon}
                        </div>
                        <h3 style={{ fontSize: "1.35rem", fontWeight: "900" }}>{group.title}</h3>
                    </div>

                    <div className={styles.badgeVaultList}>
                        {group.items.map(badge => {
                            const isOwned = badge.users.length > 0;
                            const isFirstCome = badge.type === "FIRST_COME";
                            const isTaken = isFirstCome && badge.winnerId !== null;
                            const winnerName = badge.winner?.nickname;

                            return (
                                <div key={badge.id} className={`glass-premium ${styles.badgeCollectItem} ${isTaken && !isOwned ? styles.taken : ''} ${isOwned ? styles.owned : ''} ${isFirstCome && !isTaken ? styles.rareAvail : ''}`}>
                                    <div className={`${styles.badgeIconWrapperSmall} ${isOwned ? styles.goldGlow : ''}`}>
                                        <span className={styles.badgeEmojiSmall}>{badge.icon}</span>
                                    </div>
                                    <div className={styles.badgeInfoList}>
                                        <h4>{badge.name}</h4>
                                        <p>{badge.description}</p>
                                    </div>
                                    <div className={styles.badgeMeta}>
                                        {isOwned ? (
                                            <div className={`${styles.statusBadge} ${styles.earned}`}>GAGNÉ ✨</div>
                                        ) : isTaken ? (
                                            <div className={`${styles.statusBadge} ${styles.takenBy}`}>
                                                <span>Pris par</span>
                                                <strong>{winnerName}</strong>
                                            </div>
                                        ) : isFirstCome ? (
                                            <div className={`${styles.statusBadge} ${styles.rareTag}`}>RARE (DISPO)</div>
                                        ) : (
                                            <div className={`${styles.statusBadge} ${styles.avail}`}>À DÉBLOQUER</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
