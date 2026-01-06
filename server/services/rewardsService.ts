// Rewards Service
// Handles reward rules, promotions, and bonus distribution

import { db } from "../db";
import { eq, and, desc, sql, lte, gte, or, isNull } from "drizzle-orm";
import * as schema from "@shared/schema";
import { notificationService } from "./notificationService";
import { walletService } from "./walletService";

export const rewardsService = {
  /**
   * Get all reward rules
   */
  async getRewardRules(activeOnly = true): Promise<schema.RewardRule[]> {
    if (activeOnly) {
      return db.select().from(schema.rewardRules)
        .where(eq(schema.rewardRules.isActive, true))
        .orderBy(desc(schema.rewardRules.createdAt));
    }
    return db.select().from(schema.rewardRules)
      .orderBy(desc(schema.rewardRules.createdAt));
  },

  /**
   * Get reward rule by ID
   */
  async getRewardRuleById(ruleId: string): Promise<schema.RewardRule | null> {
    const rules = await db.select().from(schema.rewardRules)
      .where(eq(schema.rewardRules.id, ruleId));
    return rules[0] || null;
  },

  /**
   * Create reward rule
   */
  async createRewardRule(data: schema.InsertRewardRule): Promise<schema.RewardRule> {
    const [rule] = await db.insert(schema.rewardRules)
      .values(data)
      .returning();
    return rule;
  },

  /**
   * Update reward rule
   */
  async updateRewardRule(ruleId: string, data: Partial<schema.InsertRewardRule>): Promise<schema.RewardRule | null> {
    const [rule] = await db.update(schema.rewardRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.rewardRules.id, ruleId))
      .returning();
    return rule || null;
  },

  /**
   * Delete reward rule
   */
  async deleteRewardRule(ruleId: string): Promise<boolean> {
    await db.delete(schema.rewardRules)
      .where(eq(schema.rewardRules.id, ruleId));
    return true;
  },

  /**
   * Get active discounts/promotions
   */
  async getActiveDiscounts(): Promise<schema.Discount[]> {
    const now = new Date();
    return db.select().from(schema.discounts)
      .where(and(
        eq(schema.discounts.isActive, true),
        or(isNull(schema.discounts.validFrom), lte(schema.discounts.validFrom, now)),
        or(isNull(schema.discounts.validUntil), gte(schema.discounts.validUntil, now))
      ))
      .orderBy(desc(schema.discounts.createdAt));
  },

  /**
   * Create discount code
   */
  async createDiscount(data: schema.InsertDiscount): Promise<schema.Discount> {
    const [discount] = await db.insert(schema.discounts)
      .values(data)
      .returning();
    return discount;
  },

  /**
   * Update discount
   */
  async updateDiscount(discountId: string, data: Partial<schema.InsertDiscount>): Promise<schema.Discount | null> {
    const [discount] = await db.update(schema.discounts)
      .set(data)
      .where(eq(schema.discounts.id, discountId))
      .returning();
    return discount || null;
  },

  /**
   * Delete discount
   */
  async deleteDiscount(discountId: string): Promise<boolean> {
    await db.delete(schema.discounts)
      .where(eq(schema.discounts.id, discountId));
    return true;
  },

  /**
   * Apply discount code
   */
  async applyDiscount(code: string, amount: number): Promise<{ valid: boolean; discountAmount: number; error?: string }> {
    const now = new Date();
    const discounts = await db.select().from(schema.discounts)
      .where(and(
        eq(schema.discounts.code, code.toUpperCase()),
        eq(schema.discounts.isActive, true)
      ));

    if (discounts.length === 0) {
      return { valid: false, discountAmount: 0, error: "Invalid discount code" };
    }

    const discount = discounts[0];

    // Check validity period
    if (discount.validFrom && discount.validFrom > now) {
      return { valid: false, discountAmount: 0, error: "Discount not yet active" };
    }
    if (discount.validUntil && discount.validUntil < now) {
      return { valid: false, discountAmount: 0, error: "Discount has expired" };
    }

    // Check usage limit
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return { valid: false, discountAmount: 0, error: "Discount usage limit reached" };
    }

    const discountAmount = (amount * discount.discountPercent) / 100;

    // Increment usage count
    await db.update(schema.discounts)
      .set({ usedCount: (discount.usedCount || 0) + 1 })
      .where(eq(schema.discounts.id, discount.id));

    return { valid: true, discountAmount };
  },

  /**
   * Grant manual reward to user
   */
  async grantReward(
    userId: string,
    amount: number,
    currency: string,
    reason: string,
    adminId: string
  ): Promise<boolean> {
    // Credit user wallet
    const credited = await walletService.credit(userId, currency, amount, `Reward: ${reason}`, adminId);
    if (!credited) return false;

    // Notify user
    await notificationService.notifyReward(userId, amount, currency, reason);

    // Log admin action
    await db.insert(schema.adminActions).values({
      adminId,
      targetUserId: userId,
      actionType: "grant_reward",
      details: { amount, currency, reason },
    });

    return true;
  },

  /**
   * Grant reward to multiple users
   */
  async grantBulkReward(
    userIds: string[],
    amount: number,
    currency: string,
    reason: string,
    adminId: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      const granted = await this.grantReward(userId, amount, currency, reason, adminId);
      if (granted) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  },

  /**
   * Check and trigger automated rewards
   */
  async checkAndTriggerRewards(
    userId: string,
    triggerType: string,
    triggerData: Record<string, any>
  ): Promise<number> {
    const rules = await db.select().from(schema.rewardRules)
      .where(and(
        eq(schema.rewardRules.triggerType, triggerType),
        eq(schema.rewardRules.isActive, true)
      ));

    let rewardsGranted = 0;

    for (const rule of rules) {
      // Check trigger condition
      const condition = rule.triggerCondition as Record<string, any> | null;
      if (condition) {
        // Check minimum amount if applicable
        if (condition.minAmount && triggerData.amount < condition.minAmount) continue;
        if (condition.currency && triggerData.currency !== condition.currency) continue;
      }

      // Check validity period
      const now = new Date();
      if (rule.validFrom && rule.validFrom > now) continue;
      if (rule.validUntil && rule.validUntil < now) continue;

      // Check budget
      if (rule.totalBudget && (rule.usedBudget || 0) >= rule.totalBudget) continue;

      // Grant reward based on type
      let granted = false;
      if (rule.rewardType === "bonus" && rule.rewardCurrency) {
        granted = await walletService.credit(userId, rule.rewardCurrency, rule.rewardAmount, `Auto reward: ${rule.name}`);
      }

      if (granted) {
        // Update used budget
        await db.update(schema.rewardRules)
          .set({ usedBudget: (rule.usedBudget || 0) + rule.rewardAmount })
          .where(eq(schema.rewardRules.id, rule.id));

        // Notify user
        await notificationService.notifyReward(
          userId,
          rule.rewardAmount,
          rule.rewardCurrency || "USDT",
          rule.name
        );

        rewardsGranted++;
      }
    }

    return rewardsGranted;
  },
};

export default rewardsService;
