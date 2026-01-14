# Deposit Balance System & User Management

## Overview

This document describes the complete deposit → balance credit → notification system that has been implemented to address user balance management needs.

## System Architecture

### 1. Deposit Flow

```
User submits deposit
    ↓
Deposit stored in `deposit_requests` table (status: pending)
    ↓
Admin reviews in DB Admin panel
    ↓
Admin clicks "Confirm" button
    ↓
Balance credited to user's wallet
    ↓
Notification sent to user
    ↓
User sees updated balance in Dashboard/Wallet
```

### 2. Database Schema
###

**Users Table**
- `id`: Unique identifier (database ID, not Firebase UID)
- `email`: User email
- `displayName`: User display name
- `uid`: Firebase UID (for authentication)
- `isActive`: Boolean flag (true = active, false = blocked)
- `role`: User role (default: "user", can be "admin")
- `createdAt`: Account creation date

**Wallets Table**
- `id`: Unique wallet ID
- `userId`: Reference to user (database ID)
- `symbol`: Crypto symbol (BTC, ETH, USDT, LTC, etc.)
- `balance`: Current balance for this crypto
- `name`: Display name
- `address`: Optional wallet address
- `createdAt`: Wallet creation date

**Notifications Table**
- Stores all notifications for users
- Types: "deposit", "withdrawal", "balance", "system"
- Categories: "user", "admin", "system"
- Priority: "low", "normal", "high"

**Deposit Requests Table**
- `id`: Deposit request ID
- `userId`: Reference to user submitting deposit
- `amount`: Deposit amount
- `currency`: Crypto type (BTC, ETH, USDT, etc.)
- `network`: Network type (bitcoin, ethereum, etc.)
- `walletAddress`: The app's wallet address for this currency/network
- `status`: pending, confirmed, rejected, expired
- `adminNote`: Admin comments (used for rejection reasons)
- `confirmedAt`: When admin confirmed it
- `confirmedBy`: Admin who confirmed it
- `txHash`: Transaction hash (optional)

### 3. API Endpoints

#### Deposit Management

**GET /api/balances/:userId**
- Fetches user-specific wallet balances
- Returns: `{ balances: [], pending: {}, totalBalance }`
- Called by frontend to display balance

**GET /api/admin/deposits/pending**
- Admin endpoint: List pending deposits
- Returns user email and display name
- Auto-refreshes every 30 seconds in DB Admin

**GET /api/admin/deposits/all**
- Admin endpoint: List all deposits (confirmed + rejected)
- Returns complete deposit history with user info

**POST /api/admin/deposits/:depositId/confirm**
- Admin action: Approve a deposit
- Updates deposit status to "confirmed"
- Creates wallet entry for user if needed
- Credits user's balance
- Sends notification to user
- Logs admin action

**POST /api/admin/deposits/:depositId/reject**
- Admin action: Reject a deposit
- Updates status to "rejected"
- Stores rejection reason in `adminNote`
- Sends rejection notification to user

#### User Management

**GET /api/admin/users**
- Admin endpoint: List all users with status
- Shows: id, email, displayName, isActive, role, createdAt

**POST /api/admin/users/:userId/block**
- Admin action: Block or unblock a user
- Request body: `{ block: boolean }`
  - `block: true` → sets `isActive: false` (blocks user)
  - `block: false` → sets `isActive: true` (unblocks user)
- Logs admin action

**POST /api/admin/users/:userId/adjust-balance**
- Admin action: Add or deduct user balance
- Request body: `{ symbol, amount, type, reason }`
  - `type`: "add" or "deduct"
  - `symbol`: "USDT", "BTC", "ETH", etc.
  - `reason`: Optional explanation
- Creates wallet if doesn't exist
- Updates balance
- Sends notification to user with reason
- Logs admin action

### 4. Frontend Integration

#### User ID Management

The frontend stores and uses the database user ID (not Firebase UID):

```javascript
// In localStorage after /api/auth/sync
{
  uid: "firebase-uid",           // Firebase UID
  email: "user@example.com",
  displayName: "John Doe",
  id: "db-user-id",              // Database ID
  dbId: "db-user-id",            // Database ID (alias)
  role: "user"
}
```

All balance-related API calls use `dbId` or `id` from localStorage.

#### Balance Display

The `useMiningData` hook has been updated to:
1. Get user ID from localStorage
2. Call `/api/balances/:userId` endpoint
3. Return user-specific wallet balances
4. Auto-refresh every 60 seconds

```typescript
// In useMiningData.ts
const userId = user?.dbId || user?.id || user?.uid;

const walletQuery = useQuery({
  queryKey: ["/api/balances", userId],
  queryFn: async () => {
    if (!userId) return { balances: [], totalBalance: 0 };
    const res = await fetch(`/api/balances/${userId}`);
    const data = await res.json();
    // Calculate total from balances
    return {
      balances: data.balances || [],
      totalBalance: // calculated sum,
    };
  },
  enabled: !!userId,
  refetchInterval: 60000, // Refresh every minute
});
```

#### DB Admin User Management UI

The DatabaseAdmin component displays users with action buttons:

```tsx
{users.map((user) => (
  <div key={user.id}>
    <p>{user.email}</p>
    <Badge>{user.isActive ? "Active" : "Blocked"}</Badge>
    
    <Button onClick={() => 
      blockUserMutation.mutate({ 
        userId: user.id, 
        block: user.isActive 
      })
    }>
      {user.isActive ? "Block" : "Unblock"}
    </Button>
    
    <Button onClick={() => {
      const amount = prompt(`Add USDT to ${user.email}:`, "100");
      if (amount && !isNaN(Number(amount))) {
        adjustBalanceMutation.mutate({
          userId: user.id,
          symbol: "USDT",
          amount: Number(amount),
          type: "add",
          reason: "Admin credit"
        });
      }
    }}>
      Add Balance
    </Button>
    
    <Button onClick={() => {
      const amount = prompt(`Deduct USDT from ${user.email}:`, "10");
      if (amount && !isNaN(Number(amount))) {
        adjustBalanceMutation.mutate({
          userId: user.id,
          symbol: "USDT",
          amount: Number(amount),
          type: "deduct",
          reason: "Admin deduction"
        });
      }
    }}>
      Deduct Balance
    </Button>
  </div>
))}
```

