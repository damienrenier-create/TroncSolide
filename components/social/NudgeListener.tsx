"use client"

import { useState, useEffect, useCallback } from "react";
import { X, Mail } from "lucide-react";
import { getUnreadNudges, markNudgeRead } from "@/lib/actions/nudges";

export default function NudgeListener() {
    const [currentNudge, setCurrentNudge] = useState<any>(null);
    const [isExiting, setIsExiting] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchOffset, setTouchOffset] = useState(0);

    const checkNudges = useCallback(async () => {
        if (currentNudge) return;
        try {
            const nudges = await getUnreadNudges();
            if (nudges && nudges.length > 0) {
                setCurrentNudge(nudges[0]);
            }
        } catch (err) {
            console.error("Error fetching nudges:", err);
        }
    }, [currentNudge]);

    useEffect(() => {
        checkNudges();
        const interval = setInterval(checkNudges, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [checkNudges]);

    const handleDismiss = useCallback(async () => {
        if (!currentNudge || isExiting) return;
        
        setIsExiting(true);
        setTimeout(async () => {
            try {
                await markNudgeRead(currentNudge.id);
            } catch (err) {
                console.error("Error marking nudge as read:", err);
            }
            setCurrentNudge(null);
            setIsExiting(false);
            setTouchOffset(0);
        }, 300);
    }, [currentNudge, isExiting]);

    // Swipe handlers
    const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setTouchStart(x);
    };

    const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (touchStart === null) return;
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const offset = x - touchStart;
        if (offset > 0) { // Only swipe to the right
            setTouchOffset(offset);
        }
    };

    const onTouchEnd = () => {
        if (touchOffset > 100) {
            handleDismiss();
        } else {
            setTouchOffset(0);
        }
        setTouchStart(null);
    };

    if (!currentNudge) return null;

    return (
        <div 
            className={`nudge-popup-container ${isExiting ? 'exit' : ''}`}
            style={{ transform: `translateX(${touchOffset}px)`, opacity: 1 - (touchOffset / 300) }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onTouchStart}
            onMouseMove={onTouchMove}
            onMouseUp={onTouchEnd}
            onMouseLeave={onTouchEnd}
        >
            <div className="nudge-card glass-premium">
                <button className="nudge-close" onClick={(e) => { e.stopPropagation(); handleDismiss(); }}>
                    <X size={14} />
                </button>
                
                <div className="nudge-header">
                    <div className="nudge-mascot">🐹</div>
                    <div className="nudge-avatar-container">
                        <div className="nudge-avatar">
                            {currentNudge.sender.nickname.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="nudge-user-info">
                        <span className="nudge-name">{currentNudge.sender.nickname}</span>
                        <span className="nudge-tag">t'envoie un petit mot !</span>
                    </div>
                    <div className="nudge-type-icon">
                        <Mail size={16} />
                    </div>
                </div>
                
                <div className="nudge-content">
                    {currentNudge.message}
                </div>

                <div className="nudge-footer">
                    {new Date(currentNudge.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })} • Pop up Tronc Solide
                </div>
                
                <div className="swipe-indicator">Balayez pour effacer →</div>
            </div>

            <style jsx>{`
                .nudge-popup-container {
                    position: fixed;
                    bottom: 100px; /* Above BottomNav */
                    left: 20px;
                    right: 20px;
                    max-width: 400px;
                    z-index: 2000;
                    transition: transform 0.1s ease-out, opacity 0.3s;
                    animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: grab;
                }
                .nudge-popup-container:active { cursor: grabbing; }
                
                @keyframes slideIn {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .nudge-popup-container.exit {
                    transform: translateX(100%) !important;
                    opacity: 0 !important;
                }

                .nudge-card {
                    background: white;
                    border-radius: 16px;
                    padding: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    border: 1px solid rgba(0,0,0,0.05);
                    position: relative;
                }

                .nudge-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.05);
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-muted);
                }

                .nudge-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .nudge-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 0.9rem;
                }

                .nudge-user-info {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .nudge-name {
                    font-weight: 800;
                    font-size: 0.9rem;
                    line-height: 1.2;
                }

                .nudge-handle {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .nudge-twitter-icon {
                    color: #1DA1F2;
                    margin-right: 20px;
                }

                .nudge-content {
                    font-size: 0.95rem;
                    line-height: 1.4;
                    margin-bottom: 8px;
                    word-break: break-word;
                }

                .nudge-footer {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                
                .swipe-indicator {
                    font-size: 0.6rem;
                    text-align: right;
                    margin-top: 8px;
                    color: var(--text-muted);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    opacity: 0.5;
                }

                @media (min-width: 640px) {
                    .nudge-popup-container {
                        left: auto;
                        right: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
