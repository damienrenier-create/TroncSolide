"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BadgeType, FeedItemType, ExerciseType, RecordType, RecordTimeframe } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
    differenceInDays, 
    startOfDay, 
    startOfWeek, 
    startOfMonth, 
    startOfYear 
} from "date-fns";
import { getBrusselsToday } from "@/lib/date-utils";

import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import { processAnniversarySettlement } from "./settlement";

/**
 * Revokes a badge from a user and reverts their XP.
 */
export async function revokeBadge(userId: string, badgeId: string, tx?: any) {
    const client = tx || prisma;
    const ub = await client.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId } },
        include: { badge: true }
    });

    if (!ub) return;

    const totalToSubtract = (ub.baseXP || 0) + (ub.rank === 1 ? 200 : 0); // Revert base XP and Casseur Bonus if rank 1

    await client.$transaction(async (innerTx: any) => {
        await innerTx.userBadge.delete({ where: { id: ub.id } });
        if (totalToSubtract > 0) {
            await innerTx.user.update({
                where: { id: userId },
                data: { totalXP: { decrement: totalToSubtract } }
            });
        }
        await innerTx.feedItem.create({
            data: {
                leagueId: ub.user?.leagueId || (await innerTx.user.findUnique({ where: { id: userId }, select: { leagueId: true } })).leagueId,
                userId,
                type: "BADGE_LOST",
                badgeId: badgeId
            }
        });
    });
}

export async function ensureBadgeExists(def: typeof BADGE_DEFINITIONS[0], leagueId: string) {
    const isFirstCome = def.type === "FIRST_COME";
    const existing = await prisma.badge.findFirst({
        where: { name: def.name, OR: [{ leagueId }, { leagueId: null }] }
    });

    if (existing) {
        if (existing.xpValue !== def.xpValue && !def.id.startsWith("RECORD_")) {
            await prisma.badge.update({ where: { id: existing.id }, data: { xpValue: def.xpValue } });
        }
        return existing;
    }

    return prisma.badge.create({
        data: {
            name: def.name,
            description: def.description,
            icon: def.icon,
            type: def.type,
            xpValue: def.xpValue,
            leagueId: isFirstCome ? leagueId : null
        }
    });
}

