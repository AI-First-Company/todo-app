"use client";

import { useState, useEffect, useCallback } from "react";

interface NotificationPref {
  enabled: boolean;
  emailAddress: string;
  remindAt: string[];
}

const REMINDER_OPTIONS = [
  { value: "1_hour_before", label: "1 hour before" },
  { value: "1_day_before", label: "1 day before" },
  { value: "3_days_before", label: "3 days before" },
];

export default function NotificationSettings() {
  const [open, setOpen] = useState(false);
  const [pref, setPref] = useState<NotificationPref>({ enabled: false, emailAddress: "", remindAt: ["1_day_before"] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const loadPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/preferences");
      if (res.ok) {
        const data = await res.json();
        setPref({ enabled: data.enabled ?? false, emailAddress: data.emailAddress ?? "", remindAt: data.remindAt ?? ["1_day_before"] });
      }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { if (open) loadPrefs(); }, [open, loadPrefs]);
  const handleSave = async () => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/notifications/preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pref) });
      if (res.ok) { setMessage("Settings saved!"); } else { const err = await res.json(); setMessage(err.error ?? "Failed to save"); }
    } catch { setMessage("Failed to save settings"); } finally { setSaving(false); }
  };
  const toggleRemindAt = (value: string) => {
    setPref((prev) => ({ ...prev, remindAt: prev.remindAt.includes(value) ? prev.remindAt.filter((r) => r !== value) : [...prev.remindAt, value] }));
  };
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-gray-400 hover:text-indigo-500 transition-colors flex items-center gap-1" title="Notification settings">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
      </button>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Email Notifications</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={pref.enabled} onChange={(e) => setPref((p) => ({ ...p, enabled: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable email reminders for due dates</span>
          </label>
          {pref.enabled && (<>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email address</label>
              <input type="email" value={pref.emailAddress} onChange={(e) => setPref((p) => ({ ...p, emailAddress: e.target.value }))} placeholder="you@example.com" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Remind me</label>
              <div className="space-y-2">
                {REMINDER_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={pref.remindAt.includes(value)} onChange={() => toggleRemindAt(value)} className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>)}
          <button onClick={handleSave} disabled={saving || (pref.enabled && pref.remindAt.length === 0)} className="w-full px-4 py-2 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">{saving ? "Saving..." : "Save Settings"}</button>
          {message && <p className={"text-xs text-center " + (message.includes("saved") ? "text-green-500" : "text-red-500")}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
