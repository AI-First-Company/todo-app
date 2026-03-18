import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const todo = await prisma.todo.findFirst({ where: { id, userId: session.user.id } });
  if (!todo) return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  const shares = await prisma.todoShare.findMany({ where: { todoId: id }, include: { sharedWith: { select: { email: true, name: true } } } });
  return NextResponse.json(shares.map((s) => ({ id: s.id, sharedWithEmail: s.sharedWith.email, sharedWithName: s.sharedWith.name, permission: s.permission })));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { email, permission } = await request.json();
  if (!email || typeof email !== "string") return NextResponse.json({ error: "email is required" }, { status: 400 });
  if (permission && !["view", "edit"].includes(permission)) return NextResponse.json({ error: "permission must be 'view' or 'edit'" }, { status: 400 });
  const todo = await prisma.todo.findFirst({ where: { id, userId: session.user.id } });
  if (!todo) return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (targetUser.id === session.user.id) return NextResponse.json({ error: "Cannot share with yourself" }, { status: 400 });
  const share = await prisma.todoShare.upsert({
    where: { todoId_sharedWithUserId: { todoId: id, sharedWithUserId: targetUser.id } },
    update: { permission: permission ?? "view" },
    create: { todoId: id, sharedByUserId: session.user.id, sharedWithUserId: targetUser.id, permission: permission ?? "view" },
    include: { sharedWith: { select: { email: true, name: true } } },
  });
  return NextResponse.json({ id: share.id, sharedWithEmail: share.sharedWith.email, sharedWithName: share.sharedWith.name, permission: share.permission }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { shareId } = await request.json();
  if (!shareId) return NextResponse.json({ error: "shareId is required" }, { status: 400 });
  const todo = await prisma.todo.findFirst({ where: { id, userId: session.user.id } });
  if (!todo) return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  try { await prisma.todoShare.delete({ where: { id: shareId, todoId: id } }); return new NextResponse(null, { status: 204 }); }
  catch { return NextResponse.json({ error: "Share not found" }, { status: 404 }); }
}
