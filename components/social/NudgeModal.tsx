"use client"

import { useState } from "react";
import { Send, X, Mail } from "lucide-react";
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
            <div className="modal-content popup-modal" onClick={e => e.stopPropagation()}>
                <header className="popup-modal-header">
                    <div className="popup-icon-container">
                        <Mail size={20} />
                    </div>
                    <h2>Envoyer un Pop up à {receiverName}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20}/></button>
                </header>

                <div className="popup-input-wrapper">
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Écris un petit mot gentil (ou un petit troll)..."
                        maxLength={140}
                        autoFocus
                    />
                    <div className="popup-char-count" style={{ color: message.length > 130 ? 'var(--error)' : 'inherit' }}>
                        {message.length}/140
                    </div>
                </div>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">🚀 Tweet envoyé !</p>}

                <footer className="popup-modal-footer">
                    <button 
                        className="btn-primary popup-btn" 
                        disabled={isSending || !message.trim() || success}
                        onClick={handleSend}
                    >
                        {isSending ? "Envoi..." : <><Send size={18} /><span>Envoyer le Pop up</span></>}
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
                .popup-modal {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    border-radius: var(--radius-md, 20px);
                    padding: 24px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                    animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid rgba(0,0,0,0.05);
                }
                @keyframes modalPop {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .popup-modal-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .popup-icon-container {
                    color: var(--primary);
                    background: rgba(var(--primary-rgb, 217, 119, 6), 0.1);
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .popup-modal-header h2 {
                    font-size: 1.25rem;
                    font-weight: 900;
                    margin: 0;
                    flex: 1;
                    color: #0f172a;
                }
                .close-btn {
                    background: rgba(0,0,0,0.03); border: none; cursor: pointer; color: var(--text-muted);
                    width: 32px; height: 32px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .close-btn:hover { background: rgba(0,0,0,0.08); color: var(--foreground); }
                .popup-input-wrapper {
                    position: relative;
                    margin-bottom: 24px;
                }
                textarea {
                    width: 100%;
                    height: 140px;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 16px;
                    padding: 16px;
                    font-size: 1rem;
                    resize: none;
                    font-family: inherit;
                    transition: all 0.2s;
                    background: #f8fafc;
                }
                textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                    box-shadow: 0 0 0 4px rgba(217,119,6,0.1);
                }
                .popup-char-count {
                    position: absolute;
                    bottom: 12px;
                    right: 16px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    padding: 4px 8px;
                    background: rgba(255,255,255,0.8);
                    border-radius: 8px;
                    opacity: 0.6;
                }
                .popup-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                }
                .popup-btn {
                    border: none;
                    border-radius: 16px;
                    padding: 12px 28px;
                    font-weight: 900;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(217,119,6,0.2);
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
