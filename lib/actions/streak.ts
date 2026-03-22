"use server"

import prisma from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export async function updateUserStreak(userId: string) {
    const allSessions = await prisma.exerciseSession.findMany({
        where: { userId, type: "VENTRAL" },
        orderBy: { date: 'desc' },
        select: { date: true }
    });

    const uniqueDates = Array.from(new Set(allSessions.map(s => startOfDay(s.date).getTime()))).sort((a,b)=>b-a);
    
    // Calculate highest streak historically
    let highest = 0;
    let runningHistoric = 0;
    let lastDateChecked: number | null = null;
    
    for (let i = 0; i < uniqueDates.length; i++) {
        if (i === 0) {
            runningHistoric = 1;
            highest = 1;
            lastDateChecked = uniqueDates[i];
            continue;
        }
        const expectedPrev = subDays(new Date(lastDateChecked!), 1).getTime();
        if (uniqueDates[i] === expectedPrev) {
            runningHistoric++;
            if (runningHistoric > highest) highest = runningHistoric;
        } else {
            runningHistoric = 1;
        }
        lastDateChecked = uniqueDates[i];
    }

    // Calculate CURRENT streak
    let currentStreak = 0;
    let currentDate = startOfDay(new Date());
    for (let i = 0; i < 1000; i++) {
        const checkDate = subDays(currentDate, i).getTime();
        if (uniqueDates.includes(checkDate)) {
            currentStreak++;
        } else if (i === 0) {
            continue; // Can miss today
        } else {
            break;
        }
    }

    const finalHighest = Math.max(highest, currentStreak);

    await prisma.user.update({
        where: { id: userId },
        data: { currentStreak, highestStreak: finalHighest }
    });
}