export async function checkGamification(userId: string, lastSessionId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            sessions: { where: { id: lastSessionId } },
            league: true,
            badges: { include: { badge: true } }
        }
    });

    if (!user || user.sessions.length === 0) return;
    const session = user.sessions[0];
    const { getLevelInfo } = await import("@/lib/constants/levels");
    
    let currentTotalXP = user.totalXP;
    const today = getBrusselsToday();

    // Lancer le règlement de l'anniversaire d'hier si nécessaire
    await processAnniversarySettlement(user.leagueId);

    // 1. Level Up Logic
    const levelInfo = getLevelInfo(currentTotalXP);
    if (levelInfo.level > user.level) {
        await prisma.user.update({
            where: { id: userId },
            data: { level: levelInfo.level }
        });
        await prisma.feedItem.create({
            data: { leagueId: user.leagueId, userId: userId, type: "LEVEL_UP", level: levelInfo.level }
        });
    }

    const badgesToAward: string[] = [];
    const userBadgeNames = new Set(user.badges.map(b => b.badge.name));
    const finalAwards: any[] = [];

    // --- LOGIQUE ACCOMPLISSEMENTS (ACHIEVEMENT) ---
    const hour = today.getHours();
    if (hour < 7 && !userBadgeNames.has("Lève-tôt")) badgesToAward.push("EARLY_BIRD");
    if (hour >= 22 && !userBadgeNames.has("Oiseau de nuit")) badgesToAward.push("NIGHT_OWL");
    if (session.value >= 100 && !userBadgeNames.has("Centurion")) badgesToAward.push("CENTURION");

    if (!userBadgeNames.has("Mood Master")) {
        const moodCount = await prisma.exerciseSession.count({ where: { userId, mood: { not: null } } });
        if (moodCount >= 10) badgesToAward.push("MOOD_MASTER");
    }

    if (!userBadgeNames.has("Squat Lover")) {
        const squatCount = await prisma.exerciseSession.count({ where: { userId, type: "SQUAT" } });
        if (squatCount >= 5) badgesToAward.push("SQUAT_LOVER");
    }

    if (levelInfo.level >= 1 && !userBadgeNames.has("Graine de Champion")) badgesToAward.push("LEVEL_SEED");
    if (levelInfo.level >= 5 && !userBadgeNames.has("Jeune Pousse")) badgesToAward.push("LEVEL_SPROUT");
    if (levelInfo.level >= 20 && !userBadgeNames.has("Arbre Majestueux")) badgesToAward.push("LEVEL_TREE");
    if (levelInfo.level >= 50 && !userBadgeNames.has("Gardien de la Forêt")) badgesToAward.push("LEVEL_FOREST");

    // --- LOGIQUE PIONNIERS STANDARD (FIRST_COME TIERS) ---
    if (session.type === "PUSHUP") {
        if (session.value >= 10) badgesToAward.push("SERIE_PUMP_10");
        if (session.value >= 50) badgesToAward.push("SERIE_PUMP_50");
        if (session.value >= 100) badgesToAward.push("SERIE_PUMP_100");
        if (session.value >= 150) badgesToAward.push("SERIE_PUMP_150");
    }
    if (session.type === "VENTRAL" || session.type === "LATERAL_L" || session.type === "LATERAL_R") {
        if (session.value >= 30) badgesToAward.push("SERIE_PLANK_30S");
        if (session.value >= 60) badgesToAward.push("SERIE_PLANK_1M");
        if (session.value >= 90) badgesToAward.push("SERIE_PLANK_1M30");
        if (session.value >= 120) badgesToAward.push("SERIE_PLANK_2M");
        if (session.value >= 180) badgesToAward.push("SERIE_PLANK_3M");
        if (session.value >= 300) badgesToAward.push("SERIE_PLANK_5M");
        if (session.value >= 600) badgesToAward.push("SERIE_PLANK_10M");
    }

    const aggregates = await prisma.exerciseSession.groupBy({ by: ['type'], where: { userId }, _sum: { value: true } });
    const totalPumps = aggregates.find(a => a.type === "PUSHUP")?._sum.value || 0;
    const totalSquats = aggregates.find(a => a.type === "SQUAT")?._sum.value || 0;
    const totalPlank = (aggregates.find(a => a.type === "VENTRAL")?._sum.value || 0) +
        (aggregates.find(a => a.type === "LATERAL_L")?._sum.value || 0) +
        (aggregates.find(a => a.type === "LATERAL_R")?._sum.value || 0);

    if (totalPumps >= 100) badgesToAward.push("PUMP_100");
    if (totalPumps >= 1000) badgesToAward.push("PUMP_1000");
    if (totalPumps >= 2000) badgesToAward.push("PUMP_2000");
    if (totalPumps >= 5000) badgesToAward.push("PUMP_5000");
    if (totalPumps >= 10000) badgesToAward.push("PUMP_10000");
    if (totalPumps >= 20000) badgesToAward.push("PUMP_20000");
    if (totalPumps >= 50000) badgesToAward.push("PUMP_50000");
    if (totalPumps >= 100000) badgesToAward.push("PUMP_100000");

    if (totalSquats >= 100) badgesToAward.push("SQUAT_100");
    if (totalSquats >= 1000) badgesToAward.push("SQUAT_1000");
    if (totalSquats >= 5000) badgesToAward.push("SQUAT_5000");

    if (totalPlank >= 1000) badgesToAward.push("PLANK_1000S");
    if (totalPlank >= 10000) badgesToAward.push("PLANK_10000S");
    if (totalPlank >= 100000) badgesToAward.push("PLANK_100000S");

    // Process Basic Badges & Tiered FIRST_COME
    for (const badgeId of badgesToAward) {
        const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
        if (!def) continue;

        const badge = await ensureBadgeExists(def, user.leagueId);

        await prisma.$transaction(async (tx) => {
            const ub = await tx.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId: badge.id } } });
            if (ub) return;

            let rank = null;
            let finalXP = def.xpValue;

            if (def.type === "FIRST_COME" && !def.id.startsWith("RECORD_")) {
                const existingWinners = await tx.userBadge.count({ where: { badgeId: badge.id } });
                if (existingWinners >= 5) return; // Too late!
                rank = existingWinners + 1; // 1=Platine, 2=Or, 3=Argent, 4=Bronze, 5=Argile
                const multiplier = 1.2 - (0.2 * rank); // 1.0, 0.8, 0.6, 0.4, 0.2
                finalXP = Math.floor(def.xpValue * multiplier);
            }

            await tx.userBadge.create({ 
                data: { userId, badgeId: badge.id, rank, baseXP: finalXP } 
            });

            if (finalXP > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: { totalXP: { increment: finalXP } }
                });
                currentTotalXP += finalXP;
                finalAwards.push({
                    type: "badge",
                    label: `BADGE: ${def.name}`,
                    xp: finalXP
                });
            }

            await tx.feedItem.create({
                data: { leagueId: user.leagueId, userId: userId, type: "BADGE_WON", badgeId: badge.id }
            });
        });
    }

    // --- LOGIQUE BRAQUAGE DE RECORDS (TOP 3) ---
    const recordAwards = await reSyncLeagueRecords(user.leagueId, userId);
    finalAwards.push(...recordAwards);

    // 4. Update the ExerciseSession(s) with these awards for transparency
    if (finalAwards.length > 0) {
        const batchId = session.batchId;
        if (batchId) {
            // Bulk update for all sessions in the same batch
            const batchSessions = await prisma.exerciseSession.findMany({ where: { batchId } });
            for (const s of batchSessions) {
                const details = (s.xpDetails as any) || { version: 1, totalXp: s.xpGained, sources: [] };
                details.sources.push(...finalAwards.map(a => ({
                    type: "badge",
                    label: a.label,
                    xp: a.xp
                })));
                details.totalXp += finalAwards.reduce((acc, a) => acc + a.xp, 0);
                
                await prisma.exerciseSession.update({
                    where: { id: s.id },
                    data: { xpDetails: details }
                });
            }
        } else {
            // Single session without batch
            const details = (session.xpDetails as any) || { version: 1, totalXp: session.xpGained, sources: [] };
            details.sources.push(...finalAwards.map(a => ({
                type: "badge",
                label: a.label,
                xp: a.xp
            })));
            details.totalXp += finalAwards.reduce((acc, a) => acc + a.xp, 0);
            
            await prisma.exerciseSession.update({
                where: { id: lastSessionId },
                data: { xpDetails: details }
            });
        }
    }

    revalidatePath("/profile");
    revalidatePath("/faq");
    revalidatePath("/league");
}

