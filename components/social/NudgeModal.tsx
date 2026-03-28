"use client"

import { useState } from "react";
import { Send, X, Twitter } from "lucide-react";
import { sendNudge } from "@/lib/actions/nudges";

interface NudgeModalProps {
    receiverId: string;
    receiverName: string;
    onClose: () => void;
}

export default function NudgeModal({ receiverId, receiverName, onClose }: NudgeModalProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setIsSending(true);
        setError(null);
        try {
            await sendNudge(receiverId, message);
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content tweet-modal" onClick={e => e.stopPropagation()}>
                <header className="tweet-modal-header">
                    <div className="tweet-icon-container">
                        <Twitter size={20} fill="currentColor" />
                    </div>
                    <h2>Envoyer un "Tweet" à {receiverName}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20}/></button>
                </header>

                <div className="tweet-input-wrapper">
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Quoi de neuf ? (Spamme ton pote !)"
                        maxLength={140}
                        autoFocus
                    />
                    <div className="tweet-char-count" style={{ color: message.length > 130 ? 'var(--error)' : 'inherit' }}>
                        {message.length}/140
                    </div>
                </div>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">🚀 Tweet envoyé !</p>}

                <footer className="tweet-modal-footer">
                    <button 
                        className="btn-primary tweet-btn" 
                        disabled={isSending || !message.trim() || success}
                        onClick={handleSend}
                    >
                        {isSending ? "Envoi..." : <><Send size={18} /><span>Tweeter</span></>}
                    </button>
                </footer>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .tweet-modal {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                    animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes modalPop {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .tweet-modal-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .tweet-icon-container {
                    color: #1DA1F2;
                }
                .tweet-modal-header h2 {
                    font-size: 1.1rem;
                    font-weight: 900;
                    margin: 0;
                    flex: 1;
                }
                .close-btn {
                    background: none; border: none; cursor: pointer; color: var(--text-muted);
                }
                .tweet-input-wrapper {
                    position: relative;
                    margin-bottom: 20px;
                }
                textarea {
                    width: 100%;
                    height: 120px;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 12px;
                    padding: 15px;
                    font-size: 1rem;
                    resize: none;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }
                textarea:focus {
                    outline: none;
                    border-color: #1DA1F2;
                }
                .tweet-char-count {
                    position: absolute;
                    bottom: 10px;
                    right: 15px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    opacity: 0.6;
                }
                .tweet-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                }
                .tweet-btn {
                    background: #1DA1F2;
                    color: white;
                    border: none;
                    border-radius: 9999px;
                    padding: 10px 24px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: transform 0.2s, background 0.2s;
                }
                .tweet-btn:hover:not(:disabled) {
                    background: #1a91da;
                    transform: translateY(-2px);
                }
                .tweet-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .error-message {
                    color: var(--error);
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-top: -10px;
                    margin-bottom: 15px;
                }
                .success-message {
                    color: var(--success);
                    font-weight: 800;
                    text-align: center;
                    margin-bottom: 15px;
                }
            `}</style>
        </div>
    );
}