## Features Implemented

### 1. ✅ Balance Credit on Deposit Confirmation
- When admin confirms a deposit, the user's wallet balance is updated
- If wallet entry doesn't exist for that currency, it's created
- Balance is immediately available for use

### 2. ✅ Real Balance Functionality
- Balance stored in `wallets` table by currency
- Each user can have multiple wallets (BTC, ETH, USDT, etc.)
- Balance is used across all app services (mining, earn, trading, etc.)

### 3. ✅ Notifications for Deposits
- When deposit is confirmed, notification is created with high priority
- Title: "Deposit Confirmed!"
- Message includes amount and currency
- User sees it in bell icon notifications
- Notifications are stored and retrievable

### 4. ✅ User Identification in Deposit History
- Both pending and all deposit endpoints include user info
- Returns: `userEmail` and `userDisplayName` for each deposit
- Admin can see exactly which user made each deposit

### 5. ✅ User Management Options
- **Block Users**: Set `isActive: false` to prevent user access
- **Add Balance**: Admin can add any amount of any crypto to user account
- **Deduct Balance**: Admin can deduct balance (for penalties, refunds, etc.)
- **All actions logged**: Admin actions are recorded in `admin_actions` table

### 6. ✅ Balance Updates Reflect Across App
- Dashboard shows updated balance after confirmation
- Wallet page shows all wallet balances
- Balances are usable for:
  - Mining purchases
  - Earn subscriptions
  - Trading/exchange
  - Withdrawal requests
  - Any app service requiring balance check

## Example Workflows

### Workflow 1: User Deposits & Admin Confirms

```
1. User registers → synced to database with dbId
2. User navigates to Wallet
3. User selects crypto (BTC, ETH, USDT, etc.)
4. User submits deposit with amount
   - Deposit request stored in DB (status: pending)
5. Admin opens DB Admin panel
6. Admin reviews pending deposits (shows user email)
7. Admin clicks "Confirm" on the deposit
   - Deposit status → "confirmed"
   - User's BTC wallet balance increased by deposit amount
   - Notification created and sent to user
8. User receives notification: "Deposit Confirmed! Your $X BTC has been credited"
9. User checks Dashboard → balance updated
10. User can now use the balance for mining/earn/trading
```

### Workflow 2: Admin Adds Balance to User

```
1. Admin opens DB Admin panel
2. Admin goes to "Users" tab
3. Admin finds user by email
4. Admin clicks "Add Balance"
5. Admin enters amount (e.g., 100 USDT)
6. System creates/updates USDT wallet for user
7. User's USDT balance increased by 100
8. Notification sent: "Balance Added: +100 USDT (Admin credit)"
9. User sees updated balance immediately
10. Balance is usable across all services
```

### Workflow 3: Admin Blocks Scammer

```
1. Admin identifies problematic user
2. Admin opens DB Admin → Users tab
3. Admin finds user
4. Admin clicks "Block"
   - User.isActive set to false
   - Admin action logged
5. On next app action, user gets access denied message
6. User cannot deposit, withdraw, or trade
7. Admin can click "Unblock" to restore access anytime
```

## Verification Steps

To verify the system is working:

1. **Register new user** → Check localStorage has both `uid` and `dbId`
2. **Submit deposit** → Check appears in DB Admin pending deposits
3. **Confirm deposit** → Watch balance appear in user's wallet
4. **Check notifications** → User should see deposit confirmation
5. **Dashboard balance** → Should show updated balance
6. **Add admin balance** → User balance updates immediately
7. **Block user** → User sees "Access Denied" on next action
8. **Check logs** → `/api/admin/logs` shows all actions

## Configuration

No environment variables needed for this system. The ADMIN_PASSWORD for DB Admin is:
```
MiningClub2024!
```

(Should be moved to environment variable in production)

## Important Notes

- **User ID**: Always use `dbId`/`id` from database, never Firebase UID for wallet operations
- **Balance Persistence**: Balances stored in database, survives app restarts
- **Notifications**: Sent immediately, available in bell icon
- **Admin Actions**: All changes logged in `admin_actions` table for audit trail
- **Concurrent Updates**: Balance updates are atomic at database level
- **Multi-Currency**: Users can hold multiple cryptocurrencies simultaneously

## Troubleshooting

**Deposit shows in DB Admin but user balance not updated**
- Check that admin clicked "Confirm" button
- Check user's localStorage has correct `dbId`
- Check `/api/balances/:userId` returns the wallet entry

**Balance not showing on Dashboard**
- Refresh page (should fetch latest from `/api/balances/:userId`)
- Check browser console for fetch errors
- Verify user is logged in with correct dbId

**Notification not appearing**
- Check notifications table has entry for user
- Check notification type is "deposit" and priority is "high"
- Refresh page to see notifications

**Admin action not working**
- Verify admin password is correct: `MiningClint2024!`
- Check browser console for fetch errors
- Verify user ID is correct format (UUID)

## Related Documentation

- See `AUTH_SYNC_DEBUG.md` for user sync troubleshooting
- See `ADMIN_CONFIG_KEYS.md` for wallet address configuration
- See `COMPLETE_LAUNCH_CHECKLIST.md` for full deployment checklist
