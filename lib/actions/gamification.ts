"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BadgeType, FeedItemType, ExerciseType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { differenceInDays, startOfDay } from "date-fns";
import { getBrusselsToday } from "@/lib/date-utils";

import { BADGE_DEFINITIONS } from "@/lib/constants/badges";

async function ensureBadgeExists(def: typeof BADGE_DEFINITIONS[0], leagueId: string) {
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
            }

            await tx.feedItem.create({
                data: { leagueId: user.leagueId, userId: userId, type: "BADGE_WON", badgeId: badge.id }
            });
        });
    }

    // --- LOGIQUE BRAQUAGE DE RECORDS ---
    const allRecords = await prisma.record.findMany({ where: { leagueId: user.leagueId } });

    const recordMapping = [
        { id: "RECORD_DAY_PUSHUP", type: "VOLUME", tf: "DAY", ex: "PUSHUP", coef: 0.5 },
        { id: "RECORD_SERIES_PUSHUP", type: "SERIES", tf: "YEAR", ex: "PUSHUP", coef: 5.0 },
        { id: "RECORD_DAY_SQUAT", type: "VOLUME", tf: "DAY", ex: "SQUAT", coef: 0.5 },
        { id: "RECORD_SERIES_SQUAT", type: "SERIES", tf: "YEAR", ex: "SQUAT", coef: 5.0 },
        { id: "RECORD_DAY_PLANK", type: "VOLUME", tf: "DAY", ex: "VENTRAL", coef: 0.5 },
        { id: "RECORD_SERIES_PLANK", type: "SERIES", tf: "YEAR", ex: "VENTRAL", coef: 5.0 },
    ];

    for (const mapping of recordMapping) {
        const topRecord = allRecords.find(r => r.type === mapping.type && r.timeframe === mapping.tf && r.exercise === mapping.ex);
        
        if (topRecord && topRecord.userId === userId) {
            // I am the current record holder in DB. Do I have the badge?
            const def = BADGE_DEFINITIONS.find(b => b.id === mapping.id);
            if (!def) continue;

            const badge = await ensureBadgeExists(def, user.leagueId);
            
            await prisma.$transaction(async (tx) => {
                const myUb = await tx.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId: badge.id } } });
                
                if (!myUb) {
                    // I DON'T have the badge, but I AM the record holder. This means I JUST STOLE IT!
                    const oldUb = await tx.userBadge.findFirst({ where: { badgeId: badge.id } });
                    
                    const newBaseXP = Math.floor(topRecord.value * mapping.coef);
                    const newRateXP = Math.max(1, Math.floor(newBaseXP * 0.01)); // 1% per day minimum 1
                    const CASSEUR_BONUS = 200;

                    if (oldUb) {
                        // DEPOUILLER L'ANCIEN PROPRIETAIRE DE SON TITRE (Mais il garde son XP accumulée)
                        await tx.userBadge.delete({ where: { id: oldUb.id } });
                        // => On ne fait plus de decrement sur l'ancien joueur. Il a profité de la rente pendant son règne.

                        // Announce the theft
                        await tx.feedItem.create({
                            data: { leagueId: user.leagueId, userId: oldUb.userId, type: "BADGE_LOST", badgeId: badge.id } 
                        });
                    }

                    // COURONNER LE NOUVEAU PROPRIETAIRE
                    await tx.userBadge.create({
                        data: {
                            userId,
                            badgeId: badge.id,
                            rank: 1, // Always Platine
                            baseXP: newBaseXP,
                            rateXP: newRateXP,
                            awardedAt: today
                        }
                    });

                    await tx.user.update({
                        where: { id: userId },
                        data: { totalXP: { increment: newBaseXP + CASSEUR_BONUS } }
                    });

                    await tx.feedItem.create({
                        data: { leagueId: user.leagueId, userId: userId, type: "BADGE_WON", badgeId: badge.id }
                    });
                } else {
                    // I already have it. Update its baseXP if I beat my own record?
                    // User broke their own record!
                    const newBaseXP = Math.floor(topRecord.value * mapping.coef);
                    if (newBaseXP > (myUb.baseXP || 0)) {
                        const diff = newBaseXP - (myUb.baseXP || 0);
                        const newRateXP = Math.max(1, Math.floor(newBaseXP * 0.01));
                        
                        await tx.userBadge.update({
                            where: { id: myUb.id },
                            data: { baseXP: newBaseXP, rateXP: newRateXP }
                        });

                        await tx.user.update({
                            where: { id: userId },
                            data: { totalXP: { increment: diff } } // Just give them the difference
                        });
                    }
                }
            });
        }
    }

    // Note: The daily "Longevity Rente" (salary) is conceptually added every day. 
    // In a real app we'd need a cron job, or we calculate it virtually on the frontend.
    // For now, it only materially impacts the user when it is STOLEN (deducted). 

    revalidatePath("/profile");
    revalidatePath("/faq");
    revalidatePath("/league");
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
