import { NATURE_LEVELS } from "@/lib/constants/levels";
import { BookOpen, HelpCircle, ShieldAlert, Trophy, Award, Zap, Star, Target, TreePine, Calendar, Shield, TrendingUp } from "lucide-react";
import { getBadgeCatalogue } from "@/lib/actions/gamification";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import BadgeCatalogueClient from "@/components/badges/BadgeCatalogueClient";

export const metadata = {
    title: "FAQ & Règles | Tronc Solide",
    description: "Toutes les règles, niveaux et badges de Tronc Solide",
};

export default async function FAQPage() {
    const badges = await getBadgeCatalogue();
    
    // We can still render the static part if not logged in, but BadgeCatalogue needs data
    const catalogue = badges ? BADGE_DEFINITIONS.map(def => {
        const dbBadge = badges.find(b => b.name === def.name);
        return {
            ...def,
            dbId: dbBadge?.id,
            users: dbBadge?.users || []
        };
    }) : [];

    const groups = [
        {
            title: "Les Records Absolus de la Ligue 🏆",
            icon: <Trophy size={18} color="white" />,
            color: "var(--primary)",
            items: catalogue.filter(b => b.id.startsWith("RECORD_"))
        },
        {
            title: "Pionniers : Milestones Cumulés (Tiers)",
            icon: <Target size={18} color="white" />,
            color: "var(--accent)",
            items: catalogue.filter(b => b.type === "FIRST_COME" && !b.id.startsWith("RECORD_"))
        },
        {
            title: "Accomplissements Personnels",
            icon: <Star size={18} color="white" />,
            color: "var(--secondary)",
            items: catalogue.filter(b => b.type === "ACHIEVEMENT" && !["Graine", "Jeune", "Arbre", "Gardien", "Anniversaire", "Marvin"].some(k => b.name.includes(k)))
        },
        {
            title: "Hiérarchie de la Nature",
            icon: <TreePine size={18} color="white" />,
            color: "#16a34a",
            items: catalogue.filter(b => ["Graine", "Jeune", "Arbre", "Gardien", "Fleur", "Bourgeon"].some(k => b.name.includes(k)) || b.id.startsWith("LEVEL_"))
        },
        {
            title: "Événements Spéciaux",
            icon: <Calendar size={18} color="white" />,
            color: "#8b5cf6",
            items: catalogue.filter(b => ["Anniversaire", "Marvin", "ST_MARVIN", "ANNIVERSARY_1"].some(k => b.id.includes(k)))
        }
    ];

    const faqItems = [
        {
            q: "Comment fonctionne l'EXP ?",
            a: "1 pompe = 1 XP. 1 seconde de gainage = 1 XP. L'entraînement paie pur et dur.",
            icon: <Zap size={20} className="text-primary" />
        },
        {
            q: "Le Voleur de Record 🦹‍♂️",
            a: "Les Trophées de Record (ex: Champion du Mois) te versent un '% Salaire de Longévité' chaque jour (1% de sa valeur). Mais attention : si quelqu'un bat ton record, il TE VOLE TON TROPHÉE et on te retire TOUT LE SALAIRE que tu avais accumulé !",
            icon: <Shield size={20} className="text-accent" />
        },
        {
            q: "Les Tiers de Milestones (Or, Argent..)",
            a: "Être le tout premier à atteindre 5000 pompes te donne le badge Platine (100% du bonus). Le 2ème aura l'Or (80%), et ainsi de suite jusqu'à l'Argile. Ne traîne pas !",
            icon: <TrendingUp size={20} className="text-secondary" />
        }
    ];

    return (
        <div className="container dashboard-container">
            <header className="hero-card glass" style={{ padding: "2rem 1.5rem", marginTop: "1rem" }}>
                <BookOpen size={48} className="text-primary mb-4" strokeWidth={1.5} style={{ margin: "0 auto 1rem" }} />
                <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--foreground)", marginBottom: "0.5rem" }}>Le Manuel du Tronc</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Règles du jeu, niveaux et fonctionnement de la cagnotte.</p>
            </header>

            <section className="glass" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                    <HelpCircle size={20} className="text-primary" />
                    Le Concept
                </h2>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p><strong>Tronc Solide</strong> est un défi communautaire de gainage quotidien. Le but ? Ne jamais rompre la chaîne.</p>
                    <p>Chaque jour, un objectif en secondes t'est assigné. Tu dois le réaliser et le valider dans La Place avant minuit.</p>
                </div>
            </section>

            <section className="glass" style={{ padding: "1.5rem" }}>
                <h2 id="cagnotte" style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#ef4444" }}>
                    <ShieldAlert size={20} />
                    La Cagnotte & L'Infirmerie
                </h2>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p>C'est l'outil de dissuasion ultime. Si tu es dans la cagnotte (participation optionnelle mais recommandée), <strong>chaque jour manqué te coûte 2€</strong> d’amende.</p>
                    <p>Tu es blessé ou malade ? Déclare tes dates en avance dans la rubrique <strong>Certificats Médicaux</strong> de ton Profil. Les jours couverts seront validés automatiquement (avec 0 XP mais sans amende).</p>
                </div>
            </section>

            <section className="glass" style={{ padding: "1.5rem" }}>
                <h2 id="niveaux" style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                    <Zap size={20} className="text-primary" />
                    Progression & XP
                </h2>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p>Chaque répétition ou seconde de gainage validée te rapporte de l'<strong>XP</strong>. L'XP permet de monter de niveau et de débloquer des titres prestigieux.</p>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "1rem" }}>
                        {NATURE_LEVELS.map((level, idx) => {
                            let requiredXP = 0;
                            for (let i = 1; i <= idx; i++) requiredXP += i * 50;
                            return (
                                <div key={idx} style={{ background: "rgba(0,0,0,0.02)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)" }}>
                                    <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--primary)" }}>NIVEAU {idx + 1}</div>
                                    <div style={{ fontWeight: "900", fontSize: "0.9rem", color: "var(--foreground)", marginTop: "4px" }}>{level.emoji} {level.name}</div>
                                    <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", marginTop: "4px" }}>{requiredXP.toLocaleString()} XP requis</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="glass" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                    <Trophy size={20} className="text-primary" />
                    Jalons & Séries
                </h2>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p>La constance est récompensée par des Badges de Jalon exclusifs pour ta Salle des Trophées. De l'XP bonus est offert pour chaque palier franchi ! Toutes ces informations sont détaillées dans le Catalogue Complet des Badges ci-dessous.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "0.5rem" }}>
                        <div style={{ background: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: "1.5rem" }}>🥉</span>
                            <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>7 Jours</div>
                            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#b45309" }}>Jalon Bronze (200 XP)</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: "1.5rem" }}>🥈</span>
                            <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>30 Jours</div>
                            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#94a3b8" }}>Jalon Argent (500 XP)</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: "1.5rem" }}>🥇</span>
                            <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>100 Jours</div>
                            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#eab308" }}>Jalon Or (1000 XP)</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: "1.5rem" }}>💎</span>
                            <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>365 Jours</div>
                            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#06b6d4" }}>Jalon Diamant (5000 XP)</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="glass" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "var(--primary)" }}>
                    <Award size={20} />
                    Trophées Périodiques
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Les trophées <strong>Champion de la Semaine</strong> et <strong>Champion du Mois</strong> sont remis en jeu à la fin de chaque période ! Ils sont décernés au joueur ayant accumulé le plus de volume d'entraînement (Pompes + Squats) durant la période. La bataille est constante et le titre passe de main en main, arrachant la rente d'XP aux anciens champions pour la donner aux nouveaux !
                </p>
            </section>

            {/* Badge Catalogue Embedding */}
            <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "2px dashed rgba(255,255,255,0.1)" }} id="badges">
                {badges ? (
                    <BadgeCatalogueClient groups={groups} faqItems={faqItems} />
                ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "800" }}>
                        Connectez-vous pour voir le catalogue des badges.
                    </div>
                )}
            </div>
        </div>
    );
}
