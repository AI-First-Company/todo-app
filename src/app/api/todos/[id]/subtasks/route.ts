import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const todo = await prisma.todo.findFirst({
    where: { id, userId: session.user.id },
    include: { subtasks: { orderBy: { createdAt: "asc" } } },
  });

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json(todo.subtasks);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const todo = await prisma.todo.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const subtask = await prisma.subtask.create({
    data: {
      title: title.trim(),
      completed: false,
      todoId: id,
    },
  });

  return NextResponse.json(subtask, { status: 201 });
}
