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
        LATERAL_L: [0], // Default wait... the user's screenshot had LATERAL_G and LATERAL_D... it matches perfectly!
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
        </div>
    );
}
