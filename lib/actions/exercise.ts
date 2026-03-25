"use server"

import prisma from "@/lib/prisma";
import { ExerciseType, RecordType, RecordTimeframe } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
    differenceInDays,
    startOfDay,
    startOfWeek,
    startOfMonth,
    startOfYear,
    subDays
} from "date-fns";
import { getBrusselsToday, getBrusselsDate } from "@/lib/date-utils";


const exerciseSchema = z.object({
    type: z.enum(["VENTRAL", "LATERAL_L", "LATERAL_R", "SQUAT", "PUSHUP"]),
    value: z.number().min(0),
});

const batchSchema = z.object({
    exercises: z.array(exerciseSchema),
    date: z.string().transform((str) => new Date(str)),
    mood: z.string().max(50).optional(),
});

/**
 * Record Synchronization Logic
 * Updates league records (Hall of Fame) if conditions are met.
 */
async function syncRecords(
    userId: string,
    leagueId: string,
    type: ExerciseType,
    value: number,
    sessionDate: Date
) {
    const timeframes: RecordTimeframe[] = ["DAY", "WEEK", "MONTH", "YEAR"];

    for (const timeframe of timeframes) {
        let startDate: Date;
        switch (timeframe) {
            case "DAY": startDate = startOfDay(sessionDate); break;
            case "WEEK": startDate = startOfWeek(sessionDate, { weekStartsOn: 1 }); break;
            case "MONTH": startDate = startOfMonth(sessionDate); break;
            case "YEAR": startDate = startOfYear(sessionDate); break;
        }

        // 1. Update SERIES Record
        const existingSeries = await prisma.record.findUnique({
            where: {
                leagueId_exercise_type_timeframe: {
                    leagueId,
                    exercise: type,
                    type: "SERIES",
                    timeframe
                }
            }
        });

        if (!existingSeries || value > existingSeries.value) {
            await prisma.record.upsert({
                where: {
                    leagueId_exercise_type_timeframe: {
                        leagueId,
                        exercise: type,
                        type: "SERIES",
                        timeframe
                    }
                },
                update: { userId, value, date: sessionDate },
                create: { leagueId, exercise: type, type: "SERIES", timeframe, userId, value, date: sessionDate }
            });
        }

        // 2. Update VOLUME Record
        // Re-calculate user total for this period
        const userVolumeResult = await prisma.exerciseSession.aggregate({
            where: {
                userId,
                type,
                date: { gte: startDate, lte: sessionDate } // Use lte sessionDate to be precise
            },
            _sum: { value: true }
        });

        const userTotalVolume = userVolumeResult._sum.value || 0;

        const existingVolume = await prisma.record.findUnique({
            where: {
                leagueId_exercise_type_timeframe: {
                    leagueId,
                    exercise: type,
                    type: "VOLUME",
                    timeframe
                }
            }
        });

        if (!existingVolume || userTotalVolume > existingVolume.value) {
            await prisma.record.upsert({
                where: {
                    leagueId_exercise_type_timeframe: {
                        leagueId,
                        exercise: type,
                        type: "VOLUME",
                        timeframe
                    }
                },
                update: { userId, value: userTotalVolume, date: sessionDate },
                create: { leagueId, exercise: type, type: "VOLUME", timeframe, userId, value: userTotalVolume, date: sessionDate }
            });
        }
    }
}

