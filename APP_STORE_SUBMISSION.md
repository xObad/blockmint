# App Store Submission Guide for BlockMint

This guide covers everything you need to successfully submit BlockMint to the Apple App Store and Google Play Store.

---

## ✅ Pre-Submission Checklist

### Critical Requirements (Already Implemented)

- [x] **Sign in with Apple** - Implemented in AuthPage.tsx
- [x] **Account Deletion** - Added in Settings.tsx with API endpoint
- [x] **Privacy Policy** - Available at /privacy (in-app accessible)
- [x] **Terms of Service** - Available at /terms (in-app accessible)
- [x] **Age Gate** - App is for 18+ (specified in Terms)
- [x] **Risk Disclaimers** - Added to Mining.tsx and Invest.tsx
- [x] **No Guaranteed Returns Language** - Disclaimers added
- [x] **Email/Password Registration** - Does not use phone-only
- [x] **Offline Functionality** - PWA with caching
- [x] **Clear Value Proposition** - Mining hashpower platform

---

## 📱 App Store Connect Setup

### App Information

| Field | Value |
|-------|-------|
| **App Name** | BlockMint |
| **Subtitle** | Premium Hashpower Mining |
| **Bundle ID** | co.hardisk.blockmint |
| **SKU** | blockmint-ios |
| **Primary Category** | Finance |
| **Secondary Category** | Utilities |
| **Content Rights** | Yes, I own or have licensed all content |

### Description (4000 chars max)

```
BlockMint is a premium cryptocurrency hashpower mining platform that allows you to participate in Bitcoin and Litecoin mining without purchasing or maintaining physical hardware.

KEY FEATURES:

🔥 Cloud Mining Made Simple
Purchase hashpower contracts and start earning cryptocurrency rewards. No hardware required, no electricity bills, no technical knowledge needed.

💰 Flexible Investment Options
• Daily, weekly, monthly, and yearly earning plans
• Competitive APR rates up to 19%
• Withdraw your funds anytime with no penalties
• Multiple cryptocurrency support (BTC, LTC, USDT, USDC)

🛡️ Bank-Grade Security
• Enterprise-level encryption protects your funds
• Two-factor authentication (2FA) support
• Biometric login (Face ID / Touch ID)
• Cold storage for enhanced security

📊 Real-Time Analytics
• Live hashrate monitoring
• Detailed earnings history
• Portfolio performance tracking
• Push notifications for transactions

🎯 Solo Mining
Join our solo mining pools for the chance to win full block rewards (3.125 BTC per block).

💳 Virtual Card (Coming Soon)
Spend your mining rewards anywhere with our upcoming virtual card feature.

IMPORTANT DISCLAIMERS:
• Cryptocurrency investments involve significant risk
• Past performance does not guarantee future results
• You may lose some or all of your investment
• This is not financial advice
• Must be 18+ to use this application

BlockMint is operated by Hardisk UAE Mining Farms. For support, contact info@hardisk.co

Website: hardisk.co
```

### Keywords (100 chars, comma-separated)

```
bitcoin,mining,crypto,hashpower,btc,litecoin,cloud mining,cryptocurrency,invest,yield,staking
```

### Support URL
```
https://hardisk.co/support
```

### Marketing URL
```
https://hardisk.co
```

### Privacy Policy URL
```
https://blockmint.app/privacy
```
*(Or use your actual deployed URL)*

---

## 🔞 Age Rating Questionnaire

For a crypto/financial app, answer these questions in App Store Connect:

| Category | Answer |
|----------|--------|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Sexual Content or Nudity | None |
| Profanity or Crude Humor | None |
| Alcohol, Tobacco, or Drug Use | None |
| Simulated Gambling | None |
| Horror/Fear Themes | None |
| Mature/Suggestive Themes | None |
| **Unrestricted Web Access** | **Yes** (app accesses internet) |

**Resulting Rating: 17+** (due to financial nature and crypto trading)

---

## 📸 Screenshots Required

### iPhone Screenshots (Required Sizes)

#### 6.7" Display (iPhone 15 Pro Max) - 1290 × 2796
- Screenshot 1: Onboarding / Welcome screen
- Screenshot 2: Dashboard with balances
- Screenshot 3: Mining packages selection
- Screenshot 4: Invest/Yield page
- Screenshot 5: Wallet with transaction history

#### 6.5" Display (iPhone 11 Pro Max) - 1242 × 2688
- Same 5 screenshots

#### 5.5" Display (iPhone 8 Plus) - 1242 × 2208
- Same 5 screenshots

### iPad Screenshots (If Supporting iPad)

#### 12.9" iPad Pro - 2048 × 2732
- Same 5 screenshots

### Screenshot Tips for Approval

