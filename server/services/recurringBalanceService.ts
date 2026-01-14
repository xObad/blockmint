import { db } from "../db";
import { recurringBalances, wallets, ledgerEntries } from "@shared/schema";
import { eq, and, lt, or, isNull } from "drizzle-orm";

/**
 * Recurring Balance Service
 * Handles automatic execution of daily/weekly/monthly balance additions
 */

export class RecurringBalanceService {
  /**
   * Execute all due recurring balances
   * Called by cron job (recommended every 5-10 minutes)
   */
  static async executeRecurring() {
    try {
      const now = new Date();

      // Find all recurring balances that:
      // 1. Are active
      // 2. Have a nextExecutionAt that has passed
      // 3. Either have no endDate or endDate is in the future
      const dueBalances = await db.select()
        .from(recurringBalances)
        .where(
          and(
            eq(recurringBalances.isActive, true),
            lt(recurringBalances.nextExecutionAt!, now)
          )
        );

      console.log(`[RecurringBalance] Found ${dueBalances.length} due recurring balances`);

      for (const rb of dueBalances) {
        // Check if ended
        if (rb.endDate && rb.endDate < now) {
          continue; // Skip ended recurring balances
        }
        await this.executeOneRecurringBalance(rb, now);
      }

      return { executed: dueBalances.length };
    } catch (error) {
      console.error("[RecurringBalance] Error executing recurring balances:", error);
      throw error;
    }
  }

  /**
   * Execute a single recurring balance
   */
  private static async executeOneRecurringBalance(rb: any, executionTime: Date) {
    try {
      const { userId, symbol, amount, frequency, id } = rb;

      // Get or create wallet
      const existingWallet = await db.select()
        .from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.symbol, symbol)));

      let newBalance = amount;
      if (existingWallet.length > 0) {
        newBalance = existingWallet[0].balance + amount;
      }

      // Update or create wallet
      if (existingWallet.length > 0) {
        await db.update(wallets)
          .set({ balance: newBalance })
          .where(eq(wallets.id, existingWallet[0].id));
      } else {
        // Need to provide name for new wallet
        const names: Record<string, string> = {
          USDT: "Tether",
          BTC: "Bitcoin",
          ETH: "Ethereum",
          LTC: "Litecoin",
          BNB: "BNB",
          USDC: "USD Coin",
          ZCASH: "ZCash",
          TON: "TON",
        };

        await db.insert(wallets).values({
          userId,
          symbol,
          name: names[symbol] || symbol,
          balance: newBalance,
        });
      }

      // Create ledger entry
      const balanceBefore = existingWallet.length > 0 ? existingWallet[0].balance : 0;
      await db.insert(ledgerEntries).values({
        userId,
        symbol,
        type: "recurring_bonus",
        amount,
        balanceBefore,
        balanceAfter: newBalance,
        referenceType: "recurring_balance",
        referenceId: id,
        note: `${frequency} recurring bonus`,
      });

      // Calculate next execution
      const next = new Date(executionTime);
      if (frequency === "daily") {
        next.setDate(next.getDate() + 1);
      } else if (frequency === "weekly") {
        next.setDate(next.getDate() + 7);
      } else if (frequency === "monthly") {
        next.setMonth(next.getMonth() + 1);
      }

      // Update recurring balance with last and next execution times
      await db.update(recurringBalances)
        .set({
          lastExecutedAt: executionTime,
          nextExecutionAt: next,
        })
        .where(eq(recurringBalances.id, id));

      console.log(`[RecurringBalance] ✅ Executed: ${userId} received ${amount} ${symbol}`);
      return true;
    } catch (error) {
      console.error(`[RecurringBalance] ❌ Failed to execute recurring balance ${rb.id}:`, error);
      return false;
    }
  }

  /**
   * Get execution stats
   */
  static async getStats() {
    try {
      const total = await db.select().from(recurringBalances);
      const active = total.filter(rb => rb.isActive);
      const executed = total.filter(rb => rb.lastExecutedAt !== null);

      return {
        total: total.length,
        active: active.length,
        executed: executed.length,
        pending: active.filter(rb => rb.nextExecutionAt && rb.nextExecutionAt > new Date()).length,
      };
    } catch (error) {
      console.error("[RecurringBalance] Error getting stats:", error);
      return { total: 0, active: 0, executed: 0, pending: 0 };
    }
  }
}

export default RecurringBalanceService;
