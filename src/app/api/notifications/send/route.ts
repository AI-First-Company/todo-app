import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const prefs = await prisma.notificationPreference.findMany({
    where: { enabled: true },
  });

  let sent = 0;

  for (const pref of prefs) {
    const todos = await prisma.todo.findMany({
      where: {
        userId: pref.userId,
        completed: false,
        dueDate: { not: null },
      },
    });

    for (const todo of todos) {
      if (!todo.dueDate) continue;

      const dueDate = new Date(todo.dueDate + "T00:00:00");
      const diffMs = dueDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      for (const timing of pref.remindAt) {
        let shouldNotify = false;

        if (timing === "1_hour_before" && diffHours > 0 && diffHours <= 1) {
          shouldNotify = true;
        } else if (timing === "1_day_before" && diffHours > 0 && diffHours <= 24) {
          shouldNotify = true;
        } else if (timing === "3_days_before" && diffHours > 0 && diffHours <= 72) {
          shouldNotify = true;
        }

        if (shouldNotify) {
          try {
            await sendReminderEmail({
              to: pref.emailAddress,
              todoTitle: todo.title,
              dueDate: todo.dueDate,
              reminderType: timing,
            });
            sent++;
          } catch (err) {
            console.error(`Failed to send reminder for todo ${todo.id}:`, err);
          }
        }
      }
    }

    await prisma.notificationPreference.update({
      where: { id: pref.id },
      data: { lastNotifiedAt: now },
    });
  }

  return NextResponse.json({ sent, checkedUsers: prefs.length });
}
