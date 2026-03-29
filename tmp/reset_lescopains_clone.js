const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const targetEmail = 'damienrenier+lescopains@hotmail.com';
    
    try {
        console.log(`Searching for clone: ${targetEmail}...`);
        const user = await prisma.user.findUnique({ 
            where: { email: targetEmail },
            include: { league: true }
        });

        if (!user) {
            console.error("User not found!");
            return;
        }

        console.log(`Found user: ${user.nickname} (ID: ${user.id}) in league: ${user.league.name}`);
        console.log("Current XP:", user.totalXP, "Level:", user.level);

        // 1. Reset user basics
        await prisma.user.update({
            where: { id: user.id },
            data: {
                totalXP: 0,
                level: 1,
                currentStreak: 0,
                highestStreak: 0,
                currentTorchStreak: 0,
                highestTorchStreak: 0,
                zenLevel: 0
            }
        });
        console.log("Basics reset.");

        // 2. Delete sessions
        const sessions = await prisma.exerciseSession.deleteMany({
            where: { userId: user.id }
        });
        console.log(`Deleted ${sessions.count} exercise sessions.`);

        // 3. Delete badges
        const badges = await prisma.userBadge.deleteMany({
            where: { userId: user.id }
        });
        console.log(`Deleted ${badges.count} user badges.`);

        // 4. Delete records
        const records = await prisma.record.deleteMany({
            where: { userId: user.id }
        });
        console.log(`Deleted ${records.count} records.`);

        // 5. Delete other related data if any
        await prisma.medicalCertificate.deleteMany({ where: { userId: user.id } });
        await prisma.penalty.deleteMany({ where: { userId: user.id } });
        await prisma.message.deleteMany({ where: { userId: user.id } });
        await prisma.messageLike.deleteMany({ where: { userId: user.id } });
        await prisma.like.deleteMany({ where: { userId: user.id } });
        await prisma.feedItem.deleteMany({ where: { userId: user.id } });
        await prisma.torchHolder.deleteMany({ where: { userId: user.id } });
        await prisma.nudge.deleteMany({ where: { senderId: user.id } });
        await prisma.nudge.deleteMany({ where: { receiverId: user.id } });

        console.log("Cleanup complete! The clone is now virgin.");

    } catch (e) {
        console.error("Error during cleanup:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