/**
 * Re-evaluates all records for a league and updates the Top 3 badges.
 * 1st = Diamond, 2nd = Gold, 3rd = Silver.
 */
export async function reSyncLeagueRecords(leagueId: string, targetUserId?: string) {
    const { getLeagueRankings } = await import("./record");
    const today = getBrusselsToday();
    const awardsForUser: { type: "badge", label: string, xp: number }[] = [];

    const recordMapping = [
        { id: "RECORD_DAY_PUSHUP", type: "VOLUME", tf: "DAY", ex: "PUSHUP", coef: 0.5 },
        { id: "RECORD_SERIES_PUSHUP", type: "SERIES", tf: "YEAR", ex: "PUSHUP", coef: 5.0 },
        { id: "RECORD_DAY_SQUAT", type: "VOLUME", tf: "DAY", ex: "SQUAT", coef: 0.5 },
        { id: "RECORD_SERIES_SQUAT", type: "SERIES", tf: "YEAR", ex: "SQUAT", coef: 5.0 },
        { id: "RECORD_DAY_PLANK", type: "VOLUME", tf: "DAY", ex: "VENTRAL", coef: 0.5 },
        { id: "RECORD_SERIES_PLANK", type: "SERIES", tf: "YEAR", ex: "VENTRAL", coef: 5.0 },
    ];

    for (const mapping of recordMapping) {
        const def = BADGE_DEFINITIONS.find(b => b.id === mapping.id);
        if (!def) continue;

        const badge = await ensureBadgeExists(def, leagueId);
        const currentRankings = await getLeagueRankings(leagueId, mapping.ex as ExerciseType, mapping.type as RecordType, mapping.tf as RecordTimeframe);
        const top3 = currentRankings.slice(0, 3);

        await prisma.$transaction(async (tx) => {
            // Get all current holders of this badge in the league
            const currentHolders = await tx.userBadge.findMany({
                where: { badgeId: badge.id },
                select: { id: true, userId: true, rank: true, baseXP: true }
            });

            // Handle cases where people dropped out of Top 3
            for (const holder of currentHolders) {
                const isStillInTop3 = top3.some(r => r.userId === holder.userId);
                if (!isStillInTop3) {
                    // Dropped out
                    const totalToSubtract = (holder.baseXP || 0) + (holder.rank === 1 ? 200 : 0);
                    await tx.userBadge.delete({ where: { id: holder.id } });
                    if (totalToSubtract > 0) {
                        await tx.user.update({ where: { id: holder.userId }, data: { totalXP: { decrement: totalToSubtract } } });
                    }
                    await tx.feedItem.create({
                        data: { leagueId, userId: holder.userId, type: "BADGE_LOST", badgeId: badge.id }
                    });
                }
            }

            // Award/Update badges for Top 3
            for (let i = 0; i < top3.length; i++) {
                const player = top3[i];
                const rank = i + 1; // 1=Diamond, 2=Gold, 3=Silver
                const existing = currentHolders.find(h => h.userId === player.userId);

                // Multipliers for Top 3: Diamond=100%, Gold=50%, Silver=25%
                const rankMultiplier = rank === 1 ? 1.0 : rank === 2 ? 0.5 : 0.25;
                const newBaseXP = Math.floor(player.value * mapping.coef * rankMultiplier);
                const newRateXP = Math.max(1, Math.floor(newBaseXP * 0.01));
                const CASSEUR_BONUS = rank === 1 ? 200 : 0;

                if (!existing) {
                    // New entry in Top 3
                    await tx.userBadge.create({
                        data: {
                            userId: player.userId,
                            badgeId: badge.id,
                            rank,
                            baseXP: newBaseXP,
                            rateXP: newRateXP,
                            awardedAt: today
                        }
                    });
                    await tx.user.update({
                        where: { id: player.userId },
                        data: { totalXP: { increment: newBaseXP + CASSEUR_BONUS } }
                    });
                    await tx.feedItem.create({
                        data: { leagueId, userId: player.userId, type: "BADGE_WON", badgeId: badge.id }
                    });
                    if (player.userId === targetUserId) {
                        awardsForUser.push({ type: "badge", label: `RECORD: ${def.name}`, xp: newBaseXP + CASSEUR_BONUS });
                    }
                } else {
                    // Already in Top 3, check if rank or XP changed
                    const oldTotal = (existing.baseXP || 0) + (existing.rank === 1 ? 200 : 0);
                    const newTotal = newBaseXP + CASSEUR_BONUS;

                    if (existing.rank !== rank || oldTotal !== newTotal) {
                        const diff = newTotal - oldTotal;
                        await tx.userBadge.update({
                            where: { id: existing.id },
                            data: { rank, baseXP: newBaseXP, rateXP: newRateXP }
                        });
                        if (diff > 0) {
                            await tx.user.update({
                                where: { id: player.userId },
                                data: { totalXP: { increment: diff } }
                            });
                            if (player.userId === targetUserId) {
                                awardsForUser.push({ type: "badge", label: `RECORD: ${def.name}`, xp: diff });
                            }
                        }
                        // Only add feed item if rank improved to 1
                        if (existing.rank !== 1 && rank === 1) {
                            await tx.feedItem.create({
                                data: { leagueId, userId: player.userId, type: "BADGE_WON", badgeId: badge.id }
                            });
                        }
                    }
                }
            }
        });
    }

    revalidatePath("/profile");
    revalidatePath("/faq");
    revalidatePath("/league");
    return awardsForUser;
}

