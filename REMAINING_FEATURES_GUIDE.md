# Implementation Guide - Remaining Features

This document guides the next developer on implementing the remaining 5 features.

---

## Feature 6: Show All Currencies on Home Page (30 min)

### Current Issue
Dashboard only shows cryptocurrencies the user has balance in. Should show all 8 supported currencies.

### Location
- File: `client/src/pages/Dashboard.tsx`
- Component: Portfolio cards section

### Implementation Steps

1. **Modify balance query to include all currencies**
```typescript
// Current: Only fetches actual wallets
const wallets = balanceData?.balances || [];

// Should: Pad with zero-balance currencies
const allCurrencies = ["USDT", "BTC", "ETH", "LTC", "BNB", "USDC", "ZCASH", "TON"];
const walletsWithZeros = allCurrencies.map(symbol => {
  return wallets.find(w => w.symbol === symbol) || {
    symbol,
    balance: 0,
    name: getCurrencyName(symbol),
  };
});
```

2. **Update portfolio display**
```typescript
// Render all 8 currencies even with 0 balance
{walletsWithZeros.map(wallet => (
  <PortfolioCard 
    key={wallet.symbol}
    currency={wallet.symbol}
    balance={wallet.balance}
    value={convertToUSD(wallet.balance, wallet.symbol)}
  />
))}
```

3. **Add helper function**
```typescript
const getCurrencyName = (symbol: string): string => {
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
  return names[symbol] || symbol;
};
```

### Testing
- [ ] All 8 currencies display on home page
- [ ] Zero-balance currencies show "0.00"
- [ ] Can navigate to deposit for zero-balance currency
- [ ] Mobile layout works with all 8

---

## Feature 7: Prioritize Assets by Balance (30 min)

### Current Issue
Currencies should be sorted by user's actual balance (highest first).

### Location
- File: `client/src/pages/Dashboard.tsx`
- Portfolio section

### Implementation Steps

1. **Sort wallets by balance**
```typescript
const sortedWallets = walletsWithZeros.sort((a, b) => {
  // Sort by balance descending, but show non-zero first
  const balanceDiff = b.balance - a.balance;
  if (balanceDiff !== 0) return balanceDiff;
  // If same balance, alphabetical by symbol
  return a.symbol.localeCompare(b.symbol);
});
```

2. **Optional: Add visual priority indicators**
```typescript
// Show badge for top 3 held currencies
{index < 3 && <Badge>Top Hold</Badge>}
```

3. **Cache user preference (optional)**
```typescript
// Allow users to customize sort order
const [sortOrder, setSortOrder] = useState<"balance" | "custom">("balance");
// Save to localStorage
useEffect(() => {
  localStorage.setItem("portfolioSortOrder", sortOrder);
}, [sortOrder]);
```

### Testing
- [ ] Highest balance currency appears first
- [ ] All currencies sort correctly
- [ ] Zero-balance currencies appear last
- [ ] Sort order persists on reload (if cached)

---

## Feature 8: Link Portfolio % to Real Data (45 min)

### Current Issue
Portfolio percentage change is static. Should reflect real price changes + daily profits.

### Location
- File: `client/src/pages/Dashboard.tsx`
- Component: Portfolio value display

### Implementation Steps

1. **Add 24h price change tracking**
```typescript
// Fetch 24h price changes for each currency
const get24hChange = async (symbol: string) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`
  );
  const data = await response.json();
  return data[symbol.toLowerCase()].usd_24h_change || 0;
};
```

2. **Calculate total portfolio change**
```typescript
const calculatePortfolioChange = (wallets: Wallet[]) => {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const wallet of wallets) {
    const currentValue = wallet.balance * getPriceUSD(wallet.symbol);
    const priceChange24h = get24hChange(wallet.symbol) / 100; // Convert to decimal
    const valueChange = currentValue * priceChange24h;
    
    totalAfter += currentValue + valueChange;
    totalBefore += currentValue;
  }

  const change = totalAfter - totalBefore;
  const changePercent = (change / totalBefore) * 100;
  
  return { change, changePercent };
};
```

3. **Add daily profits from mining/earn**
```typescript
// Get pending earnings
const { data: pendingEarnings } = useQuery({
  queryKey: ["/api/earnings/pending"],
});

