import { Todo } from "@/types/todo";

// In-memory store for MVP (resets on server restart)
const todos: Todo[] = [];

export function getTodos(): Todo[] {
  return todos;
}

export function addTodo(todo: Todo): Todo {
  todos.unshift(todo);
  return todo;
}

export function updateTodo(id: string, patch: Partial<Todo>): Todo | null {
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  todos[idx] = { ...todos[idx], ...patch };
  return todos[idx];
}

export function deleteTodo(id: string): boolean {
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  todos.splice(idx, 1);
  return true;
}
