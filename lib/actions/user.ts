"use server"

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markOnboardingAsSeen() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Non authentifié" };

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { hasSeenOnboarding: true }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error marking onboarding as seen:", error);
        return { success: false, error: "Erreur serveur" };
    }
}
