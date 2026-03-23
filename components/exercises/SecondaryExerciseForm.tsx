"use client"

import { useState } from "react";
import { logBatchExercises } from "@/lib/actions/exercise";
import { format, subDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Minus, MessageSquare, History } from "lucide-react";
import { ExerciseType } from "@prisma/client";
import Link from "next/link";

const SECONDARY_EXERCISES = [
    { type: "PULLUP" as ExerciseType, label: "Tractions", unit: "reps", icon: "🧗" },
    { type: "RUNNING" as ExerciseType, label: "Course à pied", unit: "min", icon: "🏃" },
    { type: "STRETCHING" as ExerciseType, label: "Étirements", unit: "sec", icon: "🧘" },
];

export default function SecondaryExerciseForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mood, setMood] = useState("");
    const [values, setValues] = useState<Record<string, number[]>>({
        PULLUP: [0],
        RUNNING: [0],
        STRETCHING: [0]
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
            setError("Ajoute au moins une valeur !");
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
        <div className="secondary-form-container">
            <div className="date-selector-container" style={{ marginBottom: "1.5rem" }}>
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

            <div>
                {SECONDARY_EXERCISES.map((ex) => (
                    <div key={ex.type} className="log-card" style={{ border: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.4)" }}>
                        <div className="log-card-header">
                            <div className="log-card-icon" style={{ background: "white" }}>{ex.icon}</div>
                            <div className="log-card-info">
                                <div className="log-card-title">{ex.label}</div>
                                <div className="log-card-unit">{ex.unit}</div>
                            </div>
                            <button onClick={() => addSet(ex.type)} className="log-add-serie-btn" style={{ background: "var(--primary)", color: "white" }}>
                                <Plus size={14} />
                            </button>
                        </div>

                        {values[ex.type].map((val, idx) => {
                            const step = ex.type === ("PULLUP" as string) ? 1 : 5;
                            return (
                                <div key={idx} className="log-serie-row">
                                    <span className="log-serie-label" style={{ fontWeight: 800 }}>{ex.type === ("RUNNING" as string) || ex.type === ("STRETCHING" as string) ? "Séance" : `S${idx + 1}`}</span>
                                    <button onClick={() => updateSetValue(ex.type as string, idx, -step)} className="val-btn">-{step}</button>
                                    <input
                                        type="number"
                                        value={val}
                                        onChange={(e) => handleValueChange(ex.type as string, idx, e.target.value)}
                                        className="log-val-input"
                                    />
                                    <button onClick={() => updateSetValue(ex.type as string, idx, step)} className="val-btn">+{step}</button>

                                    {values[ex.type as string].length > 1 && (
                                        <button onClick={() => removeSet(ex.type as string, idx)} className="log-remove-btn">
                                            <Minus size={16} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="log-card" style={{ padding: "0.75rem 1rem", flexDirection: "row", alignItems: "center", gap: "1rem", background: "white", borderRadius: "16px" }}>
                <MessageSquare size={18} className="text-primary" />
                <input
                    type="text"
                    placeholder="Note perso (optionnel)"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    maxLength={50}
                    style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: "0.85rem", color: "#0f172a", fontWeight: "600" }}
                />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: "100%", padding: "1rem", borderRadius: "16px", fontWeight: 900, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                >
                    {loading ? "Enregistrement..." : "ENREGISTRER MES EFFORTS"}
                </button>

                <Link href="/diary" className="btn-ghost" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 700, color: "var(--secondary)" }}>
                    <History size={16} /> Accéder à mon carnet d'entraînement
                </Link>
            </div>
        </div>
    );
}
