"use client"

import { useState, useEffect } from "react";
import { claimClickEasterEgg, claimZenReward } from "@/lib/actions/gamification";
import { differenceInYears } from "date-fns";
import { useSession } from "next-auth/react";

const SEASONS = [
    { name: "Printemps", color: "#A8E6A3", flowers: true, snow: false },
    { name: "Été", color: "#2D6A4F", flowers: false, snow: false },
    { name: "Automne", color: "#E07A5F", flowers: false, snow: false },
    { name: "Hiver", color: "#F1FAEE", flowers: false, snow: true },
];

export default function SeasonalTree() {
    const { data: session } = useSession();
    const [seasonIndex, setSeasonIndex] = useState(0); // 0: Printemps
    const [clicks, setClicks] = useState(0);
    const [isWon, setIsWon] = useState(false);
    
    // Zen Bird State
    const [showZen, setShowZen] = useState(false);
    const [zenLevel, setZenLevel] = useState(0);

    // Calcul de l'âge de l'utilisateur
    const userAge = session?.user?.birthday 
        ? differenceInYears(new Date(), new Date(session.user.birthday)) 
        : 30; // Fallback par défaut si non renseigné

    const currentSeason = SEASONS[seasonIndex];

    // Inactivity Timer for Zen Bird
    useEffect(() => {
        let timer: NodeJS.Timeout;
        const resetTimer = () => {
            setShowZen(false);
            clearTimeout(timer);
            timer = setTimeout(() => setShowZen(true), 60000); // 60s
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('click', resetTimer);

        resetTimer();

        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('click', resetTimer);
            clearTimeout(timer);
        };
    }, []);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (showZen) {
            // Click sur l'oiseau ou le chat
            const res = await claimZenReward();
            if (res.success) {
                if (zenLevel === 7) {
                    alert("🐱 GRIFFURE ! Le chat maléfique vous a griffé. Vous perdez un niveau... Ne restez pas trop longtemps immobile !");
                } else {
                    alert("🐦 CHAT ! Vous avez attrapé l'oiseau zen. +XP !");
                }
                setZenLevel(res.zenLevel ?? 0);
            }
            setShowZen(false);
            return;
        }

        const newIndex = (seasonIndex + 1) % 4;
        const newClicks = clicks + 1;
        
        setSeasonIndex(newIndex);
        setClicks(newClicks);

        // Condition d'Easter Egg : L'arbre a le même âge que l'humain (1 cycle de 4 clics = 1 an)
        if (newClicks === userAge * 4 && !isWon) {
            const res = await claimClickEasterEgg();
            if (res.success) {
                setIsWon(true);
                alert("✨ INCROYABLE ! L'arbre sacré a atteint votre âge (" + userAge + " ans). \n\nVous gagnez le badge caché 'Fou du Clic' et montez instantanément d'un niveau ! 🖱️🌳");
                window.location.reload(); // Rechargement pour voir le niveau et la gazette
            }
        }
    };

    return (
        <div 
            onClick={handleClick} 
            style={{ 
                cursor: "pointer", 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                userSelect: "none",
                marginLeft: "4px"
            }}
            title={`Arbre Sacré - ${currentSeason.name}`}
            className="seasonal-tree"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Tronc */}
                <path d="M11 18H13V22H11V18Z" fill="#5D4037" />
                
                {/* Feuillage */}
                <path 
                    d="M12 2C8 2 5 5 5 9C5 12.5 7.5 15.5 10.5 16.5V18H13.5V16.5C16.5 15.5 19 12.5 19 9C19 5 16 2 12 2Z" 
                    fill={currentSeason.color} 
                    style={{ transition: "fill 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />

                {/* Fleurs de Printemps */}
                {currentSeason.flowers && (
                    <g style={{ transition: "opacity 0.6s" }}>
                        <circle cx="8" cy="7" r="1" fill="#FFC1E3" />
                        <circle cx="15" cy="6" r="1" fill="#FFC1E3" />
                        <circle cx="12" cy="10" r="1" fill="#FFC1E3" />
                        <circle cx="9" cy="12" r="1" fill="#FFC1E3" />
                        <circle cx="15" cy="11" r="1" fill="#FFC1E3" />
                    </g>
                )}

                {/* Neige d'Hiver */}
                {currentSeason.snow && (
                    <path 
                        d="M7 6C9 4 15 4 17 6C15 5 9 5 7 6Z" 
                        fill="#FFFFFF" 
                        fillOpacity="0.8"
                        style={{ transition: "opacity 0.6s" }}
                    />
                )}
            </svg>

            {/* ZEN BIRD / CAT emoji overlay */}
            {showZen && (
                <div style={{
                    position: "absolute",
                    top: "-15px",
                    left: "14px",
                    fontSize: "1.2rem",
                    animation: "bounce 1s infinite",
                    zIndex: 10
                }}>
                    {zenLevel === 7 ? "🐱" : 
                     ["🐦", "🦜", "🕊️", "🦅", "🦆", "🦉", "🐧"][zenLevel % 7]}
                </div>
            )}

            <style jsx>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </div>
    );
}
