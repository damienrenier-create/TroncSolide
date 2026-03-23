"use server"

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getPublicProfile(nickname: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const requestingUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { leagueId: true }
    });

    if (!requestingUser) return null;

    const profileUser = await prisma.user.findFirst({
        where: { 
            nickname: { equals: nickname, mode: "insensitive" },
            leagueId: requestingUser.leagueId
        },
        include: {
            badges: {
                include: { badge: true }
            },
            sessions: {
                select: { value: true, type: true, xpGained: true }
            },
            records: {
                include: { user: true }
            }
        }
    });

    const leagueUsers = await prisma.user.findMany({
        where: { leagueId: requestingUser.leagueId },
        select: { nickname: true, totalXP: true },
        orderBy: { totalXP: 'desc' }
    });

    return { ...profileUser, leagueContext: leagueUsers };
}
