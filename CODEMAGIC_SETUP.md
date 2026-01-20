# Codemagic Setup Guide for BlockMint

This guide will help you set up Codemagic to build native iOS (.ipa) and Android (.aab/.apk) apps from your web app.

---

## ⚠️ IMPORTANT: Configuration Files Explained

Your repository has **TWO different build configuration files** that serve different purposes:

| File | Purpose | When Used |
|------|---------|-----------|
| `cloudbuild.yaml` | **Web app deployment** to Google Cloud Run (or DigitalOcean) | Deploying the web server/backend |
| `codemagic.yaml` | **Mobile app builds** (iOS .ipa / Android .aab) | Building native apps for App Store & Play Store |

**They do NOT conflict** - they are for completely different deployment targets:
- **cloudbuild.yaml** = Your web app/API server deployment
- **codemagic.yaml** = Your mobile app compilation

---

## Prerequisites

Before starting, you need:

1. **Apple Developer Account** ($99/year) - https://developer.apple.com
2. **Google Play Developer Account** ($25 one-time) - https://play.google.com/console
3. **Codemagic Account** (Free tier available) - https://codemagic.io

---

## Step 1: Codemagic Account Setup

1. Go to https://codemagic.io and sign up with GitHub
2. Click "Add application" 
3. Select your `mining-club` repository
4. **For "Select project type"** - Choose one of these options:
   - ✅ **"Other"** (Recommended) - This tells Codemagic to use your `codemagic.yaml` file directly
   - ✅ **"Capacitor"** - If available, this is also correct since we use Capacitor
   - ❌ **NOT "React Native"** - This is NOT a React Native app
   - ❌ **NOT "Flutter"** - This is NOT a Flutter app
5. Choose **"codemagic.yaml"** as the configuration method (not workflow editor)

---

## Step 2: iOS App Store Connect Integration

### 2.1 Create App Store Connect API Key

1. Go to https://appstoreconnect.apple.com
2. Navigate to **Users and Access** → **Keys** tab
3. Click the **+** button to create a new key
4. Name it: `Codemagic`
5. Access: **App Manager** (or Admin for more permissions)
6. Download the `.p8` file (save it securely - you can only download once!)
7. Note the **Key ID** and **Issuer ID**

### 2.2 Add Integration in Codemagic

1. In Codemagic, go to **Team settings** → **Integrations**
2. Click **App Store Connect**
3. Name: `Hardisk App Store Connect` (must match codemagic.yaml)
4. Enter:
   - Issuer ID
   - Key ID
   - Upload the .p8 file

### 2.3 Create App ID in Apple Developer Portal

1. Go to https://developer.apple.com/account
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Click **+** to register a new identifier
4. Select **App IDs** → **App**
5. Description: `BlockMint`
6. Bundle ID: `co.hardisk.blockmint` (Explicit)
7. Enable capabilities:
   - ✅ Push Notifications
   - ✅ Sign in with Apple
8. Click **Register**

### 2.4 Configure Sign in with Apple

To enable Sign in with Apple (required by App Store if you use other social logins):

1. Go to https://developer.apple.com/account
2. **Certificates, Identifiers & Profiles** → **Keys**
3. Click **+** to create a new key
4. Name: `BlockMint Sign In with Apple`
5. Check ✅ **Sign in with Apple**
6. Click **Configure** next to Sign in with Apple
7. Select `BlockMint (co.hardisk.blockmint)` as Primary App ID
8. Click **Save** → **Continue** → **Register**
9. Download the `.p8` key file (save securely!)
10. Note the **Key ID**

**Firebase Setup:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Click **Apple** → Enable
3. Enter:
   - **Services ID**: Your App ID (co.hardisk.blockmint)
   - **Apple Team ID**: From developer.apple.com account
   - **Key ID**: From step 9 above
   - **Private Key**: Contents of the .p8 file
4. Add authorized domains if needed
5. Save

### 2.5 Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: BlockMint
   - Primary Language: English
   - Bundle ID: Select `co.hardisk.blockmint`
   - SKU: `blockmint-ios`
4. Click **Create**

---

## Step 3: iOS Code Signing (Automatic)

Codemagic handles code signing automatically with the App Store Connect integration:

1. In your Codemagic app settings, go to **iOS code signing**
2. Select **Automatic** code signing
3. Select your Apple Developer Team
4. Bundle ID: `co.hardisk.blockmint`
5. Codemagic will create/manage certificates and profiles automatically

