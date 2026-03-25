"use server"

import prisma from "@/lib/prisma";
import { startOfDay, subDays, eachDayOfInterval, format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Fetches XP trend data for all users in a league for the last 14 days.
 * Returns a format suitable for Recharts LineChart.
 */
export async function getLeagueXPTrends(leagueId: string) {
  const users = await prisma.user.findMany({
    where: { leagueId },
    select: { id: true, nickname: true, totalXP: true, joinedAt: true }
  });

  const startDate = subDays(startOfDay(new Date()), 13); // Last 14 days
  const endDate = startOfDay(new Date());
  const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

  // 1. Fetch all XP-gaining events for these users in the interval
  const [sessions, userBadges] = await Promise.all([
    prisma.exerciseSession.findMany({
      where: {
        userId: { in: users.map(u => u.id) },
        date: { gte: startDate }
      },
      select: { userId: true, xpGained: true, date: true }
    }),
    prisma.userBadge.findMany({
      where: {
        userId: { in: users.map(u => u.id) },
        awardedAt: { gte: startDate }
      },
      select: { userId: true, baseXP: true, awardedAt: true }
    })
  ]);

  // 2. Build the time series
  const data = dateInterval.map(day => {
    const dayTimestamp = day.getTime();
    const dayLabel = format(day, "dd MMM", { locale: fr });
    const point: any = { date: dayLabel };

    for (const user of users) {
      // Calculate daily gain
      const sessionXP = sessions
        .filter(s => startOfDay(s.date).getTime() === dayTimestamp && s.userId === user.id)
        .reduce((acc, s) => acc + s.xpGained, 0);
      
      const badgeXP = userBadges
        .filter(ub => startOfDay(ub.awardedAt).getTime() === dayTimestamp && ub.userId === user.id)
        .reduce((acc, ub) => acc + (ub.baseXP || 0), 0);

      // We need a baseline to show cumulative growth correctly. 
      // Total XP today - Sum of all XP gained since 'day'.
      const xpGainedSinceThen = sessions
        .filter(s => startOfDay(s.date).getTime() > dayTimestamp && s.userId === user.id)
        .reduce((acc, s) => acc + s.xpGained, 0) +
        userBadges
        .filter(ub => startOfDay(ub.awardedAt).getTime() > dayTimestamp && ub.userId === user.id)
        .reduce((acc, ub) => acc + (ub.baseXP || 0), 0);
      
      point[user.nickname] = user.totalXP - xpGainedSinceThen;
    }
    return point;
  });

  return {
    chartData: data,
    users: users.map(u => u.nickname)
  };
}
