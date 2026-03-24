const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log("Starting TOTAL harmonization (Aggressive Revocation)...");
    
    const users = await prisma.user.findMany({
        include: { badges: { include: { badge: true } } }
    });

    for (const user of users) {
        console.log(`Processing user: ${user.nickname} (${user.id})`);
        
        // 1. Get user stats
        const aggregates = await prisma.exerciseSession.groupBy({ 
            by: ['type'], 
            where: { userId: user.id }, 
            _sum: { value: true },
            _max: { value: true }
        });

        const totalPumps = aggregates.find(a => a.type === "PUSHUP")?._sum.value || 0;
        const totalSquats = aggregates.find(a => a.type === "SQUAT")?._sum.value || 0;
        const totalPlank = (aggregates.find(a => a.type === "VENTRAL")?._sum.value || 0) +
            (aggregates.find(a => a.type === "LATERAL_L")?._sum.value || 0) +
            (aggregates.find(a => a.type === "LATERAL_R")?._sum.value || 0);
        
        const sessionCount = await prisma.exerciseSession.count({ where: { userId: user.id } });
        const maxVal = await prisma.exerciseSession.aggregate({ where: { userId: user.id }, _max: { value: true } });
        const maxValOverall = maxVal._max.value || 0;

        const maxPump = aggregates.find(a => a.type === "PUSHUP")?._max.value || 0;
        const maxPlank = Math.max(
            aggregates.find(a => a.type === "VENTRAL")?._max.value || 0,
            aggregates.find(a => a.type === "LATERAL_L")?._max.value || 0,
            aggregates.find(a => a.type === "LATERAL_R")?._max.value || 0
        );

        // 2. Revocation Logic
        for (const ub of user.badges) {
            const bid = ub.badgeId;
            let stillEarned = true;

            // IF 0 SESSIONS -> EVERYTHING GONE (except maybe events, but let's be strict for now as user requested "harmonization")
            if (sessionCount === 0) {
                // If the user has 0 sessions, they shouldn't have any badge that depends on effort
                // We'll keep only pure social badges if any exist (none currently identified)
                stillEarned = false;
            } else {
                // Specific checks
                if (bid === "CENTURION") stillEarned = maxValOverall >= 100;
                else if (bid === "SQUAT_LOVER") {
                    const count = await prisma.exerciseSession.count({ where: { userId: user.id, type: "SQUAT" } });
                    stillEarned = count >= 5;
                } else if (bid === "MOOD_MASTER") {
                    const count = await prisma.exerciseSession.count({ where: { userId: user.id, mood: { not: null } } });
                    stillEarned = count >= 10;
                } else if (bid === "EARLY_BIRD" || bid === "NIGHT_OWL") {
                    // Difficult to check retroactively without timezones, but if sessionCount > 0 we might assume it's fine
                    // Or we check if ANY session exists.
                    stillEarned = sessionCount > 0;
                } else if (bid.startsWith("PUMP_")) {
                    const req = parseInt(bid.split("_")[1]);
                    if (!isNaN(req)) stillEarned = totalPumps >= req;
                } else if (bid.startsWith("SQUAT_")) {
                    const req = parseInt(bid.split("_")[1]);
                    if (!isNaN(req)) stillEarned = totalSquats >= req;
                } else if (bid.startsWith("PLANK_") && !bid.includes("RECORD")) {
                    const req = parseInt(bid.split("_")[1].replace("S", ""));
                    if (!isNaN(req)) stillEarned = totalPlank >= req;
                } else if (bid.startsWith("SERIE_PUMP_")) {
                    const req = parseInt(bid.split("_")[2]);
                    if (!isNaN(req)) stillEarned = maxPump >= req;
                } else if (bid.startsWith("SERIE_PLANK_")) {
                    const reqStr = bid.split("_")[2];
                    let req = 0;
                    if (reqStr === "30S") req = 30;
                    else if (reqStr === "1M") req = 60;
                    else if (reqStr === "1M30") req = 90;
                    else if (reqStr === "2M") req = 120;
                    else if (reqStr === "3M") req = 180;
                    else if (reqStr === "5M") req = 300;
                    else if (reqStr === "10M") req = 600;
                    if (req > 0) stillEarned = maxPlank >= req;
                } else if (bid.startsWith("RECORD_")) {
                    const ex = bid.includes("PUSHUP") ? "PUSHUP" : bid.includes("SQUAT") ? "SQUAT" : "VENTRAL";
                    const exVal = aggregates.find(a => a.type === (ex === "VENTRAL" ? "VENTRAL" : ex))?._sum.value || 0;
                    if (exVal === 0) stillEarned = false;
                } else if (bid.startsWith("LEVEL_")) {
                    // Level depends on XP, which we recalculate. 
                    // To avoid circular dependency, let's keep it for now and it will be updated by level check later
                    // BUT if sessionCount is 0, sessionXP is 0.
                    stillEarned = sessionCount > 0;
                }
            }

            if (!stillEarned) {
                console.log(`  - Revoking badge ${bid}`);
                await prisma.userBadge.delete({ where: { id: ub.id } });
            }
        }

        // 3. Recalculate XP
        const sessionXP = await prisma.exerciseSession.aggregate({
            where: { userId: user.id },
            _sum: { xpGained: true }
        });
        const totalSessionXP = sessionXP._sum.xpGained || 0;

        const updatedBadges = await prisma.userBadge.findMany({ where: { userId: user.id } });
        const totalBadgeXP = updatedBadges.reduce((acc, ub) => {
            const casseurBonus = ub.rank === 1 && ub.badgeId.startsWith("RECORD_") ? 200 : 0;
            return acc + (ub.baseXP || 0) + casseurBonus;
        }, 0);

        const newTotalXP = totalSessionXP + totalBadgeXP;
        
        // Level up/down
        const level = newTotalXP < 25 ? 0 : newTotalXP < 100 ? 1 : newTotalXP < 500 ? 5 : 10; // Simple mock for script
        
        await prisma.user.update({
            where: { id: user.id },
            data: { 
                totalXP: newTotalXP,
                // We'll let the app trigger the proper level check, but let's reset to a safe floor
                level: newTotalXP === 0 ? 0 : user.level 
            }
        });
        console.log(`  - Final XP: ${newTotalXP}`);
    }

    console.log("Harmonization complete!");
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
