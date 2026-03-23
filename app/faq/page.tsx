import { NATURE_LEVELS } from "@/lib/constants/levels";
import { BookOpen, HelpCircle, ShieldAlert, Trophy, Award, Zap } from "lucide-react";

export const metadata = {
    title: "FAQ & Règles | Tronc Solide",
    description: "Toutes les règles et niveaux de Tronc Solide",
};

export default function FAQPage() {
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
                <h2 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#ef4444" }}>
                    <ShieldAlert size={20} />
                    La Cagnotte & L'Infirmerie
                </h2>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p>C'est l'outil de dissuasion ultime. Si tu es dans la cagnotte (participation optionnelle mais recommandée), <strong>chaque jour manqué te coûte 2€</strong> d’amende.</p>
                    <p>Tu es blessé ou malade ? Déclare tes dates en avance dans la rubrique <strong>Certificats Médicaux</strong> de ton Profil. Les jours couverts seront validés automatiquement (avec 0 XP mais sans amende).</p>
                </div>
            </section>

            <section className="glass" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                    <Zap size={20} className="text-primary" />
                    Progression & XP
                </h2>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p>Chaque seconde de gainage validée te rapporte de l'<strong>XP</strong>. L'XP permet de monter de niveau et de débloquer de nouveaux titres prestigieux.</p>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "1rem" }}>
                        {NATURE_LEVELS.map((level, idx) => (
                            <div key={idx} style={{ background: "rgba(0,0,0,0.02)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)" }}>
                                <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--primary)" }}>NIVEAU {idx + 1}</div>
                                <div style={{ fontWeight: "900", fontSize: "0.9rem", color: "var(--foreground)", marginTop: "4px" }}>{level.emoji} {level.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="glass" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                    <Trophy size={20} className="text-primary" />
                    Jalons & Séries
                </h2>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p>La constance est récompensée par des Badges de Jalon exclusifs pour ta Salle des Trophées.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "0.5rem" }}>
                        <div style={{ background: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: "1.5rem" }}>🥉</span>
                            <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>7 Jours</div>
                            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#b45309" }}>Jalon Bronze</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: "1.5rem" }}>🥈</span>
                            <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>30 Jours</div>
                            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#94a3b8" }}>Jalon Argent</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: "1.5rem" }}>🥇</span>
                            <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>100 Jours</div>
                            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#eab308" }}>Jalon Or</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: "1.5rem" }}>💎</span>
                            <div style={{ fontWeight: "800", margin: "4px 0", color: "var(--foreground)" }}>365 Jours</div>
                            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#06b6d4" }}>Jalon Diamant</div>
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
                    Les trophées <strong>Champion de la Semaine</strong> et <strong>Champion du Mois</strong> sont remis en jeu à la fin de chaque période ! Ils sont décernés au joueur ayant accompli le meilleur volume cumulé. Ton trône n'est jamais acquis.
                </p>
            </section>
        </div>
    );
}
