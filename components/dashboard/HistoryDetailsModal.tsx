"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Trophy, 
  Zap, 
  Award, 
  Star, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Info,
  Flame
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface XPDetailSource {
  type: "badge" | "milestone" | "event" | "rule" | "base";
  label: string;
  xp: number;
}

interface XPDetails {
  version: number;
  totalXp: number;
  breakdown: {
    base: number;
    bonus: number;
  };
  sources: XPDetailSource[];
}

interface BatchHistoryItem {
  id: string;
  date: Date | string;
  mood: string | null;
  exercises: { type: string; value: number }[];
  xpTotal: number;
  xpDetails: XPDetails | null;
  isBatch: boolean;
}

interface HistoryDetailsModalProps {
  batch: BatchHistoryItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryDetailsModal({ batch, isOpen, onClose }: HistoryDetailsModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  // Extraction propre des données avec fallbacks
  const xp = batch.xpDetails || {
    version: 0,
    totalXp: batch.xpTotal,
    breakdown: { base: batch.xpTotal, bonus: 0 },
    sources: batch.exercises.map(ex => ({
      type: "base" as const,
      label: `${ex.type === 'PUSHUP' ? 'Pompes' : ex.type === 'SQUAT' ? 'Squats' : 'Gainage'} (${ex.value})`,
      xp: 0
    }))
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "base": return <Zap size={18} style={{ color: "var(--primary)" }} />;
      case "event": return <Star size={18} style={{ color: "#8b5cf6" }} />;
      case "rule": return <TrendingUp size={18} style={{ color: "var(--accent)" }} />;
      case "badge": return <Award size={18} style={{ color: "#ec4899" }} />;
      case "milestone": return <Trophy size={18} style={{ color: "#f59e0b" }} />;
      default: return <Info size={18} style={{ color: "var(--text-muted)" }} />;
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(12px)",
        animation: "fadeIn 0.3s ease-out"
      }}
      onClick={onClose}
    >
      <div 
        className="glass-premium"
        style={{
          width: "100%",
          maxWdith: "450px",
          maxWidth: "450px",
          background: "white",
          padding: "2rem",
          position: "relative",
          animation: "slideInScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            background: "rgba(0,0,0,0.05)",
            border: "none",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-muted)"
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <header style={{ marginTop: "0.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--foreground)", marginBottom: "0.25rem" }}>
            Détails de la séance
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={14} />
            {format(new Date(batch.date), "eeee d MMMM", { locale: fr })}
          </p>
        </header>

        {/* XP Hero Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)",
          border: "2px solid rgba(217, 119, 6, 0.1)",
          borderRadius: "24px",
          padding: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
              RÉSULTAT TOTAL
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)" }}>+{batch.xpTotal}</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--primary)", opacity: 0.8 }}>XP</span>
            </div>
          </div>
          <div style={{ background: "var(--primary)", color: "white", padding: "12px", borderRadius: "18px", boxShadow: "0 8px 16px rgba(217, 119, 6, 0.3)" }}>
            <Trophy size={28} />
          </div>
        </div>

        {/* Breakdown Section */}
        <section>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={14} /> Décomposition des gains
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {xp.sources.map((source, idx) => (
              <div 
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "rgba(0,0,0,0.03)",
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "white", padding: "8px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    {getSourceIcon(source.type)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>{source.label}</div>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{source.type}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 900, color: "var(--foreground)", fontSize: "0.9rem" }}>
                  +{source.xp}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Exercises Tags */}
        <section>
           <h3 style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem" }}>
            Exercices réalisés
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {batch.exercises.map((ex, idx) => (
              <span key={idx} style={{ padding: "6px 12px", background: "#f1f5f9", color: "#475569", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 800, border: "1px solid #e2e8f0" }}>
                {ex.value}{ex.type === 'VENTRAL' || ex.type === 'LATERAL_L' || ex.type === 'LATERAL_R' ? 's' : ''} {ex.type === 'PUSHUP' ? 'POMPES' : ex.type === 'SQUAT' ? 'SQUATS' : 'GAINAGE'}
              </span>
            ))}
          </div>
        </section>

        {batch.mood && (
          <div style={{ padding: "12px 16px", background: "rgba(5, 150, 69, 0.05)", borderRadius: "16px", border: "1px solid rgba(5, 150, 69, 0.1)", fontStyle: "italic", fontSize: "0.8rem", color: "var(--secondary)", fontWeight: 600 }}>
             "{batch.mood}"
          </div>
        )}

        {/* Warning for old logs */}
        {xp.version === 0 && (
          <div style={{ padding: "12px", background: "rgba(37, 99, 235, 0.05)", borderRadius: "16px", border: "1px solid rgba(37, 99, 235, 0.1)", display: "flex", gap: "10px", alignItems: "center" }}>
            <Info size={16} style={{ color: "var(--accent)" }} />
            <p style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 700, margin: 0, lineHeight: 1.4 }}>
              Ancienne séance : détail XP estimé.
            </p>
          </div>
        )}

        <button 
          onClick={onClose}
          className="btn-primary"
          style={{ marginTop: "0.5rem" }}
        >
          FERMER
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInScale {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
