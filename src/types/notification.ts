export interface Notification {
  id: number; // Changed to number to match schema (SERIAL PRIMARY KEY)
  organizationId: number; // Changed to number to match schema
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string | null; // Made nullable to match schema
  createdAt: string;
} 