import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTodos, addTodo } from "./store";
import { Todo } from "@/types/todo";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getTodos(session.user.id));
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

  const todo: Todo = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    priority: priority ?? "medium",
    category: category ?? undefined,
    dueDate: dueDate ?? undefined,
    createdAt: Date.now(),
  };

  addTodo(todo, session.user.id);
  return NextResponse.json(todo, { status: 201 });
}
