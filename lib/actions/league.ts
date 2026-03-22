"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getLeagueInfo() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.leagueId) return null;

    const league = await prisma.league.findUnique({
        where: { id: session.user.leagueId },
        select: { name: true, accessCode: true }
    });

    return league;
}
