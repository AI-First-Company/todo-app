"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTodos } from "@/hooks/useTodos";
import AddTodoForm from "./AddTodoForm";
import TodoItem from "./TodoItem";
import ThemeToggle from "./ThemeToggle";
import { Todo, Category } from "@/types/todo";

type FilterType = "all" | "active" | "completed";

const CATEGORIES: Category[] = ["Work", "Personal", "Shopping", "Health", "Other"];

const CATEGORY_ICONS: Record<Category, string> = {
  Work: "💼",
  Personal: "👤",
  Shopping: "🛒",
  Health: "❤️",
  Other: "📌",
};

export default function TodoApp() {
  const { data: session } = useSession();
  const { todos, hydrated, addTodo, toggleTodo, deleteTodo, editTodo, reorderTodos, clearCompleted } =
    useTodos();
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const isDefaultView = filter === "all" && categoryFilter === "all";

  const filteredTodos = useMemo(() => {
    if (isDefaultView) return todos;
    return todos
      .filter((t) => {
        const statusMatch =
          filter === "active" ? !t.completed :
          filter === "completed" ? t.completed :
          true;
        const categoryMatch = categoryFilter === "all" || t.category === categoryFilter;
        return statusMatch && categoryMatch;
      })
      .sort((a, b) => {
        // Items with due dates come before items without
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        // Both have due dates: sort soonest first
        if (a.dueDate && b.dueDate) {
          const diff = a.dueDate.localeCompare(b.dueDate);
          if (diff !== 0) return diff;
        }
        // Fall back to creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [todos, filter, categoryFilter, isDefaultView]);

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;


  const handleDragStart = useCallback((index: number) => { setDragIndex(index); }, []);
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); }, []);
  const handleDrop = useCallback((dropIndex: number) => {
    if (dragIndex !== null && dragIndex !== dropIndex && isDefaultView) reorderTodos(dragIndex, dropIndex);
    setDragIndex(null); setDragOverIndex(null);
  }, [dragIndex, isDefaultView, reorderTodos]);
  const handleDragEnd = useCallback(() => { setDragIndex(null); setDragOverIndex(null); }, []);

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
              ✅ Todo App
            </h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {session?.user && (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {session.user.name ?? session.user.email}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your tasks, saved to your account
          </p>
        </div>

        {/* Add Form */}
        <div className="mb-6">
          <AddTodoForm onAdd={addTodo} />
        </div>

        {/* Filter Tabs + Stats */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {filters.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === value
                      ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {activeCount} left
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === "all"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              📂 All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        {!hydrated ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              {filter === "completed"
                ? "No completed todos yet."
                : filter === "active"
                ? "Nothing left to do!"
                : "Add your first todo above!"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {isDefaultView && filteredTodos.length > 1 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Drag to reorder your todos</p>
            )}
            {filteredTodos.map((todo: Todo, index: number) => (
              <div key={todo.id} className={`todo-item-enter transition-all ${dragIndex === index ? "opacity-50 scale-95" : ""} ${dragOverIndex === index && dragIndex !== index ? "border-t-2 border-indigo-400 pt-1" : ""}`} draggable={isDefaultView} onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDrop={() => handleDrop(index)} onDragEnd={handleDragEnd}>
                <TodoItem
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                  isDraggable={isDefaultView}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        {completedCount > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearCompleted}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear completed ({completedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
