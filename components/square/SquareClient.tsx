"use client"
import { useState, useTransition } from "react";
import { postMessage, toggleMessageLike } from "@/lib/actions/messages";
import { Megaphone, Shield, Flame, Flag, Clock, Heart, Zap, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SquareClient({ league, torch, messages, activeEvent, dailyTarget, currentUser }: any) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [optimisticLikes, setOptimisticLikes] = useState<Record<string, { count: number, hasLiked: boolean }>>({});
    const [isPending, startTransition] = useTransition();
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

    function handleToggleLike(msg: any) {
        const currentCount = optimisticLikes[msg.id]?.count ?? msg.likes?.length ?? 0;
        const currentHasLiked = optimisticLikes[msg.id]?.hasLiked ?? (msg.likes?.some((l: any) => l.userId === currentUser.id) || false);

        // Optimistic update
        setOptimisticLikes(prev => ({
            ...prev,
            [msg.id]: {
                count: currentHasLiked ? currentCount - 1 : currentCount + 1,
                hasLiked: !currentHasLiked
            }
        }));

        startTransition(async () => {
            await toggleMessageLike(msg.id);
            // We don't necessarily need to refresh routing immediately as local state handles the view
        });
    }

    function getLikeIcon(count: number, hasLiked: boolean) {
        if (count === 0) return <Heart size={16} color={hasLiked ? "#ef4444" : "var(--text-muted)"} strokeWidth={hasLiked ? 3 : 2} />;
        if (count <= 2) return <Heart size={16} fill="#ef4444" color="#ef4444" />;
        if (count <= 4) return <Flame size={16} fill="#f97316" color="#f97316" />;
        if (count <= 9) return <Zap size={16} fill="#fbbf24" color="#fbbf24" />;
        return <Rocket size={16} fill="#a855f7" color="#a855f7" style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.5))" }} />;
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
                                    <div style={{ fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>
                                        <Link href={`/profile/${encodeURIComponent(msg.user.nickname)}`} style={{ color: "var(--foreground)", textDecoration: "none" }}>
                                            {msg.user.nickname}
                                        </Link>
                                    </div>
                                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                                        {new Date(msg.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                                {msg.content}
                            </p>
                            
                            {/* NEW LIKE BUTTON */}
                            {(() => {
                                const currentCount = optimisticLikes[msg.id]?.count ?? msg.likes?.length ?? 0;
                                const currentHasLiked = optimisticLikes[msg.id]?.hasLiked ?? (msg.likes?.some((l: any) => l.userId === currentUser.id) || false);
                                
                                return (
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                        <button 
                                            onClick={() => handleToggleLike(msg)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "6px",
                                                background: currentHasLiked ? "rgba(239, 68, 68, 0.1)" : "rgba(0,0,0,0.03)",
                                                border: "none", cursor: "pointer",
                                                padding: "6px 12px", borderRadius: "20px",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            {getLikeIcon(currentCount, currentHasLiked)}
                                            {currentCount > 0 && (
                                                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: currentCount >= 10 ? "#a855f7" : currentCount >= 5 ? "#fbbf24" : currentCount >= 3 ? "#f97316" : currentHasLiked ? "#ef4444" : "var(--text-muted)" }}>
                                                    {currentCount}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
