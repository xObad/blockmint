# App Config Keys (Wallets, Pricing, Settings)

Use the Database Admin panel (Config tab) to add or edit entries in the `app_config` table. Each entry needs:
- **key**: unique name
- **value**: actual data (address, number, text)
- **category**: `wallet` | `pricing` | `settings` | `notifications`
- **description**: optional helper/fee note

## Wallet addresses (used by deposit UI)
Add these keys under category `wallet` to control the deposit addresses shown to users. Existing keys the UI understands:
- `wallet_btc_native`
- `wallet_btc_lightning`
- `wallet_ltc_native`
- `wallet_eth_erc20`
- `wallet_eth_arbitrum`
- `wallet_eth_optimism`
- `wallet_zcash_native`
- `wallet_ton_native`
- `wallet_bnb_bsc`
- `wallet_bnb_bep2`

How to change an address: edit the entry’s value in the Config tab.

Add a new network: create a key following `wallet_<symbol>_<network>` (example: `wallet_usdt_trc20`) in category `wallet`. Set the description to the label/fee note you want users to see (e.g., `USDT TRC20 (0 fees)`).

Remove/hide a network: delete that config entry in the Config tab (the UI will show a missing-address warning); remove the network from the UI list if you also want it hidden (see Dashboard/Wallet network arrays).

## Pricing (category: pricing)
Use for dynamic rates (e.g., mining package overrides). Suggested keys:
- `pricing_btc_hashrate_usd` – custom USD price per TH/s
- `pricing_ltc_hashrate_usd`
- `pricing_fee_percent` – platform fee percent

## Settings (category: settings)
General flags/text the app can read:
- `settings_support_email`
- `settings_maintenance_message`
- `settings_deposit_instructions`
- `settings_withdrawal_note`
- `settings_verification_email_enabled` – Enable email verification (true/false)
- `settings_verification_phone_enabled` – Enable phone verification (true/false)

## Force Update (category: update)

Controls when app requires users to update. Admin can trigger mandatory updates across all platforms:
- `update_enabled` – Enable force update (true/false)
- `update_minimum_version` – Minimum required version (e.g., "1.2.0")
- `update_current_version` – Current app version
- `update_android_url` – Google Play Store link (https://play.google.com/store/apps/details?id=...)
- `update_ios_url` – Apple App Store link (https://apps.apple.com/app/...)
- `update_message` – Custom update message to show users

## Verification SDKs (category: verification)

Configure third-party verification services for email and phone:
- `verify_email_provider` – Provider name (e.g., "twilio", "sendgrid", "custom")
- `verify_email_api_key` – API key for email service
- `verify_phone_provider` – Provider name (e.g., "twilio")
- `verify_phone_api_key` – API key for SMS service
- `verify_phone_number` – Twilio phone number for SMS verification

## Tips
- Keep key names lowercase with underscores.
- Use `description` to surface fee/notes to users (e.g., “0 fees on Lightning”).
- You can edit or delete entries anytime from the Config tab; changes take effect immediately on refresh.
