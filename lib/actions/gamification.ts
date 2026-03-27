"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BadgeType, FeedItemType, ExerciseType, RecordType, RecordTimeframe } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
    differenceInDays,
    differenceInYears,
    startOfDay, 
    startOfWeek, 
    startOfMonth, 
    startOfYear,
    format,
    subDays
} from "date-fns";
import { getBrusselsToday, getBrusselsDate } from "@/lib/date-utils";

import { BADGE_DEFINITIONS } from "@/lib/constants/badges";
import { getLevelInfo } from "@/lib/constants/levels";
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
            type: def.type as BadgeType,
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

    // --- LOGIQUE HOLISTIQUE (FULL BODY) ---
    const holisticTypes = ["VENTRAL", "LATERAL_L", "LATERAL_R", "SQUAT", "PUSHUP"];
    let batchSessionsForHolistic = [session];
    if (session.batchId) {
        batchSessionsForHolistic = await prisma.exerciseSession.findMany({ where: { batchId: session.batchId } });
    }

    const batchValues: Record<string, number> = {};
    batchSessionsForHolistic.forEach(s => {
        batchValues[s.type] = (batchValues[s.type] || 0) + s.value;
    });
    
    const minBatchValue = holisticTypes.every(t => batchValues[t] !== undefined)
        ? Math.min(...holisticTypes.map(t => batchValues[t]))
        : 0;

    if (minBatchValue >= 1) badgesToAward.push("HOLISTIC_LOG_1");
    if (minBatchValue >= 5) badgesToAward.push("HOLISTIC_LOG_5");
    if (minBatchValue >= 10) badgesToAward.push("HOLISTIC_LOG_10");
    if (minBatchValue >= 30) badgesToAward.push("HOLISTIC_LOG_30");
    if (minBatchValue >= 60) badgesToAward.push("HOLISTIC_LOG_60");

    // Cumulative Holistic (all-time)
    const minAllTimeValue = holisticTypes.every(t => {
        const agg = aggregates.find(a => a.type === t);
        return (agg?._sum.value || 0) >= 1;
    }) ? Math.min(...holisticTypes.map(t => {
        const agg = aggregates.find(a => a.type === t);
        return agg?._sum.value || 0;
    })) : 0;

    if (minAllTimeValue >= 100) badgesToAward.push("HOLISTIC_MILESTONE_100");
    if (minAllTimeValue >= 600) badgesToAward.push("HOLISTIC_MILESTONE_600");
    if (minAllTimeValue >= 6000) badgesToAward.push("HOLISTIC_MILESTONE_6000");

    // --- LOGIQUE RÉGULARITÉ (STREAKS & FREQUENCY) ---
    const reg = await getRegularityStats(userId);
    if (reg) {
        if (reg.daysWithEffort >= 5) badgesToAward.push("REGULARITY_1_EFFORT_5D");
        if (reg.daysWithPushup >= 5) badgesToAward.push("REGULARITY_1_PUSHUP_5D");
        if (reg.daysWithVentral >= 5) badgesToAward.push("REGULARITY_1_VENTRAL_5D");

        if (reg.maxStreak1 >= 3) badgesToAward.push("REGULARITY_STREAK_1_3D");
        if (reg.maxStreak3 >= 3) badgesToAward.push("REGULARITY_STREAK_3_3D");
        if (reg.maxStreak30 >= 3) badgesToAward.push("REGULARITY_STREAK_30_3D");
        if (reg.maxStreak30 >= 7) badgesToAward.push("REGULARITY_STREAK_30_7D");
        if (reg.maxStreak30 >= 21) badgesToAward.push("REGULARITY_STREAK_30_21D");

        if (reg.maxStreak3Diff >= 7) badgesToAward.push("REGULARITY_STREAK_3DIFF_7D");
        if (reg.maxStreak3Diff >= 10) badgesToAward.push("REGULARITY_STREAK_3DIFF_10D");
        if (reg.maxStreak3Diff >= 21) badgesToAward.push("REGULARITY_STREAK_3DIFF_21D");

        if (reg.maxStreakTarget >= 3) badgesToAward.push("REGULARITY_STREAK_TARGET_3D");
        if (reg.maxStreakTarget >= 6) badgesToAward.push("REGULARITY_STREAK_TARGET_6D");
        if (reg.maxStreakTarget >= 12) badgesToAward.push("REGULARITY_STREAK_TARGET_12D");
        if (reg.maxStreakTarget >= 24) badgesToAward.push("REGULARITY_STREAK_TARGET_24D");
        if (reg.maxStreakTarget >= 48) badgesToAward.push("REGULARITY_STREAK_TARGET_48D");
        if (reg.maxStreakTarget >= 96) badgesToAward.push("REGULARITY_STREAK_TARGET_96D");
    }

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
                
                // Add all awards but make sure they are distinct from base exercise
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
        { id: "RECORD_SERIES_PUSHUP", type: "SERIES", tf: "YEAR", ex: "PUSHUP", coef: 5.0 },
        { id: "RECORD_SERIES_SQUAT", type: "SERIES", tf: "YEAR", ex: "SQUAT", coef: 5.0 },
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

                    // FIX Bug 2: Only create Badge Lost alert if someone ELSE took the #1 spot
                    // This avoids false "STOLEN" alerts on daily/weekly/monthly resets.
                    if (top3.length > 0) {
                        await tx.feedItem.create({
                            data: { leagueId, userId: holder.userId, type: "BADGE_LOST", badgeId: badge.id }
                        });
                    }
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
                        awardsForUser.push({ type: "badge", label: `LIGUE: ${def.name}`, xp: newBaseXP + CASSEUR_BONUS });
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
                                awardsForUser.push({ type: "badge", label: `LIGUE: ${def.name}`, xp: diff });
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
        } else if (bid.startsWith("HOLISTIC_LOG_")) {
            const req = parseInt(bid.split("_")[2]);
            const batchSessions = await prisma.exerciseSession.findMany({
                where: { userId, batchId: { not: null } }
            });
            const valuesByBatch: Record<string, Record<string, number>> = {};
            batchSessions.forEach(s => {
                if (!valuesByBatch[s.batchId!]) valuesByBatch[s.batchId!] = {};
                valuesByBatch[s.batchId!][s.type] = (valuesByBatch[s.batchId!][s.type] || 0) + s.value;
            });
            const holisticTypes = ["VENTRAL", "LATERAL_L", "LATERAL_R", "SQUAT", "PUSHUP"];
            stillEarned = Object.values(valuesByBatch).some(batchVals => {
                const minVal = holisticTypes.every(t => batchVals[t] !== undefined)
                    ? Math.min(...holisticTypes.map(t => batchVals[t]))
                    : 0;
                return minVal >= req;
            });
        } else if (bid.startsWith("HOLISTIC_MILESTONE_")) {
            const req = parseInt(bid.split("_")[2]);
            const holisticTypes = ["VENTRAL", "LATERAL_L", "LATERAL_R", "SQUAT", "PUSHUP"];
            const minAllTime = holisticTypes.every(t => {
                const agg = aggregates.find(a => a.type === t);
                return (agg?._sum.value || 0) >= 1;
            }) ? Math.min(...holisticTypes.map(t => {
                const agg = aggregates.find(a => a.type === t);
                return agg?._sum.value || 0;
            })) : 0;
            stillEarned = minAllTime >= req;
        } else if (bid.startsWith("REGULARITY_")) {
            const reg = await getRegularityStats(userId);
            if (!reg) {
                stillEarned = false;
            } else {
                if (bid === "REGULARITY_1_EFFORT_5D") stillEarned = reg.daysWithEffort >= 5;
                else if (bid === "REGULARITY_1_PUSHUP_5D") stillEarned = reg.daysWithPushup >= 5;
                else if (bid === "REGULARITY_1_VENTRAL_5D") stillEarned = reg.daysWithVentral >= 5;
                else if (bid.startsWith("REGULARITY_STREAK_1_")) stillEarned = reg.maxStreak1 >= parseInt(bid.split("_")[3]);
                else if (bid.startsWith("REGULARITY_STREAK_3_")) stillEarned = reg.maxStreak3 >= parseInt(bid.split("_")[3]);
                else if (bid.startsWith("REGULARITY_STREAK_30_")) stillEarned = reg.maxStreak30 >= parseInt(bid.split("_")[3]);
                else if (bid.startsWith("REGULARITY_STREAK_3DIFF_")) stillEarned = reg.maxStreak3Diff >= parseInt(bid.split("_")[3]);
                else if (bid.startsWith("REGULARITY_STREAK_TARGET_")) stillEarned = reg.maxStreakTarget >= parseInt(bid.split("_")[3]);
            }
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
                orderBy: { awardedAt: 'asc' }, // All holders, ordered by time
                take: 50, // Limit to 50 total for performance
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

    // 2b. Récupérer le record d'une session holistique (batchId avec 5 types)
    const allSessions = await prisma.exerciseSession.findMany({
        where: { userId, batchId: { not: null } },
        select: { type: true, value: true, batchId: true }
    });
    const batchData: Record<string, { values: Record<string, number>, total: number }> = {};
    allSessions.forEach(s => {
        if (!batchData[s.batchId!]) batchData[s.batchId!] = { values: {}, total: 0 };
        batchData[s.batchId!].values[s.type] = (batchData[s.batchId!].values[s.type] || 0) + s.value;
        batchData[s.batchId!].total += s.value;
    });

    const holisticTypes = ["VENTRAL", "LATERAL_L", "LATERAL_R", "SQUAT", "PUSHUP"];
    let maxHolisticVol = 0; // Balanced volume (min * 5)
    Object.values(batchData).forEach(b => {
        const hasAll = holisticTypes.every(t => b.values[t] !== undefined);
        if (hasAll) {
            const minVal = Math.min(...holisticTypes.map(t => b.values[t]));
            if (minVal > 0) {
                // We define "balanced volume" as the min reps across all 5 types
                // This will help the UI show progress towards Holistic Log badges
                if (minVal > maxHolisticVol) maxHolisticVol = minVal;
            }
        }
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

    // Helper mapping
    const mapAgg = (arr: any[]) => {
        const res: any = {};
        arr.forEach(a => {
            const types = Array.isArray(a.type) ? a.type : [a.type];
            types.forEach((t: string) => {
                if (t === "PUSHUP") {
                    res.pushups = (res.pushups || 0) + (a._sum?.value || 0);
                    res.maxPushups = Math.max(res.maxPushups || 0, a._max?.value || 0);
                } else if (t === "SQUAT") {
                    res.squats = (res.squats || 0) + (a._sum?.value || 0);
                    res.maxSquats = Math.max(res.maxSquats || 0, a._max?.value || 0);
                } else if (["VENTRAL", "LATERAL_L", "LATERAL_R"].includes(t)) {
                    res.plank = (res.plank || 0) + (a._sum?.value || 0);
                    res.maxPlank = Math.max(res.maxPlank || 0, a._max?.value || 0);
                    // Add individual totals for holistic calculation
                    res[t.toLowerCase()] = (res[t.toLowerCase()] || 0) + (a._sum?.value || 0);
                }
            });
        });
        return res;
    };

    const regularityStats = await getRegularityStats(userId);

    const userStats = {
        allTime: { 
            ...mapAgg(aggregates), 
            maxHolisticSession: maxHolisticVol,
            regularity: regularityStats
        },
        month: mapAgg(monthStats),
        week: mapAgg(weekStats),
        today: mapAgg(dayStats),
        dayMax: mapAgg(dayMax)
    };

    return {
        userId,
        badges: badges.map(b => ({
            ...b,
            xpValue: BADGE_DEFINITIONS.find(d => d.id === b.id)?.xpValue || 0
        })),
        records,
        userStats
    };
}

export async function getRegularityStats(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { joinedAt: true } });
    if (!user) return null;

    const sessions = await prisma.exerciseSession.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        select: { date: true, type: true, value: true }
    });

    const dailyStats: Record<string, { total: number, pushups: number, ventral: number, types: Set<string>, targetReached: boolean }> = {};
    
    sessions.forEach(s => {
        const bd = getBrusselsDate(s.date);
        const dateStr = format(bd, 'yyyy-MM-dd');
        if (!dailyStats[dateStr]) {
            dailyStats[dateStr] = { total: 0, pushups: 0, ventral: 0, types: new Set(), targetReached: false };
        }
        dailyStats[dateStr].total += s.value;
        if (s.type === "PUSHUP") dailyStats[dateStr].pushups += s.value;
        if (s.type === "VENTRAL") dailyStats[dateStr].ventral += s.value;
        dailyStats[dateStr].types.add(s.type);
    });

    const dates = Object.keys(dailyStats).sort();
    if (dates.length === 0) return null;

    const signupStart = getBrusselsDate(user.joinedAt);
    signupStart.setHours(0, 0, 0, 0);

    dates.forEach(dateStr => {
        const d = new Date(dateStr); // parsed from yyyy-MM-dd is local at midnight
        const daysSince = differenceInDays(d, signupStart);
        const target = daysSince + 1;
        if (dailyStats[dateStr].total >= target) {
            dailyStats[dateStr].targetReached = true;
        }
    });

    let currentStreak1 = 0; let maxStreak1 = 0;
    let currentStreak3 = 0; let maxStreak3 = 0;
    let currentStreak30 = 0; let maxStreak30 = 0;
    let currentStreak3Diff = 0; let maxStreak3Diff = 0;
    let currentStreakTarget = 0; let maxStreakTarget = 0;
    
    let prevDate: Date | null = null;
    for (const dateStr of dates) {
        const currDate = new Date(dateStr);
        const day = dailyStats[dateStr];
        if (prevDate && differenceInDays(currDate, prevDate) > 1) {
            currentStreak1 = 0; currentStreak3 = 0; currentStreak30 = 0; currentStreak3Diff = 0; currentStreakTarget = 0;
        }
        if (day.total >= 1) { currentStreak1++; if (currentStreak1 > maxStreak1) maxStreak1 = currentStreak1; } else currentStreak1 = 0;
        if (day.total >= 3) { currentStreak3++; if (currentStreak3 > maxStreak3) maxStreak3 = currentStreak3; } else currentStreak3 = 0;
        if (day.total >= 30) { currentStreak30++; if (currentStreak30 > maxStreak30) maxStreak30 = currentStreak30; } else currentStreak30 = 0;
        if (day.types.size >= 3) { currentStreak3Diff++; if (currentStreak3Diff > maxStreak3Diff) maxStreak3Diff = currentStreak3Diff; } else currentStreak3Diff = 0;
        if (day.targetReached) { currentStreakTarget++; if (currentStreakTarget > maxStreakTarget) maxStreakTarget = currentStreakTarget; } else currentStreakTarget = 0;
        prevDate = currDate;
    }

    const today = getBrusselsToday();
    const lastStr = dates[dates.length - 1];
    const todayStr = format(today, 'yyyy-MM-dd');
    const yest = subDays(today, 1);
    const yestStr = format(yest, 'yyyy-MM-dd');
    if (lastStr !== todayStr && lastStr !== yestStr) {
        currentStreak1 = 0; currentStreak3 = 0; currentStreak30 = 0; currentStreak3Diff = 0; currentStreakTarget = 0;
    }

    return {
        daysWithEffort: dates.length,
        daysWithPushup: dates.filter(d => dailyStats[d].pushups >= 1).length,
        daysWithVentral: dates.filter(d => dailyStats[d].ventral >= 1).length,
        maxStreak1, maxStreak3, maxStreak30, maxStreak3Diff, maxStreakTarget,
        currentStreak1, currentStreak3, currentStreak30, currentStreak3Diff, currentStreakTarget
    };
}

