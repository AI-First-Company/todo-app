"use client";

import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10">
      <div className="rounded-[15px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg shadow-md shadow-indigo-500/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Todo App
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Stay organized, get things done
              </p>
            </div>
          </div>

          {/* Right side: theme toggle & user */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session?.user && (
              <div className="flex items-center gap-2 ml-1 pl-2 border-l border-gray-200 dark:border-gray-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold shadow-sm">
                  {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">
                  {session.user.name ?? session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
