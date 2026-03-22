import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            leagueId: string;
            role: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        leagueId: string;
        role: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        leagueId: string;
        role: string;
    }
}
