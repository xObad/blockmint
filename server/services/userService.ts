// User Service
// Handles user management, profiles, and account operations

import { db } from "../db";
import { eq, desc, and, like, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export const userService = {
  /**
   * Get all users with optional filters
   */
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResult<schema.User>> {
    const { role, isActive, search, limit = 50, offset = 0 } = filters;

    let query = db.select().from(schema.users);
    
    // Build where conditions
    const conditions = [];
    if (role) conditions.push(eq(schema.users.role, role));
    if (isActive !== undefined) conditions.push(eq(schema.users.isActive, isActive));
    if (search) {
      conditions.push(
        sql`(${schema.users.email} ILIKE ${`%${search}%`} OR ${schema.users.displayName} ILIKE ${`%${search}%`})`
      );
    }

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.users);
    
    const users = await db.select().from(schema.users)
      .orderBy(desc(schema.users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: users,
      total: Number(countResult[0]?.count || 0),
      limit,
      offset,
    };
  },

  /**
   * Get user by ID with related data
   */
  async getUserWithDetails(userId: string): Promise<{
    user: schema.User | null;
    wallets: schema.Wallet[];
    investments: schema.Investment[];
    notificationPrefs: schema.NotificationPreferences | null;
  }> {
    const users = await db.select().from(schema.users)
      .where(eq(schema.users.id, userId));

    if (users.length === 0) {
      return { user: null, wallets: [], investments: [], notificationPrefs: null };
    }

    const wallets = await db.select().from(schema.wallets)
      .where(eq(schema.wallets.userId, userId));

    const investments = await db.select().from(schema.investments)
      .where(eq(schema.investments.userId, userId));

    const notificationPrefs = await db.select().from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.userId, userId));

    return {
      user: users[0],
      wallets,
      investments,
      notificationPrefs: notificationPrefs[0] || null,
    };
  },

  /**
   * Update user role
   */
  async updateRole(userId: string, role: string, adminId: string): Promise<schema.User | null> {
    const [updatedUser] = await db.update(schema.users)
      .set({ role })
      .where(eq(schema.users.id, userId))
      .returning();

    // Log admin action
    await db.insert(schema.adminActions).values({
      adminId,
      targetUserId: userId,
      actionType: "update_role",
      details: { newRole: role },
    });

    return updatedUser || null;
  },

  /**
   * Toggle user active status
   */
  async toggleActive(userId: string, isActive: boolean, adminId: string): Promise<schema.User | null> {
    const [updatedUser] = await db.update(schema.users)
      .set({ isActive })
      .where(eq(schema.users.id, userId))
      .returning();

    // Log admin action
    await db.insert(schema.adminActions).values({
      adminId,
      targetUserId: userId,
      actionType: isActive ? "activate_user" : "deactivate_user",
      details: { isActive },
    });

    return updatedUser || null;
  },

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [totalResult] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.users);

    const [activeResult] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.isActive, true));

    const [todayResult] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(sql`${schema.users.createdAt} >= ${today}`);

    const [weekResult] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(sql`${schema.users.createdAt} >= ${weekAgo}`);

    return {
      totalUsers: Number(totalResult?.count || 0),
      activeUsers: Number(activeResult?.count || 0),
      newUsersToday: Number(todayResult?.count || 0),
      newUsersThisWeek: Number(weekResult?.count || 0),
    };
  },

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    prefs: Partial<schema.InsertNotificationPreferences>
  ): Promise<schema.NotificationPreferences | null> {
    // Upsert preferences
    const existing = await db.select().from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.userId, userId));

    if (existing.length > 0) {
      const [updated] = await db.update(schema.notificationPreferences)
        .set({ ...prefs, updatedAt: new Date() })
        .where(eq(schema.notificationPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(schema.notificationPreferences)
        .values({ userId, ...prefs })
        .returning();
      return created;
    }
  },

  /**
   * Delete user and all related data
   */
  async deleteUser(userId: string, adminId: string): Promise<boolean> {
    try {
      // Delete in order of dependencies
      await db.delete(schema.ticketMessages)
        .where(eq(schema.ticketMessages.userId, userId));
      await db.delete(schema.supportTickets)
        .where(eq(schema.supportTickets.userId, userId));
      await db.delete(schema.notificationPreferences)
        .where(eq(schema.notificationPreferences.userId, userId));
      await db.delete(schema.notifications)
        .where(eq(schema.notifications.userId, userId));
      await db.delete(schema.earnings)
        .where(eq(schema.earnings.userId, userId));
      await db.delete(schema.investments)
        .where(eq(schema.investments.userId, userId));
      await db.delete(schema.ledgerEntries)
        .where(eq(schema.ledgerEntries.userId, userId));
      await db.delete(schema.wallets)
        .where(eq(schema.wallets.userId, userId));
      await db.delete(schema.transactions)
        .where(eq(schema.transactions.userId, userId));
      await db.delete(schema.users)
        .where(eq(schema.users.id, userId));

      // Log admin action
      await db.insert(schema.adminActions).values({
        adminId,
        targetUserId: userId,
        actionType: "delete_user",
        details: { deletedAt: new Date().toISOString() },
      });

      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  },
};

export default userService;
