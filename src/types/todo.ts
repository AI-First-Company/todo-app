export type Priority = "low" | "medium" | "high";

export type Category = "Work" | "Personal" | "Shopping" | "Health" | "Other";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: Category;
  dueDate?: string; // ISO date string YYYY-MM-DD
  subtasks?: Subtask[];
  createdAt: string;
}
