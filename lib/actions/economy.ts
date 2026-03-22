"use server"

import prisma from "@/lib/prisma";
import { startOfDay, subDays, isWithinInterval, eachDayOfInterval } from "date-fns";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


/**
 * Checks if a user is eligible for the Cagnotte.
 * Requirement: Daily target met for EVERY day in the last 21 days.
 * Medical certificates count as "met".
 */
export async function checkEligibility(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { inCagnotte: true, joinedAt: true, active: true }
    });

    if (!user || !user.active) return false;

    const today = startOfDay(new Date());
    const windowStart = subDays(today, 20); // 21 days including today

    // If user joined less than 21 days ago, they can't be eligible yet? 
    // Actually, the rule says "21 days complete on the last 21 days".
    // If they just joined, they haven't lived 21 days yet.
    if (user.joinedAt > windowStart) return false;

    const days = eachDayOfInterval({ start: windowStart, end: today });

    // Fetch all sessions in the window
    const sessions = await prisma.exerciseSession.findMany({
        where: {
            userId,
            type: "VENTRAL",
            date: { gte: windowStart, lte: today }
        }
    });

    // Fetch all medical certificates in the window
    const certificates = await prisma.medicalCertificate.findMany({
        where: {
            userId,
            OR: [
                { startDate: { lte: today }, endDate: { gte: windowStart } }
            ]
        }
    });

    for (const day of days) {
        const isMedical = certificates.some(cert =>
            isWithinInterval(day, { start: startOfDay(cert.startDate), end: startOfDay(cert.endDate) })
        );

        if (isMedical) continue;

        // Calculate target for that specific day
        // Target = 1s * (Days since signup + 1)
        const daysSinceSignup = Math.floor((day.getTime() - user.joinedAt.getTime()) / (1000 * 60 * 60 * 24));
        const targetValue = daysSinceSignup + 1;

        const dayValue = sessions
            .filter(s => startOfDay(s.date).getTime() === day.getTime())
            .reduce((acc, s) => acc + s.value, 0);

        if (dayValue < targetValue) return false;
    }

    return true;
}

/**
 * Generates penalties for missed days.
 */
export async function syncPenalties() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;
    const userId = session.user.id;

    // This should ideally run in a cron, but we can trigger it on dashboard load for the current user.
    // For every day since joinedAt until yesterday:
    // If (no session >= target) AND (no medical cert) AND (no existing penalty):
    // Create penalty (2.0)

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { joinedAt: true, active: true }
    });

    if (!user || !user.active) return;

    const yesterday = subDays(startOfDay(new Date()), 1);
    const startDate = startOfDay(user.joinedAt);

    if (startDate > yesterday) return;

    const days = eachDayOfInterval({ start: startDate, end: yesterday });

    // Performance: batch fetch everything
    const [sessions, certificates, existingPenalties] = await Promise.all([
        prisma.exerciseSession.findMany({ where: { userId, type: "VENTRAL" } }),
        prisma.medicalCertificate.findMany({ where: { userId } }),
        prisma.penalty.findMany({ where: { userId } })
    ]);

    const newPenalties = [];

    for (const day of days) {
        const hasPenalty = existingPenalties.some(p => startOfDay(p.date).getTime() === day.getTime());
        if (hasPenalty) continue;

        const isMedical = certificates.some(cert =>
            isWithinInterval(day, { start: startOfDay(cert.startDate), end: startOfDay(cert.endDate) })
        );
        if (isMedical) continue;

        const daysSinceSignup = Math.floor((day.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const targetValue = daysSinceSignup + 1;

        const dayValue = sessions
            .filter(s => startOfDay(s.date).getTime() === day.getTime())
            .reduce((acc, s) => acc + s.value, 0);

        if (dayValue < targetValue) {
            newPenalties.push({
                userId,
                amount: 2.0,
                date: day,
                status: "UNPAID"
            });
        }
    }

    if (newPenalties.length > 0) {
        await prisma.penalty.createMany({ data: newPenalties });
    }
}

export async function submitMedicalCertificate(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Non autorisé" };

    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const reason = formData.get("reason") as string;

    if (!session.user.id || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return { error: "Données invalides" };
    }

    try {
        await prisma.medicalCertificate.create({
            data: { userId: session.user.id, startDate, endDate, reason }
        });
        revalidatePath("/profile");
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de l'enregistrement" };
    }
}

export async function exitCagnotte() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Non autorisé" };

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { inCagnotte: false }
        });
        revalidatePath("/profile");
        revalidatePath("/");
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de la désinscription" };
    }
}
