export type Priority = "low" | "medium" | "high";

export const DEFAULT_CATEGORIES = ["Work", "Personal", "Shopping", "Health", "Other"] as const;

export type Category = string;

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: Category;
  dueDate?: string; // ISO date string YYYY-MM-DD
  createdAt: string;
}
