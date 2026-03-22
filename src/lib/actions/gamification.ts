"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BadgeType, FeedItemType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { BADGE_DEFINITIONS } from "@/lib/constants/badges";

/**
 * Ensures a badge definition exists in the database for the league.
 * Returns the DB badge ID.
 */
async function ensureBadgeExists(def: typeof BADGE_DEFINITIONS[0], leagueId: string) {
    // Badges can be scoped to league OR global (null leagueId in schema)
    // For "FIRST_COME", we MUST scope to league.
    const isFirstCome = def.type === "FIRST_COME";

    const existing = await prisma.badge.findFirst({
        where: {
            name: def.name,
            OR: [
                { leagueId },
                { leagueId: null }
            ]
        }
    });

    if (existing) return existing;

    return prisma.badge.create({
        data: {
            name: def.name,
            description: def.description,
            icon: def.icon,
            type: def.type,
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
    const levelInfo = getLevelInfo(user.totalXP);

    // 1. Level Up Logic
    if (levelInfo.level > user.level) {
        await prisma.user.update({
            where: { id: userId },
            data: { level: levelInfo.level }
        });
        await prisma.feedItem.create({
            data: { leagueId: user.leagueId, userId: userId, type: "LEVEL_UP", level: levelInfo.level }
        });
    }

    const badgesToAward = [];
    const userBadgeNames = new Set(user.badges.map(b => b.badge.name));

    // --- LOGIQUE ACCOMPLISSEMENTS (ACHIEVEMENT) ---
    const now = new Date(session.date);
    const hour = now.getHours();

    if (hour < 7 && !userBadgeNames.has("Lève-tôt")) badgesToAward.push("EARLY_BIRD");
    if (hour >= 22 && !userBadgeNames.has("Oiseau de nuit")) badgesToAward.push("NIGHT_OWL");
    if (session.value >= 100 && !userBadgeNames.has("Centurion")) badgesToAward.push("CENTURION");

    // Mood Master
    if (!userBadgeNames.has("Mood Master")) {
        const moodCount = await prisma.exerciseSession.count({ where: { userId, mood: { not: null } } });
        if (moodCount >= 10) badgesToAward.push("MOOD_MASTER");
    }

    // Squat Lover
    if (!userBadgeNames.has("Squat Lover")) {
        const squatCount = await prisma.exerciseSession.count({ where: { userId, type: "SQUAT" } });
        if (squatCount >= 5) badgesToAward.push("SQUAT_LOVER");
    }

    // Levels Achievements
    if (levelInfo.level >= 1 && !userBadgeNames.has("Graine de Champion")) badgesToAward.push("LEVEL_SEED");
    if (levelInfo.level >= 5 && !userBadgeNames.has("Jeune Pousse")) badgesToAward.push("LEVEL_SPROUT");
    if (levelInfo.level >= 20 && !userBadgeNames.has("Arbre Majestueux")) badgesToAward.push("LEVEL_TREE");
    if (levelInfo.level >= 50 && !userBadgeNames.has("Gardien de la Forêt")) badgesToAward.push("LEVEL_FOREST");

    // --- LOGIQUE PIONNIERS (FIRST_COME) ---

    // Series Records Check (One session value)
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

    // Milestones Cumulés (Aggregates)
    const aggregates = await prisma.exerciseSession.groupBy({
        by: ['type'],
        where: { userId },
        _sum: { value: true }
    });

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

    // Process all identified badges
    for (const badgeId of badgesToAward) {
        const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
        if (!def) continue;

        // Atomic check for First Come
        if (def.type === "FIRST_COME") {
            const alreadyTaken = await prisma.badge.findFirst({
                where: { name: def.name, leagueId: user.leagueId, winnerId: { not: null } }
            });
            if (alreadyTaken && alreadyTaken.winnerId !== userId) continue;
        }

        const badge = await ensureBadgeExists(def, user.leagueId);

        await prisma.$transaction(async (tx) => {
            const ub = await tx.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId: badge.id } } });
            if (ub) return; // Already have it

            await tx.userBadge.create({ data: { userId, badgeId: badge.id } });

            if (def.type === "FIRST_COME") {
                await tx.badge.update({
                    where: { id: badge.id },
                    data: { winnerId: userId }
                });
            }

            await tx.feedItem.create({
                data: { leagueId: user.leagueId, userId: userId, type: "BADGE_WON", badgeId: badge.id }
            });
        });
    }

    revalidatePath("/profile");
    revalidatePath("/badges");
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

    // Fetch all badges for this league or global
    const badges = await prisma.badge.findMany({
        where: {
            OR: [
                { leagueId: user.leagueId },
                { leagueId: null }
            ]
        },
        include: {
            winner: { select: { nickname: true } },
            users: { where: { userId: session.user.id } }
        }
    });

    return badges;
}
