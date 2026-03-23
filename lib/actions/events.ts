"use server"

import prisma from "@/lib/prisma";
import { format, startOfDay } from "date-fns";
import { getBrusselsToday, getEasterDate } from "@/lib/date-utils";

export async function getActiveEvents(leagueId: string) {
    const todayStart = getBrusselsToday();
    const mmdd = format(todayStart, "MM-dd");
    const year = todayStart.getFullYear();

    // --- ÉVÉNEMENTS GLOBAUX ---
    if (mmdd === "04-01") {
        return { type: "APRIL_FOOLS", title: "POISSON D'AVRIL ! 🐟", description: "Faites le plus de reps possible pour décrocher le gros lot (Top 5) !" };
    }

    const easter = getEasterDate(year);
    if (format(todayStart, "MM-dd") === format(easter, "MM-dd")) {
        return { type: "EASTER", title: "JOYEUSES PÂQUES ! 🥚", description: "Chasse aux œufs géante : les 5 meilleurs gagnent des trophées !" };
    }

    if (mmdd === "05-01") {
        return { type: "LABOR_DAY", title: "FÊTE DU TRAVAIL ! 💪", description: "Aujourd'hui, on charbonne : XP x5 sur toute la séance !" };
    }

    if (mmdd === "05-10") {
        return { type: "MOTHERS_DAY", title: "FÊTE DES MÈRES ! 💖", description: "Hommage aux mamans : XP x5 sur le Gainage et les Squats !" };
    }

    if (mmdd === "06-14") {
        return { type: "FATHERS_DAY", title: "FÊTE DES PÈRES ! 💙", description: "Hommage aux papas : XP x5 sur les Pompes !" };
    }

    // --- ÉVÉNEMENTS DE LIGUE (ANNIVERSAIRE) ---
    const users = await prisma.user.findMany({
        where: { leagueId },
        select: { id: true, nickname: true, birthday: true }
    });

    const birthdayUsers = users.filter((u: any) => u.birthday && format(u.birthday, "MM-dd") === mmdd);

    if (birthdayUsers.length === 0) return null;

    const star = birthdayUsers[0];

    // Calculer les reps totales de la star (compétitives)
    const starReps = await prisma.exerciseSession.aggregate({
        where: {
            userId: star.id,
            date: { gte: todayStart },
            type: { in: ["PUSHUP", "SQUAT", "VENTRAL", "LATERAL_L", "LATERAL_R"] }
        },
        _sum: { value: true }
    });

    // Chercher le meilleur challenger (celui qui a fait le plus de reps hors star)
    const topChallenger = await prisma.exerciseSession.groupBy({
        by: ['userId'],
        where: {
            user: { leagueId },
            userId: { not: star.id },
            date: { gte: todayStart },
            type: { in: ["PUSHUP", "SQUAT", "VENTRAL", "LATERAL_L", "LATERAL_R"] }
        },
        _sum: { value: true },
        orderBy: { _sum: { value: 'desc' } },
        take: 1
    });

    return {
        type: "ANNIVERSARY",
        title: `Anniversaire de ${birthdayUsers.map(u => u.nickname).join(", ")} ! 🎂`,
        description: "Battez le score de la star du jour pour obtenir l'XP x3 ! Si la star gagne, elle fait x5 !",
        star: {
            id: star.id,
            nickname: star.nickname,
            reps: starReps._sum.value || 0
        },
        topChallenger: topChallenger[0] ? {
            value: topChallenger[0]._sum.value || 0
        } : null
    };
}
