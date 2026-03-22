"use client"

import { useState } from "react";
import { logBatchExercises } from "@/lib/actions/exercise";
import { format, subDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Minus, Check, MessageSquare } from "lucide-react";
import { ExerciseType } from "@prisma/client";

const EXERCISES = [
    { type: "PUSHUP" as ExerciseType, label: "Pompes", unit: "reps", icon: "💪" },
    { type: "SQUAT" as ExerciseType, label: "Squats", unit: "reps", icon: "🦵" },
    { type: "VENTRAL" as ExerciseType, label: "Gainage Ventral", unit: "s", icon: "🛡️" },
    { type: "LATERAL_L" as ExerciseType, label: "Gainage Latéral G", unit: "s", icon: "👈" },
    { type: "LATERAL_R" as ExerciseType, label: "Gainage Latéral D", unit: "s", icon: "👉" },
];

export default function ExerciseBatchForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mood, setMood] = useState("");
    const [values, setValues] = useState<Record<string, number[]>>({
        PUSHUP: [0],
        SQUAT: [0],
        VENTRAL: [0],
        LATERAL_L: [0],
        LATERAL_R: [0]
    });

    const dates = [0, 1, 2, 3].map(d => subDays(new Date(), d));

    const addSet = (type: string) => {
        setValues(prev => ({
            ...prev,
            [type]: [...prev[type], 0]
        }));
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

        const result = await logBatchExercises(payload, selectedDate.toISOString(), mood);
        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            onSuccess();
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Header / Date Selector */}
            <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "4px" }}>
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
                <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "600", border: "1px solid #fecaca" }}>
                    {error}
                </div>
            )}

            {/* Exercise List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {EXERCISES.map((ex) => (
                    <div key={ex.type} className="batch-exercise-row glass-premium" style={{ padding: "1.25rem", borderRadius: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                            <div style={{ fontSize: "1.5rem" }}>{ex.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.9rem", fontWeight: "900", color: "var(--foreground)" }}>{ex.label}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>{ex.unit}</div>
                            </div>
                            <button
                                onClick={() => addSet(ex.type)}
                                className="add-set-link"
                            >
                                <Plus size={14} /> Nouvelle série
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {values[ex.type].map((val, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span style={{ fontSize: "0.65rem", fontWeight: "900", color: "var(--text-muted)", minWidth: "15px" }}>S{idx + 1}</span>
                                    <button onClick={() => updateSetValue(ex.type, idx, -5)} className="val-btn">-5</button>
                                    <input
                                        type="number"
                                        value={val}
                                        onChange={(e) => handleValueChange(ex.type, idx, e.target.value)}
                                        className="batch-val-input"
                                    />
                                    <button onClick={() => updateSetValue(ex.type, idx, 5)} className="val-btn">+5</button>

                                    {values[ex.type].length > 1 && (
                                        <button onClick={() => removeSet(ex.type, idx)} className="remove-set-btn">
                                            <Minus size={14} />
                                        </button>
                                    )}
                                    {idx === values[ex.type].length - 1 && (
                                        <button onClick={() => addSet(ex.type)} className="plus-btn-small">
                                            <Plus size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mood Field */}
            <div className="glass" style={{ padding: "1rem", borderRadius: "20px", display: "flex", alignItems: "center", gap: "1rem" }}>
                <MessageSquare size={20} className="text-primary" />
                <input
                    type="text"
                    placeholder="Quel est ton mood ? (optionnel)"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    maxLength={50}
                    style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: "0.9rem", color: "var(--foreground)", fontWeight: "500" }}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary start-button"
                style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
                {loading ? "Enregistrement..." : <><Check size={20} /> VALIDER LA SÉANCE</>}
            </button>

            <style jsx>{`
                .add-set-link {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-size: 0.7rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                .add-set-link:hover {
                    background: rgba(217, 119, 6, 0.05);
                }
                .remove-set-btn {
                    background: rgba(239, 68, 68, 0.05);
                    border: none;
                    color: #ef4444;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .plus-btn-small {
                    width: 32px;
                    height: 32px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(217, 119, 6, 0.15);
                }
                .val-btn:active, .plus-btn-small:active, .remove-set-btn:active {
                    transform: scale(0.9);
                }
            `}</style>
        </div>
    );
}
