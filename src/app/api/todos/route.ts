import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { subtasks: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, priority, category, dueDate } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const todo = await prisma.todo.create({
    data: {
      title: title.trim(),
      completed: false,
      priority: priority ?? "medium",
      category: category ?? null,
      dueDate: dueDate ?? null,
      userId: session.user.id,
    },
    include: { subtasks: true },
  });

  return NextResponse.json(todo, { status: 201 });
}