export async function getBadgeCatalogue() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { leagueId: true }
    });

    if (!user) return null;

    const badges = await prisma.badge.findMany({
        where: { OR: [{ leagueId: user.leagueId }, { leagueId: null }] },
        include: {
            users: { 
                include: { user: { select: { nickname: true } } },
                orderBy: { rank: 'asc' }
            },
            feedItems: {
                where: { type: "BADGE_WON" },
                include: { user: { select: { nickname: true } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    return badges;
}

/**
 * Manuellement attribuer un badge à un utilisateur (utilisé par le règlement d'anniversaire)
 */
export async function awardBadge(userId: string, badgeId: string, leagueId: string, customXP?: number) {
    const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!def) return;

    const badge = await ensureBadgeExists(def, leagueId);
    const finalXP = customXP !== undefined ? customXP : def.xpValue;

    await prisma.$transaction(async (tx) => {
        const existing = await tx.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId: badge.id } } });
        if (existing) return;

        await tx.userBadge.create({
            data: { userId, badgeId: badge.id, baseXP: finalXP }
        });

        if (finalXP > 0) {
            await tx.user.update({
                where: { id: userId },
                data: { totalXP: { increment: finalXP } }
            });
        }

        await tx.feedItem.create({
            data: { leagueId, userId, type: "BADGE_WON", badgeId: badge.id }
        });
    });
}