export async function logBatchExercises(exercises: { type: ExerciseType, value: number }[], dateStr: string, mood?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Non autorisé" };

    const validatedBatch = batchSchema.safeParse({ exercises, date: dateStr, mood });
    if (!validatedBatch.success) return { error: "Données invalides." };

    const { date, exercises: validExercises } = validatedBatch.data;
    const today = getBrusselsToday();
    const minDate = subDays(today, 3);
    const entryDate = startOfDay(getBrusselsDate(date));

    if (entryDate < minDate || entryDate > today) {
        return { error: "La saisie n'est autorisée que pour aujourd'hui et les 3 derniers jours." };
    }

    const filteredExercises = validExercises.filter(e => e.value > 0);
    if (filteredExercises.length === 0) return { error: "Aucun exercice logué." };

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, leagueId: true, email: true }
        });
        if (!user) return { error: "Utilisateur non trouvé" };

        const { getActiveEvents } = await import("./events");
        const activeEvent = await getActiveEvents(user.leagueId);

        const COMPETITIVE_EXERCISES: ExerciseType[] = ["PUSHUP", "SQUAT", "VENTRAL", "LATERAL_L", "LATERAL_R"];
        const createdSessions: { id: string, type: ExerciseType, value: number }[] = [];
        const batchId = randomUUID();

        await prisma.$transaction(async (tx) => {
            let totalXPGained = 0;
            const sessionsToCreate = [];

            // Première passe pour calculer le total du batch pour le JSON
            for (const ex of filteredExercises) {
                const isCompetitive = COMPETITIVE_EXERCISES.includes(ex.type);
                let multiplier = activeEvent?.type === "ANNIVERSARY" ? 1.5 : 1;
                
                if (activeEvent?.type === "LABOR_DAY") multiplier = 5;
                else if (activeEvent?.type === "MOTHERS_DAY" && (ex.type === "VENTRAL" || ex.type === "SQUAT")) multiplier = 5;
                else if (activeEvent?.type === "FATHERS_DAY" && ex.type === "PUSHUP") multiplier = 5;

                const xp = isCompetitive ? Math.round(ex.value * multiplier) : 0;
                totalXPGained += xp;

                // Préparation du détail individuel pour le snapshot
                const xpBase = isCompetitive ? ex.value : 0;
                const xpEvent = xp - xpBase;

                sessionsToCreate.push({
                    ex,
                    xp,
                    xpBase,
                    xpEvent,
                    multiplier
                });
            }

            // Version v1 du JSON détaillé (Snapshot)
            // Note: On stocke le total du BATCH dans chaque session pour la résilience
            const xpDetails = {
                version: 1,
                totalXp: totalXPGained,
                breakdown: {
                    base: sessionsToCreate.reduce((sum, s) => sum + s.xpBase, 0),
                    bonus: sessionsToCreate.reduce((sum, s) => sum + s.xpEvent, 0),
                },
                sources: sessionsToCreate.map(s => ({
                    type: "base",
                    label: `${s.ex.type === 'PUSHUP' ? 'Pompes' : s.ex.type === 'SQUAT' ? 'Squats' : 'Gainage'} (${s.ex.value}${s.ex.type === 'VENTRAL' ? 's' : ''})`,
                    xp: s.xpBase
                }))
            };

            // Ajout du bonus d'événement dans les sources si présent
            if (activeEvent && xpDetails.breakdown.bonus > 0) {
                xpDetails.sources.push({
                    type: "event",
                    label: `Bonus Événement : ${activeEvent.title}`,
                    xp: xpDetails.breakdown.bonus
                });
            }

            for (const item of sessionsToCreate) {
                const newSession = await tx.exerciseSession.create({
                    data: {
                        userId: session.user.id,
                        type: item.ex.type,
                        value: item.ex.value,
                        xpGained: item.xp,
                        date: entryDate,
                        mood: mood || null,
                        batchId: batchId,
                        xpDetails: xpDetails as any,
                    },
                });
                createdSessions.push({ id: newSession.id, type: item.ex.type, value: item.ex.value });
            }

            if (totalXPGained > 0) {
                await tx.user.update({
                    where: { id: session.user.id },
                    data: { totalXP: { increment: totalXPGained } },
                });
            }
        });

        // DÉCLENCHÉ HORS DE LA TRANSACTION 
        const { checkGamification } = await import("@/lib/actions/gamification");
        const { updateUserStreak } = await import("@/lib/actions/streak");
        
        for (const s of createdSessions) {
            if (COMPETITIVE_EXERCISES.includes(s.type)) {
                await syncRecords(session.user.id, user.leagueId, s.type, s.value, entryDate);
                await checkGamification(session.user.id, s.id);
            }
        }

        // Met à jour la jauge d'assiduité du joueur (Streak)
        await updateUserStreak(session.user.id);
        
        // ==== FLAMBEAU CHECK ====
        if (entryDate.getTime() === today.getTime()) {
            const dailyTarget = await getDailyTarget(session.user.id);
            const dailyProgress = await getTodayProgress(session.user.id);
            if (dailyProgress >= dailyTarget && dailyTarget > 0) {
                const { tryClaimTorch } = await import("./torch");
                await tryClaimTorch(session.user.id, user.leagueId, entryDate);
            }
        }

        // ==== ADMIN TWIN REPLICATION (Multi-Dimension Damien) ====
        const damienEmails = ["damienrenier@hotmail.com", "damienrenier+clone@hotmail.com", "damienrenier+clone2@hotmail.com"];
        if (damienEmails.includes(user.email)) {
            const otherDamiens = await prisma.user.findMany({ 
                where: { 
                    email: { in: damienEmails },
                    id: { not: user.id } 
                } 
            });
            
            for (const twin of otherDamiens) {
                const twinActiveEvent = await getActiveEvents(twin.leagueId);
                const twinMultiplier = twinActiveEvent?.type === "ANNIVERSARY" ? 1.5 : 1;
                const twinSessions: any[] = [];

                await prisma.$transaction(async (tx) => {
                    let totalXP = 0;
                    const twinSessionsToCreate = [];
                    for (const ex of filteredExercises) {
                        const isCompetitive = COMPETITIVE_EXERCISES.includes(ex.type);
                        const xp = isCompetitive ? Math.round(ex.value * twinMultiplier) : 0;
                        totalXP += xp;
                        twinSessionsToCreate.push({ ex, xp, xpBase: isCompetitive ? ex.value : 0 });
                    }

                    const twinXpDetails = {
                        version: 1,
                        totalXp: totalXP,
                        breakdown: {
                            base: twinSessionsToCreate.reduce((sum, s) => sum + s.xpBase, 0),
                            bonus: totalXP - twinSessionsToCreate.reduce((sum, s) => sum + s.xpBase, 0),
                        },
                        sources: twinSessionsToCreate.map(s => ({
                            type: "base",
                            label: `${s.ex.type} (${s.ex.value})`,
                            xp: s.xpBase
                        }))
                    };

                    for (const s of twinSessionsToCreate) {
                        const sm = await tx.exerciseSession.create({
                            data: {
                                userId: twin.id,
                                type: s.ex.type,
                                value: s.ex.value,
                                xpGained: s.xp,
                                date: entryDate,
                                mood: mood || null,
                                batchId: batchId,
                                xpDetails: twinXpDetails as any,
                            }
                        });
                        twinSessions.push({ id: sm.id, type: sm.type, value: sm.value });
                    }
                    if (totalXP > 0) {
                        await tx.user.update({
                            where: { id: twin.id },
                            data: { totalXP: { increment: totalXP } },
                        });
                    }
                });

                for (const s of twinSessions) {
                    if (COMPETITIVE_EXERCISES.includes(s.type)) {
                        await syncRecords(twin.id, twin.leagueId, s.type, s.value, entryDate);
                        await checkGamification(twin.id, s.id);
                    }
                }
                await updateUserStreak(twin.id);

                // Flambeau check for twin
                if (entryDate.getTime() === today.getTime()) {
                    const twinDailyTarget = await getDailyTarget(twin.id);
                    const twinDailyProgress = await getTodayProgress(twin.id);
                    if (twinDailyProgress >= twinDailyTarget && twinDailyTarget > 0) {
                        const { tryClaimTorch } = await import("./torch");
                        await tryClaimTorch(twin.id, twin.leagueId, entryDate);
                    }
                }
            }
        }
        // ==== END TWIN REPLICATION ====

        revalidatePath("/");
        revalidatePath("/league");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Erreur lors de l'enregistrement groupé." };
    }
}

