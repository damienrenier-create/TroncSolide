"use server"

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function postMessage(content: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Non autorisé" };
    if (!content || content.trim().length === 0) return { error: "Message vide" };
    if (content.length > 240) return { error: "Message trop long (max 240 caractères)" };

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { leagueId: true } });
    if (!user) return { error: "Utilisateur introuvable" };

    await prisma.message.create({
        data: {
            userId: session.user.id,
            leagueId: user.leagueId,
            content: content.trim()
        }
    });

    revalidatePath("/square");
    return { success: true };
}

export async function getRecentMessages(leagueId: string) {
    const messages = await prisma.message.findMany({
        where: { leagueId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: { 
            user: { select: { nickname: true } },
            likes: { select: { userId: true } }
        }
    });

    return messages;
}

export async function toggleMessageLike(messageId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Non autorisé" };

    const existingLike = await prisma.messageLike.findUnique({
        where: {
            userId_messageId: {
                userId: session.user.id,
                messageId: messageId
            }
        }
    });

    if (existingLike) {
        await prisma.messageLike.delete({
            where: { id: existingLike.id }
        });
    } else {
        await prisma.messageLike.create({
            data: {
                userId: session.user.id,
                messageId: messageId
            }
        });
    }

    revalidatePath("/square");
    return { success: true };
}