/**
 * Re-evaluates all badges for user (except records which are handled by reSyncLeagueRecords)
 * and revokes those no longer met.
 */
export async function reSyncUserBadges(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { badges: { include: { badge: true } } }
    });
    if (!user) return;

    const userBadges = user.badges.filter(ub => !ub.badge.id.startsWith("RECORD_"));
    const { getLevelInfo } = await import("@/lib/constants/levels");
    
    // Aggregates for cumulative checks
    const aggregates = await prisma.exerciseSession.groupBy({ by: ['type'], where: { userId }, _sum: { value: true } });
    const totalPumps = aggregates.find(a => a.type === "PUSHUP")?._sum.value || 0;
    const totalSquats = aggregates.find(a => a.type === "SQUAT")?._sum.value || 0;
    const totalPlank = (aggregates.find(a => a.type === "VENTRAL")?._sum.value || 0) +
        (aggregates.find(a => a.type === "LATERAL_L")?._sum.value || 0) +
        (aggregates.find(a => a.type === "LATERAL_R")?._sum.value || 0);

    for (const ub of userBadges) {
        const bid = ub.badge.id;
        let stillEarned = true;

        if (bid === "CENTURION") {
            const maxVal = await prisma.exerciseSession.aggregate({ where: { userId }, _max: { value: true } });
            stillEarned = (maxVal._max.value || 0) >= 100;
        } else if (bid === "MOOD_MASTER") {
            const moodCount = await prisma.exerciseSession.count({ where: { userId, mood: { not: null } } });
            stillEarned = moodCount >= 10;
        } else if (bid === "SQUAT_LOVER") {
            const squatCount = await prisma.exerciseSession.count({ where: { userId, type: "SQUAT" } });
            stillEarned = squatCount >= 5;
        } else if (bid.startsWith("LEVEL_")) {
            const req = bid === "LEVEL_SEED" ? 1 : bid === "LEVEL_SPROUT" ? 5 : bid === "LEVEL_TREE" ? 20 : 50;
            const tempLevelInfo = getLevelInfo(user.totalXP);
            stillEarned = tempLevelInfo.level >= req;
        } else if (bid.startsWith("PUMP_")) {
            const req = parseInt(bid.split("_")[1]);
            if (!isNaN(req)) stillEarned = totalPumps >= req;
        } else if (bid.startsWith("SQUAT_")) {
            const req = parseInt(bid.split("_")[1]);
            if (!isNaN(req)) stillEarned = totalSquats >= req;
        } else if (bid.startsWith("PLANK_")) {
            const req = parseInt(bid.split("_")[1].replace("S", ""));
            if (!isNaN(req)) stillEarned = totalPlank >= req;
        } else if (bid.startsWith("SERIE_PUMP_")) {
            const req = parseInt(bid.split("_")[2]);
            const maxPump = await prisma.exerciseSession.aggregate({ where: { userId, type: "PUSHUP" }, _max: { value: true } });
            if (!isNaN(req)) stillEarned = (maxPump._max.value || 0) >= req;
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
            const maxPlank = await prisma.exerciseSession.aggregate({ 
                where: { userId, type: { in: ["VENTRAL", "LATERAL_L", "LATERAL_R"] } }, 
                _max: { value: true } 
            });
            if (req > 0) stillEarned = (maxPlank._max.value || 0) >= req;
        }

        if (!stillEarned) {
            await prisma.userBadge.delete({ where: { id: ub.id } });
            await prisma.feedItem.create({
                data: { leagueId: user.leagueId, userId, type: "BADGE_LOST", badgeId: bid }
            });
        }
    }
}

/**
 * Resets and recalculates a user's total XP from logs and current badges.
 */
export async function recalculateTotalXP(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { badges: true }
    });
    if (!user) return;

    const sessionXP = await prisma.exerciseSession.aggregate({
        where: { userId },
        _sum: { xpGained: true }
    });

    const totalSessionXP = sessionXP._sum.xpGained || 0;
    const totalBadgeXP = user.badges.reduce((acc, ub) => {
        const casseurBonus = ub.rank === 1 && ub.badgeId.startsWith("RECORD_") ? 200 : 0;
        return acc + (ub.baseXP || 0) + casseurBonus;
    }, 0);

    const newTotalXP = totalSessionXP + totalBadgeXP;
    
    const { getLevelInfo } = await import("@/lib/constants/levels");
    const levelInfo = getLevelInfo(newTotalXP);

    await prisma.user.update({
        where: { id: userId },
        data: { 
            totalXP: newTotalXP,
            level: levelInfo.level
        }
    });

    return newTotalXP;
}

