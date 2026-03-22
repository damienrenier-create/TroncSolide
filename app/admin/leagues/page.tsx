import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminLeaguesClient from "@/components/admin/AdminLeaguesClient";

export default async function AdminLeaguesPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "MODERATOR") {
        redirect("/");
    }

    const leagues = await prisma.league.findMany({
        orderBy: { createdAt: "desc" }
    });

    return <AdminLeaguesClient initialLeagues={leagues} />;
}
