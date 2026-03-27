import prisma from "@/lib/prisma";
import { BadgeType } from "@prisma/client";
import { getBrusselsToday } from "@/lib/date-utils";
import { 
    startOfWeek, 
    startOfMonth, 
    startOfDay, 
    startOfYear,
    subWeeks, 
    subMonths, 
    subDays, 
    subYears,
    endOfWeek, 
    endOfMonth,
    endOfDay,
    endOfYear
} from "date-fns";
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
            type: def.type as BadgeType,
            xpValue: def.xpValue,
            leagueId: leagueId
        }
    });
}

export async function evaluatePeriodicRecords(leagueId: string) {
    const today = getBrusselsToday();
    
    const timeframes = [
        { 
            id: "DAY", 
            badgePrefix: "RECORD_DAY_", 
            getStart: (d: Date) => startOfDay(subDays(d, 1)), 
            getEnd: (d: Date) => endOfDay(subDays(d, 1)),
            coef: 0.5,
            currentStart: startOfDay(today)
        },
        { 
            id: "WEEK", 
            badgePrefix: "RECORD_WEEK_", 
            getStart: (d: Date) => startOfWeek(subWeeks(d, 1), { weekStartsOn: 1 }), 
            getEnd: (d: Date) => endOfWeek(subWeeks(d, 1), { weekStartsOn: 1 }),
            coef: 1.0,
            currentStart: startOfWeek(today, { weekStartsOn: 1 })
        },
        { 
            id: "MONTH", 
            badgePrefix: "RECORD_MONTH_", 
            getStart: (d: Date) => startOfMonth(subMonths(d, 1)), 
            getEnd: (d: Date) => endOfMonth(subMonths(d, 1)),
            coef: 2.0,
            currentStart: startOfMonth(today)
        },
        { 
            id: "YEAR", 
            badgePrefix: "RECORD_YEAR_", 
            getStart: (d: Date) => startOfYear(subYears(d, 1)), 
            getEnd: (d: Date) => endOfYear(subYears(d, 1)),
            coef: 5.0,
            currentStart: startOfYear(today)
        }
    ];

    const exercises = [
        { suffix: "PUSHUP", ex: "PUSHUP" },
        { suffix: "SQUAT", ex: "SQUAT" },
        { suffix: "PLANK", ex: "VENTRAL" }
    ];

    // Get all records badges for this league
    const badges = await prisma.badge.findMany({
        where: { 
            id: { startsWith: "RECORD_" },
            OR: [{ leagueId }, { leagueId: null }] 
        },
        include: { users: true }
    });

    for (const tf of timeframes) {
        for (const exInfo of exercises) {
            const badgeId = `${tf.badgePrefix}${exInfo.suffix}`;
            const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
            if (!badgeDef) continue;

            const badge = badges.find(b => b.id === badgeId);
            
            // 1. Check if already evaluated for this SPECIFIC period
            if (badge) {
                const alreadyEvaluated = badge.users.some(ub => new Date(ub.awardedAt) >= tf.currentStart);
                if (alreadyEvaluated) continue;
            }

            // 2. Find the winner of the LAST COMPLETED period
            const prevStart = tf.getStart(today);
            const prevEnd = tf.getEnd(today);

            const aggregates = await prisma.exerciseSession.groupBy({
                by: ['userId'],
                where: {
                    type: exInfo.ex as any,
                    date: { gte: prevStart, lte: prevEnd },
                    user: { leagueId }
                },
                _sum: { value: true },
                orderBy: { _sum: { value: 'desc' } },
                take: 1
            });

            const winner = aggregates[0];
            const winnerValue = winner?._sum.value || 0;

            if (winnerValue > 0) {
                // 3. PERSISTENT LOGIC: Compare with current holder
                const currentHolderUb = badge?.users[0];
                const currentRecordValue = currentHolderUb?.baseXP || 0; // We use baseXP to store the volume/score for comparison

                if (winnerValue > currentRecordValue || !currentHolderUb) {
                    // NEW CHAMPION! (or first one)
                    const dbBadge = badge || await ensureBadgeExists(badgeDef, leagueId);
                    await grantRollingBadge(dbBadge.id, winner.userId, winnerValue, tf.coef, leagueId, today);
                } else {
                    // Current champion defends the title because the new period winner didn't beat the record
                    // But we still update awardedAt so we don't re-evaluate today/this week
                    await prisma.userBadge.update({
                        where: { id: currentHolderUb.id },
                        data: { awardedAt: today }
                    });
                }
            }
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