1. **No placeholder content** - All data should look realistic
2. **No test/demo text** - Remove any "test", "demo", "sample" text
3. **Show real feature names** - Use actual feature names
4. **Clean UI** - No debug overlays or console output
5. **Consistent branding** - Use the BlockMint brand colors

---

## 📄 App Privacy Details

When filling out App Privacy in App Store Connect:

### Data Types Collected

| Data Type | Collected | Linked to User | Used for Tracking |
|-----------|-----------|----------------|-------------------|
| Name | Yes | Yes | No |
| Email Address | Yes | Yes | No |
| User ID | Yes | Yes | No |
| Device ID | Yes | No | No |
| Purchase History | Yes | Yes | No |
| Financial Info | Yes | Yes | No |
| Usage Data | Yes | No | No |
| Crash Data | Yes | No | No |

### Data Use Purposes
- App Functionality
- Analytics
- Product Personalization
- Security (Fraud Prevention)

---

## ⚠️ Common Rejection Reasons & Solutions

### 1. Guideline 3.1.1 - In-App Purchase
**Risk**: Apple may require crypto purchases to go through IAP.
**Solution**: BlockMint sells hashpower contracts (digital services) paid via crypto, not in-app purchases. This is similar to crypto exchanges which are allowed.

**If Rejected**: Emphasize that:
- We facilitate cryptocurrency mining services
- Users pay with cryptocurrency, not fiat
- Similar to Coinbase, Binance, Crypto.com which are approved

### 2. Guideline 5.1.1 - Data Collection and Storage
**Solution**: ✅ Already implemented
- Privacy Policy accessible in-app
- Terms of Service accessible in-app
- Account deletion option available

### 3. Guideline 4.2 - Minimum Functionality
**Solution**: The app has extensive features:
- Mining dashboard with real-time stats
- Multiple investment options
- Wallet management
- Transaction history
- Security features (2FA, biometrics)
- Notifications
- Referral system

### 4. Guideline 5.6 - Developer Code of Conduct
**Solution**: 
- No misleading claims
- Risk disclaimers prominently displayed
- Clear terms and conditions
- Transparent fee structure

### 5. Guideline 3.2.1 - Unacceptable Business Model
**Risk**: Apps that promise unrealistic returns.
**Solution**: ✅ Already implemented
- Added risk disclaimers stating returns are not guaranteed
- Clear language that investments carry risk
- No "get rich quick" messaging

---

## 🚀 Submission Steps

### 1. Build the App
```bash
# In Codemagic or locally
npm run build
npx cap sync ios
```

### 2. Upload to App Store Connect
Codemagic will automatically:
1. Build the IPA
2. Sign with your certificates
3. Upload to TestFlight
4. Notify you via email

### 3. Complete App Store Connect Info
1. Log into App Store Connect
2. Select your app
3. Fill in all required fields (use info above)
4. Upload screenshots
5. Complete App Privacy section
6. Set pricing (Free)
7. Select countries/regions

### 4. Submit for Review
1. Add build from TestFlight
2. Answer export compliance (No encryption beyond HTTPS)
3. Add review notes for Apple:

**Review Notes Template:**
```
Demo Account (optional - provide if helpful):
Email: demo@blockmint.app
Password: DemoPass123!

Key Points for Review:
1. This is a cryptocurrency mining hashpower platform
2. Users purchase mining contracts, not in-app purchases
3. All transactions are in cryptocurrency
4. Similar approved apps: Binance, Coinbase, Crypto.com
5. Account deletion is available in Settings
6. Age restriction: 17+ (financial/crypto content)

Support Contact: info@hardisk.co
```

### 5. Wait for Review
- Typical review time: 24-48 hours
- May take longer for crypto apps
- Be prepared to respond to questions

---

## 🤖 Google Play Store Differences

### Key Differences from iOS

1. **No Sign in with Apple required** (obviously)
2. **More lenient on crypto apps** generally
3. **Different screenshot sizes** required
4. **Play Console** instead of App Store Connect

### Google Play Content Rating

Fill out the content rating questionnaire similarly:
- Violence: None
- Sexuality: None
- Language: None
- Controlled Substances: None
- **User-Generated Content**: No
- **In-app purchases of digital goods**: Yes

Result: **Teen** or **Mature 17+** depending on responses

### Data Safety Section

Similar to Apple's App Privacy:
- Declare all data collected
- Explain purpose of collection
- State if data is encrypted in transit (Yes - HTTPS)
- State if users can request data deletion (Yes)

---

## 📞 Support Contact

For App Store issues: info@hardisk.co
For Codemagic issues: https://docs.codemagic.io
For BlockMint bugs: Create GitHub issue

---

## 🎉 Post-Approval

After approval:
1. Announce on social media
2. Update website with download links
3. Set up App Analytics in App Store Connect
4. Monitor crash reports
5. Respond to user reviews
6. Plan regular updates to maintain ranking

Good luck with your submission! 🚀
