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

    // Calcul de l'âge de l'utilisateur
    const userAge = session?.user?.birthday 
        ? differenceInYears(new Date(), new Date(session.user.birthday)) 
        : 30; // Fallback par défaut si non renseigné

    const currentSeason = SEASONS[seasonIndex];

    const handleClick = async (e: React.MouseEvent) => {
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
            className={`seasonal-tree-container season-${seasonIndex}`}
            title={`Arbre Sacré - ${currentSeason.name}`}
        >
            <svg viewBox="0 0 100 100" className="tree-svg">
                <defs>
                    <linearGradient id="trunk-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#5D4037" />
                        <stop offset="100%" stopColor="#3E2723" />
                    </linearGradient>
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2"/>
                    </filter>
                </defs>

                {/* Tronc organique */}
                <path 
                    d="M48 95 Q50 80 50 65 L52 65 Q52 80 54 95 Z" 
                    fill="url(#trunk-grad)" 
                />
                <path 
                    d="M50 75 Q45 70 40 72" 
                    fill="none" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" 
                />
                <path 
                    d="M52 70 Q58 65 62 67" 
                    fill="none" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" 
                />

                {/* Feuillage multicouche */}
                <g filter="url(#shadow)">
                    {/* Couche arrière */}
                    <path 
                        className="leaves-back"
                        d="M50 15 C30 15 15 35 15 55 C15 70 30 80 50 82 C70 80 85 70 85 55 C85 35 70 15 50 15Z" 
                        fill={currentSeason.color}
                        opacity="0.6"
                    />
                    {/* Couche avant */}
                    <path 
                        className="leaves-front"
                        d="M50 20 C35 20 22 38 22 55 C22 68 35 78 50 80 C65 78 78 68 78 55 C78 38 65 20 50 20Z" 
                        fill={currentSeason.color}
                    />
                </g>

                {/* Détails saisonniers alternatifs */}
                {currentSeason.flowers && (
                    <g className="seasonal-details">
                        <circle cx="35" cy="40" r="3" fill="#FFC1E3" className="petal" />
                        <circle cx="65" cy="35" r="2.5" fill="#FFF" className="petal" />
                        <circle cx="50" cy="55" r="3.5" fill="#FFC1E3" className="petal" />
                        <circle cx="42" cy="30" r="2" fill="#FFF" className="petal" />
                    </g>
                )}

                {seasonIndex === 2 && ( // Automne : feuilles tombantes
                    <g className="seasonal-details">
                        <path d="M30 65 L35 68" stroke="#D84315" strokeWidth="2" className="falling-leaf" />
                        <path d="M70 60 L75 63" stroke="#BF360C" strokeWidth="2" className="falling-leaf" />
                    </g>
                )}

                {currentSeason.snow && (
                    <g className="seasonal-details">
                        <path d="M30 25 Q50 18 70 25" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                        <circle cx="40" cy="45" r="1.5" fill="white" className="snowflake" />
                        <circle cx="60" cy="50" r="1.5" fill="white" className="snowflake" />
                    </g>
                )}
            </svg>

            <style jsx>{`
                .seasonal-tree-container {
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    user-select: none;
                    margin-left: 8px;
                    width: 32px;
                    height: 32px;
                    position: relative;
                }
                .tree-svg {
                    width: 100%;
                    height: 100%;
                    transition: all 0.5s ease;
                }
                .leaves-back, .leaves-front {
                    transition: fill 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .seasonal-tree-container:hover .tree-svg {
                    transform: scale(1.1) rotate(5deg);
                }
                .seasonal-tree-container:active .tree-svg {
                    transform: scale(0.9);
                }
                
                /* Animations */
                .petal { animation: petalFloat 3s infinite ease-in-out; }
                .falling-leaf { animation: leafFall 4s infinite linear; }
                .snowflake { animation: snowSpin 2s infinite linear; }

                @keyframes petalFloat {
                    0%, 100% { transform: translate(0, 0); opacity: 0.8; }
                    50% { transform: translate(2px, -2px); opacity: 1; }
                }
                @keyframes leafFall {
                    0% { transform: translate(0, -10px) rotate(0); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translate(-5px, 20px) rotate(45deg); opacity: 0; }
                }
                @keyframes snowSpin {
                    from { transform: rotate(0); }
                    to { transform: rotate(360deg); }
                }

                /* Mobile optimization */
                @media (max-width: 640px) {
                    .seasonal-tree-container {
                        width: 28px;
                        height: 28px;
                    }
                }
            `}</style>
        </div>
    );
}
