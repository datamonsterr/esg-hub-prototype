export interface Notification {
  id: number;
  type: string;
  user: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
} 