// Add to portfolio change
const totalChange = priceChange + (pendingEarnings?.total || 0);
const totalChangePercent = (totalChange / totalPortfolioValue) * 100;
```

4. **Update display**
```typescript
<div className={`text-lg font-semibold ${totalChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
  {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
  ({totalChange >= 0 ? '+' : '$'}{Math.abs(totalChange).toFixed(2)})
</div>
```

### Testing
- [ ] Portfolio % matches market changes
- [ ] Includes mining/earn pending profits
- [ ] Updates in real-time
- [ ] Color changes correctly (green/red)
- [ ] Displays both % and $ change

---

## Feature 9: Fix Mobile Trading Section (20 min)

### Current Issue
Trading coins section not scrollable on mobile - overflows screen.

### Location
- File: `client/src/pages/Dashboard.tsx`
- Component: "Trading Coins" or "Market Overview" section

### Implementation Steps

1. **Make horizontally scrollable**
```typescript
<div className="overflow-x-auto scrollbar-hide">
  <div className="flex gap-3 pb-2">
    {coins.map(coin => (
      <div key={coin.id} className="flex-shrink-0 w-40">
        <CoinCard coin={coin} />
      </div>
    ))}
  </div>
</div>
```

2. **Add CSS for smooth scrolling**
```css
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari */
}
```

3. **Make card size responsive**
```typescript
className="flex-shrink-0 w-40 sm:w-48 md:w-56 lg:w-64"
```

4. **Add scroll indicator (optional)**
```typescript
{coinsCount > 4 && (
  <div className="absolute right-0 bg-gradient-to-l from-black/50 to-transparent w-12 h-full flex items-center justify-center">
    <ChevronRight className="w-4 h-4 text-white animate-pulse" />
  </div>
)}
```

### Testing
- [ ] Scrollable on mobile (< 640px)
- [ ] All coins visible
- [ ] Smooth scroll behavior
- [ ] No overflow issues
- [ ] Touch scrolling works on iOS/Android

---

## Feature 10: Add Referral Tracking (1.5-2 hours)

### Current Issue
No way for admin to see who referred who.

### Location
- Multiple: Database schema, backend, admin UI

### Implementation Steps

1. **Update user schema**
```typescript
// In shared/schema.ts
export const users = pgTable("users", {
  // ... existing fields ...
  referralCode: varchar("referral_code").unique(),  // e.g., "ABC123"
  referredByUserId: varchar("referred_by_user_id"),  // Parent user ID
  referralReward: real("referral_reward").default(0), // Earned rewards
});
```

2. **Create referral tracking table**
```typescript
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  refereeId: varchar("referee_id").notNull().references(() => users.id),
  rewardAmount: real("reward_amount"),
  rewardCurrency: text("reward_currency").default("USDT"),
  status: text("status").default("pending"), // pending, rewarded, rejected
  createdAt: timestamp("created_at").defaultNow(),
  rewardedAt: timestamp("rewarded_at"),
});
```

3. **Add referral endpoints**
```typescript
// Generate referral code on user signup
app.post("/api/auth/generate-referral", async (req, res) => {
  const { userId } = req.body;
  const code = generateCode(); // Random 8-char code
  
  await db.update(users)
    .set({ referralCode: code })
    .where(eq(users.id, userId));
    
  res.json({ referralCode: code });
});

// Accept referral code on signup
app.post("/api/auth/signup-with-referral", async (req, res) => {
  const { email, password, referralCode } = req.body;
  
  const referrer = await db.select()
    .from(users)
    .where(eq(users.referralCode, referralCode));
    
  if (referrer.length === 0) {
    return res.status(400).json({ error: "Invalid referral code" });
  }
  
  // Create user with referrer
  const [newUser] = await db.insert(users).values({
    email,
    password: hashPassword(password),
    referredByUserId: referrer[0].id,
  }).returning();
  
  // Create referral record
  await db.insert(referrals).values({
    referrerId: referrer[0].id,
    refereeId: newUser.id,
    status: "pending",
  });
  
  res.json({ user: newUser });
});
```

4. **Add admin view endpoints**
```typescript
// Get all referrals for a user
app.get("/api/admin/users/:userId/referrals", async (req, res) => {
  const { referrals } = await import("@shared/schema");
  const userReferrals = await db.select()
    .from(referrals)
    .where(eq(referrals.referrerId, req.params.userId));
  
  res.json(userReferrals);
});

// Get referral network (who referred this user)
app.get("/api/admin/users/:userId/referral-info", async (req, res) => {
  const { users: usersTable, referrals } = await import("@shared/schema");
  const [user] = await db.select()
    .from(usersTable)
    .where(eq(usersTable.id, req.params.userId));
  
  let referrer = null;
  if (user.referredByUserId) {
    const [parent] = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, user.referredByUserId));
    referrer = parent;
  }
  
  res.json({ user, referrer });
});
```

5. **Create admin UI component**
```typescript
// In admin dashboard
<ReferralNetwork userId={selectedUserId} />

const ReferralNetwork = ({ userId }) => {
  const { data: info } = useQuery({
    queryKey: ["/api/admin/users", userId, "referral-info"],
  });
  
  const { data: referredUsers } = useQuery({
    queryKey: ["/api/admin/users", userId, "referrals"],
  });
  
  return (
    <div>
      {info?.referrer && (
        <div>Referred by: {info.referrer.email}</div>
      )}
      <div>
        <h3>Referrals ({referredUsers?.length})</h3>
        {referredUsers?.map(ref => (
          <div key={ref.refereeId}>{ref.refereeId}</div>
        ))}
      </div>
    </div>
  );
};
```

### Testing
- [ ] Referral code generated on signup
- [ ] Code unique per user
- [ ] Admin can see referral relationships
- [ ] Referral rewards tracked
- [ ] Referral chain doesn't loop

---

## Implementation Priority for Next Session

### Phase 1 (2 hours)
1. Show all currencies on home page
2. Prioritize assets by balance
3. Fix mobile trading section

### Phase 2 (2 hours)
4. Link portfolio % to real data
5. Add referral tracking

---

## Common Issues & Solutions

### Issue: Prices not updating
- Solution: Implement price refresh interval with `setInterval` or React Query polling

### Issue: Referral code collisions
- Solution: Use UUID or add collision retry logic

### Issue: Mobile scrolling not smooth
- Solution: Add `scroll-behavior: smooth` CSS and use `overflow-x-auto`

### Issue: Portfolio % calculation wrong
- Solution: Ensure all price conversions use same API source (CoinGecko)

---

## Resources

- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Framer Motion (for animations)](https://www.framer.com/motion/)
- [Tailwind CSS (for styling)](https://tailwindcss.com)

---

## Testing Checklist Template

```markdown
### Feature Testing Checklist

- [ ] Functionality works on desktop
- [ ] Functionality works on mobile
- [ ] Functionality works on tablet
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Performance acceptable (< 100ms load)
- [ ] Database queries optimized
- [ ] Error handling implemented
- [ ] API endpoints documented
- [ ] Unit tests pass (if applicable)
```

---

Generated: January 14, 2026
For: Next Development Session
Estimated Time: 4-5 hours for all 5 features
