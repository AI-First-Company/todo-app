import { NextRequest, NextResponse } from "next/server";
import { updateTodo, deleteTodo } from "../store";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = updateTodo(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteTodo(id);
  if (!deleted) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
