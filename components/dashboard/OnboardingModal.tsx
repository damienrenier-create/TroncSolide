"use client"

import { useState } from "react";
import { markOnboardingAsSeen } from "@/lib/actions/user";
import { Trophy, Target, Award, Shield, ChevronRight, CheckCircle2 } from "lucide-react";

interface OnboardingModalProps {
    onComplete: () => void;
}

const slides = [
    {
        title: "Bienvenue, Jeune Pousse ! 🌱",
        content: "Tronc Solide n'est pas qu'une app, c'est un contrat avec toi-même. Ici, on forge un corps d'acier et une discipline de fer.",
        icon: <Target size={48} className="text-primary" />,
        color: "var(--primary)"
    },
    {
        title: "L'Objectif Quotidien 📈",
        content: "Chaque jour, ton objectif augmente de 1 point. Ton volume d'effort est le cumul brut de tes pompes, squats et secondes de gainage. Atteins le score pour valider ta journée !",
        icon: <Trophy size={48} style={{ color: "var(--secondary)" }} />,
        color: "var(--secondary)"
    },
    {
        title: "La Ligue & Ses Paliers 💎",
        content: "Gagne des niveaux via tes XP et franchis des paliers de performance. Sois le premier à atteindre un palier pour devenir un Pionnier et marquer l'histoire !",
        icon: <Award size={48} style={{ color: "var(--accent)" }} />,
        color: "var(--accent)"
    },
    {
        title: "La Cagnotte (21 Jours) 💰",
        content: "Tu as 21 jours de grâce pour créer ton habitude. Passé ce délai, chaque jour manqué te coûtera 2€ pour le pot commun !",
        icon: <Shield size={48} className="text-primary" />,
        color: "#3b82f6"
    }
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(false);

    const next = async () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            setLoading(true);
            const res = await markOnboardingAsSeen();
            if (res.success) {
                onComplete();
            }
            setLoading(false);
        }
    };

    const slide = slides[currentSlide];

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(20px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
            <div className="glass-premium" style={{ width: "100%", maxWidth: "450px", borderRadius: "32px", overflow: "hidden", display: "flex", flexDirection: "column", animation: "slideUpWelcome 0.5s ease-out" }}>
                
                {/* Progress Indicators */}
                <div style={{ display: "flex", gap: "8px", padding: "2rem 2rem 0" }}>
                    {slides.map((_, i) => (
                        <div key={i} style={{ flex: 1, height: "4px", background: i <= currentSlide ? slide.color : "rgba(255,255,255,0.1)", borderRadius: "2px", transition: "all 0.3s ease" }} />
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: "3rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "350px", justifyContent: "center" }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "2rem", borderRadius: "30px", marginBottom: "2rem", boxShadow: `0 20px 40px ${slide.color}20` }}>
                        {slide.icon}
                    </div>
                    
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 950, color: "white", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                        {slide.title}
                    </h2>
                    
                    <p style={{ fontSize: "0.95rem", color: "#94a3b8", lineHeight: 1.6, fontWeight: 600 }}>
                        {slide.content}
                    </p>
                </div>

                {/* Footer Action */}
                <div style={{ padding: "0 2rem 2rem" }}>
                    <button 
                        onClick={next}
                        disabled={loading}
                        className="btn-primary"
                        style={{ 
                            width: "100%", 
                            padding: "1.25rem", 
                            borderRadius: "20px", 
                            fontSize: "1rem", 
                            fontWeight: 900, 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            gap: "8px",
                            background: slide.color,
                            border: "none",
                            boxShadow: `0 10px 25px ${slide.color}40`,
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                    >
                        {loading ? "Chargement..." : currentSlide === slides.length - 1 ? (
                            <>C'EST PARTI ! <CheckCircle2 size={20} /></>
                        ) : (
                            <>SUIVANT <ChevronRight size={20} /></>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUpWelcome {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
