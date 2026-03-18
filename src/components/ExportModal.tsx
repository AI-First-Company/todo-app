"use client";

import { useState } from "react";
import { Category } from "@/types/todo";

type ExportFormat = "csv" | "json" | "pdf";

const CATEGORIES: Category[] = ["Work", "Personal", "Shopping", "Health", "Other"];

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportModal({ open, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [category, setCategory] = useState<Category | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format });
      if (category) params.set("category", category);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch("/api/todos/export?" + params.toString());
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Export failed");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "todos." + format;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onClose();
    } finally {
      setExporting(false);
    }
  }

  const formats: { value: ExportFormat; label: string; icon: string }[] = [
    { value: "csv", label: "CSV", icon: "📊" },
    { value: "json", label: "JSON", icon: "📋" },
    { value: "pdf", label: "PDF", icon: "📄" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Export Todos</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Format</label>
          <div className="flex gap-2">
            {formats.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors " +
                  (format === f.value
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 ring-2 ring-indigo-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600")
                }
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