export async function getDailyTarget(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { joinedAt: true },
    });

    if (!user) return 0;

    const daysSince = differenceInDays(new Date(), user.joinedAt);
    return daysSince + 1;
}

export async function getTodayProgress(userId: string) {
    const today = getBrusselsToday();

    const sessions = await prisma.exerciseSession.findMany({
        where: {
            userId,
            date: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
            type: "VENTRAL",
        },
        select: { value: true },
    });

    return sessions.reduce((acc: number, s: { value: number }) => acc + s.value, 0);
}

export async function getUserExerciseHistory() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Non autorisé" };

    try {
        const history = await prisma.exerciseSession.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' },
            select: {
                id: true,
                type: true,
                value: true,
                xpGained: true,
                date: true,
                mood: true,
            }
        });

        // Group by date (pure YYYY-MM-DD)
        const grouped = history.reduce((acc: Record<string, any[]>, s) => {
            const d = s.date;
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push({
                ...s,
                date: s.date.toISOString(), // Serializing for client
            });
            return acc;
        }, {});

        return { success: true, history: grouped };
    } catch (e) {
        console.error(e);
        return { error: "Erreur lors de la récupération de l'historique." };
    }
}

/**
 * NOUVELLE FONCTION DE LECTURE DÉDIÉE AU DASHBOARD
 * Groupement strict par batchId. 
 * Les anciennes sessions (batchId null) sont traitées comme des lots unitaires.
 */
export async function getRecentBatches() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Non autorisé" };

    try {
        const history = await prisma.exerciseSession.findMany({
            where: { userId: session.user.id },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
            take: 50 // On prend assez de sessions pour avoir un historique dashboard riche
        });

        const batches: any[] = [];
        const processedBatchIds = new Set<string>();

        for (const s of history) {
            // Si c'est un lot (batchId présent)
            if (s.batchId) {
                if (!processedBatchIds.has(s.batchId)) {
                    processedBatchIds.add(s.batchId);
                    
                    // Trouver tous les exercices du même lot dans le set récupéré
                    const batchSessions = history.filter(x => x.batchId === s.batchId);
                    
                    batches.push({
                        id: s.batchId,
                        date: s.date,
                        mood: s.mood,
                        exercises: batchSessions.map(x => ({ type: x.type, value: x.value })),
                        xpTotal: batchSessions.reduce((acc, x) => acc + x.xpGained, 0),
                        xpDetails: s.xpDetails, // Source de vérité (V1: stocké sur chaque session)
                        isBatch: true
                    });
                }
            } else {
                // Ancienne session ou session unitaire sans batchId -> Lot unitaire
                batches.push({
                    id: s.id,
                    date: s.date,
                    mood: s.mood,
                    exercises: [{ type: s.type, value: s.value }],
                    xpTotal: s.xpGained,
                    xpDetails: null, // Fallback pour les anciennes sessions
                    isBatch: false
                });
            }
        }

        // On n'envoie que les 5-10 premiers lots au Dashboard
        return { success: true, batches: batches.slice(0, 10) };
    } catch (e) {
        console.error(e);
        return { error: "Erreur lors de la récupération des lots." };
    }
}
