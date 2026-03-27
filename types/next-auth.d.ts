import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            leagueId: string;
            role: string;
            birthday?: Date;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        leagueId: string;
        role: string;
        birthday?: Date;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        leagueId: string;
        role: string;
    }
}
