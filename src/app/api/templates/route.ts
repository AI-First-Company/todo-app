import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Priority, Category } from "@/types/todo";

const VALID_PRIORITIES: Priority[] = ["low", "medium", "high"];
const VALID_CATEGORIES: Category[] = ["Work", "Personal", "Shopping", "Health", "Other"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const templates = await prisma.template.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { name, title, priority, category } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (name.trim().length > 200) {
    return NextResponse.json({ error: "name must be 200 characters or fewer" }, { status: 400 });
  }
  if (title.trim().length > 200) {
    return NextResponse.json({ error: "title must be 200 characters or fewer" }, { status: 400 });
  }

  const resolvedPriority = priority ?? "medium";
  if (!VALID_PRIORITIES.includes(resolvedPriority)) {
    return NextResponse.json(
      { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}` },
      { status: 400 }
    );
  }

  if (category != null && !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  const template = await prisma.template.create({
    data: {
      name: name.trim(),
      title: title.trim(),
      priority: resolvedPriority,
      category: category ?? null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
