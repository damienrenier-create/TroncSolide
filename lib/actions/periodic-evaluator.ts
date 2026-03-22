import prisma from "@/lib/prisma";
import { getBrusselsToday } from "@/lib/date-utils";
import { startOfWeek, startOfMonth, subWeeks, subMonths, endOfWeek, endOfMonth } from "date-fns";
import { BADGE_DEFINITIONS } from "@/lib/constants/badges";

async function ensureBadgeExists(def: typeof BADGE_DEFINITIONS[0], leagueId: string) {
    const existing = await prisma.badge.findFirst({
        where: { name: def.name, OR: [{ leagueId }, { leagueId: null }] }
    });

    if (existing) return existing;

    return prisma.badge.create({
        data: {
            name: def.name,
            description: def.description,
            icon: def.icon,
            type: def.type,
            xpValue: def.xpValue,
            leagueId: leagueId
        }
    });
}

export async function evaluatePeriodicRecords(leagueId: string) {
    const today = getBrusselsToday();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const currentMonthStart = startOfMonth(today);

    // Get all badges for the league to check if evaluated
    const badges = await prisma.badge.findMany({
        where: { OR: [{ leagueId }, { leagueId: null }] },
        include: { users: true }
    });

    const weekBadgesInfo = [
        { id: "RECORD_WEEK_PUSHUP", ex: "PUSHUP", coef: 1.0 },
        { id: "RECORD_WEEK_SQUAT", ex: "SQUAT", coef: 1.0 },
        { id: "RECORD_WEEK_PLANK", ex: "VENTRAL", coef: 1.0 } 
    ];

    for (const info of weekBadgesInfo) {
        const badgeDef = BADGE_DEFINITIONS.find(b => b.id === info.id);
        if (!badgeDef) continue;
        
        const badge = badges.find(b => b.name === badgeDef.name);
        if (badge) {
            const alreadyEvaluated = badge.users.some(ub => new Date(ub.awardedAt) >= currentWeekStart);
            if (alreadyEvaluated) continue;
        }

        const prevWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
        const prevWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

        const aggregates = await prisma.exerciseSession.groupBy({
            by: ['userId'],
            where: {
                type: info.ex as any,
                date: { gte: prevWeekStart, lte: prevWeekEnd },
                user: { leagueId }
            },
            _sum: { value: true },
            orderBy: { _sum: { value: 'desc' } },
            take: 1
        });

        if (aggregates.length > 0 && aggregates[0]._sum.value && aggregates[0]._sum.value > 0) {
            const dbBadge = badge || await ensureBadgeExists(badgeDef, leagueId);
            await grantRollingBadge(dbBadge.id, aggregates[0].userId, aggregates[0]._sum.value, info.coef, leagueId, today);
        }
    }

    const monthBadgesInfo = [
        { id: "RECORD_MONTH_PUSHUP", ex: "PUSHUP", coef: 2.0 },
        { id: "RECORD_MONTH_SQUAT", ex: "SQUAT", coef: 2.0 },
        { id: "RECORD_MONTH_PLANK", ex: "VENTRAL", coef: 2.0 } 
    ];

    for (const info of monthBadgesInfo) {
        const badgeDef = BADGE_DEFINITIONS.find(b => b.id === info.id);
        if (!badgeDef) continue;
        
        const badge = badges.find(b => b.name === badgeDef.name);
        if (badge) {
            const alreadyEvaluated = badge.users.some(ub => new Date(ub.awardedAt) >= currentMonthStart);
            if (alreadyEvaluated) continue;
        }

        const prevMonthStart = startOfMonth(subMonths(today, 1));
        const prevMonthEnd = endOfMonth(subMonths(today, 1));

        const aggregates = await prisma.exerciseSession.groupBy({
            by: ['userId'],
            where: {
                type: info.ex as any,
                date: { gte: prevMonthStart, lte: prevMonthEnd },
                user: { leagueId }
            },
            _sum: { value: true },
            orderBy: { _sum: { value: 'desc' } },
            take: 1
        });

        if (aggregates.length > 0 && aggregates[0]._sum.value && aggregates[0]._sum.value > 0) {
            const dbBadge = badge || await ensureBadgeExists(badgeDef, leagueId);
            await grantRollingBadge(dbBadge.id, aggregates[0].userId, aggregates[0]._sum.value, info.coef, leagueId, today);
        }
    }
}

async function grantRollingBadge(badgeId: string, newWinnerId: string, volume: number, coef: number, leagueId: string, today: Date) {
    await prisma.$transaction(async (tx) => {
        const oldUbs = await tx.userBadge.findMany({ where: { badgeId } });
        let existingWinner = false;
        
        for (const oldUb of oldUbs) {
            if (oldUb.userId === newWinnerId) {
                // Défend son titre
                await tx.userBadge.update({
                    where: { id: oldUb.id },
                    data: { awardedAt: today, baseXP: Math.floor(volume * coef) }
                });
                existingWinner = true;
            } else {
                // Destitution de l'ancien vainqueur
                await tx.userBadge.delete({ where: { id: oldUb.id } });
            }
        }

        if (!existingWinner) {
            const finalXP = Math.floor(volume * coef);
            const CASSEUR_BONUS = 200;
            
            await tx.userBadge.create({
                data: {
                    userId: newWinnerId,
                    badgeId,
                    rank: 1,
                    baseXP: finalXP,
                    rateXP: Math.max(1, Math.floor(finalXP * 0.01)),
                    awardedAt: today
                }
            });
            
            await tx.user.update({
                where: { id: newWinnerId },
                data: { totalXP: { increment: finalXP + CASSEUR_BONUS } }
            });
            
            await tx.feedItem.create({
                data: { leagueId, userId: newWinnerId, type: "BADGE_WON", badgeId }
            });
        }
    });
}
