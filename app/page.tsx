import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDailyTarget, getTodayProgress } from "@/lib/actions/exercise";
import { getUserStats, getDailyInvoice } from "@/lib/actions/dashboard";
import { getTrophiesRoomData } from "@/lib/actions/gamification";
import { syncPenalties } from "@/lib/actions/economy";
import { getFeedItems } from "@/lib/actions/social";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { PushReminderPopup } from "@/components/social/PushReminderPopup";
import { getTorchStatus } from "@/lib/actions/torch";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Sync penalties on load (simple "cron" replacement)
  await syncPenalties();

  const stats = await getUserStats();

  if (!stats) return (
    <div className="container dashboard-container" style={{ textAlign: "center", marginTop: "4rem" }}>
      <p>Session obsolète ou utilisateur introuvable.</p>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "1rem" }}>
        Veuillez vous déconnecter et vous reconnecter pour synchroniser votre compte avec la nouvelle base de données.
      </p>
      <a href="/api/auth/signout" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>Se déconnecter</a>
    </div>
  );

  const [target, progress, trophiesData, feedItems, torchData, invoice] = await Promise.all([
    getDailyTarget(session.user.id),
    getTodayProgress(session.user.id),
    getTrophiesRoomData(),
    getFeedItems(stats.leagueId),
    getTorchStatus(stats.leagueId),
    getDailyInvoice()
  ]);

  return (
    <>
      <DashboardClient
        userId={session.user.id}
        initialTarget={target}
        initialProgress={progress}
        stats={stats}
        trophiesData={trophiesData}
        feedItems={feedItems}
        torchData={torchData}
        invoice={invoice}
      />
      <PushReminderPopup user={stats} />
    </>
  );
}
