"use client"
import { useState } from "react";
import { postMessage } from "@/lib/actions/messages";
import { Megaphone, Shield, Flame, Flag, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SquareClient({ league, torch, messages, activeEvent, dailyTarget, currentUser }: any) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handlePost() {
        if (!content.trim() || content.length > 240) return;
        setLoading(true);
        const res = await postMessage(content);
        if (res.success) {
            setContent("");
            router.refresh(); // Load new messages
        } else {
            alert(res.error);
        }
        setLoading(false);
    }

    return (
        <div className="container" style={{ paddingBottom: "100px", maxWidth: "600px", margin: "0 auto" }}>
            <header style={{ textAlign: "center", marginBottom: "2rem", paddingTop: "1rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--foreground)", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    PLACE PUBLIQUE <Megaphone size={28} />
                </h1>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>L'espace d'expression libre de la ligue <strong>{league.name}</strong></p>
                <div style={{ marginTop: "0.5rem", display: "inline-block", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "1px" }}>
                    CODE: {league.accessCode}
                </div>
            </header>

            {/* BADGE A L'HONNEUR */}
            {activeEvent && (
                <section className="glass-premium" style={{ marginBottom: "2rem", padding: "1.5rem", borderColor: "var(--accent)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px" }}>
                                <Shield className="text-accent" size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>✨ ÉVÉNEMENT ACTIF</div>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--foreground)" }}>{activeEvent.title}</h3>
                            </div>
                        </div>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 700 }}>{activeEvent.description}</p>
                </section>
            )}

            {/* BATAILLE DE POSSESSION */}
            <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Flame className="text-primary" size={20} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>Bataille de Possession</h3>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "2rem" }}>
                {/* DETENTEUR */}
                <div className="glass" style={{ padding: "1rem", border: "1px solid var(--primary)", position: "relative", overflow: "hidden" }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                        <Clock size={12} /> Détenteur du Flambeau
                    </div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "0.5rem" }}>
                        {torch.detenteur ? torch.detenteur.nickname : "PERSONNE POUR LE MOMENT"}
                    </h4>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {torch.detenteur ? "A allumé la flamme le premier aujourd'hui." : "Sois le premier à valider ton quota aujourd'hui."}
                    </p>
                    <div style={{ marginTop: "1rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)" }}>
                        Objectif : {dailyTarget}s
                    </div>
                    {torch.detenteur && (
                        <div style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.1 }}>
                            <Flame size={80} />
                        </div>
                    )}
                </div>

                {/* GARDIEN */}
                <div className="glass" style={{ padding: "1rem", border: "1px solid var(--secondary)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.1)", fontSize: "0.6rem", padding: "2px 6px", borderRadius: "10px", color: "var(--text-muted)", fontWeight: 800 }}>
                        MILESTONE
                    </div>
                    <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--secondary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                        <Flag size={12} /> Gardien du Flambeau
                    </div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "0.5rem" }}>
                        {torch.gardien ? torch.gardien.nickname : "INCONNU"}
                    </h4>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        A gardé le Flambeau le plus grand nombre de jours consécutifs.
                    </p>
                    <div style={{ marginTop: "1rem", fontSize: "0.85rem", fontWeight: 800, color: "var(--secondary)" }}>
                        Record : {torch.gardien ? torch.gardien.highestTorchStreak : 0} jours
                    </div>
                </div>
            </div>

            {/* CHAT INPUT */}
            <section className="glass" style={{ marginBottom: "2rem", padding: "1.5rem", borderRadius: "20px" }}>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={`Quoi de neuf ${currentUser.nickname} ?...`}
                    maxLength={240}
                    style={{
                        width: "100%", background: "transparent", border: "none", color: "var(--foreground)", 
                        outline: "none", resize: "none", height: "80px", fontSize: "0.9rem",
                        fontFamily: "inherit"
                    }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px" }}>
                    <span style={{ fontSize: "0.7rem", color: content.length >= 240 ? "var(--accent)" : "var(--text-muted)" }}>
                        {content.length}/240
                    </span>
                    <button 
                        onClick={handlePost} 
                        disabled={loading || content.trim().length === 0}
                        style={{
                            background: "var(--foreground)", color: "var(--background)", border: "none",
                            padding: "8px 16px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 800,
                            cursor: loading || content.trim().length === 0 ? "not-allowed" : "pointer",
                            opacity: loading || content.trim().length === 0 ? 0.5 : 1
                        }}
                    >
                        {loading ? "..." : "Publier"}
                    </button>
                </div>
            </section>

            {/* DERNIERES PAROLES */}
            <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock className="text-text-muted" size={18} />
                <h3 style={{ fontSize: "1rem", fontWeight: 900, textTransform: "uppercase", color: "var(--text-muted)" }}>Dernières Paroles</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {messages.length === 0 ? (
                    <div className="glass" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                        La place publique est silencieuse...
                    </div>
                ) : (
                    messages.map((msg: any) => (
                        <div key={msg.id} className="glass" style={{ padding: "1.25rem", borderRadius: "16px" }}>
                            <div style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "center" }}>
                                <div style={{ 
                                    width: "30px", height: "30px", borderRadius: "50%", background: "var(--primary)",
                                    display: "flex", alignItems: "center", justifyContent: "center", 
                                    fontWeight: 900, color: "#fff", fontSize: "0.8rem"
                                }}>
                                    {msg.user.nickname.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>{msg.user.nickname}</div>
                                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                                        {new Date(msg.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.5 }}>
                                {msg.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
