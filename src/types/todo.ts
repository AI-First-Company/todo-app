export type Priority = "low" | "medium" | "high";

export type Category = "Work" | "Personal" | "Shopping" | "Health" | "Other";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: Category;
  dueDate?: string; // ISO date string YYYY-MM-DD
  sortOrder: number;
  createdAt: string;
}
