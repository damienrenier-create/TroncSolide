"use client"

import { useState } from "react";
import { Music, Trophy, Youtube, Info, CheckCircle2 } from "lucide-react";
import { logBSUChallenge } from "@/lib/actions/bsu";
import { useRouter } from "next/navigation";

export default function BSUBanner() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [repsPushup, setRepsPushup] = useState<string>("");
    const [repsSquat, setRepsSquat] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await logBSUChallenge(
                repsPushup ? parseInt(repsPushup) : undefined,
                repsSquat ? parseInt(repsSquat) : undefined
            );
            if (res.success) {
                setSuccess(true);
                router.refresh();
            } else {
                setError(res.error || "Une erreur est survenue.");
            }
        } catch (err) {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="glass-premium bsu-banner" style={{ border: "2px solid #22c55e", background: "rgba(34, 197, 94, 0.05)" }}>
                <div style={{ textAlign: "center", padding: "1.5rem" }}>
                    <CheckCircle2 size={40} color="#22c55e" style={{ marginBottom: "0.5rem" }} />
                    <h3 style={{ fontWeight: 900, fontSize: "1.2rem", color: "#22c55e" }}>PARTICIPATION ENREGISTRÉE !</h3>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, opacity: 0.8 }}>Tes répétitions ont été ajoutées à tes logs du jour. Solide ! 💪</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-premium bsu-banner">
            <div className="bsu-header">
                <div className="bsu-badge">ÉVÉNEMENT DU JOUR</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <Music size={20} className="text-primary" />
                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>CHALLENGE BRING SALLY UP</h3>
                </div>
            </div>

            <div className="bsu-content">
                <p style={{ fontSize: "0.80rem", margin: "10px 0", lineHeight: 1.5, fontWeight: 600, opacity: 0.9 }}>
                    C'est la fin du mois ! Tiens le plus longtemps possible sur la musique. Chaque rep compte aussi dans tes logs normaux.
                </p>

                <div className="bsu-links">
                    <a href="https://www.youtube.com/watch?v=41N6bKO-NVI" target="_blank" rel="noopener noreferrer" className="bsu-link">
                        <Youtube size={14} /> Version Pompes
                    </a>
                    <a href="https://www.youtube.com/watch?v=bql6sIU2A7k" target="_blank" rel="noopener noreferrer" className="bsu-link">
                        <Youtube size={14} /> Version Squats
                    </a>
                </div>

                <div className="bsu-form">
                    <div className="bsu-input-group">
                        <label>POMPES (reps)</label>
                        <input 
                            type="number" 
                            placeholder="Ex: 6" 
                            value={repsPushup} 
                            onChange={(e) => setRepsPushup(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="bsu-input-group">
                        <label>SQUATS (reps)</label>
                        <input 
                            type="number" 
                            placeholder="Ex: 12" 
                            value={repsSquat} 
                            onChange={(e) => setRepsSquat(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>

                {error && <div style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 800, textAlign: "center", marginTop: "8px" }}>{error}</div>}

                <button 
                    className="btn-primary bsu-submit" 
                    onClick={handleSubmit} 
                    disabled={loading || (!repsPushup && !repsSquat)}
                >
                    {loading ? "Chargement..." : "ENREGISTRER MES RÉSULTATS"}
                </button>
            </div>

            <style jsx>{`
                .bsu-banner {
                    padding: 1.25rem;
                    border-radius: 24px;
                    margin-bottom: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%);
                    box-shadow: 0 10px 25px rgba(217, 119, 6, 0.08);
                    position: relative;
                    overflow: hidden;
                }
                .bsu-badge {
                    display: inline-block;
                    background: var(--primary);
                    color: white;
                    font-size: 0.6rem;
                    font-weight: 950;
                    padding: 3px 8px;
                    border-radius: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .bsu-links {
                    display: flex;
                    gap: 8px;
                    margin: 12px 0;
                }
                .bsu-link {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    background: rgba(0,0,0,0.05);
                    padding: 6px 10px;
                    border-radius: 8px;
                    text-decoration: none;
                    color: var(--foreground);
                    transition: all 0.2s;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .bsu-link:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.2);
                }
                .bsu-form {
                    display: flex;
                    gap: 12px;
                    margin-top: 15px;
                }
                .bsu-input-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .bsu-input-group label {
                    font-size: 0.6rem;
                    font-weight: 900;
                    color: var(--text-muted);
                    padding-left: 4px;
                }
                .bsu-input-group input {
                    width: 100%;
                    background: rgba(255,255,255,0.7);
                    border: 1px solid rgba(0,0,0,0.1);
                    padding: 8px 12px;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 800;
                    outline: none;
                }
                .bsu-input-group input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1);
                }
                .bsu-submit {
                    width: 100%;
                    margin-top: 15px;
                    padding: 0.85rem;
                    font-size: 0.85rem;
                    font-weight: 900;
                    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
                }
            `}</style>
        </div>
    );
}
