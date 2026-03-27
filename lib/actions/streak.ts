"use server"

import prisma from "@/lib/prisma";
import { subDays } from "date-fns";
import { getBrusselsDate, getBrusselsToday } from "@/lib/date-utils";

export async function updateUserStreak(userId: string) {
    const allSessions = await prisma.exerciseSession.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        select: { date: true }
    });

    const uniqueDates = Array.from(new Set(allSessions.map(s => {
        const bd = getBrusselsDate(s.date);
        bd.setHours(0, 0, 0, 0);
        return bd.getTime();
    }))).sort((a,b)=>b-a);
    
    // Calculate highest streak historically
    let highest = 0;
    let runningHistoric = 0;
    let lastDateChecked: number | null = null;
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const currentDateTs = uniqueDates[i] as number;
        if (i === 0) {
            runningHistoric = 1;
            highest = 1;
            lastDateChecked = currentDateTs;
            continue;
        }
        const expectedPrev = subDays(new Date(lastDateChecked!), 1).getTime();
        if (currentDateTs === expectedPrev) {
            runningHistoric++;
            if (runningHistoric > highest) highest = runningHistoric;
        } else {
            runningHistoric = 1;
        }
        lastDateChecked = currentDateTs;
    }

    // Calculate CURRENT streak
    let currentStreak = 0;
    let todayDate = getBrusselsToday();
    for (let i = 0; i < 1000; i++) {
        const checkDate = subDays(todayDate, i).getTime();
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
