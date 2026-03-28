"use client"

import { useState, useEffect, useCallback } from "react";
import { claimZenReward } from "@/lib/actions/gamification";

export default function ZenBirdGlobal() {
    const [showZen, setShowZen] = useState(false);
    const [zenLevel, setZenLevel] = useState(0);
    const [position, setPosition] = useState({ top: "20%", left: "20%" });
    const [isCatching, setIsCatching] = useState(false);

    const spawnBird = useCallback(() => {
        // Random position within safe viewport areas
        const top = Math.floor(Math.random() * 70 + 15) + "%";
        const left = Math.floor(Math.random() * 70 + 15) + "%";
        setPosition({ top, left });
        setShowZen(true);
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        const resetTimer = () => {
            setShowZen(false);
            clearTimeout(timer);
            // After 60s of total inactivity, the bird appears
            timer = setTimeout(spawnBird, 60000); 
        };

        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        activityEvents.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
            clearTimeout(timer);
        };
    }, [spawnBird]);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isCatching) return;
        setIsCatching(true);

        try {
            const res = await claimZenReward();
            if (res.success) {
                if (res.zenLevel === 7) {
                    alert("🐱 GRIFFURE ! Le chat maléfique vous a griffé. Vous perdez un niveau... Ne restez pas trop longtemps immobile !");
                } else {
                    alert("🐦 CHAT ! Vous avez attrapé l'oiseau zen. +XP !");
                }
                setZenLevel(res.zenLevel ?? 0);
            }
        } catch (err) {
            console.error("Error claiming zen reward:", err);
        } finally {
            setShowZen(false);
            setIsCatching(false);
        }
    };

    if (!showZen) return null;

    const birdEmoji = ["🐦", "🦜", "🕊️", "🦅", "🦆", "🦉", "🐧"][zenLevel % 7];
    const displayEmoji = zenLevel === 7 ? "🐱" : birdEmoji;

    return (
        <div 
            className="zen-bird-container"
            onClick={handleClick}
            style={{ 
                top: position.top, 
                left: position.left,
                transform: isCatching ? 'scale(1.5) rotate(20deg)' : 'scale(1)',
                opacity: isCatching ? 0 : 1
            }}
        >
            <div className="bird-emoji">{displayEmoji}</div>
            <div className="bird-pulse"></div>
            
            <style jsx>{`
                .zen-bird-container {
                    position: fixed;
                    z-index: 9999;
                    font-size: 3rem;
                    cursor: pointer;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 80px;
                    height: 80px;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    animation: birdFloat 3s infinite ease-in-out;
                }
                .bird-emoji {
                    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
                    z-index: 2;
                }
                .bird-pulse {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: rgba(var(--primary-rgb), 0.2);
                    border-radius: 50%;
                    z-index: 1;
                    animation: pulse 2s infinite;
                }
                @keyframes birdFloat {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    33% { transform: translateY(-15px) rotate(5deg); }
                    66% { transform: translateY(5px) rotate(-5deg); }
                }
                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @media (max-width: 640px) {
                    .zen-bird-container {
                        font-size: 2.5rem;
                        width: 60px;
                        height: 60px;
                    }
                }
            `}</style>
        </div>
    );
}
