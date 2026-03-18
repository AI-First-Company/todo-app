export type Priority = "low" | "medium" | "high";

export type Category = "Work" | "Personal" | "Shopping" | "Health" | "Other";

export type RecurrencePattern = "daily" | "weekly" | "monthly";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: Category;
  dueDate?: string;
  createdAt: string;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: string;
  parentTodoId?: string;
}
