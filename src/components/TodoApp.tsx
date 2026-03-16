"use client";

import { useMemo, useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import AddTodoForm from "./AddTodoForm";
import TodoItem from "./TodoItem";
import { Todo } from "@/types/todo";

type FilterType = "all" | "active" | "completed";

export default function TodoApp() {
  const { todos, hydrated, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted } =
    useTodos();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    });
  }, [todos, filter]);

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
            ✅ Todo App
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your tasks are saved in your browser
          </p>
        </div>

        {/* Add Form */}
        <div className="mb-6">
          <AddTodoForm onAdd={addTodo} />
        </div>

        {/* Filter Tabs + Stats */}
        <div className="flex items-center justify-between mb-4">
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

        {/* Todo List */}
        {!hydrated ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {filter === "completed"
                ? "No completed todos yet."
                : filter === "active"
                ? "Nothing left to do! 🎉"
                : "Add your first todo above!"}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filteredTodos.map((todo: Todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            ))}
          </ul>
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
