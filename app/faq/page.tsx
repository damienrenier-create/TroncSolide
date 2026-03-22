import { NATURE_LEVELS } from "@/lib/constants/levels";
import { TreePine, HelpCircle } from "lucide-react";

export default function FAQPage() {
    return (
        <div className="container" style={{ paddingBottom: "100px", maxWidth: "600px", margin: "0 auto" }}>
            <header style={{ marginBottom: "2rem", paddingTop: "1rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <HelpCircle size={28} /> FAQ
                </h1>
                <p style={{ color: "var(--text-muted)" }}>Tout ce qu'il faut savoir sur Tronc Solide.</p>
            </header>

            <section className="glass" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "1rem", color: "var(--secondary)" }}>Les Niveaux d'Expérience</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                    L'expérience (XP) monte en flèche avec la régularité. À chaque palier, un nouveau rang de la nature t'est décerné. Voici la classification officielle :
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {NATURE_LEVELS.map((level, idx) => (
                        <div key={idx} style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)" }}>NV.{idx}</span>
                            <span style={{ fontWeight: "800", fontSize: "0.9rem" }}>{level.emoji} {level.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "1rem", color: "var(--primary)" }}>Les Trophées Périodiques</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
                    Les trophées **Champion de la Semaine** et **Champion du Mois** sont remis en jeu à la fin de chaque période ! Ils sont décernés dynamiquement à tous les joueurs ayant accompli le meilleur volume lors du passage à la nouvelle semaine ou au nouveau mois. Reste vigilant, ton trône n'est jamais acquis !
                </p>
            </section>
            
            <section className="glass" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "1rem", color: "var(--accent)" }}>La Cagnotte & Certificats</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
                    La cagnotte permet d'ajouter un enjeu financier (2€ d'amende par échec de palier de la période).
                    Cependant, si tu tombes malade, **ajoute un Certificat Médical** dans tes paramètres ! Les jours couverts te protègeront des pénalités financières et gèleront ta série.
                </p>
            </section>
        </div>
    );
}
