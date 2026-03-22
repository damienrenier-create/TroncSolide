import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPersonalStats } from "@/lib/actions/stats";
import StatsClient from "@/components/stats/StatsClient";

export default async function StatsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const data = await getPersonalStats(session.user.id);

    return (
        <StatsClient data={data} />
    );
}
