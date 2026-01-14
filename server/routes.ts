import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  users, depositAddresses, ledgerEntries, withdrawalRequests, 
  adminActions, networkConfig, blockchainDeposits, interestPayments,
  miningPurchases, notifications
} from "@shared/schema";
import { blockchainService } from "./services/blockchain";
import { getMasterWalletService } from "./services/hdWalletService";
import { authService } from "./services/authService";
import { eq, and, desc } from "drizzle-orm";
import { generateSecret, generate, verify } from "otplib";
import QRCode from "qrcode";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Mining Stats
  app.get("/api/mining/stats", async (_req, res) => {
    try {
      const stats = await storage.getMiningStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get mining stats" });
    }
  });

  app.post("/api/mining/toggle", async (_req, res) => {
    try {
      const currentStats = await storage.getMiningStats();
      const updatedStats = await storage.updateMiningStats({ 
        isActive: !currentStats.isActive 
      });
      res.json(updatedStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle mining" });
    }
  });

  // Wallet
  app.get("/api/wallet/balances", async (_req, res) => {
    try {
      const balances = await storage.getWalletBalances();
      const totalBalance = balances.reduce((sum, b) => sum + b.usdValue, 0);
      const change24h = storage.get24hChange();
      res.json({ balances, totalBalance, change24h });
    } catch (error) {
      res.status(500).json({ error: "Failed to get wallet balances" });
    }
  });

  app.get("/api/wallet/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  // Mining Pools
  app.get("/api/pools", async (_req, res) => {
    try {
      const pools = await storage.getMiningPools();
      res.json(pools);
    } catch (error) {
      res.status(500).json({ error: "Failed to get mining pools" });
    }
  });

  app.post("/api/pools/:id/select", async (req, res) => {
    try {
      const pools = await storage.selectPool(req.params.id);
      res.json(pools);
    } catch (error) {
      res.status(500).json({ error: "Failed to select pool" });
    }
  });

  // Chart Data
  app.get("/api/chart", async (_req, res) => {
    try {
      const chartData = await storage.getChartData();
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ error: "Failed to get chart data" });
    }
  });

  // Portfolio History (7-day)
  app.get("/api/portfolio/history", async (_req, res) => {
    try {
      // Return actual portfolio history for the last 7 days
      const data = [];
      const now = new Date();
      const balances = await storage.getWalletBalances();
      const currentValue = balances.reduce((sum, b) => sum + b.usdValue, 0);

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        
        data.push({
          day: dayName,
          value: currentValue, // Use actual balance value
          timestamp: date.toISOString(),
        });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get portfolio history" });
    }
  });

  // Settings
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const allowedKeys = ['miningIntensity', 'notificationsEnabled', 'powerSaver', 'selectedPool', 'twoFactorEnabled', 'biometricEnabled', 'currency', 'language', 'sessionTimeout'];
      const validatedSettings: Record<string, any> = {};
      
      for (const key of allowedKeys) {
        if (req.body[key] !== undefined) {
          validatedSettings[key] = req.body[key];
        }
      }
      
      const settings = await storage.updateSettings(validatedSettings);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // =====================================================
  // WALLET & DEPOSIT ADDRESS ROUTES
  // =====================================================

  // Get or generate deposit address for a user
  app.post("/api/wallet/deposit-address", async (req, res) => {
    try {
      const { userId, network, symbol } = req.body;
      
      if (!userId || !network || !symbol) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if address already exists
      const existing = await db.select()
        .from(depositAddresses)
        .where(
          and(
            eq(depositAddresses.userId, userId),
            eq(depositAddresses.network, network),
            eq(depositAddresses.symbol, symbol)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return res.json({ address: existing[0].address, existing: true });
      }

      // Get next derivation index
      const maxIndex = await db.select()
        .from(depositAddresses)
        .orderBy(desc(depositAddresses.derivationIndex))
        .limit(1);

      const nextIndex = maxIndex.length > 0 ? maxIndex[0].derivationIndex + 1 : 1;

      // Generate address from HD wallet based on cryptocurrency type
      let address: string | null = null;
      
      // Get HD wallet service
      const hdWallet = getMasterWalletService();
      
      if (symbol === 'BTC' && hdWallet) {
        // Bitcoin address generation
        const btcAddress = hdWallet.generateBitcoinAddress(nextIndex);
        address = btcAddress.address;
      } else if (symbol === 'LTC' && hdWallet) {
        // Litecoin address generation
        const ltcAddress = hdWallet.generateLitecoinAddress(nextIndex);
        address = ltcAddress.address;
      } else if (symbol === 'ZCASH' && hdWallet) {
        // Zcash address generation
        const zcashAddress = hdWallet.generateZcashAddress(nextIndex);
        address = zcashAddress.address;
      } else if ((symbol === 'ETH' || symbol === 'USDT' || symbol === 'USDC' || symbol === 'BNB') && hdWallet) {
        // Ethereum and EVM tokens use the same address
        const ethAddress = hdWallet.generateEthereumAddress(nextIndex);
        address = ethAddress.address;
      } else {
        // Fallback to EVM blockchain service
        address = blockchainService.deriveDepositAddress(nextIndex);
      }
      
      if (!address) {
        return res.status(500).json({ error: "HD wallet not initialized or address generation failed" });
      }

      // Save to database
      const [newAddress] = await db.insert(depositAddresses).values({
        userId,
        network,
        symbol,
        address,
        derivationIndex: nextIndex,
      }).returning();

      res.json({ address: newAddress.address, existing: false });
    } catch (error) {
      console.error("Generate deposit address error:", error);
      res.status(500).json({ error: "Failed to generate deposit address" });
    }
  });

  // Get all deposit addresses for a user
  app.get("/api/wallet/deposit-addresses/:userId", async (req, res) => {
    try {
      const addresses = await db.select()
        .from(depositAddresses)
        .where(eq(depositAddresses.userId, req.params.userId));
      
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to get deposit addresses" });
    }
  });

  // Get user's ledger balance for a specific symbol
  app.get("/api/wallet/ledger-balance/:userId/:symbol", async (req, res) => {
    try {
      const { userId, symbol } = req.params;
      
      // Get the latest ledger entry for this user and symbol
      const latestEntry = await db.select()
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.userId, userId),
            eq(ledgerEntries.symbol, symbol)
          )
        )
        .orderBy(desc(ledgerEntries.createdAt))
        .limit(1);

      const balance = latestEntry.length > 0 ? latestEntry[0].balanceAfter : 0;
      res.json({ symbol, balance });
    } catch (error) {
      res.status(500).json({ error: "Failed to get ledger balance" });
    }
  });

  // Get all ledger balances for a user
  app.get("/api/wallet/ledger-balances/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get latest balance for each symbol
      const entries = await db.select()
        .from(ledgerEntries)
        .where(eq(ledgerEntries.userId, userId))
        .orderBy(desc(ledgerEntries.createdAt));

      // Group by symbol and get latest balance
      const balanceMap: Record<string, number> = {};
      for (const entry of entries) {
        if (!(entry.symbol in balanceMap)) {
          balanceMap[entry.symbol] = entry.balanceAfter;
        }
      }

      res.json(balanceMap);
    } catch (error) {
      res.status(500).json({ error: "Failed to get ledger balances" });
    }
  });

  // Create withdrawal request
  app.post("/api/wallet/withdraw", async (req, res) => {
    try {
      const { userId, symbol, network, amount, toAddress } = req.body;
      
      if (!userId || !symbol || !network || !amount || !toAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate address
      if (!blockchainService.isValidAddress(toAddress)) {
        return res.status(400).json({ error: "Invalid withdrawal address" });
      }

      // Get current balance
      const latestEntry = await db.select()
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.userId, userId),
            eq(ledgerEntries.symbol, symbol)
          )
        )
        .orderBy(desc(ledgerEntries.createdAt))
        .limit(1);

      const currentBalance = latestEntry.length > 0 ? latestEntry[0].balanceAfter : 0;

      // Get network config for fee
      const networkCfg = await db.select()
        .from(networkConfig)
        .where(eq(networkConfig.network, network))
        .limit(1);

      const fee = networkCfg.length > 0 ? networkCfg[0].withdrawalFee : 0;
      const minWithdrawal = networkCfg.length > 0 ? networkCfg[0].minWithdrawal : 0;

      if (amount < minWithdrawal) {
        return res.status(400).json({ 
          error: `Minimum withdrawal is ${minWithdrawal} ${symbol}` 
        });
      }

      const totalRequired = amount + fee;
      if (currentBalance < totalRequired) {
        return res.status(400).json({ 
          error: "Insufficient balance",
          balance: currentBalance,
          required: totalRequired
        });
      }

      const netAmount = amount - fee;

      // Create withdrawal request
      const [request] = await db.insert(withdrawalRequests).values({
        userId,
        symbol,
        network,
        amount,
        fee,
        netAmount,
        toAddress,
        status: "pending",
      }).returning();

      res.json({ 
        success: true, 
        requestId: request.id,
        message: "Withdrawal request submitted for approval"
      });
    } catch (error) {
      console.error("Withdrawal request error:", error);
      res.status(500).json({ error: "Failed to create withdrawal request" });
    }
  });

  // Get user's withdrawal history
  app.get("/api/wallet/withdrawals/:userId", async (req, res) => {
    try {
      const withdrawals = await db.select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.userId, req.params.userId))
        .orderBy(desc(withdrawalRequests.requestedAt));
      
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: "Failed to get withdrawal history" });
    }
  });

  // Get user's transaction/ledger history
  app.get("/api/wallet/ledger/:userId", async (req, res) => {
    try {
      const entries = await db.select()
        .from(ledgerEntries)
        .where(eq(ledgerEntries.userId, req.params.userId))
        .orderBy(desc(ledgerEntries.createdAt))
        .limit(100);
      
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to get ledger history" });
    }
  });

  // =====================================================
  // ADMIN ROUTES
  // =====================================================

  // Get all users (admin only)
  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Get user details with balances
  app.get("/api/admin/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get all ledger balances
      const entries = await db.select()
        .from(ledgerEntries)
        .where(eq(ledgerEntries.userId, userId))
        .orderBy(desc(ledgerEntries.createdAt));

      const balances: Record<string, number> = {};
      for (const entry of entries) {
        if (!(entry.symbol in balances)) {
          balances[entry.symbol] = entry.balanceAfter;
        }
      }

      // Get deposit addresses
      const addresses = await db.select()
        .from(depositAddresses)
        .where(eq(depositAddresses.userId, userId));

      // Get withdrawal requests
      const withdrawals = await db.select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.userId, userId))
        .orderBy(desc(withdrawalRequests.requestedAt))
        .limit(20);

      res.json({ user, balances, addresses, withdrawals });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user details" });
    }
  });

  // Get user purchases/orders (admin view)
  app.get("/api/admin/users/:userId/purchases", async (req, res) => {
    try {
      const { userId } = req.params;
      const { orders, miningPurchases, earnSubscriptions } = await import("@shared/schema");
      
      // Get all orders for this user
      const userOrders = await db.select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

      // Fetch associated mining purchases and earn subscriptions
      const miningData = await db.select()
        .from(miningPurchases)
        .where(eq(miningPurchases.userId, userId));

      const earnData = await db.select()
        .from(earnSubscriptions)
        .where(eq(earnSubscriptions.userId, userId));

      // Combine data
      const enrichedOrders = userOrders.map(order => {
        let details = {};
        
        if (order.type === "mining_purchase") {
          const mining = miningData.find(m => m.id === order.productId);
          if (mining) {
            details = {
              packageName: mining.packageName,
              crypto: mining.crypto,
              symbol: mining.symbol,
              hashrate: mining.hashrate,
              hashrateUnit: mining.hashrateUnit,
              status: mining.status,
              totalEarned: mining.totalEarned,
              purchaseDate: mining.purchaseDate,
            };
          }
        } else if (order.type === "earn_subscription") {
          const earn = earnData.find(e => e.id === order.productId);
          if (earn) {
            details = {
              planId: earn.planId,
              symbol: earn.symbol,
              durationType: earn.durationType,
              aprRate: earn.aprRate,
              status: earn.status,
              totalEarned: earn.totalEarned,
              startDate: earn.startDate,
              endDate: earn.endDate,
            };
          }
        }

        return {
          ...order,
          details
        };
      });

      res.json({ orders: enrichedOrders });
    } catch (error) {
      console.error("Error getting user purchases:", error);
      res.status(500).json({ error: "Failed to get user purchases" });
    }
  });

  // Admin: Credit or debit user balance
  app.post("/api/admin/adjust-balance", async (req, res) => {
    try {
      const { adminId, targetUserId, symbol, amount, type, note } = req.body;

      if (!adminId || !targetUserId || !symbol || amount === undefined || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!["credit", "debit"].includes(type)) {
        return res.status(400).json({ error: "Type must be 'credit' or 'debit'" });
      }

      // Get current balance
      const latestEntry = await db.select()
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.userId, targetUserId),
            eq(ledgerEntries.symbol, symbol)
          )
        )
        .orderBy(desc(ledgerEntries.createdAt))
        .limit(1);

      const balanceBefore = latestEntry.length > 0 ? latestEntry[0].balanceAfter : 0;
      const adjustedAmount = type === "credit" ? Math.abs(amount) : -Math.abs(amount);
      const balanceAfter = balanceBefore + adjustedAmount;

      if (balanceAfter < 0) {
        return res.status(400).json({ 
          error: "Insufficient balance for debit",
          currentBalance: balanceBefore
        });
      }

      // Create ledger entry
      const [entry] = await db.insert(ledgerEntries).values({
        userId: targetUserId,
        symbol,
        type: `admin_${type}`,
        amount: Math.abs(amount),
        balanceBefore,
        balanceAfter,
        referenceType: "admin_action",
        note: note || `Admin ${type} by ${adminId}`,
        adminId,
      }).returning();

      // Log admin action
      await db.insert(adminActions).values({
        adminId,
        targetUserId,
        actionType: `balance_${type}`,
        details: { symbol, amount, balanceBefore, balanceAfter, note },
      });

      res.json({ 
        success: true, 
        entry,
        newBalance: balanceAfter
      });
    } catch (error) {
      console.error("Admin adjust balance error:", error);
      res.status(500).json({ error: "Failed to adjust balance" });
    }
  });

  // Admin: Get pending withdrawals
  app.get("/api/admin/withdrawals/pending", async (_req, res) => {
    try {
      const pending = await db.select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.status, "pending"))
        .orderBy(desc(withdrawalRequests.requestedAt));
      
      res.json(pending);
    } catch (error) {
      res.status(500).json({ error: "Failed to get pending withdrawals" });
    }
  });

  // Admin: Approve or reject withdrawal
  app.post("/api/admin/withdrawals/:id/process", async (req, res) => {
    try {
      const { id } = req.params;
      const { adminId, action, txHash, note } = req.body;

      if (!adminId || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const [request] = await db.select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.id, id));

      if (!request) {
        return res.status(404).json({ error: "Withdrawal request not found" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({ error: "Request already processed" });
      }

      if (action === "approve") {
        // Deduct from user's balance
        const latestEntry = await db.select()
          .from(ledgerEntries)
          .where(
            and(
              eq(ledgerEntries.userId, request.userId),
              eq(ledgerEntries.symbol, request.symbol)
            )
          )
          .orderBy(desc(ledgerEntries.createdAt))
          .limit(1);

        const balanceBefore = latestEntry.length > 0 ? latestEntry[0].balanceAfter : 0;
        const balanceAfter = balanceBefore - request.amount;

        if (balanceAfter < 0) {
          return res.status(400).json({ error: "Insufficient balance" });
        }

        // Create ledger entry for withdrawal
        await db.insert(ledgerEntries).values({
          userId: request.userId,
          symbol: request.symbol,
          network: request.network,
          type: "withdrawal",
          amount: request.amount,
          balanceBefore,
          balanceAfter,
          referenceType: "withdrawal",
          referenceId: request.id,
          txHash,
          adminId,
        });

        // Update withdrawal request
        await db.update(withdrawalRequests)
          .set({
            status: "completed",
            txHash,
            adminId,
            adminNote: note,
            processedAt: new Date(),
            completedAt: new Date(),
          })
          .where(eq(withdrawalRequests.id, id));

      } else {
        // Reject withdrawal
        await db.update(withdrawalRequests)
          .set({
            status: "rejected",
            adminId,
            rejectionReason: note,
            rejectedAt: new Date(),
          })
          .where(eq(withdrawalRequests.id, id));
      }

      // Log admin action
      await db.insert(adminActions).values({
        adminId,
        targetUserId: request.userId,
        actionType: `withdrawal_${action}`,
        details: { withdrawalId: id, amount: request.amount, symbol: request.symbol, txHash, note },
      });

      res.json({ success: true, action });
    } catch (error) {
      console.error("Process withdrawal error:", error);
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  // Admin: Get admin action logs
  app.get("/api/admin/logs", async (_req, res) => {
    try {
      const logs = await db.select()
        .from(adminActions)
        .orderBy(desc(adminActions.createdAt))
        .limit(100);
      
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get admin logs" });
    }
  });

  // Admin: Get network configurations
  app.get("/api/admin/networks", async (_req, res) => {
    try {
      const networks = await db.select().from(networkConfig);
      res.json(networks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get network config" });
    }
  });

  // Admin: Update network configuration
  app.patch("/api/admin/networks/:network", async (req, res) => {
    try {
      const { network: networkName } = req.params;
      const updates = req.body;

      const [updated] = await db.update(networkConfig)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(networkConfig.network, networkName))
        .returning();

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update network config" });
    }
  });

  // Blockchain service status
  app.get("/api/blockchain/status", async (_req, res) => {
    res.json({
      initialized: blockchainService.isInitialized(),
      masterAddress: blockchainService.getMasterAddress(),
    });
  });

  // =====================================================
  // NOTIFICATION ROUTES
  // =====================================================

  // Get user notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const includeRead = req.query.includeRead !== "false";

      const { notificationService } = await import("./services/notificationService");
      const notifications = await notificationService.getUserNotifications(userId, limit, includeRead);
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      const { notificationId } = req.params;
      const { notificationService } = await import("./services/notificationService");
      await notificationService.markAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read for a user
  app.post("/api/notifications/:userId/mark-all-read", async (req, res) => {
    try {
      const { userId } = req.params;
      const { notificationService } = await import("./services/notificationService");
      await notificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:notificationId", async (req, res) => {
    try {
      const { notificationId } = req.params;
      const { notificationService } = await import("./services/notificationService");
      await notificationService.delete(notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // Admin: Get admin notifications
  app.get("/api/admin/notifications", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const includeRead = req.query.includeRead !== "false";

      const { notificationService } = await import("./services/notificationService");
      const notifications = await notificationService.getAdminNotifications(limit, includeRead);
      const unreadCount = await notificationService.getUnreadAdminCount();

      res.json({ notifications, unreadCount });
    } catch (error) {
      res.status(500).json({ error: "Failed to get admin notifications" });
    }
  });

  // Admin: Send broadcast notification
  app.post("/api/admin/notifications/broadcast", async (req, res) => {
    try {
      const { title, message, type = "promotion" } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({ error: "Title and message are required" });
      }

      const { notificationService } = await import("./services/notificationService");
      const count = await notificationService.createBroadcast(title, message, type);
      res.json({ success: true, notificationsSent: count });
    } catch (error) {
      res.status(500).json({ error: "Failed to send broadcast notification" });
    }
  });

  // Admin: Send notification to specific user
  app.post("/api/admin/notifications/send", async (req, res) => {
    try {
      const { userId, title, message, type = "system", priority = "normal" } = req.body;
      
      if (!userId || !title || !message) {
        return res.status(400).json({ error: "userId, title and message are required" });
      }

      const { notificationService } = await import("./services/notificationService");
      const notification = await notificationService.create({
        userId,
        type,
        title,
        message,
        priority,
      });
      res.json({ success: true, notification });
    } catch (error) {
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // =====================================================
  // SUPPORT TICKET ROUTES
  // =====================================================

  // Create support ticket
  app.post("/api/support/tickets", async (req, res) => {
    try {
      const { userId, subject, description, category = "general", priority = "normal" } = req.body;
      
      if (!userId || !subject || !description) {
        return res.status(400).json({ error: "userId, subject and description are required" });
      }

      const { supportTickets } = await import("@shared/schema");
      const [ticket] = await db.insert(supportTickets).values({
        userId,
        subject,
        description,
        category,
        priority,
      }).returning();

      // Notify admins
      const { notificationService } = await import("./services/notificationService");
      await notificationService.notifyAdminSupportTicket(ticket.id, subject, userId);

      res.json(ticket);
    } catch (error) {
      console.error("Create ticket error:", error);
      res.status(500).json({ error: "Failed to create support ticket" });
    }
  });

  // Get user's tickets
  app.get("/api/support/tickets/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { supportTickets } = await import("@shared/schema");
      
      const tickets = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.userId, userId))
        .orderBy(desc(supportTickets.createdAt));

      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to get support tickets" });
    }
  });

  // Get ticket messages
  app.get("/api/support/tickets/:ticketId/messages", async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { ticketMessages } = await import("@shared/schema");
      
      const messages = await db.select()
        .from(ticketMessages)
        .where(eq(ticketMessages.ticketId, ticketId))
        .orderBy(ticketMessages.createdAt);

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get ticket messages" });
    }
  });

  // Add message to ticket
  app.post("/api/support/tickets/:ticketId/messages", async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { userId, message, isAdmin = false } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ error: "userId and message are required" });
      }

      const { ticketMessages, supportTickets } = await import("@shared/schema");
      
      const [msg] = await db.insert(ticketMessages).values({
        ticketId,
        userId,
        message,
        isAdmin,
      }).returning();

      // Update ticket updated time
      await db.update(supportTickets)
        .set({ updatedAt: new Date() })
        .where(eq(supportTickets.id, ticketId));

      res.json(msg);
    } catch (error) {
      res.status(500).json({ error: "Failed to add message" });
    }
  });

  // =====================================================
  // USER NOTIFICATION PREFERENCES
  // =====================================================

  // Get notification preferences
  app.get("/api/users/:userId/notification-preferences", async (req, res) => {
    try {
      const { userId } = req.params;
      const { notificationPreferences } = await import("@shared/schema");
      
      const prefs = await db.select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));

      if (prefs.length === 0) {
        // Return defaults
        res.json({
          deposits: true,
          withdrawals: true,
          rewards: true,
          dailyReturns: true,
          promotions: true,
          systemAlerts: true,
          emailNotifications: true,
          pushNotifications: true,
        });
      } else {
        res.json(prefs[0]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get notification preferences" });
    }
  });

  // Update notification preferences
  app.patch("/api/users/:userId/notification-preferences", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      const { userService } = await import("./services/userService");
      
      const prefs = await userService.updateNotificationPreferences(userId, updates);
      res.json(prefs);
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification preferences" });
    }
  });

  // =====================================================
  // EARN/YIELD PLANS (Public Routes)
  // =====================================================

  // Get active earn plans
  app.get("/api/earn-plans", async (_req, res) => {
    try {
      const { earnPlans } = await import("@shared/schema");
      const plans = await db.select()
        .from(earnPlans)
        .where(eq(earnPlans.isActive, true))
        .orderBy(earnPlans.order);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to get earn plans" });
    }
  });

  // Get earn APR rates
  app.get("/api/earn-rates", async (_req, res) => {
    try {
      const { earnPageSettings } = await import("@shared/schema");
      const settings = await db.select().from(earnPageSettings);
      
      // Default rates if not configured
      const defaultRates = {
        daily: { rate: 17.9, label: "Daily", period: 1 },
        weekly: { rate: 18.0, label: "Weekly", period: 7 },
        monthly: { rate: 18.25, label: "Monthly", period: 30 },
        quarterly: { rate: 18.7, label: "Quarterly", period: 90 },
        yearly: { rate: 19.25, label: "Yearly", period: 365 },
      };

      // Override with admin settings if available
      const dailySetting = settings.find(s => s.key === "daily_apr");
      const weeklySetting = settings.find(s => s.key === "weekly_apr");
      const monthlySetting = settings.find(s => s.key === "monthly_apr");
      const quarterlySetting = settings.find(s => s.key === "quarterly_apr");
      const yearlySetting = settings.find(s => s.key === "yearly_apr");

      if (dailySetting) defaultRates.daily.rate = parseFloat(dailySetting.value);
      if (weeklySetting) defaultRates.weekly.rate = parseFloat(weeklySetting.value);
      if (monthlySetting) defaultRates.monthly.rate = parseFloat(monthlySetting.value);
      if (quarterlySetting) defaultRates.quarterly.rate = parseFloat(quarterlySetting.value);
      if (yearlySetting) defaultRates.yearly.rate = parseFloat(yearlySetting.value);

      res.json(defaultRates);
    } catch (error) {
      res.status(500).json({ error: "Failed to get earn rates" });
    }
  });

  // Get earn FAQs (public)
  app.get("/api/content/earn-faqs", async (_req, res) => {
    try {
      const { earnFaqs } = await import("@shared/schema");
      const faqs = await db.select()
        .from(earnFaqs)
        .where(eq(earnFaqs.isActive, true))
        .orderBy(earnFaqs.order);
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get earn FAQs" });
    }
  });

  // Create earn subscription (user invests in earn plan)
  app.post("/api/earn/subscribe", async (req, res) => {
    try {
      const { userId, planId, amount, symbol, durationType, aprRate } = req.body;
      const { earnSubscriptions, wallets } = await import("@shared/schema");
      
      // Check user has sufficient balance
      const userWallets = await db.select()
        .from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.symbol, symbol)));
      
      if (userWallets.length === 0 || userWallets[0].balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Deduct from wallet
      await db.update(wallets)
        .set({ balance: userWallets[0].balance - amount })
        .where(eq(wallets.id, userWallets[0].id));

      // Create subscription
      const subscription = await db.insert(earnSubscriptions).values({
        userId,
        planId,
        amount,
        symbol,
        durationType,
        aprRate,
        status: "active",
      }).returning();

      res.json(subscription[0]);
    } catch (error) {
      console.error("Error creating earn subscription:", error);
      res.status(500).json({ error: "Failed to create earn subscription" });
    }
  });

  // Withdraw from earn subscription
  app.post("/api/earn/withdraw/:subscriptionId", async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      const { earnSubscriptions, wallets } = await import("@shared/schema");
      
      // Get subscription
      const subs = await db.select()
        .from(earnSubscriptions)
        .where(eq(earnSubscriptions.id, subscriptionId));
      
      if (subs.length === 0) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      const sub = subs[0];
      if (sub.status !== "active") {
        return res.status(400).json({ error: "Subscription is not active" });
      }

      // Return principal + earnings to wallet
      const totalAmount = sub.amount + sub.totalEarned;
      const userWallets = await db.select()
        .from(wallets)
        .where(and(eq(wallets.userId, sub.userId), eq(wallets.symbol, sub.symbol)));
      
      if (userWallets.length > 0) {
        await db.update(wallets)
          .set({ balance: userWallets[0].balance + totalAmount })
          .where(eq(wallets.id, userWallets[0].id));
      }

      // Mark as withdrawn
      await db.update(earnSubscriptions)
        .set({ status: "withdrawn", withdrawnAt: new Date() })
        .where(eq(earnSubscriptions.id, subscriptionId));

      res.json({ success: true, amountReturned: totalAmount });
    } catch (error) {
      console.error("Error withdrawing from earn subscription:", error);
      res.status(500).json({ error: "Failed to withdraw" });
    }
  });

  // Get user's earn subscriptions
  app.get("/api/users/:userId/earn-subscriptions", async (req, res) => {
    try {
      const { userId } = req.params;
      const { earnSubscriptions } = await import("@shared/schema");
      
      const subs = await db.select()
        .from(earnSubscriptions)
        .where(eq(earnSubscriptions.userId, userId))
        .orderBy(desc(earnSubscriptions.startDate));
      
      res.json(subs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get earn subscriptions" });
    }
  });

  // Mining purchase - buy hashpower or device
  app.post("/api/mining/purchase", async (req, res) => {
    try {
      const { 
        userId, 
        packageName, 
        crypto, 
        symbol,
        amount, 
        hashrate, 
        hashrateUnit, 
        efficiency,
        dailyReturnBTC, 
        returnPercent,
        paybackMonths
      } = req.body;
      const { miningPurchases, wallets, orders, notifications } = await import("@shared/schema");
      
      const purchaseCurrency = symbol || "USDT";
      
      // Check user has sufficient balance in selected currency
      const userWallets = await db.select()
        .from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.symbol, purchaseCurrency)));
      
      if (userWallets.length === 0 || userWallets[0].balance < amount) {
        return res.status(400).json({ error: `Insufficient ${purchaseCurrency} balance` });
      }

      // Deduct from wallet
      await db.update(wallets)
        .set({ balance: userWallets[0].balance - amount })
        .where(eq(wallets.id, userWallets[0].id));

      // Create mining purchase
      const purchase = await db.insert(miningPurchases).values({
        userId,
        packageName,
        crypto,
        symbol: purchaseCurrency,
        amount,
        hashrate,
        hashrateUnit,
        efficiency,
        dailyReturnBTC,
        returnPercent,
        paybackMonths,
        status: "active",
      }).returning();

      // Create order record for tracking
      await db.insert(orders).values({
        userId,
        type: "mining_purchase",
        productId: purchase[0].id,
        productName: `${crypto} Mining - ${packageName} (${hashrate} ${hashrateUnit})`,
        amount,
        currency: purchaseCurrency,
        paymentMethod: "balance",
        balanceDeducted: true,
        status: "completed",
        completedAt: new Date(),
        metadata: { crypto, hashrate, hashrateUnit, efficiency, dailyReturnBTC, returnPercent, paybackMonths },
      });

      // Create notification
      await db.insert(notifications).values({
        userId,
        type: "purchase",
        category: "user",
        title: "Mining Package Activated!",
        message: `Your ${packageName} ${crypto} mining package (${hashrate} ${hashrateUnit}) purchased with ${purchaseCurrency} is now active and earning rewards.`,
        priority: "normal",
        data: { purchaseId: purchase[0].id, packageName, crypto, hashrate, symbol: purchaseCurrency },
      });

      res.json(purchase[0]);
    } catch (error) {
      console.error("Error creating mining purchase:", error);
      res.status(500).json({ error: "Failed to create mining purchase" });
    }
  });

  // Get user's mining purchases
  app.get("/api/users/:userId/mining-purchases", async (req, res) => {
    try {
      const { userId } = req.params;
      const { miningPurchases } = await import("@shared/schema");
      
      const purchases = await db.select()
        .from(miningPurchases)
        .where(eq(miningPurchases.userId, userId))
        .orderBy(desc(miningPurchases.purchaseDate));
      
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: "Failed to get mining purchases" });
    }
  });

  // Cancel/withdraw from mining purchase
  app.post("/api/mining/withdraw/:purchaseId", async (req, res) => {
    try {
      const { purchaseId } = req.params;
      const { miningPurchases, wallets } = await import("@shared/schema");
      
      // Get purchase
      const purchases = await db.select()
        .from(miningPurchases)
        .where(eq(miningPurchases.id, purchaseId));
      
      if (purchases.length === 0) {
        return res.status(404).json({ error: "Mining purchase not found" });
      }

      const purchase = purchases[0];
      if (purchase.status !== "active") {
        return res.status(400).json({ error: "Mining purchase is not active" });
      }

      // Return principal + earnings to wallet (as USDT)
      const btcEarned = purchase.totalEarned;
      // Convert BTC to USDT at current rate (simplified - should fetch real rate)
      const btcPrice = 95000; // Placeholder - in real implementation, fetch from API
      const totalAmount = purchase.amount + (btcEarned * btcPrice);
      
      const userWallets = await db.select()
        .from(wallets)
        .where(and(eq(wallets.userId, purchase.userId), eq(wallets.symbol, "USDT")));
      
      if (userWallets.length > 0) {
        await db.update(wallets)
          .set({ balance: userWallets[0].balance + totalAmount })
          .where(eq(wallets.id, userWallets[0].id));
      }

      // Mark as completed/cancelled
      await db.update(miningPurchases)
        .set({ status: "completed" })
        .where(eq(miningPurchases.id, purchaseId));

      res.json({ success: true, amountReturned: totalAmount });
    } catch (error) {
      console.error("Error withdrawing from mining purchase:", error);
      res.status(500).json({ error: "Failed to withdraw" });
    }
  });

  // Public API: Get active promotional offers
  app.get("/api/offers", async (_req, res) => {
    try {
      const { promotionalOffers } = await import("@shared/schema");
      const now = new Date();
      
      const offers = await db.select()
        .from(promotionalOffers)
        .where(eq(promotionalOffers.isActive, true))
        .orderBy(promotionalOffers.order);
      
      // Filter by validity dates
      const validOffers = offers.filter(o => {
        if (o.validFrom && o.validFrom > now) return false;
        if (o.validUntil && o.validUntil < now) return false;
        return true;
      });
      
      res.json(validOffers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get offers" });
    }
  });

  // ============ APP CONFIG (Database-driven settings) ============

  // Get app configuration value
  app.get("/api/config/:key", async (req, res) => {
    try {
      const { appConfig } = await import("@shared/schema");
      const config = await db.select()
        .from(appConfig)
        .where(and(eq(appConfig.key, req.params.key), eq(appConfig.isActive, true)));
      
      if (config.length === 0) {
        return res.status(404).json({ error: "Config not found" });
      }
      res.json(config[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to get config" });
    }
  });

  // Get all wallet addresses for deposits
  app.get("/api/config/wallets/all", async (_req, res) => {
    try {
      const { appConfig } = await import("@shared/schema");
      const wallets = await db.select()
        .from(appConfig)
        .where(and(
          eq(appConfig.category, "wallet"),
          eq(appConfig.isActive, true)
        ));
      
      // Convert to a map for easy access
      const walletMap: Record<string, string> = {};
      wallets.forEach(w => {
        walletMap[w.key] = w.value;
      });
      
      res.json({
        map: walletMap,
        entries: wallets.map((w) => ({
          id: w.id,
          key: w.key,
          value: w.value,
          description: w.description,
          category: w.category,
          isActive: w.isActive,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get wallet addresses" });
    }
  });

  // Sync Firebase user into database so admin can manage
  app.post("/api/auth/sync", async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const tokenFromHeader = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";
      const idToken = tokenFromHeader || req.body?.idToken;

      if (!idToken) {
        console.warn("Auth sync: No ID token provided");
        return res.status(401).json({ error: "Missing auth token" });
      }

      const payload = await authService.verifyToken(idToken);
      if (!payload?.uid || !payload.email) {
        console.warn("Auth sync: Invalid token payload", { uid: payload?.uid, email: payload?.email });
        return res.status(400).json({ error: "Invalid auth token" });
      }

      const displayName = (payload as any).name;
      const photoUrl = (payload as any).picture;
      console.log("Auth sync: Creating/updating user", { uid: payload.uid, email: payload.email });
      
      const result = await authService.getOrCreateUser(payload.uid, payload.email, displayName, photoUrl);

      if (!result.success || !result.user) {
        console.error("Auth sync failed:", result.error);
        return res.status(500).json({ error: result.error || "Failed to sync user" });
      }

      console.log("Auth sync: User created/updated", { userId: result.user.id, email: result.user.email });
      res.json({ user: result.user });
    } catch (error) {
      console.error("Error syncing auth user:", error);
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

  // ============ DEPOSIT REQUESTS ============

  // Create a deposit request
  app.post("/api/deposits/request", async (req, res) => {
    try {
      const { userId, amount, currency, network, walletAddress } = req.body;
      const { depositRequests, notifications } = await import("@shared/schema");
      
      if (!userId || !amount || !currency || !network || !walletAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create deposit request
      const [request] = await db.insert(depositRequests).values({
        userId,
        amount: parseFloat(amount),
        currency,
        network,
        walletAddress,
        status: "pending",
      }).returning();

      // Create notification for user
      await db.insert(notifications).values({
        userId,
        type: "deposit",
        category: "user",
        title: "Deposit Request Created",
        message: `Your deposit request for ${amount} ${currency} has been submitted. We'll confirm it once we verify the transaction.`,
        priority: "normal",
      });

      res.json({ 
        success: true, 
        request,
        message: "Deposit request created successfully. Please wait for confirmation."
      });
    } catch (error) {
      console.error("Error creating deposit request:", error);
      res.status(500).json({ error: "Failed to create deposit request" });
    }
  });

  // Get user's deposit requests
  app.get("/api/deposits/requests/:userId", async (req, res) => {
    try {
      const { depositRequests } = await import("@shared/schema");
      const requests = await db.select()
        .from(depositRequests)
        .where(eq(depositRequests.userId, req.params.userId))
        .orderBy(desc(depositRequests.createdAt));
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to get deposit requests" });
    }
  });

  // Get user's pending deposits (for display)
  app.get("/api/deposits/pending/:userId", async (req, res) => {
    try {
      const { depositRequests } = await import("@shared/schema");
      const pending = await db.select()
        .from(depositRequests)
        .where(and(
          eq(depositRequests.userId, req.params.userId),
          eq(depositRequests.status, "pending")
        ))
        .orderBy(desc(depositRequests.createdAt));
      
      // Calculate total pending by currency
      const pendingByCurrency: Record<string, number> = {};
      pending.forEach(p => {
        pendingByCurrency[p.currency] = (pendingByCurrency[p.currency] || 0) + p.amount;
      });
      
      res.json({ 
        requests: pending,
        totals: pendingByCurrency
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get pending deposits" });
    }
  });

  // ============ USER BALANCE (from wallets table) ============

  // Get user balances (confirmed only)
  app.get("/api/balances/:userId", async (req, res) => {
    try {
      const { wallets } = await import("@shared/schema");
      const userWallets = await db.select()
        .from(wallets)
        .where(eq(wallets.userId, req.params.userId));
      
      // Get pending deposits
      const { depositRequests } = await import("@shared/schema");
      const pending = await db.select()
        .from(depositRequests)
        .where(and(
          eq(depositRequests.userId, req.params.userId),
          eq(depositRequests.status, "pending")
        ));
      
      const pendingByCurrency: Record<string, number> = {};
      pending.forEach(p => {
        pendingByCurrency[p.currency] = (pendingByCurrency[p.currency] || 0) + p.amount;
      });
      
      res.json({
        balances: userWallets,
        pending: pendingByCurrency
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get balances" });
    }
  });

  // ============ ORDERS ============

  // Create an order
  app.post("/api/orders", async (req, res) => {
    try {
      const { userId, type, productId, productName, amount, currency, metadata, paymentMethod } = req.body;
      const { orders, wallets, notifications } = await import("@shared/schema");
      
      if (!userId || !type || !productName || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check balance if paying from balance
      if (paymentMethod === "balance") {
        const userWallets = await db.select()
          .from(wallets)
          .where(and(eq(wallets.userId, userId), eq(wallets.symbol, currency || "USDT")));
        
        if (userWallets.length === 0 || userWallets[0].balance < amount) {
          return res.status(400).json({ 
            error: "Insufficient balance",
            required: amount,
            available: userWallets[0]?.balance || 0
          });
        }

        // Deduct balance
        await db.update(wallets)
          .set({ balance: userWallets[0].balance - amount })
          .where(eq(wallets.id, userWallets[0].id));
      }

      // Create order
      const [order] = await db.insert(orders).values({
        userId,
        type,
        productId,
        productName,
        amount,
        currency: currency || "USDT",
        metadata,
        paymentMethod: paymentMethod || "balance",
        balanceDeducted: paymentMethod === "balance",
        status: "completed", // Immediate completion for balance payments
        completedAt: paymentMethod === "balance" ? new Date() : null,
      }).returning();

      // Create notification
      await db.insert(notifications).values({
        userId,
        type: "order",
        category: "user",
        title: "Order Completed",
        message: `Your purchase of ${productName} for $${amount} ${currency || "USDT"} was successful!`,
        priority: "normal",
        data: { orderId: order.id, amount, productName },
      });

      res.json({ 
        success: true, 
        order,
        message: "Order completed successfully!"
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get user's orders
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const { orders } = await import("@shared/schema");
      const userOrders = await db.select()
        .from(orders)
        .where(eq(orders.userId, req.params.userId))
        .orderBy(desc(orders.createdAt));
      
      res.json(userOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to get orders" });
    }
  });

  // ============ GLOBAL NOTIFICATIONS ============

  // Get global/broadcast notifications (for all users) - shows announcements from database
  app.get("/api/notifications/global/all", async (_req, res) => {
    try {
      const { notifications } = await import("@shared/schema");
      const { sql } = await import("drizzle-orm");
      
      // Get notifications where userId is null (broadcast to all)
      const globalNotifications = await db.select()
        .from(notifications)
        .where(sql`${notifications.userId} IS NULL`)
        .orderBy(desc(notifications.createdAt))
        .limit(20);
      
      res.json(globalNotifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to get global notifications" });
    }
  });

  // ============ DATABASE ADMIN ROUTES ============

  // Get pending deposits for admin
  app.get("/api/admin/deposits/pending", async (_req, res) => {
    try {
      const { depositRequests, users: usersTable } = await import("@shared/schema");
      const pending = await db.select({
        id: depositRequests.id,
        userId: depositRequests.userId,
        amount: depositRequests.amount,
        currency: depositRequests.currency,
        network: depositRequests.network,
        walletAddress: depositRequests.walletAddress,
        status: depositRequests.status,
        createdAt: depositRequests.createdAt,
        userEmail: usersTable.email,
        userDisplayName: usersTable.displayName,
      })
        .from(depositRequests)
        .leftJoin(usersTable, eq(depositRequests.userId, usersTable.id))
        .where(eq(depositRequests.status, "pending"))
        .orderBy(desc(depositRequests.createdAt));
      
      res.json(pending);
    } catch (error) {
      res.status(500).json({ error: "Failed to get pending deposits" });
    }
  });

  // Get all deposits for admin
  app.get("/api/admin/deposits/all", async (_req, res) => {
    try {
      const { depositRequests, users: usersTable } = await import("@shared/schema");
      const deposits = await db.select({
        id: depositRequests.id,
        userId: depositRequests.userId,
        amount: depositRequests.amount,
        currency: depositRequests.currency,
        network: depositRequests.network,
        walletAddress: depositRequests.walletAddress,
        status: depositRequests.status,
        createdAt: depositRequests.createdAt,
        confirmedAt: depositRequests.confirmedAt,
        userEmail: usersTable.email,
        userDisplayName: usersTable.displayName,
      })
        .from(depositRequests)
        .leftJoin(usersTable, eq(depositRequests.userId, usersTable.id))
        .orderBy(desc(depositRequests.createdAt))
        .limit(100);
      
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ error: "Failed to get deposits" });
    }
  });

  // Confirm a deposit (admin action)
  app.post("/api/admin/deposits/:depositId/confirm", async (req, res) => {
    try {
      const { depositId } = req.params;
      const { depositRequests, wallets } = await import("@shared/schema");
      
      // Get deposit request
      const [deposit] = await db.select()
        .from(depositRequests)
        .where(eq(depositRequests.id, depositId));
      
      if (!deposit) {
        return res.status(404).json({ error: "Deposit request not found" });
      }
      
      if (deposit.status !== "pending") {
        return res.status(400).json({ error: "Deposit already processed" });
      }

      // Update deposit status
      await db.update(depositRequests)
        .set({ status: "confirmed", confirmedAt: new Date() })
        .where(eq(depositRequests.id, depositId));

      // Credit user's wallet
      const [existingWallet] = await db.select()
        .from(wallets)
        .where(and(eq(wallets.userId, deposit.userId), eq(wallets.symbol, deposit.currency)));
      
      if (existingWallet) {
        await db.update(wallets)
          .set({ balance: existingWallet.balance + deposit.amount })
          .where(eq(wallets.id, existingWallet.id));
      } else {
        // Create new wallet for this currency
        await db.insert(wallets).values({
          userId: deposit.userId,
          symbol: deposit.currency,
          name: deposit.currency,
          balance: deposit.amount,
        });
      }

      // Create notification for user
      await db.insert(notifications).values({
        userId: deposit.userId,
        type: "deposit",
        category: "user",
        title: "🎉 Deposit Confirmed!",
        message: `✅ Your deposit of ${deposit.amount} ${deposit.currency} has been confirmed and credited to your account. 🚀 Start mining now!`,
        priority: "high",
        data: { depositId, amount: deposit.amount, currency: deposit.currency },
      });

      res.json({ success: true, message: "Deposit confirmed and balance credited" });
    } catch (error) {
      console.error("Error confirming deposit:", error);
      res.status(500).json({ error: "Failed to confirm deposit" });
    }
  });

  // Reject a deposit (admin action)
  app.post("/api/admin/deposits/:depositId/reject", async (req, res) => {
    try {
      const { depositId } = req.params;
      const { reason } = req.body;
      const { depositRequests } = await import("@shared/schema");
      
      // Get deposit request
      const [deposit] = await db.select()
        .from(depositRequests)
        .where(eq(depositRequests.id, depositId));
      
      if (!deposit) {
        return res.status(404).json({ error: "Deposit request not found" });
      }
      
      if (deposit.status !== "pending") {
        return res.status(400).json({ error: "Deposit already processed" });
      }

      // Update deposit status
      await db.update(depositRequests)
        .set({ 
          status: "rejected", 
          adminNote: reason || "Deposit could not be verified"
        })
        .where(eq(depositRequests.id, depositId));

      // Create notification for user
      await db.insert(notifications).values({
        userId: deposit.userId,
        type: "deposit",
        category: "user",
        title: "❌ Deposit Request Rejected",
        message: `Your deposit request for ${deposit.amount} ${deposit.currency} was rejected. Reason: ${reason || "Could not verify transaction"} 📧 Please contact support for assistance.`,
        priority: "high",
        data: { depositId, amount: deposit.amount, currency: deposit.currency, reason },
      });

      res.json({ success: true, message: "Deposit rejected and user notified" });
    } catch (error) {
      console.error("Error rejecting deposit:", error);
      res.status(500).json({ error: "Failed to reject deposit" });
    }
  });

  // Get all users for admin
  app.get("/api/admin/users", async (_req, res) => {
    try {
      const { wallets: walletsTable } = await import("@shared/schema");
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        isActive: users.isActive,
        role: users.role,
        createdAt: users.createdAt,
      })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(100);
      
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Block/unblock user (admin action)
  app.post("/api/admin/users/:userId/block", async (req, res) => {
    try {
      const { userId } = req.params;
      const { block } = req.body;
      
      if (!userId || block === undefined) {
        return res.status(400).json({ error: "Missing userId or block parameter" });
      }

      const [updatedUser] = await db.update(users)
        .set({ isActive: !block })
        .where(eq(users.id, userId))
        .returning();
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Log admin action
      await db.insert(adminActions).values({
        adminId: "system",
        targetUserId: userId,
        actionType: block ? "block_user" : "unblock_user",
        details: { blocked: block },
      }).catch(() => {}); // Ignore if adminActions table doesn't exist

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  // Adjust user balance (admin action)
  app.post("/api/admin/users/:userId/adjust-balance", async (req, res) => {
    try {
      const { userId } = req.params;
      const { symbol, amount, type, reason } = req.body; // type: 'add' or 'deduct'
      
      if (!userId || !symbol || amount === undefined || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (type !== "add" && type !== "deduct") {
        return res.status(400).json({ error: "Type must be 'add' or 'deduct'" });
      }

      // Get or create wallet
      const { wallets: walletsTable } = await import("@shared/schema");
      const existing = await db.select()
        .from(walletsTable)
        .where(and(eq(walletsTable.userId, userId), eq(walletsTable.symbol, symbol)));
      
      let wallet;
      if (existing.length > 0) {
        const newBalance = type === "add" 
          ? existing[0].balance + amount 
          : existing[0].balance - amount;
        
        if (newBalance < 0) {
          return res.status(400).json({ error: "Insufficient balance to deduct" });
        }

        [wallet] = await db.update(walletsTable)
          .set({ balance: newBalance })
          .where(eq(walletsTable.id, existing[0].id))
          .returning();
      } else {
        if (type === "deduct") {
          return res.status(400).json({ error: "User has no wallet for this currency" });
        }
        [wallet] = await db.insert(walletsTable).values({
          userId,
          symbol,
          name: symbol,
          balance: amount,
        }).returning();
      }

      // Create notification for user
      await db.insert(notifications).values({
        userId,
        type: "balance",
        category: "user",
        title: type === "add" ? "💰 Balance Added!" : "⚠️ Balance Adjusted",
        message: `${type === "add" ? "✅ Admin added" : "⚠️ Admin deducted"} ${amount} ${symbol} ${type === "add" ? "to" : "from"} your account${reason ? ": " + reason : ". Thank you!"}.`,
        priority: "normal",
        data: { symbol, amount, type, reason },
      });

      // Log admin action
      await db.insert(adminActions).values({
        adminId: "system",
        targetUserId: userId,
        actionType: "adjust_balance",
        details: { symbol, amount, type, reason },
      }).catch(() => {});

      res.json({ success: true, wallet });
    } catch (error) {
      console.error("Error adjusting balance:", error);
      res.status(500).json({ error: "Failed to adjust balance" });
    }
  });

  // Get all config for admin
  app.get("/api/admin/config", async (_req, res) => {
    try {
      const { appConfig } = await import("@shared/schema");
      const configs = await db.select()
        .from(appConfig)
        .orderBy(appConfig.key);
      
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get config" });
    }
  });

  // Add new config (admin)
  app.post("/api/admin/config", async (req, res) => {
    try {
      const { key, value, category, description } = req.body;
      const { appConfig } = await import("@shared/schema");
      
      if (!key || !value) {
        return res.status(400).json({ error: "Key and value are required" });
      }

      // Check if key already exists
      const existing = await db.select()
        .from(appConfig)
        .where(eq(appConfig.key, key));
      
      if (existing.length > 0) {
        // Update existing
        await db.update(appConfig)
          .set({ value, category, description, updatedAt: new Date() })
          .where(eq(appConfig.key, key));
        res.json({ success: true, message: "Config updated" });
      } else {
        // Insert new
        const [config] = await db.insert(appConfig).values({
          key,
          value,
          category: category || "settings",
          description,
          isActive: true,
        }).returning();
        res.json({ success: true, config });
      }
    } catch (error) {
      console.error("Error adding config:", error);
      res.status(500).json({ error: "Failed to add config" });
    }
  });

  // Update config by ID (admin)
  app.put("/api/admin/config/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { value } = req.body;
      const { appConfig } = await import("@shared/schema");
      
      if (!value) {
        return res.status(400).json({ error: "Value is required" });
      }

      await db.update(appConfig)
        .set({ value, updatedAt: new Date() })
        .where(eq(appConfig.id, id));
      
      res.json({ success: true, message: "Config updated" });
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  // Delete config by ID (admin)
  app.delete("/api/admin/config/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { appConfig } = await import("@shared/schema");
      
      await db.delete(appConfig).where(eq(appConfig.id, id));
      
      res.json({ success: true, message: "Config deleted" });
    } catch (error) {
      console.error("Error deleting config:", error);
      res.status(500).json({ error: "Failed to delete config" });
    }
  });

  // Broadcast notification to all users
  app.post("/api/admin/notifications/broadcast", async (req, res) => {
    try {
      const { title, message } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({ error: "Title and message are required" });
      }

      const { notificationService } = await import("./services/notificationService");
      const count = await notificationService.createBroadcast(title, message, "promotion");
      
      res.json({ success: true, count, message: `Notification sent to ${count} users` });
    } catch (error) {
      console.error("Error sending broadcast:", error);
      res.status(500).json({ error: "Failed to send broadcast" });
    }
  });

  // ============ TWO-FACTOR AUTHENTICATION ============

  // Generate 2FA secret and QR code
  app.post("/api/auth/2fa/setup", async (req, res) => {
    try {
      const { userId } = req.body; // Firebase UID
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Get user by Firebase UID
      const user = await db.select().from(users).where(eq(users.firebaseUid, userId)).limit(1);
      if (!user.length) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate secret
      const secret = generateSecret();

      // Generate OTP Auth URL
      const otpauth = `otpauth://totp/BlockMint Mining:${user[0].email}?secret=${secret}&issuer=BlockMint Mining`;

      // Generate QR code
      const qrCode = await QRCode.toDataURL(otpauth);

      // Save secret (but don't enable 2FA yet)
      await db.update(users)
        .set({ twoFactorSecret: secret })
        .where(eq(users.id, user[0].id));

      res.json({
        secret,
        qrCode,
        manualEntry: secret,
        otpauth
      });
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ error: "Failed to setup 2FA" });
    }
  });

  // Verify 2FA token and enable 2FA
  app.post("/api/auth/2fa/verify", async (req, res) => {
    try {
      const { userId, token } = req.body; // Firebase UID
      
      if (!userId || !token) {
        return res.status(400).json({ error: "User ID and token are required" });
      }

      // Get user by Firebase UID
      const user = await db.select().from(users).where(eq(users.firebaseUid, userId)).limit(1);
      if (!user.length || !user[0].twoFactorSecret) {
        return res.status(404).json({ error: "2FA not set up for this user" });
      }

      // Verify token
      const isValid = verify({ token, secret: user[0].twoFactorSecret });

      if (!isValid) {
        return res.status(400).json({ error: "Invalid token" });
      }

      // Enable 2FA
      await db.update(users)
        .set({ twoFactorEnabled: true })
        .where(eq(users.id, user[0].id));

      res.json({ success: true, message: "2FA enabled successfully" });
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ error: "Failed to verify 2FA" });
    }
  });

  // Disable 2FA
  app.post("/api/auth/2fa/disable", async (req, res) => {
    try {
      const { userId, token } = req.body; // Firebase UID
      
      if (!userId || !token) {
        return res.status(400).json({ error: "User ID and token are required" });
      }

      // Get user by Firebase UID
      const user = await db.select().from(users).where(eq(users.firebaseUid, userId)).limit(1);
      if (!user.length || !user[0].twoFactorEnabled) {
        return res.status(404).json({ error: "2FA not enabled for this user" });
      }

      // Verify token before disabling
      const isValid = verify({ token, secret: user[0].twoFactorSecret! });

      if (!isValid) {
        return res.status(400).json({ error: "Invalid token" });
      }

      // Disable 2FA and clear secret
      await db.update(users)
        .set({ 
          twoFactorEnabled: false,
          twoFactorSecret: null
        })
        .where(eq(users.id, user[0].id));

      res.json({ success: true, message: "2FA disabled successfully" });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });

  // Check 2FA status
  app.get("/api/auth/2fa/status/:userId", async (req, res) => {
    try {
      const { userId } = req.params; // Firebase UID
      
      const user = await db.select({
        twoFactorEnabled: users.twoFactorEnabled
      }).from(users).where(eq(users.firebaseUid, userId)).limit(1);
      
      if (!user.length) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        enabled: user[0].twoFactorEnabled || false 
      });
    } catch (error) {
      console.error("Error checking 2FA status:", error);
      res.status(500).json({ error: "Failed to check 2FA status" });
    }
  });

  // Verify 2FA token for login
  app.post("/api/auth/2fa/verify-login", async (req, res) => {
    try {
      const { userId, token } = req.body; // Firebase UID
      
      if (!userId || !token) {
        return res.status(400).json({ error: "User ID and token are required" });
      }

      // Get user by Firebase UID
      const user = await db.select().from(users).where(eq(users.firebaseUid, userId)).limit(1);
      if (!user.length || !user[0].twoFactorEnabled) {
        return res.status(404).json({ error: "2FA not enabled for this user" });
      }

      // Verify token
      const isValid = verify({ token, secret: user[0].twoFactorSecret! });

      if (!isValid) {
        return res.status(400).json({ error: "Invalid token" });
      }

      res.json({ success: true, message: "2FA verified successfully" });
    } catch (error) {
      console.error("Error verifying 2FA login:", error);
      res.status(500).json({ error: "Failed to verify 2FA" });
    }
  });

  // ============ PRODUCT MANAGEMENT (Admin) ============

  // Get all products
  app.get("/api/admin/products", async (_req, res) => {
    try {
      const { products } = await import("@shared/schema");
      const allProducts = await db.select()
        .from(products)
        .orderBy(desc(products.createdAt));
      res.json(allProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get products" });
    }
  });

  // Create a new product
  app.post("/api/admin/products", async (req, res) => {
    try {
      const { type, name, description, basePrice, currency, metadata } = req.body;
      const { products } = await import("@shared/schema");
      
      if (!type || !name || basePrice === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [product] = await db.insert(products).values({
        type,
        name,
        description,
        basePrice,
        currency: currency || "USDT",
        metadata: metadata || {},
        isActive: true,
      }).returning();

      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Update product
  app.patch("/api/admin/products/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const { name, description, basePrice, currency, metadata, isActive } = req.body;
      const { products } = await import("@shared/schema");
      
      const [product] = await db.update(products)
        .set({
          ...(name && { name }),
          ...(description && { description }),
          ...(basePrice !== undefined && { basePrice }),
          ...(currency && { currency }),
          ...(metadata && { metadata }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  return httpServer;
}
