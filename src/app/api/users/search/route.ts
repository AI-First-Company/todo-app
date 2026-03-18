import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json([]);
  const users = await prisma.user.findMany({
    where: { email: { contains: q, mode: "insensitive" }, id: { not: session.user.id } },
    select: { id: true, email: true, name: true }, take: 5,
  });
  return NextResponse.json(users);
}
