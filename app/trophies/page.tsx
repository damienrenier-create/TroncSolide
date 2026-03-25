import { getTrophiesRoomData } from "@/lib/actions/gamification";
import TrophiesClient from "@/components/badges/TrophiesClient";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Salle des Trophées | Tronc Solide",
    description: "Visualisez vos exploits et les records à battre.",
};

export default async function TrophiesRoomPage() {
    const data = await getTrophiesRoomData();

    if (!data) {
        redirect("/login");
    }

    return (
        <div className="container dashboard-container">
            <header className="hero-header" style={{ marginBottom: "1.5rem" }}>
                <h1 className="log-title">Salle des Trophées 🏛️</h1>
                <p className="log-subtitle">Tes vitrines d'exploits et les records à conquérir.</p>
            </header>

            <TrophiesClient 
                initialBadges={data.badges} 
                userStats={data.userStats} 
            />
        </div>
    );
}
