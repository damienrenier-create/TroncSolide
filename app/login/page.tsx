"use client"

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get("message");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Identifiants invalides.");
        } else {
            router.push("/");
            router.refresh();
        }
    }

    return (
        <div className="auth-card">
            <h1 className="auth-header">Connexion</h1>

            {message && <div className="auth-alert-success">{message}</div>}
            {error && <div className="auth-alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="auth-input-group">
                    <label className="auth-label">Email</label>
                    <input name="email" type="email" required className="auth-input" placeholder="prenom@exemple.com" />
                </div>

                <div className="auth-input-group">
                    <label className="auth-label">Mot de passe</label>
                    <input name="password" type="password" required className="auth-input" placeholder="••••••••" />
                </div>

                <button className="auth-button" disabled={loading}>
                    {loading ? "Chargement..." : "Se connecter"}
                </button>
            </form>

            <p className="auth-link-text">
                Pas encore de compte ? <a href="/register" className="auth-link">S'inscrire</a>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="auth-container">
            <Suspense fallback={<div className="auth-card" style={{ textAlign: "center" }}>Chargement...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
