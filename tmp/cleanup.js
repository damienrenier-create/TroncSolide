const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst({
            where: { nickname: "Dam" },
            include: { badges: { include: { badge: true } } }
        });

        if (!user) {
            console.log("User not found!");
            return;
        }

        const badgesToRemove = user.badges.filter(ub => 
            ub.badge.name.includes("Champion de la Sem.") || 
            ub.badge.name.includes("Champion du Mois")
        );

        let xpDeduction = 0;
        for (const ub of badgesToRemove) {
            xpDeduction += (ub.baseXP || 0);
            console.log("Removing badge:", ub.badge.name, "XP:", ub.baseXP);
            await prisma.userBadge.delete({ where: { id: ub.id } });
            await prisma.feedItem.deleteMany({
                where: { userId: user.id, badgeId: ub.badgeId, type: "BADGE_WON" }
            });
        }

        if (xpDeduction > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: { totalXP: { decrement: xpDeduction } }
            });
            console.log("Deducted XP:", xpDeduction);
        } else {
            console.log("No unearned periodic badges found.");
        }
    } catch (e) {
        console.error(e);
    }
}

main().finally(() => prisma.$disconnect());
