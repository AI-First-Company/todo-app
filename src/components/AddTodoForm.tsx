"use client";

import { useState, useRef, useEffect } from "react";
import { Todo, DEFAULT_CATEGORIES } from "@/types/todo";

interface AddTodoFormProps {
  onAdd: (
    title: string,
    priority: Todo["priority"],
    category?: Todo["category"],
    dueDate?: string
  ) => void;
  categories: string[];
}

export default function AddTodoForm({ onAdd, categories }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...categories])
  );

  const filteredCategories = category
    ? allCategories.filter((c) =>
        c.toLowerCase().includes(category.toLowerCase())
      )
    : allCategories;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, priority, category.trim() || undefined, dueDate || undefined);
    setTitle("");
    setPriority("medium");
    setCategory("");
    setDueDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Todo["priority"])}
          className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-xl shadow-sm hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative" ref={dropdownRef}>
          <input
            type="text"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Category (type or select)"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm text-sm"
          />
          {showDropdown && filteredCategories.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {filteredCategories.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm text-sm"
        />
      </div>
    </form>
  );
}
