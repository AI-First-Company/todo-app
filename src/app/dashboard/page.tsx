"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

interface Stats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  streak: number;
  productiveDays: { day: string; count: number }[];
  categoryBreakdown: { category: string; total: number; completed: number }[];
  priorityBreakdown: { priority: string; total: number; completed: number }[];
}

const PRIORITY_ICONS: Record<string, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

const CATEGORY_ICONS: Record<string, string> = {
  Work: "💼",
  Personal: "👤",
  Shopping: "🛒",
  Health: "❤️",
  Other: "📌",
  Uncategorized: "📂",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/todos/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <p className="text-gray-400">Loading statistics…</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <p className="text-gray-400">Failed to load statistics.</p>
      </div>
    );
  }

  const maxDayCount = Math.max(...stats.productiveDays.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
              📊 Statistics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your productivity at a glance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              ← Back to todos
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total" value={stats.total} color="text-gray-700 dark:text-gray-200" />
          <StatCard label="Completed" value={stats.completed} color="text-green-600 dark:text-green-400" />
          <StatCard label="Pending" value={stats.pending} color="text-orange-600 dark:text-orange-400" />
          <StatCard label="Completion" value={`${stats.completionRate}%`} color="text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Current Streak
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {stats.streak} {stats.streak === 1 ? "day" : "days"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Consecutive days completing todos
              </p>
            </div>
          </div>
        </div>

        {/* Most Productive Days */}
        {stats.productiveDays.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Most Productive Days
            </h2>
            <div className="space-y-2">
              {stats.productiveDays.map(({ day, count }) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-600 dark:text-gray-300 shrink-0">
                    {day}
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                    <div
                      className="bg-indigo-500 dark:bg-indigo-400 h-full rounded-full transition-all"
                      style={{ width: `${(count / maxDayCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {stats.categoryBreakdown.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              By Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.categoryBreakdown.map(({ category, total, completed }) => (
                <div
                  key={category}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {CATEGORY_ICONS[category] ?? "📂"} {category}
                  </span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {completed}/{total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Breakdown */}
        {stats.priorityBreakdown.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              By Priority
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {["high", "medium", "low"].map((p) => {
                const entry = stats.priorityBreakdown.find((b) => b.priority === p);
                if (!entry) return null;
                return (
                  <div
                    key={p}
                    className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3"
                  >
                    <p className="text-lg">{PRIORITY_ICONS[p]}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">{p}</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-1">
                      {entry.completed}/{entry.total}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{label}</p>
    </div>
  );
}
