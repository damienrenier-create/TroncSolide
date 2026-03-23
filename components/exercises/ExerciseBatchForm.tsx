"use client"

import { useState } from "react";
import { logBatchExercises } from "@/lib/actions/exercise";
import { format, subDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Minus, Check, MessageSquare, ShieldAlert } from "lucide-react";
import { ExerciseType } from "@prisma/client";

const EXERCISES = [
    { type: "PUSHUP" as ExerciseType, label: "Pompes", unit: "reps", icon: "💪" },
    { type: "SQUAT" as ExerciseType, label: "Squats", unit: "reps", icon: "🦵" },
    { type: "VENTRAL" as ExerciseType, label: "Gainage Ventral", unit: "s", icon: "🛡️" },
    { type: "LATERAL_L" as ExerciseType, label: "Gainage Latéral G", unit: "s", icon: "👈" },
    { type: "LATERAL_R" as ExerciseType, label: "Gainage Latéral D", unit: "s", icon: "👉" },
];

const THRESHOLDS: Record<string, number> = {
    PUSHUP: 100,
    SQUAT: 200,
    VENTRAL: 600,
    LATERAL_L: 600,
    LATERAL_R: 600,
    PULLUP: 40,
    RUNNING: 120,
    STRETCHING: 1800
};

export default function ExerciseBatchForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mood, setMood] = useState("");
    const [showHonorModal, setShowHonorModal] = useState(false);
    const [isHonorSworn, setIsHonorSworn] = useState(false);
    const [values, setValues] = useState<Record<string, number[]>>({
        PUSHUP: [0],
        SQUAT: [0],
        VENTRAL: [0],
        LATERAL_L: [0], // Default wait... the user's screenshot had LATERAL_G and LATERAL_D... it matches perfectly!
        LATERAL_R: [0]
    });

    const dates = [0, 1, 2, 3].map(d => subDays(new Date(), d));

    const addSet = (type: string) => {
        setValues(prev => {
            const lastValue = prev[type][prev[type].length - 1] || 0;
            return {
                ...prev,
                [type]: [...prev[type], lastValue]
            };
        });
    };

    const removeSet = (type: string, index: number) => {
        setValues(prev => {
            const newSets = [...prev[type]];
            if (newSets.length > 1) {
                newSets.splice(index, 1);
            } else {
                newSets[0] = 0;
            }
            return { ...prev, [type]: newSets };
        });
    };

    const updateSetValue = (type: string, index: number, delta: number) => {
        setValues(prev => {
            const newSets = [...prev[type]];
            newSets[index] = Math.max(0, newSets[index] + delta);
            return { ...prev, [type]: newSets };
        });
    };

    const handleValueChange = (type: string, index: number, val: string) => {
        const num = parseInt(val) || 0;
        setValues(prev => {
            const newSets = [...prev[type]];
            newSets[index] = Math.max(0, num);
            return { ...prev, [type]: newSets };
        });
    };

    async function handleSubmit() {
        setLoading(true);
        setError(null);

        const payload: { type: ExerciseType; value: number }[] = [];
        Object.entries(values).forEach(([type, sets]) => {
            sets.forEach(val => {
                if (val > 0) {
                    payload.push({ type: type as ExerciseType, value: val });
                }
            });
        });

        if (payload.length === 0) {
            setError("Ajoute au moins une série !");
            setLoading(false);
            return;
        }

        // Check thresholds
        const hasSusValue = payload.some(ex => ex.value >= (THRESHOLDS[ex.type] || 999999));
        if (hasSusValue && !isHonorSworn) {
            setShowHonorModal(true);
            setLoading(false);
            return;
        }

        const result = await logBatchExercises(payload, selectedDate.toISOString(), mood);
        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            onSuccess();
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="log-header-container">
                <h1 className="log-title">Enregistrer une séance</h1>
                <div className="log-subtitle">Qu'as-tu accompli aujourd'hui ?</div>
            </div>

            {/* Date Selector */}
            <div className="date-selector-container">
                {dates.map((d, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        className={`date-chip ${isSameDay(d, selectedDate) ? 'active' : ''}`}
                    >
                        {i === 0 ? "Aujourd'hui" : i === 1 ? "Hier" : format(d, "EEE d", { locale: fr })}
                    </button>
                ))}
            </div>

            {error && (
                <div className="auth-alert-error" style={{ marginBottom: "1rem" }}>
                    {error}
                </div>
            )}

            {/* Exercise List */}
            <div>
                {EXERCISES.map((ex) => (
                    <div key={ex.type} className="log-card">
                        <div className="log-card-header">
                            <div className="log-card-icon">{ex.icon}</div>
                            <div className="log-card-info">
                                <div className="log-card-title">{ex.label}</div>
                                <div className="log-card-unit">{ex.unit}</div>
                            </div>
                            <button
                                onClick={() => addSet(ex.type)}
                                className="log-add-serie-btn"
                            >
                                <Plus size={14} /> Nouvelle série
                            </button>
                        </div>

                        {values[ex.type].map((val, idx) => (
                            <div key={idx} className="log-serie-row">
                                <span className="log-serie-label">S{idx + 1}</span>
                                <button onClick={() => updateSetValue(ex.type, idx, -5)} className="val-btn">-5</button>
                                <input
                                    type="number"
                                    value={val}
                                    onChange={(e) => handleValueChange(ex.type, idx, e.target.value)}
                                    className="log-val-input"
                                />
                                <button onClick={() => updateSetValue(ex.type, idx, 5)} className="val-btn">+5</button>

                                {values[ex.type].length > 1 && idx !== values[ex.type].length - 1 && (
                                    <button onClick={() => removeSet(ex.type, idx)} className="log-remove-btn">
                                        <Minus size={16} />
                                    </button>
                                )}
                                
                                {idx === values[ex.type].length - 1 && (
                                     <button onClick={() => addSet(ex.type)} className="log-action-btn">
                                        <Plus size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Mood Field */}
            <div className="log-card" style={{ padding: "1rem 1.5rem", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <MessageSquare size={20} className="text-primary" />
                <input
                    type="text"
                    placeholder="Quel est ton mood ? (optionnel)"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    maxLength={50}
                    style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: "0.95rem", color: "#0f172a", fontWeight: "600" }}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="auth-button"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
                {loading ? "Enregistrement..." : <>VALIDER LA SÉANCE</>}
            </button>

            {/* Honor Modal */}
            {showHonorModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1.5rem" }}>
                    <div className="glass-premium" style={{ maxWidth: "400px", background: "white", padding: "2rem", borderRadius: "32px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
                        <div style={{ width: "64px", height: "64px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                            <ShieldAlert size={32} />
                        </div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 900, marginBottom: "1rem" }}>Performance Herculéenne ?</h3>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "2rem", fontWeight: 600, lineHeight: 1.5 }}>
                            Tu as saisi des valeurs qui semblent hors du commun. Vérifie tes données pour éviter de fausser les records de la ligue.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button 
                                onClick={() => {
                                    setIsHonorSworn(true);
                                    setShowHonorModal(false);
                                    // Trigger submit again after swearing
                                    setTimeout(() => handleSubmit(), 100);
                                }}
                                className="btn-primary"
                                style={{ width: "100%", padding: "1rem", borderRadius: "16px", fontWeight: 900 }}
                            >
                                Je jure sur l'honneur ✋
                            </button>
                            <button 
                                onClick={() => setShowHonorModal(false)}
                                className="btn-ghost"
                                style={{ fontWeight: 700 }}
                            >
                                Je vérifie mes chiffres
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
