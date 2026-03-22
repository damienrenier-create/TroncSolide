"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await registerUser(formData);
        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            router.push("/login?message=Compte créé avec succès ! Connectez-vous.");
        }
    }

    return (
        <div className="container" style={{ marginTop: "4rem" }}>
            <div className="glass" style={{ padding: "2rem" }}>
                <h1 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Rejoindre tronc-solide</h1>

                {error && (
                    <div style={{ background: "#ef444433", color: "#ef4444", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
                        {error}
                    </div>
                )}

                <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Pseudo</label>
                        <input name="nickname" type="text" required style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "#0f172a", color: "white" }} />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
                        <input name="email" type="email" required style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "#0f172a", color: "white" }} />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Date d'anniversaire</label>
                        <input name="birthday" type="date" required style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "#0f172a", color: "white" }} />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Mot de passe</label>
                        <input name="password" type="password" required style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "#0f172a", color: "white" }} />
                    </div>

                    <div style={{ marginTop: "0.5rem", padding: "1rem", background: "#3b82f61a", borderRadius: "8px" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--primary)" }}>Code d'accès Ligue</label>
                        <input name="leagueCode" type="text" placeholder="CODE-REQUIS" required style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--primary)", background: "#0f172a", color: "white" }} />
                    </div>

                    <button className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
                        {loading ? "Chargement..." : "S'inscrire"}
                    </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Déjà un compte ? <a href="/login" style={{ color: "var(--primary)" }}>Se connecter</a>
                </p>
            </div>
        </div>
    );
}
