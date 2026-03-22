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
        <div className="glass" style={{ padding: "2rem" }}>
            <h1 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Connexion</h1>

            {message && (
                <div style={{ background: "#10b98133", color: "#10b981", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
                    {message}
                </div>
            )}

            {error && (
                <div style={{ background: "#ef444433", color: "#ef4444", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
                    <input name="email" type="email" required style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "#0f172a", color: "white" }} />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Mot de passe</label>
                    <input name="password" type="password" required style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "#0f172a", color: "white" }} />
                </div>

                <button className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
                    {loading ? "Chargement..." : "Se connecter"}
                </button>
            </form>

            <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Pas encore de compte ? <a href="/register" style={{ color: "var(--primary)" }}>S'inscrire</a>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="container" style={{ marginTop: "4rem" }}>
            <Suspense fallback={<div className="glass" style={{ padding: "2rem", textAlign: "center" }}>Chargement...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
