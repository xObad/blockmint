# BlockMint Mining App - User Guide

## �� Starting the App

The app is currently running at: **http://localhost:5173**

### Starting from Terminal:
```bash
cd /workspaces/mining-club
npm run dev
```

The server will start on port 5000 (Express) and Vite dev server on port 5173.

---

## 📱 App Flow - First Time User Experience

### 1. **Onboarding Screens (Splash Screens)**
When you first open the app, you'll see 3 onboarding screens:

- **Screen 1**: Introduction to Bitcoin mining
- **Screen 2**: Mixed cryptocurrency information  
- **Screen 3**: Server mining capabilities

**Options on Onboarding:**
- **Continue** → Next onboarding screen
- **Get Started** (on last screen) → Go to authentication
- **Skip** → Skip directly to main app
- **Sign In** → Go to authentication page

### 2. **Authentication Page**
After onboarding, you reach the auth page where you can:
- **Sign In** with email/password or Google
- **Register** a new account
- **Back** → Return to onboarding

### 3. **Main App**
Once authenticated, you access the 5 main tabs:
- 🏠 **Home** (Dashboard)
- 💰 **Wallet**
- 📈 **Invest** 
- ⚡ **Solo Mining**
- ⛏️ **Mining**

---

## 🔄 How to Reset to Beginning (See Onboarding Again)

### Option 1: Clear Browser Storage
1. Open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage**
3. Delete these keys:
   - `hasSeenOnboarding`
   - `isLoggedIn`
4. Refresh the page

### Option 2: Clear All Data
In browser console (F12), run:
```javascript
localStorage.clear();
location.reload();
```

### Option 3: Manual Navigation
Simply navigate to the root URL: `http://localhost:5173/`

---

## 🛡️ Admin Panel Access

### Accessing the Admin Panel:

**Development Mode (Current):**
The admin panel bypasses authentication in development mode.

**Two Ways to Access:**

#### Method 1: Via Settings (Recommended)
1. Open the app
2. Click on any tab (Home, Wallet, etc.)
3. Tap the profile icon or settings
4. Scroll down to **ACCOUNT** section
5. Click **"Admin Panel"** (only visible in development)

#### Method 2: Direct URL
Navigate directly to: `http://localhost:5173/admin`

### Admin Panel Features:

The admin panel includes 13 sections:
- **Dashboard** - Overview statistics
- **Users** - Manage all user accounts
- **Wallets** - View all wallet balances
- **Investment Plans** - Configure investment packages
- **Earn/Yield Plans** - Manage earning plans
- **Miner Pricing** - Set mining contract prices
- **Withdrawals** - Process withdrawal requests
- **Notifications** - Send push notifications to users
- **Support Tickets** - Handle user support requests
- **Content** - Manage app content and FAQs
- **Discounts** - Create discount codes
- **API & Services** - Configure blockchain APIs
- **Settings** - App-wide settings

---

## ✅ Current Status - Demo Data Removed

### What Was Fixed:
✅ **Portfolio History** - Now shows actual balance (was showing fake $1200)  
✅ **Crypto 24h Change** - Now shows 0% (was showing fake 2.45%, 3.12%, etc.)  
✅ **Balance Values** - All start at 0  
✅ **All WebP Images Loaded** - App optimized for fast loading  

### What Remains (Dynamic Demo Data):
⚠️ **Mining Pools** - Still shows demo pools (CryptoPool Pro, MegaHash, LightningPool)  
⚠️ **Chart Data** - Hash rate chart generates random data for visualization  

**Note:** These are intentional for UI demonstration. They can be replaced with real data when backend integration is ready.

---

## 🔐 Authentication Status

Currently configured for development:
- Firebase auth verification is disabled (no Firebase configured yet)
- Admin routes bypass authentication in development mode
- Users can sign in with email/password or Google

---

## 📊 API Endpoints

### User Endpoints:
- `GET /api/mining/stats` - Mining statistics
- `GET /api/wallet/balances` - Wallet balances
- `GET /api/wallet/transactions` - Transaction history
- `GET /api/pools` - Mining pools
- `GET /api/chart` - Hash rate chart data
- `GET /api/portfolio/history` - 7-day portfolio history
- `GET /api/settings` - User settings

### Admin Endpoints:
All admin endpoints are prefixed with `/api/admin/`:
- `/api/admin/users` - User management
- `/api/admin/wallets` - Wallet management
- `/api/admin/plans` - Investment plans
- `/api/admin/miners` - Mining contracts
- `/api/admin/withdrawals` - Withdrawal requests
- `/api/admin/notifications` - Send notifications
- `/api/admin/settings` - App configuration

---

## �� Testing the App

### Test User Flow:
1. **Start Fresh** - Clear localStorage
2. **See Onboarding** - View all 3 splash screens
3. **Register/Sign In** - Create account or sign in
4. **Explore Tabs:**
   - Dashboard - View portfolio overview
   - Wallet - Check balances (all $0 initially)
   - Invest - Browse investment plans
   - Solo Mining - Check solo mining jackpots
   - Mining - Start/stop mining, view contracts
5. **Settings** - Configure preferences, view profile
6. **Admin Panel** - Access via Settings → Admin Panel

### Test Admin Features:
1. Navigate to Admin Panel
2. Click through different tabs
3. Test user management, wallet viewing, etc.
4. Send test notifications
5. Configure settings

---

## 🚨 Important Notes

1. **Warnings are Normal:** 
   - `MASTER_WALLET_MNEMONIC not set` - Expected in dev
   - `Firebase project ID not configured` - Expected without Firebase setup
   - PostCSS warnings - Don't affect functionality

2. **Image Optimization:**
   - All large images converted to WebP
   - ~90% size reduction achieved
   - App loads significantly faster

3. **Development Mode:**
   - Admin access is open (no auth required)
   - Some features may be limited without real blockchain connection

---

## 📝 Next Steps for Production

To make this production-ready:
1. ✅ Set up Firebase project and configure credentials
2. ✅ Set up database (PostgreSQL) connection
3. ✅ Configure blockchain RPC endpoints
4. ✅ Set up master wallet for actual mining
5. ✅ Implement proper admin authentication
6. ✅ Replace demo mining pools with real pools
7. ✅ Connect to actual mining hardware/APIs

---

## 🆘 Troubleshooting

**App won't load:**
```bash
# Kill any process on port 5173 or 5000
pkill -f "tsx server/index.ts"
pkill -f "vite"

# Restart
npm run dev
```

**Can't see admin button:**
- Make sure you're in development mode
- Check that the app is running (not just the server)
- Try refreshing the page

**Onboarding won't show:**
- Clear localStorage: `localStorage.clear()`
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

