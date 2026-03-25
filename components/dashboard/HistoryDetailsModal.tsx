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
  Info
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface XPDetailSource {
  type: "badge" | "milestone" | "event" | "rule" | "base";
  label: string;
  xp: number;
  exerciseType?: string;
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

  const xp = batch.xpDetails || {
    version: 0,
    totalXp: batch.xpTotal,
    breakdown: { base: batch.xpTotal, bonus: 0 },
    sources: batch.exercises.map(ex => ({
      type: "base" as const,
      label: `${ex.type === 'PUSHUP' ? 'Pompes' : ex.type === 'SQUAT' ? 'Squats' : 'Gainage'} (${ex.value})`,
      xp: 0,
      exerciseType: ex.type
    }))
  };

  const getSourceIcon = (type: string, exType?: string) => {
    if (type === "base") {
      switch (exType) {
        case "PUSHUP": return <span style={{ fontSize: "1.1rem" }}>💪</span>;
        case "SQUAT": return <span style={{ fontSize: "1.1rem" }}>🦵</span>;
        case "VENTRAL":
        case "LATERAL_L":
        case "LATERAL_R": return <span style={{ fontSize: "1.1rem" }}>🛡️</span>;
        default: return <Zap size={18} style={{ color: "var(--primary)" }} />;
      }
    }
    
    switch (type) {
      case "event": return <Star size={18} style={{ color: "#8b5cf6" }} />;
      case "rule": return <TrendingUp size={18} style={{ color: "var(--accent)" }} />;
      case "badge": 
      case "milestone": return <Trophy size={18} style={{ color: "#f59e0b" }} />;
      default: return <Info size={18} style={{ color: "var(--text-muted)" }} />;
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10020,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        background: "rgba(13, 27, 26, 0.4)", // --foreground avec opacité
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          position: "relative",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            border: "none",
            background: "#f1f5f9",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b"
          }}
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
            Détails de la séance
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "0.85rem", fontWeight: 700 }}>
             <Calendar size={14} />
             {format(new Date(batch.date), "eeee d MMMM", { locale: fr })}
          </div>
        </div>

        {/* Total XP Highlight */}
        <div style={{
          background: "linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)",
          border: "2px solid rgba(217, 119, 6, 0.08)",
          borderRadius: "24px",
          padding: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Total XP Gagné
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "2.75rem", fontWeight: 900, color: "var(--primary)" }}>+{batch.xpTotal}</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--primary)", opacity: 0.7 }}>XP</span>
            </div>
          </div>
          <div style={{ background: "var(--primary)", width: "56px", height: "56px", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", borderRadius: "18px", color: "#ffffff", boxShadow: "0 8px 20px rgba(217, 119, 6, 0.25)" }}>
            <Trophy size={32} />
          </div>
        </div>

        {/* Breakdown List */}
        <section>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={14} /> Décomposition des points
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
             {xp.sources.map((source, idx) => (
                <div key={idx} style={{
                  background: "#f8fafc",
                  borderRadius: "18px",
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #f1f5f9"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ background: "#ffffff", padding: "8px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {getSourceIcon(source.type, source.exerciseType)}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b" }}>{source.label}</div>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{source.type}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, color: "#0f172a" }}>+{source.xp}</div>
                </div>
             ))}
          </div>
        </section>

        {/* Exercises realizado */}
        <section>
          <h4 style={{ fontSize: "0.75rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
            Contenu du lot
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {batch.exercises.map((ex, idx) => (
              <span key={idx} style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 800, color: "#475569", border: "1px solid #e2e8f0" }}>
                {ex.value}{ex.type === 'VENTRAL' || ex.type === 'LATERAL_L' || ex.type === 'LATERAL_R' ? 's' : ''} {ex.type}
              </span>
            ))}
          </div>
        </section>

        {batch.mood && (
          <div style={{ background: "rgba(5, 150, 105, 0.05)", border: "1px solid rgba(5, 150, 105, 0.1)", borderRadius: "16px", padding: "12px 16px", fontSize: "0.8rem", fontStyle: "italic", color: "#059669", fontWeight: 600 }}>
             "{batch.mood}"
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "0.5rem" }}>
          <button 
            onClick={onClose}
            className="btn-primary" // On garde la classe existante qui marche
            style={{ width: "100%" }}
          >
            TERMINÉ
          </button>
        </div>
      </div>
    </div>
  );
}
