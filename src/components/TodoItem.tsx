"use client";

import { useState, useRef, useEffect } from "react";
import { Todo, Attachment, AttachmentType, Category } from "@/types/todo";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  high: "bg-red-100 text-red-700 border-red-300",
};

const PRIORITY_ICONS = { low: "🟢", medium: "🟡", high: "🔴" };
const PRIORITY_BORDER = { low: "", medium: "", high: "border-l-4 border-l-red-400 dark:border-l-red-500" };
const CATEGORIES: Category[] = ["Work", "Personal", "Shopping", "Health", "Other"];
const ATTACHMENT_ICONS: Record<AttachmentType, string> = { image: "🖼️", file: "📄", link: "🔗" };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType.startsWith("image/")) return "image";
  return "file";
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, priority: Todo["priority"], category?: Todo["category"], dueDate?: string) => void;
  onAddAttachment: (todoId: string, attachment: Attachment) => void;
  onRemoveAttachment: (todoId: string, attachmentId: string) => void;
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function isDueToday(dueDate?: string): boolean {
  if (!dueDate) return false;
  return dueDate === new Date().toISOString().split("T")[0];
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit, onAddAttachment, onRemoveAttachment }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState<Todo["priority"]>(todo.priority);
  const [editCategory, setEditCategory] = useState<Todo["category"] | "">(todo.category ?? "");
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? "");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) { alert(`File "${file.name}" exceeds 5MB limit.`); return; }
      const reader = new FileReader();
      reader.onload = () => {
        onAddAttachment(todo.id, {
          id: crypto.randomUUID(), name: file.name, type: getAttachmentType(file.type),
          url: reader.result as string, mimeType: file.type, size: file.size,
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    onAddAttachment(todo.id, { id: crypto.randomUUID(), name: linkName.trim() || linkUrl.trim(), type: "link", url: linkUrl.trim() });
    setLinkUrl(""); setLinkName(""); setShowLinkInput(false);
  };

  const saveEdit = () => {
    if (editTitle.trim()) {
      onEdit(todo.id, editTitle, editPriority, editCategory || undefined, editDueDate || undefined);
    } else {
      setEditTitle(todo.title); setEditPriority(todo.priority); setEditCategory(todo.category ?? ""); setEditDueDate(todo.dueDate ?? "");
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditTitle(todo.title); setEditPriority(todo.priority); setEditCategory(todo.category ?? ""); setEditDueDate(todo.dueDate ?? "");
    setEditing(false);
  };

  const overdue = !todo.completed && isOverdue(todo.dueDate);
  const dueToday = !todo.completed && isDueToday(todo.dueDate);
  const attachments = todo.attachments ?? [];

  return (
    <li className={`flex items-start gap-3 p-4 rounded-xl shadow-sm border group transition-all hover:shadow-md ${
      overdue ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
    } ${PRIORITY_BORDER[todo.priority]}`}>
      <button onClick={() => onToggle(todo.id)} aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.completed ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-300 hover:border-indigo-400"
        }`}>
        {todo.completed && (<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input ref={inputRef} value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
              className="w-full px-2 py-1 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white" />
            <div className="flex flex-wrap gap-2 items-center">
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Todo["priority"])}
                className="text-xs px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as Todo["category"] | "")}
                className="text-xs px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none">
                <option value="">No category</option>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)}
                className="text-xs px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none" />
              <button onClick={saveEdit} className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Save</button>
              <button onClick={cancelEdit} className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium truncate ${todo.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100"}`}>{todo.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[todo.priority]}`}>{PRIORITY_ICONS[todo.priority]} {todo.priority}</span>
              {todo.category && (<span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">{todo.category}</span>)}
            </div>
            {todo.dueDate && (
              <span className={`text-xs ${overdue ? "text-red-600 dark:text-red-400 font-semibold" : dueToday ? "text-orange-500 dark:text-orange-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                {overdue ? "⚠️ Overdue: " : dueToday ? "📅 Due today: " : "📅 Due: "}{todo.dueDate}
              </span>
            )}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {attachments.map((att) => (
                  <div key={att.id} className="group/att flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs">
                    {att.type === "image" ? (
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 min-w-0">
                        <img src={att.url} alt={att.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                        <span className="truncate max-w-[120px] text-gray-600 dark:text-gray-300">{att.name}</span>
                      </a>
                    ) : att.type === "link" ? (
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 min-w-0 text-indigo-600 dark:text-indigo-400 hover:underline">
                        <span>{ATTACHMENT_ICONS.link}</span><span className="truncate max-w-[120px]">{att.name}</span>
                      </a>
                    ) : (
                      <a href={att.url} download={att.name} className="flex items-center gap-1 min-w-0 text-gray-600 dark:text-gray-300 hover:text-indigo-500">
                        <span>{ATTACHMENT_ICONS.file}</span><span className="truncate max-w-[120px]">{att.name}</span>
                      </a>
                    )}
                    {att.size && (<span className="text-gray-400 dark:text-gray-500 flex-shrink-0">({formatFileSize(att.size)})</span>)}
                    <button onClick={() => onRemoveAttachment(todo.id, att.id)} className="opacity-0 group-hover/att:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0" aria-label={`Remove ${att.name}`}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showLinkInput && (
              <div className="flex flex-col gap-1.5 mt-1.5 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com"
                  className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddLink(); if (e.key === "Escape") setShowLinkInput(false); }} autoFocus />
                <input type="text" value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="Link name (optional)"
                  className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddLink(); if (e.key === "Escape") setShowLinkInput(false); }} />
                <div className="flex gap-1.5">
                  <button onClick={handleAddLink} disabled={!linkUrl.trim()} className="text-xs px-2 py-0.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-40">Add</button>
                  <button onClick={() => { setShowLinkInput(false); setLinkUrl(""); setLinkName(""); }} className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" onChange={handleFileSelect} className="hidden" />

      {!editing && (
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => fileInputRef.current?.click()} aria-label="Attach file" className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
          <button onClick={() => setShowLinkInput(!showLinkInput)} aria-label="Attach link" className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </button>
          <button onClick={() => setEditing(true)} aria-label="Edit todo" className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 14H9v-3z" /></svg>
          </button>
          <button onClick={() => onDelete(todo.id)} aria-label="Delete todo" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" /></svg>
          </button>
        </div>
      )}
    </li>
  );
}
