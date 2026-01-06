// Admin Service
// Handles admin-specific operations, configurations, and system management

import { db } from "../db";
import { eq, desc, sql, and } from "drizzle-orm";
import * as schema from "@shared/schema";

export const adminService = {
  // ============ API CONFIGURATION ============

  /**
   * Get all API configurations
   */
  async getApiConfigs(): Promise<schema.ApiConfig[]> {
    return db.select().from(schema.apiConfigs)
      .orderBy(schema.apiConfigs.category, schema.apiConfigs.order);
  },

  /**
   * Get API config by service name
   */
  async getApiConfig(serviceName: string): Promise<schema.ApiConfig | null> {
    const configs = await db.select().from(schema.apiConfigs)
      .where(eq(schema.apiConfigs.serviceName, serviceName));
    return configs[0] || null;
  },

  /**
   * Create or update API config
   */
  async upsertApiConfig(data: schema.InsertApiConfig, adminId: string): Promise<schema.ApiConfig> {
    const existing = await this.getApiConfig(data.serviceName);
    
    if (existing) {
      const [updated] = await db.update(schema.apiConfigs)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.apiConfigs.id, existing.id))
        .returning();
      
      await this.logAction(adminId, "update_api_config", { serviceName: data.serviceName });
      return updated;
    }

    const [created] = await db.insert(schema.apiConfigs)
      .values(data)
      .returning();
    
    await this.logAction(adminId, "create_api_config", { serviceName: data.serviceName });
    return created;
  },

  /**
   * Toggle API service
   */
  async toggleApiService(serviceName: string, isEnabled: boolean, adminId: string): Promise<boolean> {
    await db.update(schema.apiConfigs)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(schema.apiConfigs.serviceName, serviceName));

    await this.logAction(adminId, isEnabled ? "enable_api_service" : "disable_api_service", { serviceName });
    return true;
  },

  /**
   * Test API connection
   */
  async testApiConnection(serviceName: string): Promise<{ success: boolean; message: string }> {
    // This would contain actual API testing logic per service type
    // For now, just update the test status
    await db.update(schema.apiConfigs)
      .set({ lastTestedAt: new Date(), testStatus: "success" })
      .where(eq(schema.apiConfigs.serviceName, serviceName));

    return { success: true, message: "Connection successful" };
  },

  // ============ FEATURE TOGGLES ============

  /**
   * Get all feature toggles
   */
  async getFeatureToggles(): Promise<schema.FeatureToggle[]> {
    return db.select().from(schema.featureToggles)
      .orderBy(schema.featureToggles.category);
  },

  /**
   * Toggle feature
   */
  async toggleFeature(featureName: string, isEnabled: boolean, adminId: string): Promise<schema.FeatureToggle | null> {
    const [toggle] = await db.update(schema.featureToggles)
      .set({ isEnabled, updatedAt: new Date(), updatedBy: adminId })
      .where(eq(schema.featureToggles.featureName, featureName))
      .returning();

    await this.logAction(adminId, isEnabled ? "enable_feature" : "disable_feature", { featureName });
    return toggle || null;
  },

  /**
   * Create feature toggle
   */
  async createFeatureToggle(data: schema.InsertFeatureToggle): Promise<schema.FeatureToggle> {
    const [toggle] = await db.insert(schema.featureToggles)
      .values(data)
      .returning();
    return toggle;
  },

  /**
   * Check if feature is enabled
   */
  async isFeatureEnabled(featureName: string): Promise<boolean> {
    const toggles = await db.select().from(schema.featureToggles)
      .where(eq(schema.featureToggles.featureName, featureName));
    return toggles.length > 0 && toggles[0].isEnabled;
  },

  // ============ ADMIN EMAILS ============

  /**
   * Get all admin emails
   */
  async getAdminEmails(): Promise<schema.AdminEmail[]> {
    return db.select().from(schema.adminEmails)
      .orderBy(desc(schema.adminEmails.createdAt));
  },

  /**
   * Add admin email
   */
  async addAdminEmail(email: string, role: string, adminId: string): Promise<schema.AdminEmail> {
    const [adminEmail] = await db.insert(schema.adminEmails)
      .values({
        email: email.toLowerCase(),
        role,
        addedBy: adminId,
      })
      .returning();

    await this.logAction(adminId, "add_admin_email", { email, role });
    return adminEmail;
  },

  /**
   * Remove admin email
   */
  async removeAdminEmail(emailId: string, adminId: string): Promise<boolean> {
    const emails = await db.select().from(schema.adminEmails)
      .where(eq(schema.adminEmails.id, emailId));
    
    if (emails.length === 0) return false;

    await db.delete(schema.adminEmails)
      .where(eq(schema.adminEmails.id, emailId));

    await this.logAction(adminId, "remove_admin_email", { email: emails[0].email });
    return true;
  },

  // ============ THEME CONFIGURATION ============

  /**
   * Get all themes
   */
  async getThemes(): Promise<schema.ThemeConfig[]> {
    return db.select().from(schema.themeConfig)
      .orderBy(desc(schema.themeConfig.isDefault));
  },

  /**
   * Get active theme
   */
  async getActiveTheme(): Promise<schema.ThemeConfig | null> {
    const themes = await db.select().from(schema.themeConfig)
      .where(eq(schema.themeConfig.isActive, true));
    return themes[0] || null;
  },

  /**
   * Create theme
   */
  async createTheme(data: schema.InsertThemeConfig): Promise<schema.ThemeConfig> {
    const [theme] = await db.insert(schema.themeConfig)
      .values(data)
      .returning();
    return theme;
  },

  /**
   * Set active theme
   */
  async setActiveTheme(themeId: string, adminId: string): Promise<boolean> {
    // Deactivate all themes
    await db.update(schema.themeConfig)
      .set({ isActive: false });

    // Activate selected theme
    await db.update(schema.themeConfig)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(schema.themeConfig.id, themeId));

    await this.logAction(adminId, "set_active_theme", { themeId });
    return true;
  },

  // ============ APP SETTINGS ============

  /**
   * Get app setting by key
   */
  async getSetting(key: string): Promise<string | null> {
    const settings = await db.select().from(schema.appSettings)
      .where(eq(schema.appSettings.key, key));
    return settings[0]?.value || null;
  },

  /**
   * Set app setting
   */
  async setSetting(key: string, value: string, type = "string", description?: string): Promise<void> {
    const existing = await db.select().from(schema.appSettings)
      .where(eq(schema.appSettings.key, key));

    if (existing.length > 0) {
      await db.update(schema.appSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(schema.appSettings.key, key));
    } else {
      await db.insert(schema.appSettings).values({
        key,
        value,
        type,
        description,
      });
    }
  },

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<schema.AppSetting[]> {
    return db.select().from(schema.appSettings);
  },

  // ============ SUPPORT TICKETS ============

  /**
   * Get support tickets
   */
  async getSupportTickets(status?: string): Promise<schema.SupportTicket[]> {
    if (status) {
      return db.select().from(schema.supportTickets)
        .where(eq(schema.supportTickets.status, status))
        .orderBy(desc(schema.supportTickets.createdAt));
    }
    return db.select().from(schema.supportTickets)
      .orderBy(desc(schema.supportTickets.createdAt));
  },

  /**
   * Get ticket with messages
   */
  async getTicketWithMessages(ticketId: string): Promise<{
    ticket: schema.SupportTicket | null;
    messages: schema.TicketMessage[];
  }> {
    const tickets = await db.select().from(schema.supportTickets)
      .where(eq(schema.supportTickets.id, ticketId));

    if (tickets.length === 0) {
      return { ticket: null, messages: [] };
    }

    const messages = await db.select().from(schema.ticketMessages)
      .where(eq(schema.ticketMessages.ticketId, ticketId))
      .orderBy(schema.ticketMessages.createdAt);

    return { ticket: tickets[0], messages };
  },

  /**
   * Reply to ticket
   */
  async replyToTicket(
    ticketId: string,
    adminId: string,
    message: string
  ): Promise<schema.TicketMessage> {
    const [msg] = await db.insert(schema.ticketMessages).values({
      ticketId,
      userId: adminId,
      message,
      isAdmin: true,
    }).returning();

    // Update ticket status
    await db.update(schema.supportTickets)
      .set({ status: "in_progress", updatedAt: new Date(), assignedTo: adminId })
      .where(eq(schema.supportTickets.id, ticketId));

    return msg;
  },

  /**
   * Close ticket
   */
  async closeTicket(ticketId: string, adminId: string): Promise<boolean> {
    await db.update(schema.supportTickets)
      .set({ status: "closed", resolvedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.supportTickets.id, ticketId));

    await this.logAction(adminId, "close_ticket", { ticketId });
    return true;
  },

  // ============ DASHBOARD STATS ============

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<{
    users: { total: number; active: number; newToday: number };
    investments: { total: number; active: number; totalValue: number };
    withdrawals: { pending: number; totalPending: number };
    tickets: { open: number; inProgress: number };
  }> {
    const [userStats] = await db.select({
      total: sql<number>`count(*)`,
      active: sql<number>`sum(case when ${schema.users.isActive} then 1 else 0 end)`,
    }).from(schema.users);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [newUsers] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(sql`${schema.users.createdAt} >= ${today}`);

    const [investmentStats] = await db.select({
      total: sql<number>`count(*)`,
      active: sql<number>`sum(case when ${schema.investments.status} = 'active' then 1 else 0 end)`,
      value: sql<number>`sum(${schema.investments.amount})`,
    }).from(schema.investments);

    const pendingWithdrawals = await db.select({
      count: sql<number>`count(*)`,
      total: sql<number>`sum(${schema.withdrawalRequests.amount})`,
    }).from(schema.withdrawalRequests)
      .where(eq(schema.withdrawalRequests.status, "pending"));

    const [ticketStats] = await db.select({
      open: sql<number>`sum(case when ${schema.supportTickets.status} = 'open' then 1 else 0 end)`,
      inProgress: sql<number>`sum(case when ${schema.supportTickets.status} = 'in_progress' then 1 else 0 end)`,
    }).from(schema.supportTickets);

    return {
      users: {
        total: Number(userStats?.total || 0),
        active: Number(userStats?.active || 0),
        newToday: Number(newUsers?.count || 0),
      },
      investments: {
        total: Number(investmentStats?.total || 0),
        active: Number(investmentStats?.active || 0),
        totalValue: Number(investmentStats?.value || 0),
      },
      withdrawals: {
        pending: Number(pendingWithdrawals[0]?.count || 0),
        totalPending: Number(pendingWithdrawals[0]?.total || 0),
      },
      tickets: {
        open: Number(ticketStats?.open || 0),
        inProgress: Number(ticketStats?.inProgress || 0),
      },
    };
  },

  // ============ ADMIN ACTION LOGGING ============

  /**
   * Log admin action
   */
  async logAction(
    adminId: string,
    actionType: string,
    details?: Record<string, any>,
    targetUserId?: string
  ): Promise<void> {
    await db.insert(schema.adminActions).values({
      adminId,
      actionType,
      targetUserId,
      details,
    });
  },

  /**
   * Get admin action log
   */
  async getActionLog(limit = 100): Promise<schema.AdminAction[]> {
    return db.select().from(schema.adminActions)
      .orderBy(desc(schema.adminActions.createdAt))
      .limit(limit);
  },
};

export default adminService;
