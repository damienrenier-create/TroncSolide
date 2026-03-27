"use server"

import prisma from "@/lib/prisma";
import { getBrusselsToday } from "@/lib/date-utils";
import { startOfDay, eachDayOfInterval, format } from "date-fns";
import { getLevelInfo } from "@/lib/constants/levels";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getLeagueInfo() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.leagueId) return null;

    const league = await prisma.league.findUnique({
        where: { id: session.user.leagueId },
        select: { name: true, accessCode: true }
    });

    return league;
}

export async function getLeagueEvolutionData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { leagueId: true }
    });

    if (!currentUser?.leagueId) throw new Error("League not found");

    const users = await prisma.user.findMany({
        where: { leagueId: currentUser.leagueId },
        select: { id: true, nickname: true, joinedAt: true },
        orderBy: { currentStreak: 'desc' }
    });

    const userSessions = await prisma.exerciseSession.findMany({
        where: { user: { leagueId: currentUser.leagueId } },
        orderBy: { date: 'asc' },
        select: { userId: true, date: true, xpGained: true }
    });

    // Find the global start date (earliest join or earliest session)
    const earliestDate = users.reduce((acc, u) => u.joinedAt < acc ? u.joinedAt : acc, new Date());
    const startDate = startOfDay(earliestDate);
    const endDate = startOfDay(getBrusselsToday());

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Initialize user data
    const usersMap = users.map(u => ({
        ...u,
        totalXP: 0,
        evolution: [] as any[]
    }));

    // Process sessions into a map per user per day
    const sessionMap: Record<string, Record<string, number>> = {};
    userSessions.forEach(s => {
        const dStr = format(s.date, 'yyyy-MM-dd');
        if (!sessionMap[s.userId]) sessionMap[s.userId] = {};
        sessionMap[s.userId][dStr] = (sessionMap[s.userId][dStr] || 0) + s.xpGained;
    });

    const chartData = days.map(day => {
        const dStr = format(day, 'yyyy-MM-dd');
        const entry: any = { date: dStr };
        
        usersMap.forEach(u => {
            const dayXP = sessionMap[u.id]?.[dStr] || 0;
            u.totalXP += dayXP;
            
            // Only show data if the user has already joined
            if (day >= startOfDay(u.joinedAt)) {
                entry[u.nickname] = u.totalXP;
                entry[`${u.nickname}_lvl`] = getLevelInfo(u.totalXP).level;
            }
        });
        
        return entry;
    });

    return {
        chartData,
        users: users.map(u => ({ id: u.id, nickname: u.nickname }))
    };
}

export async function getLeagueStreakRankings() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { leagueId: true }
    });

    if (!user?.leagueId) throw new Error("League not found");

    return await prisma.user.findMany({
        where: { leagueId: user.leagueId },
        select: { 
            id: true, 
            nickname: true, 
            currentStreak: true, 
            highestStreak: true,
            totalXP: true
        },
        orderBy: { currentStreak: 'desc' }
    });
}
