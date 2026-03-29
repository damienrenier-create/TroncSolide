"use server"

import prisma from "@/lib/prisma";
import { ExerciseType, RecordType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBrusselsToday } from "@/lib/date-utils";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { startOfYear, endOfMonth, isSameDay } from "date-fns";

/**
 * Checks if a given date is the last day of the month.
 */
export function isLastDayOfMonth(date: Date): boolean {
    const lastDay = endOfMonth(date);
    return isSameDay(date, lastDay);
}

export async function logBSUChallenge(repsPushup?: number, repsSquat?: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Non autorisé" };

    const today = getBrusselsToday();
    if (!isLastDayOfMonth(today) && process.env.NODE_ENV === "production") {
        return { error: "Le challenge n'est disponible que le dernier jour du mois." };
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { leagueId: true, email: true }
    });
    if (!user) return { error: "Utilisateur non trouvé" };

    const entries = [];
    if (repsPushup && repsPushup > 0) entries.push({ type: "PUSHUP" as ExerciseType, value: repsPushup, challenge: "BSU_PUSHUP" });
    if (repsSquat && repsSquat > 0) entries.push({ type: "SQUAT" as ExerciseType, value: repsSquat, challenge: "BSU_SQUAT" });

    if (entries.length === 0) return { error: "Veuillez entrer au moins un score." };

    try {
        const batchId = crypto.randomUUID();
        let totalXPGained = 0;

        await prisma.$transaction(async (tx) => {
            for (const entry of entries) {
                // XP = 1 XP per rep for BSU (standard)
                const xp = entry.value;
                totalXPGained += xp;

                const xpDetails = {
                    version: 1,
                    totalXp: xp,
                    sources: [
                        { type: "base", label: `Challenge BSU (${entry.type})`, xp, exerciseType: entry.type }
                    ]
                };

                await tx.exerciseSession.create({
                    data: {
                        userId,
                        type: entry.type,
                        value: entry.value,
                        xpGained: xp,
                        date: today,
                        batchId,
                        challenge: entry.challenge,
                        xpDetails: xpDetails as any
                    }
                });

                // Update BSU RECORD (Winner style)
                // We only do this for Pushups (as per requirement 4: "record all-time Bring Sally Up pompes")
                if (entry.challenge === "BSU_PUSHUP") {
                    const existingRecord = await tx.record.findUnique({
                        where: {
                            leagueId_exercise_type_timeframe: {
                                leagueId: user.leagueId,
                                exercise: "PUSHUP",
                                type: "BSU",
                                timeframe: "YEAR" // Equivalent to ALL-TIME in this system
                            }
                        }
                    });

                    if (!existingRecord || entry.value > existingRecord.value) {
                        await tx.record.upsert({
                            where: {
                                leagueId_exercise_type_timeframe: {
                                    leagueId: user.leagueId,
                                    exercise: "PUSHUP",
                                    type: "BSU",
                                    timeframe: "YEAR"
                                }
                            },
                            update: { userId, value: entry.value, date: today },
                            create: { leagueId: user.leagueId, exercise: "PUSHUP", type: "BSU", timeframe: "YEAR", userId, value: entry.value, date: today }
                        });
                    }
                }
            }

            if (totalXPGained > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: { totalXP: { increment: totalXPGained } }
                });
            }
        });

        // Trigger Gamification & Streak
        const { checkGamification } = await import("./gamification");
        const { updateUserStreak } = await import("./streak");
        
        // Find one session to trigger check
        const lastSession = await prisma.exerciseSession.findFirst({
            where: { batchId },
            orderBy: { createdAt: 'desc' }
        });

        if (lastSession) {
            await checkGamification(userId, lastSession.id);
        }
        await updateUserStreak(userId);

        revalidatePath("/");
        return { success: true };
    } catch (e) {
        console.error("BSU Logging error:", e);
        return { error: "Erreur lors de l'enregistrement du challenge." };
    }
}
