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
  Info
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface XPDetailSource {
  type: "badge" | "milestone" | "event" | "rule" | "base";
  label: string;
  xp: number;
  href?: string;
}

interface XPDetails {
  version: number;
  totalXp: number;
  batchTotalXp?: number; // Compatibilité
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

  // Extraction propre des données avec fallbacks pour les anciens logs
  const xp = batch.xpDetails || {
    version: 0,
    totalXp: batch.xpTotal,
    breakdown: { base: batch.xpTotal, bonus: 0 },
    sources: batch.exercises.map(ex => ({
      type: "base" as const,
      label: `${ex.type === 'PUSHUP' ? 'Pompes' : ex.type === 'SQUAT' ? 'Squats' : 'Gainage'} (${ex.value})`,
      xp: 0 // On ne connaît pas l'XP individuelle pour les anciens logs
    }))
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "base": return <Zap size={16} className="text-yellow-400" />;
      case "event": return <Star size={16} className="text-purple-400" />;
      case "rule": return <TrendingUp size={16} className="text-blue-400" />;
      case "badge": return <Award size={16} className="text-pink-400" />;
      case "milestone": return <Trophy size={16} className="text-amber-400" />;
      default: return <Info size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Détails de la séance
            </h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Calendar size={14} />
            <span>{format(new Date(batch.date), "eeee d MMMM", { locale: fr })}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* XP Summary Card */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary/70 font-bold mb-1">XP Total Gagné</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-primary">+{batch.xpTotal}</span>
                <span className="text-primary/70 font-bold text-lg italic">XP</span>
              </div>
            </div>
            <div className="bg-primary/20 p-3 rounded-2xl">
              <Trophy size={32} className="text-primary animate-pulse" />
            </div>
          </div>

          {/* Breakdown Section */}
          <section>
            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={14} />
              Décomposition des gains
            </h4>
            
            <div className="space-y-3">
              {xp.sources.map((source, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg shadow-inner">
                      {getSourceIcon(source.type)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{source.label}</p>
                      <p className="text-[10px] uppercase text-zinc-500 font-medium tracking-tight">Source: {source.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white">+{source.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Exercises Summary */}
          <section className="pt-2">
             <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} />
              Exercices réalisés
            </h4>
            <div className="flex flex-wrap gap-2">
              {batch.exercises.map((ex, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-zinc-800 rounded-full text-[11px] font-bold text-zinc-300 border border-zinc-700/50">
                  {ex.value} × {ex.type === 'PUSHUP' ? 'POMPES' : ex.type === 'SQUAT' ? 'SQUATS' : 'GAINAGE'}
                </div>
              ))}
            </div>
          </section>

          {batch.mood && (
            <section className="pt-2">
              <div className="bg-zinc-800/30 rounded-2xl p-4 border border-zinc-800 italic text-zinc-400 text-sm">
                "{batch.mood}"
              </div>
            </section>
          )}

          {xp.version === 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 text-blue-400">
              <Info size={18} className="shrink-0" />
              <p className="text-xs leading-relaxed">
                Cette séance date d'avant la mise à jour des statistiques. Le détail précis des XP n'a pas pu être récupéré rétroactivement.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-center">
           <button 
             onClick={onClose}
             className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
           >
             Fermer
           </button>
        </div>
      </div>
    </div>
  );
}
