import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, subtaskId } = await params;

  const todo = await prisma.todo.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, completed } = body;

  try {
    const subtask = await prisma.subtask.update({
      where: { id: subtaskId, todoId: id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(completed !== undefined && { completed }),
      },
    });
    return NextResponse.json(subtask);
  } catch {
    return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, subtaskId } = await params;

  const todo = await prisma.todo.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  try {
    await prisma.subtask.delete({
      where: { id: subtaskId, todoId: id },
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
  }
}
