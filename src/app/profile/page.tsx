import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            certificates: {
                orderBy: { createdAt: 'desc' }
            },
            penalties: {
                orderBy: { date: 'desc' }
            },
            badges: {
                include: { badge: true }
            }
        }
    });

    if (!user) return (
        <div className="container dashboard-container" style={{ textAlign: "center", marginTop: "4rem" }}>
            <p>Utilisateur introuvable ou session obsolète.</p>
            <a href="/api/auth/signout" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>Se déconnecter</a>
        </div>
    );

    return <ProfileClient user={user} />;
}
