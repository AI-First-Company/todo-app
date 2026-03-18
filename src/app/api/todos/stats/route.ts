import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    select: {
      completed: true,
      createdAt: true,
      updatedAt: true,
      category: true,
      priority: true,
    },
  });

  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Completed todos grouped by date (using updatedAt as completion date)
  const completedByDate = new Map<string, number>();
  for (const todo of todos) {
    if (todo.completed) {
      const dateKey = todo.updatedAt.toISOString().split("T")[0];
      completedByDate.set(dateKey, (completedByDate.get(dateKey) ?? 0) + 1);
    }
  }

  // Streak: consecutive days (ending today or yesterday) with at least one completion
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const checkDate = new Date(today);
  const todayKey = checkDate.toISOString().split("T")[0];
  if (!completedByDate.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  while (true) {
    const key = checkDate.toISOString().split("T")[0];
    if (completedByDate.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Most productive days of the week
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  for (const todo of todos) {
    if (todo.completed) {
      dayTotals[todo.updatedAt.getDay()]++;
    }
  }
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const productiveDays = dayNames
    .map((name, i) => ({ day: name, count: dayTotals[i] }))
    .sort((a, b) => b.count - a.count)
    .filter((d) => d.count > 0);

  // Category breakdown
  const categoryMap = new Map<string, { total: number; completed: number }>();
  for (const todo of todos) {
    const cat = todo.category ?? "Uncategorized";
    const entry = categoryMap.get(cat) ?? { total: 0, completed: 0 };
    entry.total++;
    if (todo.completed) entry.completed++;
    categoryMap.set(cat, entry);
  }
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    ...stats,
  }));

  // Priority breakdown
  const priorityMap = new Map<string, { total: number; completed: number }>();
  for (const todo of todos) {
    const entry = priorityMap.get(todo.priority) ?? { total: 0, completed: 0 };
    entry.total++;
    if (todo.completed) entry.completed++;
    priorityMap.set(todo.priority, entry);
  }
  const priorityBreakdown = Array.from(priorityMap.entries()).map(([priority, stats]) => ({
    priority,
    ...stats,
  }));

  return NextResponse.json({
    total,
    completed,
    pending,
    completionRate,
    streak,
    productiveDays,
    categoryBreakdown,
    priorityBreakdown,
  });
}
