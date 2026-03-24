const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfDay, subDays, isWithinInterval, eachDayOfInterval } = require('date-fns');

async function getFirstCagnotteDate(userId, userJoinedAt) {
    // UPDATED: Include all competitive exercises
    const sessions = await prisma.exerciseSession.findMany({ 
        where: { 
            userId, 
            type: { in: ["VENTRAL", "LATERAL_L", "LATERAL_R", "SQUAT", "PUSHUP"] } 
        } 
    });
    const certificates = await prisma.medicalCertificate.findMany({ where: { userId } });
    
    const today = startOfDay(new Date());
    const startDate = startOfDay(userJoinedAt);
    const days = eachDayOfInterval({ start: startDate, end: today });

    let consecutiveDays = 0;
    for (const day of days) {
        const isMedical = certificates.some(cert =>
            isWithinInterval(day, { start: startOfDay(cert.startDate), end: startOfDay(cert.endDate) })
        );
        
        let met = isMedical;
        if (!met) {
            const daysSinceSignup = Math.floor((day.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const targetValue = daysSinceSignup + 1;
            const dayValue = sessions
                .filter(s => startOfDay(s.date).getTime() === day.getTime())
                .reduce((acc, s) => acc + s.value, 0);
            met = dayValue >= targetValue;
        }

        if (met) {
            consecutiveDays++;
            if (consecutiveDays >= 21) {
                return day;
            }
        } else {
            consecutiveDays = 0;
        }
    }
    return null;
}

async function run() {
    console.log("Starting multi-exercise penalty cleanup...");
    const users = await prisma.user.findMany();
    let totalDeleted = 0;

    for (const user of users) {
        console.log(`Checking user: ${user.nickname}`);
        const firstDate = await getFirstCagnotteDate(user.id, user.joinedAt);
        
        if (!firstDate) {
            const result = await prisma.penalty.deleteMany({
                where: { userId: user.id }
            });
            totalDeleted += result.count;
            if (user.inCagnotte) {
                await prisma.user.update({ where: { id: user.id }, data: { inCagnotte: false } });
            }
            console.log(`  - Never reached 21 days. Deleted ${result.count} penalties.`);
        } else {
            const result = await prisma.penalty.deleteMany({
                where: {
                    userId: user.id,
                    date: { lt: firstDate }
                }
            });
            totalDeleted += result.count;
            if (!user.inCagnotte) {
                await prisma.user.update({ where: { id: user.id }, data: { inCagnotte: true } });
            }
            console.log(`  - Reached 21 days on ${firstDate.toISOString().split('T')[0]}. Deleted ${result.count} past penalties.`);
        }
    }

    console.log(`Total penalties deleted: ${totalDeleted}`);
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
