import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getLeagueRankings, getLeagueRecords, getTop3AbsoluteRecords } from "@/lib/actions/record";
import { getFeedItems } from "@/lib/actions/social";
import { getRecentMessages } from "@/lib/actions/messages";
import LeagueClient from "@/components/league/LeagueClient";
import { ExerciseType, RecordType, RecordTimeframe } from "@prisma/client";

export default async function LeaguePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { league: { select: { id: true, name: true } } }
    });

    if (!user?.league) return (
        <div className="container dashboard-container" style={{ textAlign: "center", marginTop: "4rem" }}>
            <p>Panthéon introuvable ou session obsolète.</p>
            <a href="/api/auth/signout" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>Se déconnecter</a>
        </div>
    );

    const [initialRankings, initialFeedItems, allRecords, top3AbsoluteRecords, trendData, messages] = await Promise.all([
        getLeagueRankings(user.league.id, "VENTRAL", "VOLUME", "DAY"),
        getFeedItems(user.league.id),
        getLeagueRecords(user.league.id),
        getTop3AbsoluteRecords(user.league.id),
        import("@/lib/actions/history").then(m => m.getLeagueXPTrends(user!.league.id)),
        getRecentMessages(user.league.id)
    ]);

    async function handleFilterChangeAction(exercise: ExerciseType, type: RecordType, timeframe: RecordTimeframe) {
        "use server"
        return getLeagueRankings(user!.league.id, exercise, type, timeframe);
    }

    return (
        <LeagueClient
            leagueName={user.league.name}
            currentUserId={session.user.id}
            initialRankings={initialRankings}
            initialFeedItems={initialFeedItems}
            allRecords={allRecords as any}
            top3AbsoluteRecords={top3AbsoluteRecords}
            trendData={trendData}
            messages={messages}
            onFilterChange={handleFilterChangeAction}
        />
    );
}
