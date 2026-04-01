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

  const getSourceIcon = (type: string, label: string, exType?: string) => {
    if (label.includes("LIGUE") || label.includes("RECORD")) {
      return <Trophy size={18} style={{ color: "#f59e0b" }} />;
    }

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
      <style>{`
        @keyframes modalEnter {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(217, 119, 6, 0); }
          100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
        }
        .xp-modal-content {
          animation: modalEnter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .source-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .source-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .source-card.badge {
          background: linear-gradient(to right, #fffbeb, #ffffff);
          border: 1px solid #fde68a;
        }
        .source-card.event {
          background: linear-gradient(to right, #f5f3ff, #ffffff);
          border: 1px solid #c4b5fd;
        }
        .source-card.base {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .crown-jewel-total {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .text-shine {
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 25%, #f59e0b 50%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 3s linear infinite;
        }
      `}</style>
      <div 
        className="xp-modal-content"
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
        <div className="crown-jewel-total" style={{
          borderRadius: "24px",
          padding: "1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Subtle background glow effect */}
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%" }}></div>
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#94a3b8", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Score Global
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span className="text-shine" style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1 }}>+{batch.xpTotal}</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#f59e0b", opacity: 0.8 }}>XP</span>
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "20px", color: "#ffffff", boxShadow: "0 10px 25px rgba(217, 119, 6, 0.4)", animation: "pulseGlow 2s infinite", position: "relative", zIndex: 1, flexShrink: 0 }}>
            <Trophy size={32} />
          </div>
        </div>

        {/* Breakdown List */}
        <section>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={14} /> Décomposition des points
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
             {xp.sources.map((source, idx) => {
                const typeClass = source.type === "badge" || source.type === "milestone" ? "badge" : source.type === "event" ? "event" : "base";
                const typeColor = typeClass === "badge" ? "#d97706" : typeClass === "event" ? "#7c3aed" : "#64748b";
                const bgIcon = typeClass === "badge" ? "#fef3c7" : typeClass === "event" ? "#ede9fe" : "#ffffff";
                
                return (
                 <div key={idx} className={`source-card ${typeClass}`} style={{
                   borderRadius: "16px",
                   padding: "1rem",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "space-between"
                 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                     <div style={{ background: bgIcon, padding: "10px", borderRadius: "14px", boxShadow: typeClass === "base" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                       {getSourceIcon(source.type, source.label, source.exerciseType)}
                     </div>
                     <div>
                       <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1e293b", marginBottom: "2px" }}>{source.label}</div>
                       <div style={{ fontSize: "0.65rem", fontWeight: 800, color: typeColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>{source.type}</div>
                     </div>
                   </div>
                   <div style={{ fontWeight: 900, color: typeClass === "badge" ? "#d97706" : typeClass === "event" ? "#7c3aed" : "#0f172a", fontSize: "1.1rem" }}>
                     +{source.xp}
                   </div>
                 </div>
                );
             })}
          </div>
        </section>

        {/* Exercises realizado */}
        <section>
          <h4 style={{ fontSize: "0.75rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
            Contenu du lot
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {batch.exercises.map((ex, idx) => (
              <span key={idx} style={{ background: "#f8fafc", padding: "8px 14px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 800, color: "#334155", border: "1px solid #cbd5e1", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <span style={{ color: "var(--primary)" }}>•</span> {ex.value}{ex.type === 'VENTRAL' || ex.type === 'LATERAL_L' || ex.type === 'LATERAL_R' ? 's' : ''} {ex.type}
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
