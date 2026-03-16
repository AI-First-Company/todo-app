"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo } from "@/types/todo";

function redirectToLogin() {
  window.location.href = "/login";
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load todos from API on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/todos");
        if (res.status === 401) {
          redirectToLogin();
          return;
        }
        if (res.ok) {
          const data: Todo[] = await res.json();
          setTodos(data);
        }
      } catch {
        // network error — leave empty
      } finally {
        setHydrated(true);
      }
    }
    load();
  }, []);

  const addTodo = useCallback(
    async (
      title: string,
      priority: Todo["priority"],
      category?: Todo["category"],
      dueDate?: string
    ) => {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority, category, dueDate }),
      });
      if (res.status === 401) {
        redirectToLogin();
        return;
      }
      if (res.ok) {
        const todo: Todo = await res.json();
        setTodos((prev) => [todo, ...prev]);
      }
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
        }).then((res) => {
          if (res.status === 401) redirectToLogin();
        }).catch(() => {});
      }
      return updated;
    });
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/todos/${id}`, { method: "DELETE" }).then((res) => {
      if (res.status === 401) redirectToLogin();
    }).catch(() => {});
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
      }).then((res) => {
        if (res.status === 401) redirectToLogin();
      }).catch(() => {});
    },
    []
  );

  const clearCompleted = useCallback(async () => {
    setTodos((prev) => {
      const toDelete = prev.filter((t) => t.completed);
      toDelete.forEach((t) => {
        fetch(`/api/todos/${t.id}`, { method: "DELETE" }).then((res) => {
          if (res.status === 401) redirectToLogin();
        }).catch(() => {});
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
    clearCompleted,
  };
}
