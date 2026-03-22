"use client"

import { useState } from "react";
import { createLeague } from "@/lib/actions/moderation";
import { Plus, Shield, Globe } from "lucide-react";

export default function AdminLeaguesClient({ initialLeagues }: { initialLeagues: any[] }) {
    const [leagues, setLeagues] = useState(initialLeagues);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const res = await createLeague(name, code);
        if (res.success) {
            setLeagues([res.league, ...leagues]);
            setName("");
            setCode("");
            setMessage("Ligue créée avec succès !");
        } else {
            setMessage(res.error || "Erreur inconnue");
        }
        setLoading(false);
    }

    return (
        <div className="container dashboard-container">
            <header style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Shield className="text-primary" /> Administration des Ligues
                </h2>
                <p style={{ color: "var(--text-muted)" }}>Créez et gérez les environnements cloisonnés.</p>
            </header>

            {/* 1. Create Form */}
            <section className="glass" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>Nouvelle Ligue</h3>
                <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nom de la ligue (ex: Sartay Elite)"
                        className="glass-input"
                        required
                    />
                    <input
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder="Code d'accès unique"
                        className="glass-input"
                        required
                    />
                    <button className="btn-primary" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <Plus size={18} /> {loading ? "Création..." : "Créer la ligue"}
                    </button>
                    {message && <p style={{ fontSize: "0.8rem", textAlign: "center", color: message.includes('succès') ? "var(--primary)" : "#ef4444" }}>{message}</p>}
                </form>
            </section>

            {/* 2. Listing */}
            <section>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>Ligues existantes ({leagues.length})</h3>
                <div className="league-list" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {leagues.map(l => (
                        <div key={l.id} className="glass" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: "800", fontSize: "0.9rem" }}>{l.name}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Code : <code>{l.accessCode}</code></div>
                            </div>
                            <Globe size={16} className="text-muted" />
                        </div>
                    ))}
                </div>
            </section>

            <style jsx>{`
        .glass-input {
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--card-border);
            color: white;
            padding: 0.75rem;
            border-radius: 10px;
            font-size: 0.9rem;
        }
        code {
            background: rgba(255,255,255,0.1);
            padding: 2px 4px;
            border-radius: 4px;
            color: var(--primary);
        }
      `}</style>
        </div>
    );
}
