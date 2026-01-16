// Wallet Service
// Handles wallet operations, balances, deposits, and withdrawals

import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { notificationService } from "./notificationService";

export interface BalanceAdjustment {
  userId: string;
  symbol: string;
  amount: number;
  type: "credit" | "debit";
  note?: string;
  adminId?: string;
}

export const walletService = {
  /**
   * Get user wallets with balances
   */
  async getUserWallets(userId: string): Promise<schema.Wallet[]> {
    return db.select().from(schema.wallets)
      .where(eq(schema.wallets.userId, userId));
  },

  /**
   * Get single wallet by user and symbol
   */
  async getWallet(userId: string, symbol: string): Promise<schema.Wallet | null> {
    const wallets = await db.select().from(schema.wallets)
      .where(and(
        eq(schema.wallets.userId, userId),
        eq(schema.wallets.symbol, symbol)
      ));
    return wallets[0] || null;
  },

  /**
   * Create or update wallet balance
   */
  async ensureWallet(userId: string, symbol: string, name: string): Promise<schema.Wallet> {
    const existing = await this.getWallet(userId, symbol);
    if (existing) return existing;

    const [wallet] = await db.insert(schema.wallets).values({
      userId,
      symbol,
      name,
      balance: 0,
    }).returning();

    return wallet;
  },

  /**
   * Adjust balance (add or subtract)
   */
  async adjustBalance(adjustment: BalanceAdjustment): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const { userId, symbol, amount, type, note, adminId } = adjustment;

    const wallet = await this.getWallet(userId, symbol);
    if (!wallet) {
      return { success: false, newBalance: 0, error: "Wallet not found" };
    }

    const currentBalance = wallet.balance || 0;
    const adjustedAmount = type === "credit" ? amount : -amount;
    const newBalance = currentBalance + adjustedAmount;

    if (newBalance < 0) {
      return { success: false, newBalance: currentBalance, error: "Insufficient balance" };
    }

    // Update wallet balance
    await db.update(schema.wallets)
      .set({ balance: newBalance })
      .where(eq(schema.wallets.id, wallet.id));

    // Create ledger entry for audit trail
    await db.insert(schema.ledgerEntries).values({
      userId,
      symbol,
      type: type === "credit" ? "admin_credit" : "admin_debit",
      amount: adjustedAmount,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      note,
      adminId,
    });

    // Log admin action if performed by admin
    if (adminId) {
      await db.insert(schema.adminActions).values({
        adminId,
        targetUserId: userId,
        actionType: type === "credit" ? "credit_balance" : "debit_balance",
        details: { symbol, amount, newBalance, note },
      });
    }

    return { success: true, newBalance };
  },

  /**
   * Exchange crypto balances
   */
  async exchange(userId: string, fromSymbol: string, toSymbol: string, amount: number, toAmount: number): Promise<{ success: boolean; error?: string }> {
    // 1. Check source balance
    const fromWallet = await this.getWallet(userId, fromSymbol);
    if (!fromWallet || fromWallet.balance < amount) {
      return { success: false, error: "Insufficient balance" };
    }

    // 2. Perform Debit
    const debitResult = await this.adjustBalance({
      userId,
      symbol: fromSymbol,
      amount,
      type: "debit",
      note: `Exchange to ${toSymbol}`
    });

    if (!debitResult.success) {
      return { success: false, error: debitResult.error || "Failed to debit source wallet" };
    }

    // 3. Ensure target wallet exists
    await this.ensureWallet(userId, toSymbol, toSymbol);

    // 4. Perform Credit
    const creditResult = await this.adjustBalance({
      userId,
      symbol: toSymbol,
      amount: toAmount,
      type: "credit",
      note: `Exchange from ${fromSymbol}`
    });

    if (!creditResult.success) {
      // Rollback debit
      await this.adjustBalance({
        userId,
        symbol: fromSymbol,
        amount,
        type: "credit",
        note: `ROLLBACK: Exchange to ${toSymbol} failed`
      });
      return { success: false, error: creditResult.error || "Failed to credit target wallet" };
    }

    return { success: true };
  },

  /**
   * Credit user balance
   */
  async credit(userId: string, symbol: string, amount: number, note?: string, adminId?: string): Promise<boolean> {
    const result = await this.adjustBalance({ userId, symbol, amount, type: "credit", note, adminId });
    return result.success;
  },

  /**
   * Debit user balance
   */
  async debit(userId: string, symbol: string, amount: number, note?: string, adminId?: string): Promise<boolean> {
    const result = await this.adjustBalance({ userId, symbol, amount, type: "debit", note, adminId });
    return result.success;
  },

  /**
   * Get total platform balances
   */
  async getTotalBalances(): Promise<Record<string, number>> {
    const result = await db.select({
      symbol: schema.wallets.symbol,
      total: sql<number>`sum(${schema.wallets.balance})`,
    })
      .from(schema.wallets)
      .groupBy(schema.wallets.symbol);

    const balances: Record<string, number> = {};
    for (const row of result) {
      balances[row.symbol] = Number(row.total || 0);
    }
    return balances;
  },

  /**
   * Get user transaction history
   */
  async getTransactions(userId: string, limit = 50): Promise<schema.Transaction[]> {
    return db.select().from(schema.transactions)
      .where(eq(schema.transactions.userId, userId))
      .orderBy(desc(schema.transactions.createdAt))
      .limit(limit);
  },

  /**
   * Create transaction record
   */
  async createTransaction(data: schema.InsertTransaction): Promise<schema.Transaction> {
    const [transaction] = await db.insert(schema.transactions)
      .values(data)
      .returning();
    return transaction;
  },

  /**
   * Create withdrawal request
   */
  async createWithdrawalRequest(
    userId: string,
    symbol: string,
    network: string,
    amount: number,
    fee: number,
    toAddress: string
  ): Promise<{ success: boolean; request?: schema.WithdrawalRequest; error?: string }> {
    // Check balance
    const wallet = await this.getWallet(userId, symbol);
    if (!wallet || wallet.balance < amount) {
      return { success: false, error: "Insufficient balance" };
    }

    const netAmount = amount - fee;
    if (netAmount <= 0) {
      return { success: false, error: "Amount too small after fee" };
    }

    // Debit the balance immediately (hold)
    const debitResult = await this.debit(userId, symbol, amount, "Withdrawal request hold");
    if (!debitResult) {
      return { success: false, error: "Failed to hold balance" };
    }

    // Create withdrawal request
    const [request] = await db.insert(schema.withdrawalRequests).values({
      userId,
      symbol,
      network,
      amount,
      fee,
      netAmount,
      toAddress,
      status: "pending",
    }).returning();

    // Notify user
    await notificationService.notifyWithdrawal(userId, amount, symbol, "pending");

    // Notify admins
    await notificationService.notifyAdminWithdrawalRequest(userId, amount, symbol, request.id);

    return { success: true, request };
  },

  /**
   * Approve withdrawal request
   */
  async approveWithdrawal(requestId: string, adminId: string, txHash?: string): Promise<boolean> {
    const requests = await db.select().from(schema.withdrawalRequests)
      .where(eq(schema.withdrawalRequests.id, requestId));

    if (requests.length === 0) return false;
    const request = requests[0];

    await db.update(schema.withdrawalRequests)
      .set({
        status: "completed",
        adminId,
        txHash,
        processedAt: new Date(),
        completedAt: new Date(),
      })
      .where(eq(schema.withdrawalRequests.id, requestId));

    // Notify user
    await notificationService.notifyWithdrawal(request.userId, request.amount, request.symbol, "completed");

    // Log admin action
    await db.insert(schema.adminActions).values({
      adminId,
      targetUserId: request.userId,
      actionType: "approve_withdrawal",
      details: { requestId, amount: request.amount, symbol: request.symbol, txHash },
    });

    return true;
  },

  /**
   * Reject withdrawal request
   */
  async rejectWithdrawal(requestId: string, adminId: string, reason: string): Promise<boolean> {
    const requests = await db.select().from(schema.withdrawalRequests)
      .where(eq(schema.withdrawalRequests.id, requestId));

    if (requests.length === 0) return false;
    const request = requests[0];

    // Refund the held balance
    await this.credit(request.userId, request.symbol, request.amount, `Withdrawal rejected: ${reason}`);

    await db.update(schema.withdrawalRequests)
      .set({
        status: "rejected",
        adminId,
        rejectedAt: new Date(),
        rejectionReason: reason,
      })
      .where(eq(schema.withdrawalRequests.id, requestId));

    // Notify user
    await notificationService.notifyWithdrawal(request.userId, request.amount, request.symbol, "rejected");

    // Log admin action
    await db.insert(schema.adminActions).values({
      adminId,
      targetUserId: request.userId,
      actionType: "reject_withdrawal",
      details: { requestId, reason },
    });

    return true;
  },

  /**
   * Get pending withdrawal requests
   */
  async getPendingWithdrawals(): Promise<schema.WithdrawalRequest[]> {
    return db.select().from(schema.withdrawalRequests)
      .where(eq(schema.withdrawalRequests.status, "pending"))
      .orderBy(desc(schema.withdrawalRequests.requestedAt));
  },

  /**
   * Get all withdrawal requests with optional status filter
   */
  async getWithdrawals(status?: string, limit = 50): Promise<schema.WithdrawalRequest[]> {
    let query = db.select().from(schema.withdrawalRequests);
    
    if (status) {
      query = query.where(eq(schema.withdrawalRequests.status, status)) as typeof query;
    }

    return query.orderBy(desc(schema.withdrawalRequests.requestedAt)).limit(limit);
  },
};

export default walletService;
