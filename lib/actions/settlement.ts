"use server"

import prisma from "@/lib/prisma";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ExerciseType } from "@prisma/client";
import { getBrusselsToday, getEasterDate } from "@/lib/date-utils";
import { awardBadge } from "./gamification";

/**
 * Traite les résultats de l'anniversaire d'hier pour une ligue donnée.
 * Attribue les badges et les bonus d'XP (x5 pour la star ou x3 pour les chasseurs).
 */
export async function processAnniversarySettlement(leagueId: string) {
    const today = getBrusselsToday();
    const yesterday = subDays(today, 1);
    const mmd = format(yesterday, "MM-dd");
    const year = yesterday.getFullYear();
    const holidaySettlementKey = `holiday_${leagueId}_${mmd}`;

    // 1. Vérifier si un anniversaire a eu lieu hier
    const leagueUsers = await prisma.user.findMany({
        where: { leagueId },
        select: { id: true, nickname: true, birthday: true, joinedAt: true }
    });

    const birthdayUsers = leagueUsers.filter(u => u.birthday && format(u.birthday, "MM-dd") === mmd);
    if (birthdayUsers.length === 0) return;

    // 2. Vérifier si le règlement a déjà été fait (via un FeedItem témoin)
    const alreadySettled = await prisma.feedItem.findFirst({
        where: {
            leagueId,
            type: "BADGE_WON",
            createdAt: { gte: today },
            OR: [
                { badge: { id: "BIRTHDAY_STAR" } },
                { badge: { id: "BIRTHDAY_HUNTER" } }
            ]
        }
    });
    if (alreadySettled) return;

    const star = birthdayUsers[0];
    const competitiveTypes: ExerciseType[] = ["PUSHUP", "SQUAT", "VENTRAL", "LATERAL_L", "LATERAL_R"];

    // 3. Récupérer les scores finaux d'hier
    const scores = await prisma.exerciseSession.groupBy({
        by: ['userId'],
        where: {
            userId: { in: leagueUsers.map(u => u.id) },
            date: { gte: startOfDay(yesterday), lte: endOfDay(yesterday) },
            type: { in: competitiveTypes }
        },
        _sum: { value: true, xpGained: true }
    });

    const starScoreData = scores.find(s => s.userId === star.id);
    const starTotalReps = starScoreData?._sum?.value || 0;
    const starBaseXP = starScoreData?._sum?.xpGained || 0;

    const challengers = scores.filter(s => s.userId !== star.id);
    const topChallengerScore = challengers.length > 0 
        ? Math.max(...challengers.map(c => c._sum?.value || 0))
        : 0;

    const isStarWinner = starTotalReps >= topChallengerScore && starTotalReps > 0;

    // 4. Attribution des récompenses
    if (isStarWinner) {
        // La Star gagne ! x5 XP (Régul : +3.5x car 1.5x déjà donné)
        const extraXP = Math.round(starBaseXP * (3.5 / 1.5));
        
        // Calcul de l'âge pour la valeur du badge
        const age = new Date().getFullYear() - star.birthday.getFullYear();
        const badgeXP = age * 3;

        await awardBadge(star.id, "BIRTHDAY_STAR", leagueId, badgeXP);
        
        if (extraXP > 0) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: star.id },
                    data: { totalXP: { increment: extraXP } }
                }),
                prisma.xpTransaction.create({
                    data: { userId: star.id, amount: extraXP, source: "SETTLEMENT_BIRTHDAY", date: getBrusselsToday() }
                })
            ]);
        }
    } else {
        // BP battu ! Les "chasseurs" qui ont fait plus que la star gagnent x3 (+1.5x)
        const winners = challengers.filter(c => (c._sum?.value || 0) > starTotalReps);
        
        for (const hunter of winners) {
            const hunterBaseXP = hunter._sum?.xpGained || 0;
            const extraXP = Math.round(hunterBaseXP * (1.5 / 1.5)); // +1.5x pour atteindre x3

            await awardBadge(hunter.userId, "BIRTHDAY_HUNTER", leagueId, 100);
            
            if (extraXP > 0) {
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: hunter.userId },
                        data: { totalXP: { increment: extraXP } }
                    }),
                    prisma.xpTransaction.create({
                        data: { userId: hunter.userId, amount: extraXP, source: "SETTLEMENT_BIRTHDAY_HUNTER", date: getBrusselsToday() }
                    })
                ]);
            }
        }
    }

    // --- 5. RÈGLEMENT DES PODIUMS (POISSON/PÂQUES/PARENTS) ---
    const isAprilFools = mmd === "04-01";
    const easter = getEasterDate(year);
    const isEaster = format(yesterday, "MM-dd") === format(easter, "MM-dd");
    const isMothersDay = mmd === "05-10";
    const isFathersDay = mmd === "06-14";

    if (isAprilFools || isEaster || isMothersDay || isFathersDay) {
        // Pour les podiums, on trie par Reps (Poisson/Pâques) ou par XP (Parents)
        const sortBy = (isAprilFools || isEaster) ? "reps" : "xp";
        const finalRanking = scores
            .map(s => ({ userId: s.userId, total: sortBy === "reps" ? (s._sum?.value || 0) : (s._sum?.xpGained || 0) }))
            .sort((a, b) => b.total - a.total);

        if (isAprilFools || isEaster) {
            const prefix = isAprilFools ? "APRIL_FOOLS_" : "EASTER_";
            // On récompense les 5 premiers
            for (let j = 0; j < Math.min(5, finalRanking.length); j++) {
                // Rang 1 (index 0) gagne Badge 5, Rang 2 gagne Badge 4, etc.
                const badgeRank = 5 - j;
                await awardBadge(finalRanking[j].userId, `${prefix}${badgeRank}`, leagueId);
            }
        } else {
            const prefix = isMothersDay ? "MOTHERS_DAY_" : "FATHERS_DAY_";
            const tiers = ["GOLD", "SILVER", "BRONZE"];
            for (let j = 0; j < Math.min(3, finalRanking.length); j++) {
                await awardBadge(finalRanking[j].userId, `${prefix}${tiers[j]}`, leagueId);
            }
        }
    }
}
