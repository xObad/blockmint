import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "milestone" | "offer" | "payout" | "news" | "reward";
  time: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, "id" | "time" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: AppNotification[] = [
  {
    id: "1",
    title: "Daily Mining Bonus",
    message: "Claim your free 0.00001 BTC daily bonus!",
    type: "offer",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    title: "New Contract Available",
    message: "Limited time 30% discount on 1-year mining contracts!",
    type: "offer",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    title: "Mining Milestone",
    message: "You've reached 100 TH/s total hashpower!",
    type: "milestone",
    time: "1 day ago",
    read: true,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<AppNotification, "id" | "time" | "read">) => {
      const newNotification: AppNotification = {
        ...notification,
        id: Date.now().toString(),
        time: "Just now",
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      
      toast({
        title: notification.title,
        description: notification.message,
      });
    },
    [toast]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
