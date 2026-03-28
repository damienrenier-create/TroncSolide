"use server"

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { subMinutes } from "date-fns";

export async function sendNudge(receiverId: string, message: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Non autorisé");
    const senderId = session.user.id;

    if (senderId === receiverId) throw new Error("Vous ne pouvez pas vous spammer vous-même");

    // Rate Limiting: 1 nudge toutes les 5 minutes vers la même personne
    const cooldown = subMinutes(new Date(), 5);
    const recentNudge = await prisma.nudge.findFirst({
        where: {
            senderId,
            receiverId,
            createdAt: { gte: cooldown }
        }
    });

    if (recentNudge) {
        throw new Error("Du calme ! Attends un peu avant de renvoyer un 'tweet' à cette personne.");
    }

    const nudge = await prisma.nudge.create({
        data: {
            senderId,
            receiverId,
            message: message.substring(0, 140)
        }
    });

    return nudge;
}

export async function getUnreadNudges() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];
    
    return await prisma.nudge.findMany({
        where: {
            receiverId: session.user.id,
            read: false
        },
        include: {
            sender: {
                select: {
                    nickname: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
}

export async function markNudgeRead(nudgeId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Non autorisé");

    await prisma.nudge.updateMany({
        where: {
            id: nudgeId,
            receiverId: session.user.id
        },
        data: {
            read: true
        }
    });

    revalidatePath("/");
}
