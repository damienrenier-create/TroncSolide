import { getLeagueEvolutionData, getLeagueStreakRankings, getLeagueInfo } from "@/lib/actions/league";
import LeagueRankingsClient from "@/components/league/LeagueRankingsClient";

export const metadata = {
    title: "Classement & Évolution | Tronc Solide",
    description: "Suivez la progression et la régularité des membres de votre ligue.",
};

export default async function LeagueRankingsPage() {
    const [evolutionData, streakRankings, leagueInfo] = await Promise.all([
        getLeagueEvolutionData(),
        getLeagueStreakRankings(),
        getLeagueInfo()
    ]);

    return (
        <LeagueRankingsClient 
            evolutionData={evolutionData} 
            streakRankings={streakRankings}
            leagueInfo={leagueInfo}
        />
    );
}
