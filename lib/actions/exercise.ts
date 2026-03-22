"use server"

import prisma from "@/lib/prisma";
import { ExerciseType, RecordType, RecordTimeframe } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
            select: { leagueId: true, email: true }
        });
        if (!user) return { error: "Utilisateur non trouvé" };

        const { getActiveEvents } = await import("./events");
        const activeEvent = await getActiveEvents(user.leagueId);
        const bonusMultiplier = activeEvent?.type === "ANNIVERSARY" ? 1.5 : 1;

        const createdSessions: { id: string, type: ExerciseType, value: number }[] = [];

        await prisma.$transaction(async (tx) => {
            let totalXPGained = 0;

            for (const ex of filteredExercises) {
                const xp = Math.round(ex.value * bonusMultiplier);
                totalXPGained += xp;

                const newSession = await tx.exerciseSession.create({
                    data: {
                        userId: session.user.id,
                        type: ex.type,
                        value: ex.value,
                        xpGained: xp,
                        date: entryDate,
                        mood: mood || null,
                    },
                });
                createdSessions.push({ id: newSession.id, type: ex.type, value: ex.value });
            }

            await tx.user.update({
                where: { id: session.user.id },
                data: { totalXP: { increment: totalXPGained } },
            });
        });

        // DÉCLENCHÉ HORS DE LA TRANSACTION 
        // (Pour s'assurer que les données globales sont commitées et lisibles par les autres threads)
        const { checkGamification } = await import("@/lib/actions/gamification");
        const { updateUserStreak } = await import("@/lib/actions/streak");
        
        for (const s of createdSessions) {
            // Recalcule les volumes totaux en incluant la session fraîchement commitée
            await syncRecords(session.user.id, user.leagueId, s.type, s.value, entryDate);
            // Vérifie les paliers de niveau et de records
            await checkGamification(session.user.id, s.id);
        }

        // Met à jour la jauge d'assiduité du joueur (Streak)
        await updateUserStreak(session.user.id);

        // ==== ADMIN TWIN REPLICATION ====
        if (user.email === "damienrenier@hotmail.com" || user.email === "damienrenier+clone@hotmail.com") {
            const twinEmail = user.email === "damienrenier@hotmail.com" ? "damienrenier+clone@hotmail.com" : "damienrenier@hotmail.com";
            const twin = await prisma.user.findUnique({ where: { email: twinEmail } });
            
            if (twin) {
                const twinActiveEvent = await getActiveEvents(twin.leagueId);
                const twinMultiplier = twinActiveEvent?.type === "ANNIVERSARY" ? 1.5 : 1;
                const twinSessions: typeof createdSessions = [];

                await prisma.$transaction(async (tx) => {
                    let totalXP = 0;
                    for (const ex of filteredExercises) {
                        const xp = Math.round(ex.value * twinMultiplier);
                        totalXP += xp;
                        const sm = await tx.exerciseSession.create({
                            data: {
                                userId: twin.id,
                                type: ex.type,
                                value: ex.value,
                                xpGained: xp,
                                date: entryDate,
                                mood: mood || null,
                            }
                        });
                        twinSessions.push({ id: sm.id, type: sm.type, value: sm.value });
                    }
                    await tx.user.update({
                        where: { id: twin.id },
                        data: { totalXP: { increment: totalXP } },
                    });
                });

                for (const s of twinSessions) {
                    await syncRecords(twin.id, twin.leagueId, s.type, s.value, entryDate);
                    await checkGamification(twin.id, s.id);
                }
                await updateUserStreak(twin.id);
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
