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
    ) => {
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
        // fallback: optimistic local add
      }
      const template: Template = {
        id: crypto.randomUUID(),
        name: name.trim(),
        title: title.trim(),
        priority,
        category,
        createdAt: new Date().toISOString(),
      };
      setTemplates((prev) => [template, ...prev]);
      return template;
    },
    []
  );

  const deleteTemplate = useCallback(async (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    fetch("/api/templates/" + id, { method: "DELETE" }).catch(() => {});
  }, []);

  return { templates, loaded, addTemplate, deleteTemplate };
}
