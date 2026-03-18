"use client";
import { useState, useEffect, useRef } from "react";
import { TodoShareInfo, SharePermission } from "@/types/todo";

interface ShareModalProps { todoId: string; todoTitle: string; onClose: () => void; }
interface SearchUser { id: string; email: string; name: string | null; }

export default function ShareModal({ todoId, todoTitle, onClose }: ShareModalProps) {
  const [shares, setShares] = useState<TodoShareInfo[]>([]);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("view");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { fetchShares(); }, [todoId]);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose(); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  async function fetchShares() { try { const res = await fetch(`/api/todos/${todoId}/share`); if (res.ok) setShares(await res.json()); } catch {} }

  function handleEmailChange(value: string) {
    setEmail(value); setError("");
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => { try { const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`); if (res.ok) setSearchResults(await res.json()); } catch {} }, 300);
  }

  async function handleShare() {
    if (!email.trim()) return; setLoading(true); setError("");
    try {
      const res = await fetch(`/api/todos/${todoId}/share`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), permission }) });
      if (res.ok) { const share: TodoShareInfo = await res.json(); setShares((prev) => { const idx = prev.findIndex((s) => s.id === share.id); if (idx >= 0) { const u = [...prev]; u[idx] = share; return u; } return [...prev, share]; }); setEmail(""); setSearchResults([]); }
      else { const data = await res.json(); setError(data.error || "Failed to share"); }
    } catch { setError("Failed to share todo"); } finally { setLoading(false); }
  }

  async function handleRemoveShare(shareId: string) { try { const res = await fetch(`/api/todos/${todoId}/share`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shareId }) }); if (res.ok) setShares((prev) => prev.filter((s) => s.id !== shareId)); } catch {} }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Share Todo</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">&ldquo;{todoTitle}&rdquo;</p>
        <div className="flex flex-col gap-2 mb-4">
          <div className="relative">
            <input type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleShare()} placeholder="Enter email address" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white" />
            {searchResults.length > 0 && (<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">{searchResults.map((user) => (<button key={user.id} onClick={() => { setEmail(user.email); setSearchResults([]); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"><span className="font-medium">{user.name || user.email}</span>{user.name && <span className="text-gray-400 ml-1">({user.email})</span>}</button>))}</div>)}
          </div>
          <div className="flex gap-2">
            <select value={permission} onChange={(e) => setPermission(e.target.value as SharePermission)} className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none"><option value="view">View only</option><option value="edit">Can edit</option></select>
            <button onClick={handleShare} disabled={loading || !email.trim()} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{loading ? "Sharing..." : "Share"}</button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        {shares.length > 0 && (<div><h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Shared with</h3><div className="flex flex-col gap-2">{shares.map((share) => (<div key={share.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><div className="flex flex-col min-w-0"><span className="text-sm text-gray-700 dark:text-gray-200 truncate">{share.sharedWithName || share.sharedWithEmail}</span>{share.sharedWithName && <span className="text-xs text-gray-400 truncate">{share.sharedWithEmail}</span>}</div><div className="flex items-center gap-2 flex-shrink-0"><span className={`text-xs px-2 py-0.5 rounded-full ${share.permission === "edit" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300"}`}>{share.permission === "edit" ? "Can edit" : "View only"}</span><button onClick={() => handleRemoveShare(share.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div></div>))}</div></div>)}
      </div>
    </div>
  );
}
