// Mining Service
// Handles mining contracts, plans, earnings, and hash rate management

import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { notificationService } from "./notificationService";

export const miningService = {
  /**
   * Get all investment plans
   */
  async getPlans(activeOnly = true): Promise<schema.InvestmentPlan[]> {
    if (activeOnly) {
      return db.select().from(schema.investmentPlans)
        .where(eq(schema.investmentPlans.isActive, true))
        .orderBy(schema.investmentPlans.order);
    }
    return db.select().from(schema.investmentPlans)
      .orderBy(schema.investmentPlans.order);
  },

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<schema.InvestmentPlan | null> {
    const plans = await db.select().from(schema.investmentPlans)
      .where(eq(schema.investmentPlans.id, planId));
    return plans[0] || null;
  },

  /**
   * Create investment plan
   */
  async createPlan(data: schema.InsertInvestmentPlan): Promise<schema.InvestmentPlan> {
    const [plan] = await db.insert(schema.investmentPlans)
      .values(data)
      .returning();
    return plan;
  },

  /**
   * Update investment plan
   */
  async updatePlan(planId: string, data: Partial<schema.InsertInvestmentPlan>): Promise<schema.InvestmentPlan | null> {
    const [plan] = await db.update(schema.investmentPlans)
      .set(data)
      .where(eq(schema.investmentPlans.id, planId))
      .returning();
    return plan || null;
  },

  /**
   * Delete investment plan
   */
  async deletePlan(planId: string): Promise<boolean> {
    await db.delete(schema.investmentPlans)
      .where(eq(schema.investmentPlans.id, planId));
    return true;
  },

  /**
   * Get user investments (contracts)
   */
  async getUserInvestments(userId: string): Promise<schema.Investment[]> {
    return db.select().from(schema.investments)
      .where(eq(schema.investments.userId, userId))
      .orderBy(desc(schema.investments.startDate));
  },

  /**
   * Get active investments
   */
  async getActiveInvestments(userId?: string): Promise<schema.Investment[]> {
    if (userId) {
      return db.select().from(schema.investments)
        .where(and(
          eq(schema.investments.userId, userId),
          eq(schema.investments.status, "active")
        ))
        .orderBy(desc(schema.investments.startDate));
    }
    return db.select().from(schema.investments)
      .where(eq(schema.investments.status, "active"))
      .orderBy(desc(schema.investments.startDate));
  },

  /**
   * Create investment (purchase contract)
   */
  async createInvestment(
    userId: string,
    planId: string,
    amount: number,
    currency: string
  ): Promise<{ success: boolean; investment?: schema.Investment; error?: string }> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    if (amount < plan.minAmount) {
      return { success: false, error: `Minimum investment is ${plan.minAmount} ${plan.currency}` };
    }

    if (plan.maxAmount && amount > plan.maxAmount) {
      return { success: false, error: `Maximum investment is ${plan.maxAmount} ${plan.currency}` };
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const [investment] = await db.insert(schema.investments).values({
      userId,
      planId,
      amount,
      currency: currency || plan.currency,
      endDate,
      status: "active",
    }).returning();

    // Notify user
    await notificationService.create({
      userId,
      type: "reward",
      title: "Investment Created",
      message: `Your ${plan.name} investment of ${amount} ${currency} is now active!`,
      data: { planId, amount, currency },
      priority: "high",
    });

    // Notify admins
    await notificationService.createAdminNotification(
      "new_order",
      "New Investment",
      `User purchased ${plan.name} for ${amount} ${currency}`,
      { userId, planId, amount, currency }
    );

    return { success: true, investment };
  },

  /**
   * Process daily earnings for all active investments
   */
  async processDailyEarnings(adminId?: string): Promise<{ processed: number; totalEarnings: number }> {
    const activeInvestments = await this.getActiveInvestments();
    let processed = 0;
    let totalEarnings = 0;

    for (const investment of activeInvestments) {
      const plan = await this.getPlanById(investment.planId);
      if (!plan) continue;

      // Calculate daily earning
      const dailyReturn = (investment.amount * plan.dailyReturnPercent) / 100;

      // Create earning record
      await db.insert(schema.earnings).values({
        userId: investment.userId,
        investmentId: investment.id,
        amount: dailyReturn,
        currency: investment.currency,
        type: "daily",
      });

      // Update investment total earned
      await db.update(schema.investments)
        .set({ totalEarned: (investment.totalEarned || 0) + dailyReturn })
        .where(eq(schema.investments.id, investment.id));

      // Notify user
      await notificationService.notifyDailyReturn(investment.userId, dailyReturn, investment.currency);

      processed++;
      totalEarnings += dailyReturn;
    }

    // Log admin action if manual
    if (adminId) {
      await db.insert(schema.adminActions).values({
        adminId,
        actionType: "process_daily_earnings",
        details: { processed, totalEarnings },
      });
    }

    return { processed, totalEarnings };
  },

  /**
   * Get miner pricing list
   */
  async getMiners(activeOnly = true): Promise<schema.MinerPricing[]> {
    if (activeOnly) {
      return db.select().from(schema.minerPricing)
        .where(eq(schema.minerPricing.isActive, true))
        .orderBy(schema.minerPricing.order);
    }
    return db.select().from(schema.minerPricing)
      .orderBy(schema.minerPricing.order);
  },

  /**
   * Create miner
   */
  async createMiner(data: schema.InsertMinerPricing): Promise<schema.MinerPricing> {
    const [miner] = await db.insert(schema.minerPricing)
      .values(data)
      .returning();
    return miner;
  },

  /**
   * Update miner
   */
  async updateMiner(minerId: string, data: Partial<schema.InsertMinerPricing>): Promise<schema.MinerPricing | null> {
    const [miner] = await db.update(schema.minerPricing)
      .set(data)
      .where(eq(schema.minerPricing.id, minerId))
      .returning();
    return miner || null;
  },

  /**
   * Delete miner
   */
  async deleteMiner(minerId: string): Promise<boolean> {
    await db.delete(schema.minerPricing)
      .where(eq(schema.minerPricing.id, minerId));
    return true;
  },

  /**
   * Get platform mining statistics
   */
  async getPlatformStats(): Promise<{
    totalInvestments: number;
    activeInvestments: number;
    totalValue: number;
    totalEarningsPaid: number;
  }> {
    const [investmentStats] = await db.select({
      total: sql<number>`count(*)`,
      active: sql<number>`sum(case when ${schema.investments.status} = 'active' then 1 else 0 end)`,
      value: sql<number>`sum(${schema.investments.amount})`,
      earnings: sql<number>`sum(${schema.investments.totalEarned})`,
    }).from(schema.investments);

    return {
      totalInvestments: Number(investmentStats?.total || 0),
      activeInvestments: Number(investmentStats?.active || 0),
      totalValue: Number(investmentStats?.value || 0),
      totalEarningsPaid: Number(investmentStats?.earnings || 0),
    };
  },

  /**
   * Get daily return configuration
   */
  async getDailyReturnConfig(planId?: string): Promise<schema.DailyReturnConfig[]> {
    if (planId) {
      return db.select().from(schema.dailyReturnConfig)
        .where(eq(schema.dailyReturnConfig.planId, planId));
    }
    return db.select().from(schema.dailyReturnConfig);
  },

  /**
   * Update daily return configuration
   */
  async updateDailyReturnConfig(
    configId: string,
    data: Partial<schema.InsertDailyReturnConfig>,
    adminId: string
  ): Promise<schema.DailyReturnConfig | null> {
    const [config] = await db.update(schema.dailyReturnConfig)
      .set({ ...data, updatedAt: new Date(), updatedBy: adminId })
      .where(eq(schema.dailyReturnConfig.id, configId))
      .returning();

    if (config) {
      await db.insert(schema.adminActions).values({
        adminId,
        actionType: "update_daily_return_config",
        details: data,
      });
    }

    return config || null;
  },
};

export default miningService;
