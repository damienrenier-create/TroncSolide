"use server"

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getPublicProfile(nickname: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const profileUser = await prisma.user.findFirst({
        where: { nickname: { equals: nickname, mode: "insensitive" } },
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

    if (!profileUser) return null;
    
    // Validate they are in the same league
    const requestingUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { leagueId: true }
    });
    
    if (!requestingUser || requestingUser.leagueId !== profileUser.leagueId) {
        return null;
    }

    return profileUser;
}