---

## Step 4: Android Setup (for later)

### 4.1 Create Keystore

Run this locally or Codemagic can generate one:

```bash
keytool -genkey -v -keystore blockmint.keystore \
  -alias blockmint \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=BlockMint, OU=Hardisk, O=Hardisk UAE Mining Farms, L=Dubai, ST=Dubai, C=AE"
```

### 4.2 Add Keystore to Codemagic

1. In Codemagic app settings → **Android code signing**
2. Upload your `.keystore` file
3. Reference name: `blockmint_keystore`
4. Enter passwords and alias

### 4.3 Google Play Console Setup

1. Create app in https://play.google.com/console
2. **Setup** → **API access** → **Create new service account**
3. Download the JSON key file
4. Grant the service account **Admin** permissions
5. In Codemagic: **Team settings** → **Global variables**
6. Add `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` with the JSON content

---

## Step 5: Environment Variables

In Codemagic app settings, add these variables if needed:

| Variable | Description |
|----------|-------------|
| `FIREBASE_CONFIG` | Firebase web config (optional for native) |
| `API_URL` | Your backend API URL |

---

## Step 6: Run Your First Build

### For iOS:

1. Commit and push your changes to `main` branch
2. Codemagic will automatically start a build
3. Or manually trigger: Codemagic Dashboard → Start new build → Select `ios-release`

### For Android:

1. After iOS is working, trigger `android-release` workflow

---

## Step 7: App Store Submission Checklist

Before submitting to App Store, ensure you have:

### Required Assets
- [ ] App Icon (1024x1024 PNG, no transparency, no rounded corners)
- [ ] Screenshots for iPhone 6.7" (1290×2796) - at least 3
- [ ] Screenshots for iPhone 6.5" (1242×2688) - at least 3
- [ ] Screenshots for iPhone 5.5" (1242×2208) - at least 3
- [ ] iPad Pro 12.9" screenshots (if supporting iPad)

### App Store Connect Info
- [ ] App Name: BlockMint
- [ ] Subtitle: Premium Hashpower Mining
- [ ] Description (4000 chars max)
- [ ] Keywords (100 chars max, comma-separated)
- [ ] Support URL: https://hardisk.co/support
- [ ] Marketing URL: https://hardisk.co
- [ ] Privacy Policy URL: https://blockmint.app/privacy-policy
- [ ] Category: Finance
- [ ] Secondary Category: Utilities
- [ ] Age Rating: 17+ (for crypto/financial apps)
- [ ] Copyright: © 2026 Hardisk UAE Mining Farms

### Review Guidelines Compliance
- [ ] No placeholder content
- [ ] All features functional
- [ ] No broken links
- [ ] Clear value proposition
- [ ] Accurate screenshots
- [ ] Privacy policy accessible in-app

---

## Troubleshooting

### Build Fails: "No matching provisioning profiles"
- Ensure Bundle ID matches exactly: `co.hardisk.blockmint`
- Check App Store Connect integration is properly configured
- Verify App ID exists in Apple Developer Portal

### Build Fails: "Code signing error"
- Re-create certificates in Codemagic code signing settings
- Ensure you have a valid Apple Developer subscription

### Build Fails: "CocoaPods installation failed"
- Check that `ios/App/Podfile` exists after `cap add ios`
- May need to update CocoaPods: add `gem install cocoapods` to scripts

---

## Understanding Project Types in Codemagic

When Codemagic asks you to select a project type, here's what each option means:

### ✅ Choose "Other" or "Capacitor"
Your BlockMint app is a **Capacitor** project (web app wrapped as native). Select:
- **"Other"** - Uses your `codemagic.yaml` configuration file directly
- **"Capacitor"** - Pre-configured templates for Capacitor projects

### ❌ Do NOT Choose These
- **"React Native"** - For apps built with React Native framework (different from React web)
- **"Flutter"** - For apps built with Google's Flutter SDK
- **"Native iOS"** - For apps written purely in Swift/Objective-C
- **"Native Android"** - For apps written purely in Kotlin/Java

### Why "Other" is Recommended
Choosing "Other" tells Codemagic to look for your `codemagic.yaml` file and use that configuration. This gives you full control over the build process, which is already configured in your repository.

---

## Contact

For Codemagic support: https://docs.codemagic.io
For Hardisk support: info@hardisk.co

