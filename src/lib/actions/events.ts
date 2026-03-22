"use server"

import prisma from "@/lib/prisma";
import { format, startOfDay } from "date-fns";

export async function getActiveEvents(leagueId: string) {
    const users = await prisma.user.findMany({
        where: { leagueId },
        select: { id: true, nickname: true, birthday: true }
    });

    const today = format(new Date(), "MM-dd");
    const birthdayUsers = users.filter(u => u.birthday && format(u.birthday, "MM-dd") === today);

    if (birthdayUsers.length === 0) return null;

    return {
        type: "ANNIVERSARY",
        title: `Anniversaire de ${birthdayUsers.map(u => u.nickname).join(", ")} ! 🎂`,
        description: "Gagnez des bonus d'XP en participant aujourd'hui. Battez le score de la star du jour pour plus de récompenses !",
        users: birthdayUsers,
    };
}
