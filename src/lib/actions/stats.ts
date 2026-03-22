"use server"

import prisma from "@/lib/prisma";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { ExerciseType } from "@prisma/client";

export async function getPersonalStats(userId?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Non autorisé");

    // If userId provided, check if it's the current user or a moderator
    // For this simple version, we just force the current user's ID
    const targetUserId = session.user.id;

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // 1. Distribution (Pie Chart data)
    const distribution = await prisma.exerciseSession.groupBy({
        by: ['type'],
        where: { userId: targetUserId },
        _sum: { value: true },
        _count: { id: true }
    });

    // 2. Progression (Area/Bar Chart data - Last 30 days)
    const sessions = await prisma.exerciseSession.findMany({
        where: {
            userId: targetUserId,
            date: { gte: thirtyDaysAgo }
        },
        orderBy: { date: 'asc' },
        select: { date: true, value: true, type: true }
    });

    // Fill gaps with 0 for the chart
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
    const chartData = days.map(day => {
        const daySessions = sessions.filter(s => format(s.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
        return {
            date: format(day, 'dd/MM'),
            ventral: daySessions.filter(s => s.type === "VENTRAL").reduce((acc, s) => acc + s.value, 0),
            others: daySessions.filter(s => s.type !== "VENTRAL").reduce((acc, s) => acc + s.value, 0),
        };
    });

    return {
        distribution: distribution.map(d => ({
            name: d.type === "VENTRAL" ? "Ventral" : d.type.includes("LATERAL") ? "Latéral" : d.type === "SQUAT" ? "Squat" : "Pompage",
            value: d._sum.value || 0
        })),
        chartData,
        totals: {
            ventral: distribution.find(d => d.type === "VENTRAL")?._sum.value || 0,
            squat: distribution.find(d => d.type === "SQUAT")?._sum.value || 0,
            pushup: distribution.find(d => d.type === "PUSHUP")?._sum.value || 0,
        }
    };
}
