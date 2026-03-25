import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDailyTarget, getTodayProgress } from "@/lib/actions/exercise";
import { getUserStats } from "@/lib/actions/dashboard";
import { getTrophiesRoomData } from "@/lib/actions/gamification";
import { syncPenalties } from "@/lib/actions/economy";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Sync penalties on load (simple "cron" replacement)
  await syncPenalties();

  const [target, progress, stats, trophiesData] = await Promise.all([
    getDailyTarget(session.user.id),
    getTodayProgress(session.user.id),
    getUserStats(),
    getTrophiesRoomData()
  ]);

  if (!stats) return (
    <div className="container dashboard-container" style={{ textAlign: "center", marginTop: "4rem" }}>
      <p>Session obsolète ou utilisateur introuvable.</p>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "1rem" }}>
        Veuillez vous déconnecter et vous reconnecter pour synchroniser votre compte avec la nouvelle base de données.
      </p>
      <a href="/api/auth/signout" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>Se déconnecter</a>
    </div>
  );

  return (
    <DashboardClient
      userId={session.user.id}
      initialTarget={target}
      initialProgress={progress}
      stats={stats}
      trophiesData={trophiesData}
    />
  );
}
