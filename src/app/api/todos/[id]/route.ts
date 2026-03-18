import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { title, completed, priority, category, dueDate, archived } = await request.json();

  const data: Record<string, unknown> = { title, completed, priority, category, dueDate };
  if (typeof archived === "boolean") {
    data.archived = archived;
    data.archivedAt = archived ? new Date() : null;
  }

  try {
    const todo = await prisma.todo.update({
      where: { id, userId: session.user.id },
      data,
    });
    return NextResponse.json(todo);
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