export async function claimClickEasterEgg() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Non connecté" };

    const userId = session.user.id;

    // 1. Check if already has the badge
    const existingBadge = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: "HIDDEN_FOU_CLIC" } }
    });
    if (existingBadge) return { success: false, error: "Badge déjà obtenu" };

    // 2. Fetch user to check age
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { birthday: true, totalXP: true, level: true, leagueId: true }
    });

    if (!user) return { success: false, error: "Utilisateur introuvable" };

    // 3. Award Badge & Level Up
    const levelInfo = getLevelInfo(user.totalXP);
    const xpToNext = levelInfo.nextLevelXP - user.totalXP;

    try {
        await prisma.$transaction(async (tx) => {
            // Award badge
            await tx.userBadge.create({
                data: {
                    userId,
                    badgeId: "HIDDEN_FOU_CLIC",
                    awardedAt: new Date()
                }
            });

            // Level up (add XP to reach exactly next level)
            await tx.user.update({
                where: { id: userId },
                data: {
                    totalXP: { increment: xpToNext },
                    level: user.level + 1
                }
            });

            // Add to feed for the gazette
            await tx.feedItem.create({
                data: {
                    leagueId: user.leagueId,
                    userId,
                    type: "BADGE_WON",
                    badgeId: "HIDDEN_FOU_CLIC"
                }
            });

            // Special Level Up feed item
            await tx.feedItem.create({
                data: {
                    leagueId: user.leagueId,
                    userId,
                    type: "LEVEL_UP",
                    level: user.level + 1
                }
            });
        });

        revalidatePath("/");
        revalidatePath("/league");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erreur lors de l'attribution" };
    }
}

