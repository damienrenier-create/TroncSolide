"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function getFeedItems(leagueId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.leagueId || session.user.leagueId !== leagueId) {
        throw new Error("Accès refusé.");
    }

    const currentUserId = session.user.id;
    const items = await prisma.feedItem.findMany({

        where: { leagueId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            user: { select: { nickname: true, id: true, totalXP: true } },
            badge: { select: { name: true, icon: true, description: true } },
            likes: { select: { userId: true } }
        }
    });

    const enrichedItems = await Promise.all(items.map(async (item) => {
        let thief = null;
        if (item.type === "BADGE_LOST") {
            const thiefItem = await prisma.feedItem.findFirst({
                where: {
                    leagueId: item.leagueId,
                    badgeId: item.badgeId,
                    type: "BADGE_WON",
                    createdAt: {
                        gte: new Date(item.createdAt.getTime() - 15000),
                        lte: new Date(item.createdAt.getTime() + 15000)
                    },
                    NOT: { userId: item.userId }
                },
                include: { user: { select: { id: true, nickname: true } } }
            });
            thief = thiefItem?.user || null;
        }

        return {
            ...item,
            thief,
            likeCount: item.likes.length,
            isLiked: item.likes.some(l => l.userId === currentUserId)
        };
    }));

    return enrichedItems;
}

export async function toggleLike(feedItemId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Non autorisé" };

    const userId = session.user.id;
    const existing = await prisma.like.findUnique({

        where: { userId_feedItemId: { userId, feedItemId } }
    });

    if (existing) {
        await prisma.like.delete({
            where: { id: existing.id }
        });
    } else {
        await prisma.like.create({
            data: { userId, feedItemId }
        });
    }

    revalidatePath("/league");
    revalidatePath("/");
}
