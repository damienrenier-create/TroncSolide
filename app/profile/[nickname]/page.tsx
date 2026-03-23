import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPublicProfile } from "@/lib/actions/profile";
import PublicProfileClient from "@/components/profile/PublicProfileClient";

export default async function PublicProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const awaitedParams = await params;
    const decodedNickname = decodeURIComponent(awaitedParams.nickname);
    const profileData = await getPublicProfile(decodedNickname);

    if (!profileData) {
        return (
            <div className="container dashboard-container" style={{ textAlign: "center", marginTop: "4rem" }}>
                <div className="glass-premium" style={{ padding: "3rem", borderRadius: "32px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>🕵️‍♂️</div>
                    <h2 style={{ fontWeight: 900, marginBottom: "0.5rem" }}>Profil Introuvable</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "2rem" }}>
                        Ce joueur n'existe pas ou n'appartient pas à ta ligue.
                    </p>
                    <a href="/league" className="btn-primary" style={{ display: "inline-block", fontSize: "0.85rem" }}>
                        Retour au Classement
                    </a>
                </div>
            </div>
        );
    }

    // Redirect to personal profile if clicking on oneself
    if (profileData.id === session.user.id) {
        redirect("/profile");
    }

    return <PublicProfileClient profile={profileData} />;
}
