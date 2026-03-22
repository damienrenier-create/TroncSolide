const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};
const subDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
};

async function main() {
    console.log("Starting backfill for Streaks...");
    const users = await prisma.user.findMany();

    for (const user of users) {
        const allSessions = await prisma.exerciseSession.findMany({
            where: { userId: user.id, type: "VENTRAL" },
            orderBy: { date: 'desc' },
            select: { date: true }
        });

        const uniqueDates = Array.from(new Set(allSessions.map(s => startOfDay(s.date).getTime()))).sort((a,b)=>b-a);
        
        // Calculate highest streak historically
        let highest = 0;
        let runningHistoric = 0;
        let lastDateChecked = null;
        
        // Simple continuous historical streak logic:
        for (let i = 0; i < uniqueDates.length; i++) {
            if (i === 0) {
                runningHistoric = 1;
                highest = 1;
                lastDateChecked = uniqueDates[i];
                continue;
            }
            const expectedPrev = subDays(lastDateChecked, 1).getTime();
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

        await prisma.user.update({
            where: { id: user.id },
            data: { currentStreak, highestStreak: Math.max(highest, currentStreak) }
        });
        console.log(`Updated ${user.nickname} - Current: ${currentStreak}, Highest: ${Math.max(highest, currentStreak)}`);
    }
    
    console.log("Backfill complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
