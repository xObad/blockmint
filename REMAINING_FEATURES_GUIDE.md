# Remaining Work Guide (Updated)

This document tracks what’s left to implement and what was recently changed.

Important constraint: Avoid DB schema changes unless you ship migrations and deploy them alongside code changes. Admin stability is critical.

---

## Completed (this session)

- Trending section limited to 4 coins and USDT price no longer shows as 0.
- Asset ordering enforced: USDT → BTC → LTC first (Dashboard + Wallet).
- Invest is USDT-only and uses wallet balance when subscribing.
- Mining purchases use wallet balance reliably and pay with USDT.
- db-admin Articles crash fixed (`articles.map is not a function`) by normalizing response shape.
- X link updated to: https://x.com/BlockMintingApp

---

## Remaining (highest priority)

## 1) db-admin layout/UX improvements (UI-only)

### Goal
Make db-admin easier to use and more readable on desktop + mobile without changing backend routes, logic, or database schema.

### Scope (allowed)
- Layout, spacing, typography, responsive table wrappers, better section headers.
- Add non-invasive UI features (search input client-side, “refresh” button).

### Scope (not allowed)
- No changes to API routes, request/response shapes, or DB schema.

### Implementation Notes
- Wrap tables in `overflow-x-auto` containers for mobile.
- Add a consistent page header (title + actions) for each tab.
- Keep existing query keys and mutations intact.

---

## 2) Invest page polish (USDT-only)

### Goal
Invest should be USDT-only, show real-time available USDT balance, and purchase plans by deducting from the USDT wallet.

### Notes
- Current implementation posts to `/api/earn/subscribe` using the stored DB user id and `symbol: "USDT"`.
- If users report “Not authenticated”, verify localStorage `user.id` is present after login.

---

## 3) Mining purchase polish (USDT-only)

### Goal
Mining devices + hashrate purchases should show real-time USDT balance and always deduct from USDT.

### Notes
- Purchases post to `/api/mining/purchase` with `symbol: "USDT"`.
- If users report “Account Not Ready”, verify localStorage `user.id` is present after login.

---

## Beginner deployment guide

Use DEPLOYMENT_GUIDE.md for a complete step-by-step guide from cloning → database → Firebase → production deploy → Android (AAB) → iOS (IPA) submissions.

---

## Deprecated / on-hold

### Referral tracking
This is intentionally on-hold because it requires DB schema changes + safe migrations. Do not reintroduce ad-hoc referral columns/endpoints without a migration plan.

If/when referral tracking is reintroduced, treat it as a proper migration-driven feature (schema + backfill + deploy order) to avoid bringing the app down.

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
