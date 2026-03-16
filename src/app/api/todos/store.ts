import { Todo } from "@/types/todo";

// In-memory store scoped by userId for MVP
const todosByUser = new Map<string, Todo[]>();

function getStore(userId: string): Todo[] {
  if (!todosByUser.has(userId)) todosByUser.set(userId, []);
  return todosByUser.get(userId)!;
}

export function getTodos(userId: string): Todo[] {
  return getStore(userId);
}

export function addTodo(todo: Todo, userId: string): Todo {
  getStore(userId).unshift(todo);
  return todo;
}

export function updateTodo(
  id: string,
  patch: Partial<Todo>,
  userId: string
): Todo | null {
  const store = getStore(userId);
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  store[idx] = { ...store[idx], ...patch };
  return store[idx];
}

export function deleteTodo(id: string, userId: string): boolean {
  const store = getStore(userId);
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
