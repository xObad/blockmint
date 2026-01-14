# Emergency Fix Report - January 14, 2026

## What broke

- The app was going down due to an uncaught `fetch()` failure against CoinGecko in [client/src/hooks/useMiningData.ts](client/src/hooks/useMiningData.ts).
- Admin UI (DB admin/user management) became unreliable after referral schema changes were merged but not migrated in the live DB, causing column-missing errors.
- Dashboard “Trending Cryptocurrencies” started showing all currencies; you want it to show only 4 coins.

## What I did (safe + careful)

- Reverted the referral system commit **without force-pushing** (created a standard `git revert` commit). This restores admin reliability because the backend no longer queries non-existent referral columns.
- Hardened CoinGecko fetching with a 5s timeout + fallback so CoinGecko downtime cannot take the app down.
- Adjusted Dashboard:
  - **Assets**: still show all supported currencies and are sorted by biggest balance first.
  - **Trending**: now shows **only 4 coins** (BTC, ETH, USDT, LTC) and displays market price/24h change.

## Files changed

- [client/src/hooks/useMiningData.ts](client/src/hooks/useMiningData.ts)
- [client/src/pages/Dashboard.tsx](client/src/pages/Dashboard.tsx)
- [shared/schema.ts](shared/schema.ts) (via revert)
- [server/routes.ts](server/routes.ts) (via revert)

## Notes

- Referral system can be re-introduced later, but only together with a proper DB migration plan so production/staging DB is always in sync.
