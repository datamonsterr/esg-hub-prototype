export interface Notification {
  id: string;
  organizationId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
  createdAt: string;
} 