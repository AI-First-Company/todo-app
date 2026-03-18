"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo, RecurrencePattern } from "@/types/todo";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [archivedTodos, setArchivedTodos] = useState<Todo[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/todos");
        if (res.ok) {
          const data: Todo[] = await res.json();
          if (data.length === 0 && typeof window !== "undefined") {
            const stored = localStorage.getItem("todos");
            if (stored) {
              const local: Todo[] = JSON.parse(stored);
              for (const todo of [...local].reverse()) {
                await fetch("/api/todos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(todo),
                });
              }
              setTodos(local);
              setHydrated(true);
              return;
            }
          }
          setTodos(data);
        }
      } catch {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("todos");
          if (stored) setTodos(JSON.parse(stored));
        }
      } finally {
        setHydrated(true);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, hydrated]);

  const addTodo = useCallback(
    async (
      title: string,
      priority: Todo["priority"],
      category?: Todo["category"],
      dueDate?: string,
      isRecurring?: boolean,
      recurrencePattern?: RecurrencePattern,
      recurrenceEndDate?: string
    ) => {
      try {
        const res = await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, priority, category, dueDate, isRecurring, recurrencePattern, recurrenceEndDate }),
        });
        if (res.ok) {
          const todo: Todo = await res.json();
          setTodos((prev) => [todo, ...prev]);
          return;
        }
      } catch { /* fallback */ }
      const todo: Todo = {
        id: crypto.randomUUID(),
        title: title.trim(),
        completed: false,
        priority,
        category,
        dueDate,
        createdAt: new Date().toISOString(),
        isRecurring,
        recurrencePattern,
        recurrenceEndDate,
      };
      setTodos((prev) => [todo, ...prev]);
    },
    []
  );

  const toggleTodo = useCallback(async (id: string) => {
    setTodos((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      const todo = updated.find((t) => t.id === id);
      if (todo) {
        fetch(`/api/todos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: todo.completed }),
        }).catch(() => {});
      }
      return updated;
    });
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/todos/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const editTodo = useCallback(
    async (id: string, title: string, priority: Todo["priority"], category?: Todo["category"], dueDate?: string) => {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: title.trim(), priority, category, dueDate } : t))
      );
      fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), priority, category, dueDate }),
      }).catch(() => {});
    },
    []
  );

  const loadArchivedTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos?archived=true");
      if (res.ok) {
        const data: Todo[] = await res.json();
        setArchivedTodos(data);
      }
    } catch { /* silently fail */ }
  }, []);

  const archiveTodo = useCallback(async (id: string) => {
    setTodos((prev) => {
      const todo = prev.find((t) => t.id === id);
      if (todo) {
        const archived = { ...todo, archived: true, archivedAt: new Date().toISOString() };
        setArchivedTodos((a) => [archived, ...a]);
      }
      return prev.filter((t) => t.id !== id);
    });
    fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: true }),
    }).catch(() => {});
  }, []);

  const restoreTodo = useCallback(async (id: string) => {
    setArchivedTodos((prev) => {
      const todo = prev.find((t) => t.id === id);
      if (todo) {
        const restored = { ...todo, archived: false, archivedAt: undefined };
        setTodos((t) => [restored, ...t]);
      }
      return prev.filter((t) => t.id !== id);
    });
    fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: false }),
    }).catch(() => {});
  }, []);

  const deleteArchivedTodo = useCallback(async (id: string) => {
    setArchivedTodos((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/todos/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const clearCompleted = useCallback(async () => {
    setTodos((prev) => {
      const toArchive = prev.filter((t) => t.completed);
      toArchive.forEach((t) => {
        const archived = { ...t, archived: true, archivedAt: new Date().toISOString() };
        setArchivedTodos((a) => [archived, ...a]);
        fetch(`/api/todos/${t.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: true }),
        }).catch(() => {});
      });
      return prev.filter((t) => !t.completed);
    });
  }, []);

  return {
    todos,
    archivedTodos,
    hydrated,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    archiveTodo,
    restoreTodo,
    deleteArchivedTodo,
    loadArchivedTodos,
    clearCompleted,
  };
}
