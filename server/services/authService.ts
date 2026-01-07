// Authentication Service
// Handles user authentication, registration, and session management

import { db } from "../db";
import { eq, and } from "drizzle-orm";
import * as schema from "@shared/schema";
import { verifyIdToken, setCustomClaims, deleteUser as deleteFirebaseUser } from "../firebase-admin";

export interface AuthResult {
  success: boolean;
  user?: schema.User;
  error?: string;
}

export interface TokenPayload {
  uid: string;
  email?: string;
  admin?: boolean;
  role?: string;
}

export const authService = {
  /**
   * Verify Firebase ID token and return user data
   */
  async verifyToken(idToken: string): Promise<TokenPayload | null> {
    try {
      const decoded = await verifyIdToken(idToken);
      return decoded;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  },

  /**
   * Get or create user from Firebase auth
   */
  async getOrCreateUser(firebaseUid: string, email: string, displayName?: string, photoUrl?: string): Promise<AuthResult> {
    try {
      // Check if user exists
      const existingUsers = await db.select().from(schema.users)
        .where(eq(schema.users.firebaseUid, firebaseUid));

      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        
        // Check if email is now in admin list (may have been added after registration)
        const adminEmail = await db.select().from(schema.adminEmails)
          .where(and(
            eq(schema.adminEmails.email, email),
            eq(schema.adminEmails.isActive, true)
          ));

        const shouldBeAdmin = adminEmail.length > 0;
        const newRole = shouldBeAdmin ? adminEmail[0].role : existingUser.role;
        
        // Update last login and role if needed
        const [updatedUser] = await db.update(schema.users)
          .set({ 
            lastLoginAt: new Date(),
            role: newRole 
          })
          .where(eq(schema.users.id, existingUser.id))
          .returning();
        
        // Update Firebase custom claims if role changed to admin
        if (shouldBeAdmin && existingUser.role !== newRole) {
          await setCustomClaims(firebaseUid, { admin: true, role: newRole });
        }
        
        return { success: true, user: updatedUser };
      }

      // Check if email is designated as admin
      const adminEmail = await db.select().from(schema.adminEmails)
        .where(and(
          eq(schema.adminEmails.email, email),
          eq(schema.adminEmails.isActive, true)
        ));

      const isAdmin = adminEmail.length > 0;
      const role = isAdmin ? adminEmail[0].role : "user";

      // Create new user
      const [newUser] = await db.insert(schema.users).values({
        firebaseUid,
        email,
        displayName: displayName || email.split("@")[0],
        photoUrl,
        role,
        isActive: true,
        lastLoginAt: new Date(),
      }).returning();

      // Set Firebase custom claims if admin
      if (isAdmin) {
        await setCustomClaims(firebaseUid, { admin: true, role });
      }

      // Create default wallets for new user
      await this.createDefaultWallets(newUser.id);

      // Create default notification preferences
      await db.insert(schema.notificationPreferences).values({
        userId: newUser.id,
      }).onConflictDoNothing();

      return { success: true, user: newUser };
    } catch (error) {
      console.error("Error in getOrCreateUser:", error);
      return { success: false, error: "Failed to get or create user" };
    }
  },

  /**
   * Create default wallets for a new user
   */
  async createDefaultWallets(userId: string): Promise<void> {
    const defaultWallets = [
      { symbol: "BTC", name: "Bitcoin" },
      { symbol: "LTC", name: "Litecoin" },
      { symbol: "USDT", name: "Tether" },
      { symbol: "USDC", name: "USD Coin" },
    ];

    for (const wallet of defaultWallets) {
      await db.insert(schema.wallets).values({
        userId,
        symbol: wallet.symbol,
        name: wallet.name,
        balance: 0,
      }).onConflictDoNothing();
    }
  },

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const users = await db.select().from(schema.users)
      .where(eq(schema.users.id, userId));
    
    return users.length > 0 && users[0].role === "admin";
  },

  /**
   * Check if email is designated as admin
   */
  async isAdminEmail(email: string): Promise<boolean> {
    const adminEmails = await db.select().from(schema.adminEmails)
      .where(and(
        eq(schema.adminEmails.email, email),
        eq(schema.adminEmails.isActive, true)
      ));
    
    return adminEmails.length > 0;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: { displayName?: string; photoUrl?: string }): Promise<AuthResult> {
    try {
      const [updatedUser] = await db.update(schema.users)
        .set(data)
        .where(eq(schema.users.id, userId))
        .returning();
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }
  },

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<AuthResult> {
    try {
      const [user] = await db.update(schema.users)
        .set({ isActive: false })
        .where(eq(schema.users.id, userId))
        .returning();
      
      return { success: true, user };
    } catch (error) {
      console.error("Error deactivating user:", error);
      return { success: false, error: "Failed to deactivate user" };
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<schema.User | null> {
    const users = await db.select().from(schema.users)
      .where(eq(schema.users.id, userId));
    
    return users.length > 0 ? users[0] : null;
  },

  /**
   * Get user by Firebase UID
   */
  async getUserByFirebaseUid(firebaseUid: string): Promise<schema.User | null> {
    const users = await db.select().from(schema.users)
      .where(eq(schema.users.firebaseUid, firebaseUid));
    
    return users.length > 0 ? users[0] : null;
  },
};

export default authService;
