const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfDay, startOfWeek, startOfMonth, startOfYear } = require('date-fns');

async function syncRecords(userId, leagueId, type, value, sessionDate) {
    const timeframes = ["DAY", "WEEK", "MONTH", "YEAR"];
    for (const timeframe of timeframes) {
        let startDate;
        switch (timeframe) {
            case "DAY": startDate = startOfDay(sessionDate); break;
            case "WEEK": startDate = startOfWeek(sessionDate, { weekStartsOn: 1 }); break;
            case "MONTH": startDate = startOfMonth(sessionDate); break;
            case "YEAR": startDate = startOfYear(sessionDate); break;
        }
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
}

async function test_replication(userId, leagueId, email, exercises) {
    console.log(`Testing replication for ${email} in ${leagueId}...`);
    const damienEmails = ["damienrenier@hotmail.com", "damienrenier+lescopains@hotmail.com"];
    
    if (damienEmails.includes(email)) {
        const otherDamiens = await prisma.user.findMany({ 
            where: { 
                email: { in: damienEmails },
                id: { not: userId } 
            } 
        });

        console.log(`Found ${otherDamiens.length} twins.`);

        for (const twin of otherDamiens) {
            console.log(`Replicating to ${twin.email} (ID: ${twin.id}) in ${twin.leagueId}...`);
            
            // Simulation of getActiveEvents
            const activeEvent = null; 
            const twinMultiplier = 1;
            const twinSessions = [];

            await prisma.$transaction(async (tx) => {
                let totalXP = 0;
                for (const ex of exercises) {
                    const isCompetitive = true; // Simulating
                    const xp = Math.round(ex.value * twinMultiplier);
                    totalXP += xp;
                    
                    const sm = await tx.exerciseSession.create({
                        data: {
                            userId: twin.id,
                            type: ex.type,
                            value: ex.value,
                            xpGained: xp,
                            date: new Date(),
                            batchId: "debug-batch-id",
                        }
                    });
                    twinSessions.push({ id: sm.id, type: sm.type, value: sm.value });
                }
                
                if (totalXP > 0) {
                    await tx.user.update({
                        where: { id: twin.id },
                        data: { totalXP: { increment: totalXP } },
                    });
                }
            });

            console.log(`Successfully created twin sessions for ${twin.email}.`);

            for (const s of twinSessions) {
                await syncRecords(twin.id, twin.leagueId, s.type, s.value, new Date());
            }
            console.log(`Successfully synced records for twin ${twin.email}.`);
        }
    }
}

async function run() {
    try {
        const user = await prisma.user.findUnique({ where: { email: 'damienrenier@hotmail.com' } });
        if (!user) throw new Error("Original user not found");
        
        await test_replication(user.id, user.leagueId, user.email, [{ type: "PUSHUP", value: 10 }]);
        console.log("TEST COMPLETED SUCCESSFULLY");
    } catch (e) {
        console.error("TEST FAILED:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
