
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import prisma from "@/lib/prisma";
import { getDailyTarget, getTodayProgress } from "@/lib/actions/exercise";

// Configure Web Push (Vercel env vars expected)
const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@tronc-solide.com";

if (PUBLIC_KEY && PRIVATE_KEY) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
}

export async function GET(req: NextRequest) {
  // Check for Cron Secret (Vercel standard)
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!PUBLIC_KEY || !PRIVATE_KEY) {
    console.warn("VAPID keys missing, skipping push reminders.");
    return NextResponse.json({ message: "VAPID key configuration missing" }, { status: 200 }); // Still 200 for cron health
  }

  try {
    // 1. Find users who enabled reminders
    const usersWithReminders = await prisma.user.findMany({
      where: { 
        pushReminderEnabled: true,
        active: true 
      },
      select: { id: true, nickname: true }
    });

    const results = [];

    // 2. Process each user
    for (const user of usersWithReminders) {
      const target = await getDailyTarget(user.id);
      const progress = await getTodayProgress(user.id);

      // Only remind if target not reached
      if (progress < target) {
        // Find their subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
          where: { userId: user.id }
        });

        for (const sub of subscriptions) {
          const pushConfig = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          try {
            await webpush.sendNotification(
              pushConfig,
              JSON.stringify({
                title: "Rappel Tronc Solide ! 💪",
                body: `${user.nickname}, il te manque encore des reps pour ton objectif du jour. Plus que quelques heures !`,
                url: "/"
              })
            );
          } catch (error: any) {
            // If subscription is 404 or 410, it's dead, clean it up
            if (error.statusCode === 410 || error.statusCode === 404) {
              await prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
            console.error(`Push failed for user ${user.id} at ${sub.endpoint}:`, error.message);
          }
        }
        results.push(user.id);
      }
    }

    return NextResponse.json({ success: true, usersNotifiedCount: results.length });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
