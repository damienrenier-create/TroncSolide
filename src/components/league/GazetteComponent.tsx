"use client"

import { useState } from "react";
import { Heart, Trophy, Zap, User, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toggleLike } from "@/lib/actions/social";

interface FeedItem {
    id: string;
    type: string;
    user: { id: string, nickname: string };
    badge?: { name: string, icon: string };
    level?: number;
    createdAt: string;
    likeCount: number;
    isLiked: boolean;
}

export default function GazetteComponent({
    initialItems,
    currentUserId
}: {
    initialItems: any[],
    currentUserId: string
}) {
    const [items, setItems] = useState(initialItems);

    async function handleLike(itemId: string) {
        // Optimistic update
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    isLiked: !item.isLiked,
                    likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1
                };
            }
            return item;
        }));
        await toggleLike(itemId);
    }

    return (
        <div className="gazette-container">
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem" }}>La Gazette & Live 📰</h3>

            <div className="feed-list">
                {items.map((item) => (
                    <div key={item.id} className="glass feed-card">
                        <div className="feed-icon">
                            {item.type === "LEVEL_UP" ? (
                                <Zap size={18} color="var(--primary)" />
                            ) : (
                                <Trophy size={18} color="var(--accent)" />
                            )}
                        </div>

                        <div className="feed-content">
                            <div className="feed-header">
                                <Link href="/profile" className="feed-user">
                                    @{item.user.nickname}
                                </Link>
                                <span className="feed-time">
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="feed-text">
                                {item.type === "LEVEL_UP" ? (
                                    <>A grimpé au niveau <strong>{item.level}</strong> ! 🌲</>
                                ) : (
                                    <>A remporté le badge <strong>{item.badge?.icon} {item.badge?.name}</strong></>
                                )}
                            </div>

                            <div className="feed-actions">
                                <button
                                    onClick={() => handleLike(item.id)}
                                    className={`like-btn ${item.isLiked ? 'active' : ''}`}
                                >
                                    <Heart size={14} fill={item.isLiked ? "currentColor" : "none"} />
                                    <span>{item.likeCount}</span>
                                </button>

                                <Link href="/faq" className="feed-link">
                                    <ExternalLink size={12} />
                                    Voir {item.type === "LEVEL_UP" ? "niveaux" : "badge"}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", padding: "2rem" }}>
                        Rien de neuf dans la ligue aujourd'hui.
                    </p>
                )}
            </div>

            <style jsx>{`
        .feed-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .feed-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
        }
        .feed-icon {
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.03);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feed-content { flex: 1; }
        .feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .feed-user {
          font-weight: 700;
          font-size: 0.85rem;
          color: white;
          text-decoration: none;
        }
        .feed-user:hover { color: var(--primary); }
        .feed-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .feed-text {
          font-size: 0.85rem;
          line-height: 1.4;
          margin-bottom: 0.75rem;
        }
        .feed-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .like-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0;
          transition: color 0.2s;
        }
        .like-btn.active { color: #ef4444; }
        .like-btn:hover { color: #ef4444; }
        
        .feed-link {
            font-size: 0.7rem;
            color: var(--text-muted);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .feed-link:hover { color: white; }
      `}</style>
        </div>
    );
}
