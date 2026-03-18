"use client";

import { useState, useRef, useEffect } from "react";
import { Todo, Subtask, Category } from "@/types/todo";

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
  onAddSubtask: (todoId: string, title: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onDeleteSubtask: (todoId: string, subtaskId: string) => void;
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
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState<Todo["priority"]>(todo.priority);
  const [editCategory, setEditCategory] = useState<Todo["category"] | "">(todo.category ?? "");
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? "");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(false);
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
  const subtasks = todo.subtasks ?? [];
  const completedSubtasks = subtasks.filter((s: Subtask) => s.completed).length;

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
            </div>
            {todo.dueDate && (
              <span className={`text-xs ${
                overdue ? "text-red-600 dark:text-red-400 font-semibold"
                  : dueToday ? "text-orange-500 dark:text-orange-400 font-medium"
                  : "text-gray-400 dark:text-gray-500"
              }`}>
                {overdue ? "⚠️ Overdue: " : dueToday ? "📅 Due today: " : "📅 Due: "}
                {todo.dueDate}
              </span>
            )}

            {/* Subtasks */}
            {(subtasks.length > 0 || !todo.completed) && (
              <div className="mt-2">
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center gap-1"
                >
                  <svg className={`w-3 h-3 transition-transform ${showSubtasks ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {subtasks.length > 0 ? `${completedSubtasks}/${subtasks.length} subtasks` : "Add subtasks"}
                </button>

                {showSubtasks && (
                  <div className="mt-1.5 ml-1 space-y-1">
                    {subtasks.length > 0 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                        <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }} />
                      </div>
                    )}

                    {subtasks.map((subtask: Subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2 group/subtask">
                        <button
                          onClick={() => onToggleSubtask(todo.id, subtask.id)}
                          className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            subtask.completed ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-300 hover:border-indigo-400"
                          }`}
                        >
                          {subtask.completed && (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`text-xs flex-1 ${subtask.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}>
                          {subtask.title}
                        </span>
                        <button
                          onClick={() => onDeleteSubtask(todo.id, subtask.id)}
                          className="opacity-0 group-hover/subtask:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5"
                          aria-label="Delete subtask"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {!todo.completed && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newSubtaskTitle.trim()) {
                            onAddSubtask(todo.id, newSubtaskTitle);
                            setNewSubtaskTitle("");
                          }
                        }}
                        className="flex items-center gap-1.5 mt-1"
                      >
                        <span className="text-gray-300 dark:text-gray-600 text-xs">+</span>
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Add a subtask..."
                          className="flex-1 text-xs px-1.5 py-0.5 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-indigo-400 text-gray-700 dark:text-gray-300 placeholder-gray-400"
                        />
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!editing && (
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
