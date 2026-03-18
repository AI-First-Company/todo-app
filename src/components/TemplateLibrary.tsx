"use client";

import { useState } from "react";
import { Template, Category, Priority } from "@/types/todo";

const CATEGORIES: Category[] = ["Work", "Personal", "Shopping", "Health", "Other"];

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "🟢 Low",
  medium: "🟡 Medium",
  high: "🔴 High",
};

interface TemplateLibraryProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
  onAddTemplate: (name: string, title: string, priority: Priority, category?: Category) => Promise<Template | null>;
  onDeleteTemplate: (id: string) => void;
}

export default function TemplateLibrary({ templates, onUseTemplate, onAddTemplate, onDeleteTemplate }: TemplateLibraryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category | "">("");

  const [error, setError] = useState("");

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;
    setError("");
    const result = await onAddTemplate(name.trim(), title.trim(), priority, category || undefined);
    if (result) {
      setName("");
      setTitle("");
      setPriority("medium");
      setCategory("");
      setShowForm(false);
    } else {
      setError("Failed to save template. Please try again.");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
      >
        📋 Templates
        {templates.length > 0 && (
          <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs px-1.5 py-0.5 rounded-full">
            {templates.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Template Library</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setShowForm(!showForm)}
                className="text-xs px-2 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                {showForm ? "Cancel" : "+ New"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs px-2 py-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleSaveTemplate} className="p-3 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template name (e.g. Weekly Review)"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Todo title (e.g. Complete weekly review)"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex gap-2">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category | "")}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">No category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={!name.trim() || !title.trim()}
                className="px-3 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save Template
              </button>
            </form>
          )}

          <div className="max-h-64 overflow-y-auto">
            {templates.length === 0 ? (
              <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">
                No templates yet. Create one to quickly add common tasks.
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-750 border-b border-gray-50 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {template.title}
                      {template.category && (
                        <span className="ml-1 text-indigo-500">· {template.category}</span>
                      )}
                      <span className="ml-1">· {PRIORITY_LABELS[template.priority]}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => { onUseTemplate(template); setIsOpen(false); }}
                      className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    >
                      + Add
                    </button>
                    <button
                      onClick={() => onDeleteTemplate(template.id)}
                      className="text-xs px-1.5 py-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
