"use server"

import prisma from "@/lib/prisma";
import { ExerciseType, RecordType, RecordTimeframe } from "@prisma/client";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getLeagueRankings(
    leagueId: string, // Kept for API compatibility, but validated against session
    exercise: ExerciseType,
    type: RecordType,
    timeframe: RecordTimeframe
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.leagueId || session.user.leagueId !== leagueId) {
        throw new Error("Accès refusé : Ligue invalide.");
    }

    let startDate: Date;
    const now = new Date();

    switch (timeframe) {
        case "DAY": startDate = startOfDay(now); break;
        case "WEEK": startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
        case "MONTH": startDate = startOfMonth(now); break;
        case "YEAR": startDate = startOfYear(now); break;
    }

    if (type === "SERIES") {
        // Best single sets in this league
        // Group by user, take max
        const usersInLeague = await prisma.user.findMany({
            where: { leagueId },
            select: { id: true, nickname: true }
        });

        const rankings = await Promise.all(usersInLeague.map(async (user) => {
            const best = await prisma.exerciseSession.findFirst({
                where: {
                    userId: user.id,
                    type: exercise,
                    date: { gte: startDate }
                },
                orderBy: { value: 'desc' },
                select: { value: true }
            });

            return {
                userId: user.id,
                nickname: user.nickname,
                value: best?.value || 0
            };
        }));

        return rankings
            .filter(r => r.value > 0)
            .sort((a, b) => b.value - a.value);
    } else {
        // VOLUME: Aggregate sum of sessions
        const aggregations = await prisma.exerciseSession.groupBy({
            by: ['userId'],
            where: {
                user: { leagueId },
                type: exercise,
                date: { gte: startDate }
            },
            _sum: { value: true },
            orderBy: { _sum: { value: 'desc' } }
        });

        // Join with nicknames
        const userIds = aggregations.map(a => a.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, nickname: true }
        });

        return aggregations.map(agg => ({
            userId: agg.userId,
            nickname: users.find(u => u.id === agg.userId)?.nickname || "Inconnu",
            value: agg._sum.value || 0
        }));
    }
}

export async function getLeagueRecords(leagueId: string) {
    return prisma.record.findMany({
        where: { leagueId },
        include: {
            user: {
                select: { nickname: true }
            }
        }
    });
}

export async function syncAllRecordsForLeague(leagueId: string, exercise: ExerciseType) {
    const timeframes: RecordTimeframe[] = ["DAY", "WEEK", "MONTH", "YEAR"];
    const types: RecordType[] = ["SERIES", "VOLUME"];

    for (const timeframe of timeframes) {
        for (const type of types) {
            // Get current rankings
            const rankings = await getLeagueRankings(leagueId, exercise, type, timeframe);
            const top = rankings[0];

            if (top) {
                await prisma.record.upsert({
                    where: { leagueId_exercise_type_timeframe: { leagueId, exercise, type, timeframe } },
                    update: { userId: top.userId, value: top.value, date: new Date() },
                    create: { leagueId, exercise, type, timeframe, userId: top.userId, value: top.value, date: new Date() }
                });
            } else {
                // No sessions left, delete record entry
                await prisma.record.deleteMany({
                    where: { leagueId, exercise, type, timeframe }
                });
            }
        }
    }
}
