"use client"

import { useState, useEffect } from "react";
import { getUserExerciseHistory } from "@/lib/actions/exercise";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Zap, Trophy, TrendingUp, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

const EXERCISE_LABELS: Record<string, { label: string, icon: string, unit: string }> = {
    PUSHUP: { label: "Pompes", icon: "💪", unit: "reps" },
    SQUAT: { label: "Squats", icon: "🦵", unit: "reps" },
    VENTRAL: { label: "Gainage Ventral", icon: "🛡️", unit: "s" },
    LATERAL_L: { label: "Gainage Lateral G", icon: "👈", unit: "s" },
    LATERAL_R: { label: "Gainage Lateral D", icon: "👉", unit: "s" },
    PULLUP: { label: "Tractions", icon: "🧗", unit: "reps" },
    RUNNING: { label: "Course à pied", icon: "🏃", unit: "min" },
    STRETCHING: { label: "Étirements", icon: "🧘", unit: "sec" },
};

export default function DiaryPage() {
    const [history, setHistory] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        setLoading(true);
        const res = await getUserExerciseHistory();
        if (res.success) {
            setHistory(res.history);
        }
        setLoading(false);
    }

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const selectedDaySessions = history[selectedDateStr] || [];

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    if (loading) {
        return (
            <div className="flex-center" style={{ height: "100vh", flexDirection: "column", gap: "1rem" }}>
                <CalendarIcon size={48} className="text-secondary animate-pulse" />
                <p style={{ fontWeight: 800, color: "var(--text-muted)" }}>Ouverture du carnet...</p>
            </div>
        );
    }

    return (
        <main className="container-narrow" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
            <header style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link href="/" className="btn-ghost" style={{ padding: "0.5rem" }}><ArrowLeft size={24} /></Link>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.02em" }}>Carnet d'Entraînement</h1>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700 }}>Ton historique complet, jour après jour.</p>
                </div>
            </header>

            {/* CALENDAR BLOCK */}
            <section className="glass-premium" style={{ padding: "1.5rem", borderRadius: "32px", marginBottom: "2rem", border: "1px solid rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "capitalize" }}>
                        {format(currentMonth, "MMMM yyyy", { locale: fr })}
                    </h2>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={prevMonth} className="btn-ghost" style={{ padding: "0.25rem" }}><ChevronLeft size={20} /></button>
                        <button onClick={nextMonth} className="btn-ghost" style={{ padding: "0.25rem" }}><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", marginBottom: "8px" }}>
                    {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                        <span key={i} style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--text-muted)", opacity: 0.5 }}>{d}</span>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                    {/* Padding for month start day */}
                    {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                        <div key={`pad-${i}`} />
                    ))}
                    
                    {days.map((day, i) => {
                        const dateKey = format(day, "yyyy-MM-dd");
                        const hasSessions = history[dateKey] && history[dateKey].length > 0;
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(day)}
                                style={{
                                    aspectRatio: "1",
                                    borderRadius: "12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                    fontSize: "0.9rem",
                                    fontWeight: isSelected || hasSessions ? 900 : 600,
                                    border: isSelected ? "2px solid var(--primary)" : "1px solid rgba(0,0,0,0.03)",
                                    background: isSelected ? "white" : hasSessions ? "rgba(217, 119, 6, 0.05)" : "transparent",
                                    color: isSelected ? "var(--primary)" : isToday ? "var(--secondary)" : "inherit",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {day.getDate()}
                                {hasSessions && !isSelected && (
                                    <div style={{ 
                                        width: "4px", height: "4px", borderRadius: "50%", background: "var(--primary)", 
                                        position: "absolute", bottom: "4px" 
                                    }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* DETAILS BLOCK */}
            <section>
                <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 900, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
                        {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                    </h3>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                        {selectedDaySessions.length} activité{selectedDaySessions.length > 1 ? 's' : ''}
                    </div>
                </div>

                {selectedDaySessions.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {selectedDaySessions.map((s, idx) => {
                            const config = EXERCISE_LABELS[s.type as string] || { label: s.type, icon: "❓", unit: "" };
                            return (
                                <div key={s.id || idx} className="glass-premium" style={{ padding: "1.25rem", borderRadius: "24px", display: "flex", alignItems: "center", gap: "1rem", border: "1px solid rgba(0,0,0,0.03)" }}>
                                    <div style={{ width: "48px", height: "48px", background: "white", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                                        {config.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: "1rem" }}>{config.label}</div>
                                        <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                                            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--primary)" }}>{s.value} {config.unit}</span>
                                            {s.xpGained > 0 && (
                                                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--secondary)" }}>+{s.xpGained} XP</span>
                                            )}
                                        </div>
                                    </div>
                                    {s.mood && (
                                        <div title={s.mood} style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                                            <MessageSquare size={16} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-premium" style={{ padding: "3rem 1rem", textAlign: "center", borderRadius: "24px", color: "var(--text-muted)", opacity: 0.8 }}>
                         <CalendarIcon size={32} style={{ marginBottom: "1rem", opacity: 0.3 }} />
                         <p style={{ fontWeight: 700 }}>Rien à signaler pour cette journée.</p>
                         <p style={{ fontSize: "0.75rem", marginTop: "4px" }}>C'était peut-être un jour de repos mérité !</p>
                    </div>
                )}
            </section>
        </main>
    );
}
