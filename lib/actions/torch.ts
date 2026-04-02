"use server"

import prisma from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";
import { getBrusselsToday, getBrusselsDate } from "@/lib/date-utils";

export async function tryClaimTorch(userId: string, leagueId: string, entryDate: Date) {
    // entryDate should be startOfDay
    try {
        const torch = await prisma.torchHolder.create({
            data: {
                leagueId,
                userId,
                date: entryDate
            }
        });

        // If success, update streaks!
        const yesterday = subDays(entryDate, 1);
        const yesterdayTorch = await prisma.torchHolder.findUnique({
            where: { leagueId_date: { leagueId, date: yesterday } }
        });

        const user = await prisma.user.findUnique({ 
            where: { id: userId }, 
            select: { currentTorchStreak: true, highestTorchStreak: true } 
        });
        
        if (!user) return false;

        let newStreak = 1;
        if (yesterdayTorch && yesterdayTorch.userId === userId) {
            newStreak = user.currentTorchStreak + 1;
        }

        const newHighest = Math.max(newStreak, user.highestTorchStreak);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    currentTorchStreak: newStreak,
                    highestTorchStreak: newHighest,
                    totalXP: { increment: 100 } // Bonus for taking the torch
                }
            }),
            prisma.xpTransaction.create({
                data: {
                    userId,
                    amount: 100,
                    source: "TORCH_BONUS",
                    date: entryDate
                }
            })
        ]);

        return true;
    } catch (e: any) {
        // Unique constraint failed P2002
        // Someone else already got it, or this user already got it.
        return false;
    }
}

export async function getTorchStatus(leagueId: string) {
    const today = getBrusselsToday();
    const todayTorch = await prisma.torchHolder.findUnique({
        where: { leagueId_date: { leagueId, date: today } },
        include: { user: { select: { nickname: true, currentTorchStreak: true } } }
    });

    // Find Gardien (Highest streak historically)
    const gardien = await prisma.user.findFirst({
        where: { leagueId, highestTorchStreak: { gt: 0 } },
        orderBy: { highestTorchStreak: 'desc' },
        select: { nickname: true, highestTorchStreak: true }
    });

    return {
        detenteur: todayTorch ? { 
            id: todayTorch.userId,
            nickname: todayTorch.user.nickname, 
            currentTorchStreak: todayTorch.user.currentTorchStreak,
            claimedAt: todayTorch.createdAt 
        } : null,
        gardien: gardien
    };
}
