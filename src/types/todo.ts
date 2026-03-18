export type Priority = "low" | "medium" | "high";

export type Category = "Work" | "Personal" | "Shopping" | "Health" | "Other";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: Category;
  dueDate?: string;
  notes?: string; // ISO date string YYYY-MM-DD
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  title: string;
  priority: Priority;
  category?: Category;
  createdAt: string;
}