/**
 * Global harmonization: re-syncs all leagues and all users.
 */
export async function harmonizeGlobalXP() {
    console.log("Starting global harmonization...");
    const leagues = await prisma.league.findMany({ select: { id: true } });
    
    for (const league of leagues) {
        await reSyncLeagueRecords(league.id);
        await reSyncCumulativeRanks(league.id);
    }

    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
        await reSyncUserBadges(user.id);
        await recalculateTotalXP(user.id);
    }
    
    console.log("Global harmonization complete.");
    return { success: true };
}

/**
 * Re-evaluates ranks for FIRST_COME cumulative badges in a league.
 * If someone lost a badge, others move up.
 */
export async function reSyncCumulativeRanks(leagueId: string) {
    const badges = await prisma.badge.findMany({
        where: { type: "FIRST_COME", leagueId },
        include: { users: { orderBy: { awardedAt: 'asc' } } }
    });

    for (const badge of badges) {
        if (badge.id.startsWith("RECORD_")) continue; // Records are handled separately

        const holders = badge.users;
        for (let i = 0; i < holders.length; i++) {
            const holder = holders[i];
            const newRank = i + 1;
            if (newRank > 5) {
                // Too many winners now? (Shouldn't happen if we revoke correctly, but let's be safe)
                await prisma.userBadge.delete({ where: { id: holder.id } });
                continue;
            }

            if (holder.rank !== newRank) {
                const def = BADGE_DEFINITIONS.find(b => b.id === badge.id);
                if (!def) continue;

                const multiplier = 1.2 - (0.2 * newRank);
                const newBaseXP = Math.floor(def.xpValue * multiplier);

                await prisma.userBadge.update({
                    where: { id: holder.id },
                    data: { rank: newRank, baseXP: newBaseXP }
                });
                // XP total will be corrected by recalculateTotalXP later
            }
        }
    }
}

/**
 * Récupère toutes les données nécessaires pour la Salle des Trophées.
 * Inclut les badges (avec détenteurs de rang 1) et les stats personnelles du joueur.
 */
export async function getTrophiesRoomData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { leagueId: true }
    });
    if (!user) return null;

    // 1. Récupérer tous les badges de la ligue (ou globaux) et leurs détenteurs de Rang 1 (Platine/Record)
    const badges = await prisma.badge.findMany({
        where: { OR: [{ leagueId: user.leagueId }, { leagueId: null }] },
        include: {
            users: {
                where: { rank: 1 },
                include: { user: { select: { nickname: true } } }
            }
        }
    });

    // 2. Récupérer les records de la ligue pour les badges dynamiques
    const records = await prisma.record.findMany({
        where: { leagueId: user.leagueId }
    });

    // 3. Récupérer les totaux et max de l'utilisateur (All-time)
    const aggregates = await prisma.exerciseSession.groupBy({
        by: ['type'],
        where: { userId },
        _sum: { value: true },
        _max: { value: true }
    });

    // 3. Récupérer les stats de l'utilisateur pour les périodes en cours (pour les calculs d'écarts de record)
    const today = getBrusselsToday();
    const startWeek = startOfWeek(today, { weekStartsOn: 1 });
    const startMonth = startOfMonth(today);

    // Volume sur le mois en cours (pour couvrir JOUR, SEMAINE, MOIS)
    const monthStats = await prisma.exerciseSession.groupBy({
        by: ['type'],
        where: {
            userId,
            date: { gte: startMonth }
        },
        _sum: { value: true }
    });

    // Volume sur la semaine en cours
    const weekStats = await prisma.exerciseSession.groupBy({
        by: ['type'],
        where: {
            userId,
            date: { gte: startWeek }
        },
        _sum: { value: true }
    });

    // Volume sur la journée en cours
    const dayStats = await prisma.exerciseSession.groupBy({
        by: ['type'],
        where: {
            userId,
            date: { gte: today }
        },
        _sum: { value: true }
    });

    // Max série sur la journée en cours (pour les records de série)
    const dayMax = await prisma.exerciseSession.groupBy({
        by: ['type'],
        where: {
            userId,
            date: { gte: today }
        },
        _max: { value: true }
    });

    return {
        badges,
        records,
        userStats: {
            aggregates,
            monthStats,
            weekStats,
            dayStats,
            dayMax
        }
    };
}
