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
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-header">Rejoindre tronc-solide</h1>

                {error && <div className="auth-alert-error">{error}</div>}

                <form action={handleSubmit}>
                    <div className="auth-input-group">
                        <label className="auth-label">Pseudo</label>
                        <input name="nickname" type="text" required className="auth-input" placeholder="Ton pseudo stylé" />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Email</label>
                        <input name="email" type="email" required className="auth-input" placeholder="prenom@exemple.com" />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Date d'anniversaire</label>
                        <input name="birthday" type="date" required className="auth-input" />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Mot de passe</label>
                        <input name="password" type="password" required className="auth-input" placeholder="••••••••" />
                    </div>

                    <div className="auth-input-group" style={{ background: "#eff6ff", padding: "1rem", borderRadius: "16px", border: "1px solid #dbeafe" }}>
                        <label className="auth-label" style={{ color: "#1e40af" }}>Code d'accès Ligue</label>
                        <input name="leagueCode" type="text" placeholder="CODE-REQUIS" required className="auth-input" style={{ background: "#0f172a", border: "2px solid #3b82f6" }} />
                    </div>

                    <button className="auth-button" disabled={loading}>
                        {loading ? "Chargement..." : "S'inscrire"}
                    </button>
                </form>

                <p className="auth-link-text">
                    Déjà un compte ? <a href="/login" className="auth-link">Se connecter</a>
                </p>
            </div>
        </div>
    );
}
