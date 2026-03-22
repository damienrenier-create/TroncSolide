import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SquareClient from "@/components/square/SquareClient";
import { getTorchStatus } from "@/lib/actions/torch";
import { getRecentMessages } from "@/lib/actions/messages";
import { getActiveEvents } from "@/lib/actions/events";
import { getDailyTarget } from "@/lib/actions/exercise";

export default async function SquarePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.leagueId) {
        redirect("/login");
    }

    const league = await prisma.league.findUnique({
        where: { id: session.user.leagueId },
        select: { name: true, accessCode: true }
    });
    
    if (!league) redirect("/");

    const torchData = await getTorchStatus(session.user.leagueId);
    const messages = await getRecentMessages(session.user.leagueId);
    const activeEvent = await getActiveEvents(session.user.leagueId);
    const dailyTarget = await getDailyTarget(session.user.id);

    return (
        <SquareClient 
            league={league} 
            torch={torchData} 
            messages={messages} 
            activeEvent={activeEvent}
            dailyTarget={dailyTarget}
            currentUser={session.user}
        />
    );
}
