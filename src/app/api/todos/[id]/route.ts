import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateTodo, deleteTodo } from "../store";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const updated = updateTodo(id, body, session.user.id);
  if (!updated) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
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
  const deleted = deleteTodo(id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
