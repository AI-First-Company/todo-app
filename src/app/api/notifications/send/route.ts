import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

function verifySecret(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const expected = "Bearer " + secret;
  if (!header || header.length !== expected.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(header),
    Buffer.from(expected),
  );
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const prefs = await prisma.notificationPreference.findMany({ where: { enabled: true } });

  if (prefs.length === 0) {
    return NextResponse.json({ sent: 0, checkedUsers: 0 });
  }

  const userIds = prefs.map((p) => p.userId);

  const allTodos = await prisma.todo.findMany({
    where: { userId: { in: userIds }, completed: false, dueDate: { not: null } },
  });

  const todosByUser = new Map<string, typeof allTodos>();
  for (const todo of allTodos) {
    const list = todosByUser.get(todo.userId!) ?? [];
    list.push(todo);
    todosByUser.set(todo.userId!, list);
  }

  const existingSent = await prisma.sentNotification.findMany({
    where: {
      todoId: { in: allTodos.map((t) => t.id) },
    },
  });
  const alreadySent = new Set(existingSent.map((s) => s.todoId + ":" + s.timing));

  let sent = 0;
  const notificationsToCreate: { todoId: string; userId: string; timing: string }[] = [];

  for (const pref of prefs) {
    const todos = todosByUser.get(pref.userId) ?? [];
    for (const todo of todos) {
      if (!todo.dueDate) continue;
      const dueDate = new Date(todo.dueDate + "T00:00:00");
      const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      for (const timing of pref.remindAt) {
        const key = todo.id + ":" + timing;
        if (alreadySent.has(key)) continue;

        let shouldNotify = false;
        if (timing === "1_hour_before" && diffHours > 0 && diffHours <= 1) shouldNotify = true;
        else if (timing === "1_day_before" && diffHours > 0 && diffHours <= 24) shouldNotify = true;
        else if (timing === "3_days_before" && diffHours > 0 && diffHours <= 72) shouldNotify = true;

        if (shouldNotify) {
          try {
            await sendReminderEmail({ to: pref.emailAddress, todoTitle: todo.title, dueDate: todo.dueDate, reminderType: timing });
            notificationsToCreate.push({ todoId: todo.id, userId: pref.userId, timing });
            sent++;
          } catch (err) {
            console.error("Failed to send reminder for todo " + todo.id + ":", err);
          }
        }
      }
    }
    await prisma.notificationPreference.update({ where: { id: pref.id }, data: { lastNotifiedAt: now } });
  }

  if (notificationsToCreate.length > 0) {
    await prisma.sentNotification.createMany({ data: notificationsToCreate });
  }

  return NextResponse.json({ sent, checkedUsers: prefs.length });
}
