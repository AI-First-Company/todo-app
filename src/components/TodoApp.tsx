"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTodos } from "@/hooks/useTodos";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AddTodoForm, { AddTodoFormHandle } from "./AddTodoForm";
import TodoItem from "./TodoItem";
import ThemeToggle from "./ThemeToggle";
import { Todo, Category } from "@/types/todo";

type FilterType = "all" | "active" | "completed";
const CATEGORIES: Category[] = ["Work", "Personal", "Shopping", "Health", "Other"];
const CATEGORY_ICONS: Record<Category, string> = { Work: "💼", Personal: "👤", Shopping: "🛒", Health: "❤️", Other: "📌" };
const SHORTCUT_HINTS = [
  { key: "N", action: "New todo" }, { key: "/", action: "Search" }, { key: "↑↓", action: "Navigate" },
  { key: "Space", action: "Complete" }, { key: "E", action: "Edit" }, { key: "D", action: "Delete" }, { key: "Esc", action: "Clear" },
];

export default function TodoApp() {
  const { data: session } = useSession();
  const { todos, hydrated, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted } = useTodos();
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const addFormRef = useRef<AddTodoFormHandle>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTodos = useMemo(() => {
    return todos
      .filter((t) => {
        const statusMatch = filter === "active" ? !t.completed : filter === "completed" ? t.completed : true;
        const categoryMatch = categoryFilter === "all" || t.category === categoryFilter;
        const searchMatch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return statusMatch && categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && b.dueDate) { const diff = a.dueDate.localeCompare(b.dueDate); if (diff !== 0) return diff; }
        return b.createdAt - a.createdAt;
      });
  }, [todos, filter, categoryFilter, searchQuery]);

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;
  const selectedTodo = selectedIndex >= 0 && selectedIndex < filteredTodos.length ? filteredTodos[selectedIndex] : null;

  const handleNewTodo = useCallback(() => { addFormRef.current?.focusInput(); setSelectedIndex(-1); setEditingTodoId(null); }, []);
  const handleDelete = useCallback(() => { if (selectedTodo) { deleteTodo(selectedTodo.id); setSelectedIndex((prev) => Math.min(prev, filteredTodos.length - 2)); setEditingTodoId(null); } }, [selectedTodo, deleteTodo, filteredTodos.length]);
  const handleEdit = useCallback(() => { if (selectedTodo) setEditingTodoId(selectedTodo.id); }, [selectedTodo]);
  const handleSearch = useCallback(() => { searchInputRef.current?.focus(); setSelectedIndex(-1); setEditingTodoId(null); }, []);
  const handleToggleComplete = useCallback(() => { if (selectedTodo) toggleTodo(selectedTodo.id); }, [selectedTodo, toggleTodo]);
  const handleMoveUp = useCallback(() => { setEditingTodoId(null); setSelectedIndex((prev) => { if (filteredTodos.length === 0) return -1; if (prev <= 0) return filteredTodos.length - 1; return prev - 1; }); }, [filteredTodos.length]);
  const handleMoveDown = useCallback(() => { setEditingTodoId(null); setSelectedIndex((prev) => { if (filteredTodos.length === 0) return -1; if (prev >= filteredTodos.length - 1) return 0; return prev + 1; }); }, [filteredTodos.length]);
  const handleEscape = useCallback(() => { setSelectedIndex(-1); setEditingTodoId(null); setSearchQuery(""); if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); }, []);

  useKeyboardShortcuts({ onNewTodo: handleNewTodo, onDelete: handleDelete, onEdit: handleEdit, onSearch: handleSearch, onToggleComplete: handleToggleComplete, onMoveUp: handleMoveUp, onMoveDown: handleMoveDown, onEscape: handleEscape });

  const filters: { label: string; value: FilterType }[] = [{ label: "All", value: "all" }, { label: "Active", value: "active" }, { label: "Completed", value: "completed" }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">✅ Todo App</h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {session?.user && (<><span className="text-sm text-gray-600 dark:text-gray-400">{session.user.name ?? session.user.email}</span><button onClick={() => signOut({ callbackUrl: "/login" })} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Sign out</button></>)}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your tasks, saved to your account</p>
        </div>

        <div className="mb-6"><AddTodoForm ref={addFormRef} onAdd={addTodo} /></div>

        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(-1); }} placeholder='Search todos... (press "/" to focus)' className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm text-sm" />
            {searchQuery && (<button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>)}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {filters.map(({ label, value }) => (<button key={value} onClick={() => setFilter(value)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === value ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>{label}</button>))}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">{activeCount} left</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setCategoryFilter("all")} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === "all" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>📂 All</button>
            {CATEGORIES.map((cat) => (<button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>{CATEGORY_ICONS[cat]} {cat}</button>))}
          </div>
        </div>

        {!hydrated ? (<div className="text-center py-16 text-gray-400">Loading…</div>)
        : filteredTodos.length === 0 ? (<div className="text-center py-16"><p className="text-gray-400 text-sm">{searchQuery ? "No todos match your search." : filter === "completed" ? "No completed todos yet." : filter === "active" ? "Nothing left to do!" : "Add your first todo above!"}</p></div>)
        : (<div className="flex flex-col gap-2">
            {filteredTodos.map((todo: Todo, index: number) => (
              <div key={todo.id} className="todo-item-enter cursor-pointer" onClick={() => { setSelectedIndex(index); setEditingTodoId(null); }}>
                <TodoItem todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} onEdit={editTodo} isSelected={index === selectedIndex} autoEdit={todo.id === editingTodoId} />
              </div>
            ))}
          </div>
        )}

        {completedCount > 0 && (<div className="mt-4 flex justify-end"><button onClick={clearCompleted} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear completed ({completedCount})</button></div>)}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SHORTCUT_HINTS.map(({ key, action }) => (<span key={key} className="text-xs text-gray-400 dark:text-gray-500"><kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-gray-500 dark:text-gray-400">{key}</kbd>{" "}{action}</span>))}
        </div>
      </div>
    </div>
  );
}