export async function claimZenReward() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Non connecté" };

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { zenLevel: true, totalXP: true, level: true, leagueId: true }
    }) as any;

    if (!user) return { success: false, error: "Utilisateur introuvable" };

    const birdIndex = user.zenLevel;
    
    try {
        await prisma.$transaction(async (tx) => {
            if (birdIndex < 7) {
                // Happy Bird
                const xpGain = 50 + (birdIndex * 25);
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        totalXP: { increment: xpGain },
                        zenLevel: { increment: 1 }
                    }
                });

                // Award first time zen badge
                if (birdIndex === 0) {
                    await tx.userBadge.upsert({
                        where: { userId_badgeId: { userId, badgeId: "HIDDEN_ZEN_BIRD" } },
                        create: { userId, badgeId: "HIDDEN_ZEN_BIRD" },
                        update: {}
                    });
                     await tx.feedItem.create({
                        data: { leagueId: user.leagueId, userId, type: "BADGE_WON", badgeId: "HIDDEN_ZEN_BIRD" }
                    });
                }
            } else {
                // MALÉFIQUE CHAT !
                // Find XP required to reach the start of user.level - 1
                let targetXP = 0;
                let accumulated = 0;
                const targetLevel = Math.max(1, user.level - 1);
                
                for (let i = 2; i <= targetLevel; i++) {
                     const linearCost = (i - 1) * 50;
                     const acceleration = i > 50 ? Math.pow(i - 50, 2) * 10 : 0;
                     accumulated += (linearCost + acceleration);
                }
                targetXP = accumulated;

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        totalXP: targetXP,
                        level: targetLevel,
                        zenLevel: 0 // Reset
                    }
                });

                await tx.feedItem.create({
                    data: {
                        leagueId: user.leagueId,
                        userId,
                        type: "LEVEL_UP", // Using LEVEL_UP as a general level change
                        level: targetLevel
                    }
                });
            }
        });

        revalidatePath("/");
        revalidatePath("/league");
        return { success: true, zenLevel: birdIndex < 7 ? birdIndex + 1 : 0 };
    } catch (e) {
        console.error(e);
        return { success: false };
    }
}

export async function claimRetroBadge() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false };

    const userId = session.user.id;
    const badgeId = "HIDDEN_RETRO_GAINEUR";

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { leagueId: true } });
    if (!user) return { success: false };

    try {
        await prisma.$transaction(async (tx) => {
            const existing = await tx.userBadge.findUnique({
                where: { userId_badgeId: { userId, badgeId } }
            });
            if (!existing) {
                await tx.userBadge.create({ data: { userId, badgeId } });
                await tx.feedItem.create({
                    data: { leagueId: user.leagueId, userId, type: "BADGE_WON", badgeId }
                });
            }
        });

        revalidatePath("/trophies");
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}
