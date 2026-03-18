"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo, RecurrencePattern } from "@/types/todo";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
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
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.nextTodo) {
              setTodos((prev) => [data.nextTodo, ...prev]);
            }
          })
          .catch(() => {});
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

  
  const updateNotes = useCallback(
    async (id: string, notes: string) => {
      const trimmedNotes = notes.trim() || undefined;
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, notes: trimmedNotes } : t
        )
      );
      fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: trimmedNotes ?? null }),
      }).catch(() => {});
    },
    []
  );

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
    updateNotes,
    clearCompleted,
  };
}
