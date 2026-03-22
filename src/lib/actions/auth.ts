"use server"

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    nickname: z.string().min(2),
    birthday: z.string().transform((str) => new Date(str)),
    leagueCode: z.string().min(1),
});

export async function registerUser(formData: FormData) {
    const validatedFields = registerSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return { error: "Données invalides. Vérifiez vos champs." };
    }

    const { email, password, nickname, birthday, leagueCode } = validatedFields.data;

    // 1. Check if league exists
    const league = await prisma.league.findUnique({
        where: { accessCode: leagueCode },
    });

    if (!league) {
        return { error: "Code de ligue invalide. Demandez un code à votre modérateur." };
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: "Cet email est déjà utilisé." };
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Role logic: Check for the main moderator
    const role = email.toLowerCase() === "d.renier@sartay.be" ? "MODERATOR" : "USER";

    // 5. Create user
    try {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                nickname,
                birthday,
                leagueId: league.id,
                role: role,
            },
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Une erreur est survenue lors de l'inscription." };
    }
}
