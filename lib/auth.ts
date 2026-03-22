import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) return null;

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) return null;

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
                token.email = user.email;
            }
            // Admin Twin Session Override Tunnel
            if (trigger === "update" && session?.overrideId) {
                if (token.email === "damienrenier@hotmail.com" || token.email === "damienrenier+clone@hotmail.com") {
                    token.sub = session.overrideId;
                    token.email = session.overrideId === "cmn2e73ds0001iesbmk6zfl5v" ? "damienrenier+clone@hotmail.com" : "damienrenier@hotmail.com";
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                // Adding leagueId to session for isolation
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub as string },
                    select: { leagueId: true, role: true },
                });
                if (dbUser) {
                    session.user.leagueId = dbUser.leagueId;
                    session.user.role = dbUser.role;
                    session.user.email = token.email as string;
                }
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
