const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst({ 
            where: { nickname: "Dam" }, 
            include: { 
                badges: { include: { badge: true } }, 
                records: true 
            }
        });
        
        if (!user) {
            console.log("User 'Dam' not found.");
            return;
        }

        console.log("--- BAGES DE DAM ---");
        console.table(user.badges.map(b => ({
            name: b.badge.name,
            awardedAt: b.awardedAt,
            baseXP: b.baseXP
        })));

        console.log("\n--- RECORDS DE DAM ---");
        console.table(user.records.map(r => ({
            exercise: r.exercise,
            type: r.type,
            timeframe: r.timeframe,
            value: r.value
        })));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
