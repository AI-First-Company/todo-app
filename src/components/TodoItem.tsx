"use client";

import { useState, useRef, useEffect } from "react";
import { Todo, Category } from "@/types/todo";

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700",
  high: "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700",
};

const PRIORITY_ICONS: Record<string, string> = {
  low: "🟢",
  medium: "🟡",
  high: "🔴",
};

const PRIORITY_BORDER: Record<string, string> = {
  low: "",
  medium: "",
  high: "border-l-4 border-l-red-400 dark:border-l-red-500",
};

const RECURRENCE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const CATEGORIES: Category[] = ["Work", "Personal", "Shopping", "Health", "Other"];

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    title: string,
    priority: Todo["priority"],
    category?: Todo["category"],
    dueDate?: string
  ) => void;
  onShare?: (id: string) => void;
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function isDueToday(dueDate?: string): boolean {
  if (!dueDate) return false;
  return dueDate === new Date().toISOString().split("T")[0];
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onShare,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState<Todo["priority"]>(todo.priority);
  const [editCategory, setEditCategory] = useState<Todo["category"] | "">(todo.category ?? "");
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const saveEdit = () => {
    if (editTitle.trim()) {
      onEdit(todo.id, editTitle, editPriority, editCategory || undefined, editDueDate || undefined);
    } else {
      setEditTitle(todo.title);
      setEditPriority(todo.priority);
      setEditCategory(todo.category ?? "");
      setEditDueDate(todo.dueDate ?? "");
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
    setEditCategory(todo.category ?? "");
    setEditDueDate(todo.dueDate ?? "");
    setEditing(false);
  };

  const overdue = !todo.completed && isOverdue(todo.dueDate);
  const dueToday = !todo.completed && isDueToday(todo.dueDate);

  return (
    <li className={`flex items-start gap-3 p-4 rounded-xl shadow-sm border group transition-all hover:shadow-md ${
      overdue
        ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
    } ${PRIORITY_BORDER[todo.priority]}`}>
      <button
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.completed
            ? "bg-indigo-500 border-indigo-500 text-white"
            : "border-gray-300 hover:border-indigo-400"
        }`}
      >
        {todo.completed && (
          <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="w-full px-2 py-1 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex flex-wrap gap-2 items-center">
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Todo["priority"])} className="text-xs px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as Todo["category"] | "")} className="text-xs px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none">
                <option value="">No category</option>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="text-xs px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none" />
              <button onClick={saveEdit} className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Save</button>
              <button onClick={cancelEdit} className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium truncate ${
                todo.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100"
              }`}>{todo.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[todo.priority]}`}>
                {PRIORITY_ICONS[todo.priority]} {todo.priority}
              </span>
              {todo.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                  {todo.category}
                </span>
              )}
              {todo.isRecurring && todo.recurrencePattern && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800">
                  🔄 {RECURRENCE_LABELS[todo.recurrencePattern]}
                </span>
              )}
              {todo.isSharedWithMe && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700">
                  Shared by {todo.sharedByEmail}
                </span>
              )}
              {!todo.isSharedWithMe && todo.shares && todo.shares.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700">
                  Shared ({todo.shares.length})
                </span>
              )}
            </div>
            {todo.dueDate && (
              <span className={`text-xs ${
                overdue ? "text-red-600 dark:text-red-400 font-semibold"
                  : dueToday ? "text-orange-500 dark:text-orange-400 font-medium"
                  : "text-gray-400 dark:text-gray-500"
              }`}>
                {overdue ? "Overdue: " : dueToday ? "Due today: " : "Due: "}
                {todo.dueDate}
              </span>
            )}
            {todo.isRecurring && todo.recurrenceEndDate && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Repeats until {todo.recurrenceEndDate}
              </span>
            )}
          </div>
        )}
      </div>

      {!editing && (
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!todo.isSharedWithMe && onShare && (
            <button onClick={() => onShare(todo.id)} aria-label="Share todo" className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
          )}
          <button onClick={() => setEditing(true)} aria-label="Edit todo" className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 14H9v-3z" />
            </svg>
          </button>
          <button onClick={() => onDelete(todo.id)} aria-label="Delete todo" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
            </svg>
          </button>
        </div>
      )}
    </li>
  );
}
