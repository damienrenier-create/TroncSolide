import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { User, Award } from "lucide-react";

export default async function PublicProfilePage(props: { params: Promise<{ userId: string }> }) {
    const { userId } = await props.params;
    
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            badges: {
                include: { badge: true },
                orderBy: { awardedAt: 'desc' },
                take: 6
            }
        }
    });

    if (!user) notFound();

    return (
        <div className="container dashboard-container">
            <header className="hero-card glass" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "white" }}>
                    <User size={40} />
                </div>
                <h1 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "0.5rem" }}>@{user.nickname}</h1>
                <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--primary)" }}>{user.totalXP}</div>
                        <div style={{ fontSize: "0.7rem", fontWeight: "800", opacity: 0.6, textTransform: "uppercase" }}>XP TOTAL</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--secondary)" }}>{user.level}</div>
                        <div style={{ fontSize: "0.7rem", fontWeight: "800", opacity: 0.6, textTransform: "uppercase" }}>NIVEAU</div>
                    </div>
                </div>
            </header>

            <section style={{ marginTop: "2rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Award size={20} className="text-secondary" />
                    Dernières Prouesses
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" }}>
                    {user.badges.map((ub) => (
                        <div key={ub.id} className="glass" style={{ padding: "1rem", textAlign: "center", borderRadius: "20px" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{ub.badge.icon}</div>
                            <div style={{ fontSize: "0.75rem", fontWeight: "800" }}>{ub.badge.name}</div>
                        </div>
                    ))}
                    {user.badges.length === 0 && (
                        <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", padding: "2rem" }}>Pas encore de trophées à son actif.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
