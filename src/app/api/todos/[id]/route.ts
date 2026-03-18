import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function getNextDueDate(currentDueDate: string | null, pattern: string): string {
  const base = currentDueDate ? new Date(currentDueDate) : new Date();
  switch (pattern) {
    case "daily":
      base.setDate(base.getDate() + 1);
      break;
    case "weekly":
      base.setDate(base.getDate() + 7);
      break;
    case "monthly":
      base.setMonth(base.getMonth() + 1);
      break;
    default:
      base.setDate(base.getDate() + 1);
  }
  return base.toISOString().split("T")[0];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { title, completed, priority, category, dueDate, isRecurring, recurrencePattern, recurrenceEndDate } = await request.json();

  try {
    const existing = await prisma.todo.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const todo = await prisma.todo.update({
      where: { id, userId: session.user.id },
      data: { title, completed, priority, category, dueDate, isRecurring, recurrencePattern, recurrenceEndDate },
    });

    let nextTodo = null;
    if (completed && !existing.completed && existing.isRecurring && existing.recurrencePattern) {
      const nextDueDate = getNextDueDate(existing.dueDate, existing.recurrencePattern);
      const shouldCreate = !existing.recurrenceEndDate || nextDueDate <= existing.recurrenceEndDate;

      if (shouldCreate) {
        nextTodo = await prisma.todo.create({
          data: {
            title: existing.title,
            completed: false,
            priority: existing.priority,
            category: existing.category,
            dueDate: nextDueDate,
            userId: existing.userId,
            isRecurring: true,
            recurrencePattern: existing.recurrencePattern,
            recurrenceEndDate: existing.recurrenceEndDate,
            parentTodoId: existing.parentTodoId ?? existing.id,
          },
        });
      }
    }

    return NextResponse.json({ todo, nextTodo });
  } catch {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    await prisma.todo.delete({ where: { id, userId: session.user.id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
}
