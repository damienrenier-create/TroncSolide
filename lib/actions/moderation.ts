"use server"

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Deletes an exercise session and reverts XP.
 * Hardening: Only for MODERATORS.
 */
export async function deleteSession(sessionId: string) {
    const session = await getServerSession(authOptions);

    const targetSession = await prisma.exerciseSession.findUnique({
        where: { id: sessionId },
        select: { userId: true, xpGained: true, type: true }
    });

    if (!targetSession) return { error: "Session non trouvée." };

    const isOwner = session?.user?.id === targetSession.userId;
    const isModerator = session?.user?.role === "MODERATOR";

    if (!isOwner && !isModerator) {
        throw new Error("Accès refusé. Tu ne peux supprimer que tes propres séances.");
    }

    try {
        const sessionData = await prisma.exerciseSession.findUnique({
            where: { id: sessionId },
            include: { user: { select: { leagueId: true } } }
        });

        if (!sessionData) return { error: "Session non trouvée." };

        await prisma.$transaction([
            prisma.exerciseSession.delete({ where: { id: sessionId } }),
            prisma.user.update({
                where: { id: sessionData.userId },
                data: { totalXP: { decrement: sessionData.xpGained } }
            }),
            prisma.feedItem.deleteMany({
                where: {
                    userId: sessionData.userId,
                    createdAt: { gte: new Date(Date.now() - 5000) }
                }
            })
        ]);

        const { syncAllRecordsForLeague } = await import("./record");
        await syncAllRecordsForLeague(sessionData.user.leagueId, sessionData.type);

        revalidatePath("/");
        revalidatePath("/league");
        revalidatePath("/stats");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Erreur lors de la suppression." };
    }
}

/**
 * Creates a new league.
 */
export async function createLeague(name: string, accessCode: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "MODERATOR") {
        throw new Error("Accès refusé.");
    }

    try {
        const newLeague = await prisma.league.create({
            data: {
                name,
                accessCode,
                creatorId: session.user.id
            }
        });
        revalidatePath("/admin/leagues");
        return { success: true, league: newLeague };
    } catch (e) {
        return { error: "Erreur : Ce code d'accès est probablement déjà utilisé." };
    }
}

/**
 * Manually adjusts a user's XP.
 */
export async function adjustUserXP(userId: string, amount: number) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "MODERATOR") {
        throw new Error("Accès refusé.");
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { totalXP: { increment: amount } }
        });
        revalidatePath("/");
        revalidatePath("/league");
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de l'ajustement." };
    }
}
