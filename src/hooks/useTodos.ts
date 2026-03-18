"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo } from "@/types/todo";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load todos from API on mount; fall back to localStorage if API is unavailable
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/todos");
        if (res.ok) {
          const data: Todo[] = await res.json();
          // If API store is empty, seed from localStorage
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
        // fallback to localStorage
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

  // Mirror to localStorage for offline resilience
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
      dueDate?: string
    ) => {
      try {
        const res = await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, priority, category, dueDate }),
        });
        if (res.ok) {
          const todo: Todo = await res.json();
          setTodos((prev) => [todo, ...prev]);
          return;
        }
      } catch {
        // fallback: optimistic local add
      }
      const todo: Todo = {
        id: crypto.randomUUID(),
        title: title.trim(),
        completed: false,
        priority,
        category,
        dueDate,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
      };
      setTodos((prev) => [todo, ...prev]);
    },
    []
  );

  const toggleTodo = useCallback(async (id: string) => {
    setTodos((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
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
    async (
      id: string,
      title: string,
      priority: Todo["priority"],
      category?: Todo["category"],
      dueDate?: string
    ) => {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, title: title.trim(), priority, category, dueDate } : t
        )
      );
      fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), priority, category, dueDate }),
      }).catch(() => {});
    },
    []
  );


  const reorderTodos = useCallback(async (fromIndex: number, toIndex: number) => {
    setTodos((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const reordered = updated.map((t, i) => ({ ...t, sortOrder: i }));
      const orderedIds = reordered.map((t) => t.id);
      fetch("/api/todos/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      }).catch(() => {});
      return reordered;
    });
  }, []);

  const clearCompleted = useCallback(async () => {
    setTodos((prev) => {
      const toDelete = prev.filter((t) => t.completed);
      toDelete.forEach((t) => {
        fetch(`/api/todos/${t.id}`, { method: "DELETE" }).catch(() => {});
      });
      return prev.filter((t) => !t.completed);
    });
  }, []);

  return {
    todos,
    hydrated,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reorderTodos,
    clearCompleted,
  };
}
