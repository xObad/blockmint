// Notification Service
// Handles all notification operations for users and admins

import { db } from "../db";
import { eq, desc, and, sql, isNull, or } from "drizzle-orm";
import * as schema from "@shared/schema";

export type NotificationType = 
  | "deposit" 
  | "withdrawal" 
  | "reward" 
  | "daily_return" 
  | "promotion" 
  | "system" 
  | "admin_alert"
  | "new_order"
  | "withdrawal_request"
  | "support_ticket";

export type NotificationCategory = "user" | "admin";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface CreateNotificationInput {
  userId?: string;
  type: NotificationType;
  category?: NotificationCategory;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  expiresAt?: Date;
}

export const notificationService = {
  /**
   * Create a new notification
   */
  async create(input: CreateNotificationInput): Promise<schema.Notification> {
    const [notification] = await db.insert(schema.notifications).values({
      userId: input.userId,
      type: input.type,
      category: input.category || "user",
      title: input.title,
      message: input.message,
      data: input.data,
      priority: input.priority || "normal",
      expiresAt: input.expiresAt,
    }).returning();

    return notification;
  },

  /**
   * Create notification for all users
   */
  async createBroadcast(
    title: string,
    message: string,
    type: NotificationType = "promotion",
    data?: Record<string, any>
  ): Promise<number> {
    const users = await db.select({ id: schema.users.id }).from(schema.users)
      .where(eq(schema.users.isActive, true));

    let count = 0;
    for (const user of users) {
      await this.create({
        userId: user.id,
        type,
        title,
        message,
        data,
      });
      count++;
    }

    return count;
  },

  /**
   * Create admin notification (visible to all admins)
   */
  async createAdminNotification(
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    priority: NotificationPriority = "normal"
  ): Promise<schema.Notification> {
    return this.create({
      type,
      category: "admin",
      title,
      message,
      data,
      priority,
    });
  },

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    limit = 50,
    includeRead = true
  ): Promise<schema.Notification[]> {
    const conditions = [
      eq(schema.notifications.userId, userId),
      eq(schema.notifications.category, "user"),
    ];

    if (!includeRead) {
      conditions.push(eq(schema.notifications.isRead, false));
    }

    return db.select().from(schema.notifications)
      .where(and(...conditions))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit);
  },

  /**
   * Get admin notifications
   */
  async getAdminNotifications(limit = 50, includeRead = true): Promise<schema.Notification[]> {
    const conditions = [
      eq(schema.notifications.category, "admin"),
    ];

    if (!includeRead) {
      conditions.push(eq(schema.notifications.isRead, false));
    }

    return db.select().from(schema.notifications)
      .where(and(...conditions))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit);
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await db.update(schema.notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(schema.notifications.id, notificationId));
  },

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await db.update(schema.notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.isRead, false)
      ));

    return 0; // Drizzle doesn't return affected rows count easily
  },

  /**
   * Mark all admin notifications as read
   */
  async markAllAdminAsRead(): Promise<void> {
    await db.update(schema.notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(schema.notifications.category, "admin"),
        eq(schema.notifications.isRead, false)
      ));
  },

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.isRead, false),
        eq(schema.notifications.category, "user")
      ));

    return Number(result?.count || 0);
  },

  /**
   * Get unread admin count
   */
  async getUnreadAdminCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(and(
        eq(schema.notifications.category, "admin"),
        eq(schema.notifications.isRead, false)
      ));

    return Number(result?.count || 0);
  },

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOldNotifications(daysOld = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await db.delete(schema.notifications)
      .where(sql`${schema.notifications.createdAt} < ${cutoffDate} AND ${schema.notifications.isRead} = true`);

    return 0;
  },

  /**
   * Delete notification
   */
  async delete(notificationId: string): Promise<void> {
    await db.delete(schema.notifications)
      .where(eq(schema.notifications.id, notificationId));
  },

  // ============ CONVENIENCE METHODS FOR COMMON NOTIFICATIONS ============

  /**
   * Notify user of deposit
   */
  async notifyDeposit(userId: string, amount: number, currency: string, txHash?: string): Promise<void> {
    await this.create({
      userId,
      type: "deposit",
      title: "Deposit Received",
      message: `Your deposit of ${amount} ${currency} has been received and credited to your account.`,
      data: { amount, currency, txHash },
      priority: "high",
    });

    // Also notify admins
    await this.createAdminNotification(
      "deposit",
      "New Deposit",
      `User deposited ${amount} ${currency}`,
      { userId, amount, currency, txHash }
    );
  },

  /**
   * Notify user of withdrawal
   */
  async notifyWithdrawal(userId: string, amount: number, currency: string, status: string): Promise<void> {
    const statusMessages: Record<string, string> = {
      pending: `Your withdrawal request for ${amount} ${currency} is being processed.`,
      completed: `Your withdrawal of ${amount} ${currency} has been completed.`,
      rejected: `Your withdrawal request for ${amount} ${currency} was rejected.`,
    };

    await this.create({
      userId,
      type: "withdrawal",
      title: `Withdrawal ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: statusMessages[status] || `Withdrawal status: ${status}`,
      data: { amount, currency, status },
      priority: status === "completed" ? "high" : "normal",
    });
  },

  /**
   * Notify user of reward
   */
  async notifyReward(userId: string, amount: number, currency: string, reason: string): Promise<void> {
    await this.create({
      userId,
      type: "reward",
      title: "Reward Received! 🎉",
      message: `You've earned ${amount} ${currency} - ${reason}`,
      data: { amount, currency, reason },
      priority: "high",
    });
  },

  /**
   * Notify user of daily return
   */
  async notifyDailyReturn(userId: string, amount: number, currency: string): Promise<void> {
    await this.create({
      userId,
      type: "daily_return",
      title: "Daily Return Credited",
      message: `Your daily mining return of ${amount} ${currency} has been credited.`,
      data: { amount, currency },
    });
  },

  /**
   * Notify admins of new withdrawal request
   */
  async notifyAdminWithdrawalRequest(userId: string, amount: number, currency: string, requestId: string): Promise<void> {
    await this.createAdminNotification(
      "withdrawal_request",
      "New Withdrawal Request",
      `User requested withdrawal of ${amount} ${currency}`,
      { userId, amount, currency, requestId },
      "high"
    );
  },

  /**
   * Notify admins of new support ticket
   */
  async notifyAdminSupportTicket(ticketId: string, subject: string, userId: string): Promise<void> {
    await this.createAdminNotification(
      "support_ticket",
      "New Support Ticket",
      subject,
      { ticketId, userId },
      "normal"
    );
  },
};

export default notificationService;
