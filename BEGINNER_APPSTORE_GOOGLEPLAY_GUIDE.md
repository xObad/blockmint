# Mining Club — Beginner Guide: From Project to App Store + Google Play

This guide is written for **zero prior experience**. Follow it in order.

> Quick reality check
>
> - **Google Play (Android):** you can do everything from Windows/Linux.
> - **Apple App Store (iOS):** you still need Apple’s tooling that runs on macOS — but you *do not* need to own a Mac. See **“Publish to App Store without macOS”** below.

---

## 0) What you have here

This repo is a **web app** (Vite + React + TypeScript) plus a **Node/Express server**.

To publish to mobile stores you typically wrap the web app inside a native “shell” using **Capacitor** (recommended for existing web apps).

### Why a wrapper is required
- App Store / Google Play require a native app bundle (`.ipa` / `.aab`).
- A PWA alone usually cannot be listed as a normal store app.

---

## 1) Accounts you must create

### Required
- **Google Play Console** (one-time fee)
  - https://play.google.com/console
- **Apple Developer Program** (annual fee)
  - https://developer.apple.com/programs/

### Recommended
- A GitHub account (for CI builds)
- A cloud Mac build provider account (if you don’t have macOS)

---

## 2) Install tools on your computer

### Install Node.js
- Install **Node.js LTS** (18+ or 20+ recommended)
  - Verify: `node -v` and `npm -v`

### Install Git
- Verify: `git --version`

### Android-only tools (for Google Play)
- Install **Android Studio** (includes SDK + emulator)
  - https://developer.android.com/studio
- In Android Studio:
  - Install an SDK (latest stable)
  - Install “Android SDK Platform-Tools”

---

## 3) Run the app locally (sanity check)

From the repo root:

```bash
npm install
npm run dev
```

If the project uses separate dev commands for client/server, follow the repo’s existing docs in:
- `ADMIN_SETUP_GUIDE.md`
- `DEPLOYMENT_GUIDE.md`

---

## 4) Prepare production hosting for your API

Mobile apps cannot depend on your laptop running the server.

You need:
- A **production URL** for the backend API (for example: `https://api.yourdomain.com`)
- HTTPS enabled (required for modern mobile networking)

### Important: API base URL
Many apps use relative requests like `fetch('/api/...')`.

On mobile (Capacitor), your app loads from a local origin like `capacitor://localhost`, so `'/api'` will **not** automatically hit your hosted server.

You will need one of these approaches:
1) Change the frontend to use an env-based base URL, like `import.meta.env.VITE_API_BASE_URL`
2) Configure a proxy layer in the native shell (advanced)

If you haven’t done this yet, plan to do it before store release.

---

## 5) Turn the web app into a mobile app using Capacitor (recommended)

### 5.1 Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

During `cap init`, choose:
- App name: `Mining Club`
- App ID: `com.yourcompany.miningclub` (this must be unique)

### 5.2 Build the web app

```bash
npm run build
```

Vite typically outputs to `dist/`.

### 5.3 Configure Capacitor to point to your build folder

In `capacitor.config.ts`, set:
- `webDir: "dist"` (or whatever your build output is)

### 5.4 Add Android

```bash
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio will open.

### 5.5 Add iOS (requires macOS somewhere)

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

This opens Xcode.

---

## 6) Android release (Google Play)

### 6.1 Create a signing key (keystore)
Android apps must be signed.

You can do this in Android Studio or via command line.

### 6.2 Build an Android App Bundle (AAB)
In Android Studio:
- Build → Generate Signed Bundle/APK
- Choose **Android App Bundle**

Result: an `.aab` file.

### 6.3 Upload to Google Play Console
- Create an app
- Complete required “Store listing” fields
- Upload the `.aab` to an Internal test track first

### 6.4 Test, then roll out
- Use Internal testing → Closed testing → Production

---

## 7) iOS release (App Store)

### 7.1 Certificates + Identifiers
In Apple Developer:
- Create App ID / Bundle ID (must match `com.yourcompany.miningclub`)
- Create signing certificates

### 7.2 Build an archive
In Xcode:
- Product → Archive
- Distribute App → App Store Connect

### 7.3 App Store Connect
- Create the app record
- Upload build
- Fill in:
  - Screenshots
  - Description
  - Privacy details
  - App review information

### 7.4 Submit for review
Apple review can take hours to days.

---

## 8) Publish to App Store without macOS

You still need **macOS somewhere** for the iOS build/sign step, but you don’t need to own a Mac.

### Option A (most common): Cloud Mac rental
- **MacStadium**, **MacInCloud**: rent a Mac VM / machine.
- Install Xcode and build like normal.

### Option B: CI with hosted macOS runners
You can build iOS in CI:
- **GitHub Actions** (macOS runners)
- **Bitrise** / **Codemagic** / **CircleCI** (macOS build machines)

Typical flow:
- Push code to GitHub
- CI builds + signs the app
- CI uploads to TestFlight / App Store Connect

You still need:
- Apple Developer account
- Signing certificates/profiles (stored securely as CI secrets)

### Option C: Use a partner/contractor for iOS signing+upload
If you don’t want to handle certificates:
- A trusted dev can build/sign/upload on their Mac.

(You should still own the Apple Developer account and App Store Connect app record.)

---

## 9) Store readiness checklist (quick)

Before submitting:
- App runs fully on device (not just in browser)
- API points to production domain (not `localhost`)
- Error handling is solid (no crashes on network failure)
- Terms/Privacy policy links are present
- Support email present
- Screenshots generated for store sizes

---

## 10) If you want, I can tailor this guide

Reply with:
- Your target: **Capacitor** or something else?
- Your backend production URL
- Do you want CI builds (GitHub Actions / Codemagic / Bitrise)?
