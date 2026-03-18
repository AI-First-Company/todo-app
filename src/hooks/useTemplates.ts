"use client";

import { useState, useEffect, useCallback } from "react";
import { Template } from "@/types/todo";

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          setTemplates(await res.json());
        }
      } catch {
        // silently fail - templates are non-critical
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const addTemplate = useCallback(
    async (
      name: string,
      title: string,
      priority: Template["priority"],
      category?: Template["category"]
    ): Promise<Template | null> => {
      try {
        const res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, title, priority, category }),
        });
        if (res.ok) {
          const template: Template = await res.json();
          setTemplates((prev) => [template, ...prev]);
          return template;
        }
      } catch {
        // network error
      }
      return null;
    },
    []
  );

  const deleteTemplate = useCallback(async (id: string) => {
    let previous: Template[] = [];
    setTemplates((prev) => {
      previous = prev;
      return prev.filter((t) => t.id !== id);
    });
    try {
      const res = await fetch("/api/templates/" + id, { method: "DELETE" });
      if (!res.ok) setTemplates(previous);
    } catch {
      setTemplates(previous);
    }
  }, []);

  return { templates, loaded, addTemplate, deleteTemplate };
}
