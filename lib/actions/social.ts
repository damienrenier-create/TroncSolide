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

    return items.map(item => ({
        ...item,
        likeCount: item.likes.length,
        isLiked: item.likes.some(l => l.userId === currentUserId)
    }));
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
