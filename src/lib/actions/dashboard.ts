"use server"

import prisma from "@/lib/prisma";
import { startOfDay, subDays, eachDayOfInterval, isWithinInterval } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveEvents } from "@/lib/actions/events";


export async function getUserStats() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            sessions: {
                orderBy: { date: 'desc' },
                take: 5
            },
            badges: {
                include: {
                    badge: true
                }
            }
        }
    });

    if (!user) return null;

    // 1. Calculate Streak (Limit to last 100 days to avoid heavy load)
    const allSessions = await prisma.exerciseSession.findMany({
        where: { userId, type: "VENTRAL" },
        orderBy: { date: 'desc' },
        take: 100, // Enough for most streaks
        select: { date: true }
    });

    let streak = 0;
    let currentDate = startOfDay(new Date());
    const uniqueDates = Array.from(new Set(allSessions.map(s => startOfDay(s.date).getTime())));

    for (let i = 0; i < 1000; i++) {
        const checkDate = subDays(currentDate, i);
        if (uniqueDates.includes(checkDate.getTime())) {
            streak++;
        } else if (i === 0) continue;
        else break;
    }

    // 2. League Overview (Top 3)
    const top3 = await prisma.user.findMany({
        where: { leagueId: user.leagueId },
        orderBy: { totalXP: 'desc' },
        take: 3,
        select: { nickname: true, totalXP: true }
    });

    // 3. Cagnotte Eligibility Progress
    const windowStart = subDays(startOfDay(new Date()), 20);
    const daysInterval = eachDayOfInterval({ start: windowStart, end: startOfDay(new Date()) });

    const [windowSessions, certificates] = await Promise.all([
        prisma.exerciseSession.findMany({
            where: { userId, type: "VENTRAL", date: { gte: windowStart } }
        }),
        prisma.medicalCertificate.findMany({
            where: { userId, OR: [{ startDate: { lte: new Date() }, endDate: { gte: windowStart } }] }
        })
    ]);

    let successfulDays = 0;
    const sessionDatesSet = new Set(windowSessions.map(s => startOfDay(s.date).getTime()));

    for (const day of daysInterval) {
        const checkTime = day.getTime();
        const isMedical = certificates.some(cert =>
            checkTime >= startOfDay(cert.startDate).getTime() && checkTime <= startOfDay(cert.endDate).getTime()
        );
        if (isMedical) {
            successfulDays++;
            continue;
        }

        const daysSinceSignup = Math.floor((checkTime - user.joinedAt.getTime()) / (1000 * 60 * 60 * 24));
        const targetValue = daysSinceSignup + 1;

        // Sum sessions for this specific day from pre-fetched list
        const dayVolume = windowSessions
            .filter(s => startOfDay(s.date).getTime() === checkTime)
            .reduce((acc, s) => acc + s.value, 0);

        if (dayVolume >= targetValue) successfulDays++;
    }

    // 4. Penalty summary
    const unpaidPenalties = await prisma.penalty.aggregate({
        where: { userId, status: "UNPAID" },
        _sum: { amount: true }
    });

    // 5. Active Events
    const activeEvent = await getActiveEvents(user.leagueId);

    return {
        ...user,
        streak,
        top3,
        cagnotteProgress: {
            successfulDays,
            totalDays: 21,
            isEligible: successfulDays >= 21
        },
        unpaidAmount: unpaidPenalties._sum.amount || 0,
        activeEvent
    };
}
