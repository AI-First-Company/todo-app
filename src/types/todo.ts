export type Priority = "low" | "medium" | "high";
export type Category = "Work" | "Personal" | "Shopping" | "Health" | "Other";
export type SharePermission = "view" | "edit";
export type AttachmentType = "image" | "file" | "link";
export type RecurrencePattern = "daily" | "weekly" | "monthly";

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface TodoShareInfo {
  id: string;
  sharedWithEmail: string;
  sharedWithName: string | null;
  permission: SharePermission;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: Category;
  dueDate?: string;
  archived?: boolean;
  archivedAt?: string;
  sortOrder?: number;
  attachments?: Attachment[];
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: string;
  createdAt: string;
  isSharedWithMe?: boolean;
  sharedByEmail?: string;
  sharePermission?: SharePermission;
  shares?: TodoShareInfo[];
}

export interface Template {
  id: string;
  name: string;
  title: string;
  priority: Priority;
  category?: Category;
  archived?: boolean;
  archivedAt?: string;
  createdAt: string;
}
