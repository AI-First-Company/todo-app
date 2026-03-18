"use client";

import { useState, useRef, useEffect } from "react";
import { Todo, Category } from "@/types/todo";
import MarkdownRenderer from "./MarkdownRenderer";

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  high: "bg-red-100 text-red-700 border-red-300",
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
  onUpdateNotes,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState<Todo["priority"]>(todo.priority);
  const [editCategory, setEditCategory] = useState<Todo["category"] | "">(todo.category ?? "");
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(todo.notes ?? "");
  const notesRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (editingNotes) notesRef.current?.focus(); }, [editingNotes]);
  useEffect(() => { setNotesText(todo.notes ?? ""); }, [todo.notes]);
  const saveNotes = () => { onUpdateNotes?.(todo.id, notesText); setEditingNotes(false); };
  const cancelNotes = () => { setNotesText(todo.notes ?? ""); setEditingNotes(false); };


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

  const hasNotes = !!(todo.notes && todo.notes.trim());
  const overdue = !todo.completed && isOverdue(todo.dueDate);
  const dueToday = !todo.completed && isDueToday(todo.dueDate);

  return (
    <li className={`flex flex-col rounded-xl shadow-sm border group transition-all hover:shadow-md ${
      overdue
        ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
    }`}>
      <div className="flex items-start gap-3 p-4">
      {/* Checkbox */}
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

      {/* Content */}
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
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Todo["priority"])}
                className="text-xs px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Todo["category"] | "")}
                className="text-xs px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none"
              >
                <option value="">No category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="text-xs px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none"
              />
              <button onClick={saveEdit} className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Save</button>
              <button onClick={cancelEdit} className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium truncate ${
                todo.completed
                  ? "line-through text-gray-400 dark:text-gray-500"
                  : "text-gray-800 dark:text-gray-100"
              }`}>
                {todo.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[todo.priority]}`}>
                {todo.priority}
              </span>
              {todo.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                  {todo.category}
                </span>
              )}
            </div>
            {todo.dueDate && (
              <span className={`text-xs ${
                overdue
                  ? "text-red-600 dark:text-red-400 font-semibold"
                  : dueToday
                  ? "text-orange-500 dark:text-orange-400 font-medium"
                  : "text-gray-400 dark:text-gray-500"
              }`}>
                {overdue ? "⚠️ Overdue: " : dueToday ? "📅 Due today: " : "📅 Due: "}
                {todo.dueDate}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { setShowNotes(!showNotes); if (!showNotes && !hasNotes) setEditingNotes(true); }} aria-label={showNotes ? "Hide notes" : "Show notes"} className={`p-1.5 rounded-lg transition-colors ${hasNotes ? "text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700" : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700"}`}><svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg></button>
                <button
            onClick={() => setEditing(true)}
            aria-label="Edit todo"
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 14H9v-3z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            aria-label="Delete todo"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
            </svg>
          </button>
        </div>
      )}

      </div>
      {hasNotes && !showNotes && (<button onClick={() => setShowNotes(true)} className="px-4 pb-3 -mt-1 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 transition-colors text-left"><svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg><span className="truncate">{todo.notes!.split("\n")[0].slice(0, 60)}{todo.notes!.length > 60 ? "..." : ""}</span></button>)}
      {showNotes && (<div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3">{editingNotes ? (<div className="flex flex-col gap-2"><textarea ref={notesRef} value={notesText} onChange={(e) => setNotesText(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") cancelNotes(); }} placeholder='Add notes... (supports **bold**, *italic*, `code`, lists, and headings)' rows={4} className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white resize-y font-mono" /><div className="flex gap-2 items-center"><button onClick={saveNotes} className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Save Notes</button><button onClick={cancelNotes} className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button><span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">Markdown supported</span></div></div>) : (<div>{hasNotes ? (<div onClick={() => setEditingNotes(true)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg p-2 -m-2 transition-colors"><MarkdownRenderer content={todo.notes!} /></div>) : (<button onClick={() => setEditingNotes(true)} className="text-xs text-gray-400 hover:text-indigo-500 transition-colors">Click to add notes...</button>)}<div className="flex justify-end mt-2 gap-2"><button onClick={() => setEditingNotes(true)} className="text-xs text-gray-400 hover:text-indigo-500 transition-colors">Edit</button><button onClick={() => setShowNotes(false)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Close</button></div></div>)}</div>)}
    </li>
  );
}
