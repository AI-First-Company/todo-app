import { NextRequest, NextResponse } from "next/server";
import { getTodos, addTodo } from "./store";
import { Todo } from "@/types/todo";

export async function GET() {
  return NextResponse.json(getTodos());
}

export async function POST(request: NextRequest) {
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

  addTodo(todo);
  return NextResponse.json(todo, { status: 201 });
}
