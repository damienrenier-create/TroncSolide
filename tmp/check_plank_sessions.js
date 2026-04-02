const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sessions = await prisma.exerciseSession.findMany({
        where: { type: { in: ['VENTRAL', 'LATERAL_L', 'LATERAL_R'] }, value: { gte: 60 } },
        orderBy: { value: 'desc' },
        take: 10,
        select: { id: true, userId: true, type: true, value: true, date: true, user: { select: { email: true } } }
    });
    console.log("Top Plank Sessions:", JSON.stringify(sessions, null, 2));

    const records = await prisma.record.findMany({
        where: { exercise: 'VENTRAL' },
        orderBy: { value: 'desc' },
        take: 10,
        select: { id: true, timeframe: true, type: true, value: true, user: { select: { email: true } } }
    });
    console.log("Top Plank Records:", JSON.stringify(records, null, 2));
}

main().finally(() => prisma.$disconnect());
