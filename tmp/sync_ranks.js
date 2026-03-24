const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log("Syncing Cumulative Ranks league-wide...");
    
    // This script mocks the reSyncCumulativeRanks logic
    const leagues = await prisma.league.findMany();
    
    for (const league of leagues) {
        console.log(`Processing league: ${league.name || league.id}`);
        // Find FIRST_COME badges
        const badges = await prisma.badge.findMany({
            where: { type: "FIRST_COME" }
        });

        for (const badge of badges) {
            const holders = await prisma.userBadge.findMany({
                where: { badgeId: badge.id, user: { leagueId: league.id } },
                orderBy: { awardedAt: 'asc' }
            });

            for (let i = 0; i < holders.length; i++) {
                const holder = holders[i];
                const newRank = i + 1;
                if (newRank > 5) {
                    await prisma.userBadge.delete({ where: { id: holder.id } });
                    continue;
                }
                if (holder.rank !== newRank) {
                    console.log(`  - Upgrading ${badge.name} rank: ${holder.rank} -> ${newRank} for user ${holder.userId}`);
                    await prisma.userBadge.update({
                        where: { id: holder.id },
                        data: { rank: newRank }
                        // XP will be fixed by a follow-up XP recalc if needed, but the primary script already did it
                    });
                }
            }
        }
    }

    console.log("Rank sync complete!");
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
