const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getLevelInfo(totalXP) {
    let currentLevel = 1;
    let accumulated = 0;
    for (let i = 2; i <= 100; i++) {
        const linearCost = (i - 1) * 50;
        const acceleration = i > 50 ? Math.pow(i - 50, 2) * 10 : 0;
        const cost = linearCost + acceleration;
        if (totalXP >= (accumulated + cost)) {
            accumulated += cost;
            currentLevel = i;
        } else {
            break;
        }
    }
    return currentLevel;
}

async function main() {
    console.log("Re-calculating all user levels...");
    const users = await prisma.user.findMany({ select: { id: true, totalXP: true, level: true, nickname: true } });
    
    for (const user of users) {
        const correctLevel = getLevelInfo(user.totalXP);
        if (user.level !== correctLevel) {
            console.log(`Updating ${user.nickname}: ${user.level} -> ${correctLevel}`);
            await prisma.user.update({
                where: { id: user.id },
                data: { level: correctLevel }
            });
        }
    }
    console.log("Done!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
