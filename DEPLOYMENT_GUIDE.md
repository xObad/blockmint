# Mining Club - Complete Deployment Guide

A comprehensive beginner-friendly guide to deploying the Mining Club cryptocurrency mining application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Local Development](#local-development)
5. [Web Deployment](#web-deployment)
6. [Custom Domain Setup](#custom-domain-setup)
7. [Android APK/AAB Build](#android-apkaab-build)
8. [iOS IPA Build](#ios-ipa-build)
9. [App Store Submissions](#app-store-submissions)
10. [Admin Panel Usage](#admin-panel-usage)
11. [Environment Variables](#environment-variables)
12. [Troubleshooting](#troubleshooting)
13. [GCP Compute Engine Quick Setup](#gcp-compute-engine-quick-setup)
14. [CI/CD to VPS (GitHub Actions)](#cicd-to-vps-github-actions)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org)
- **npm or yarn**: Comes with Node.js
- **Git**: Download from [git-scm.com](https://git-scm.com)
- **PostgreSQL database**: Local or cloud-hosted (we recommend [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- **Firebase account**: Free tier available at [firebase.google.com](https://firebase.google.com)
- **Code editor**: VS Code recommended

---

## Database Setup

### Option 1: Neon (Recommended for Beginners)

1. **Create Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub or email

2. **Create Database**
   - Click "New Project"
   - Name it "mining-club"
   - Select region closest to your users
   - Copy the connection string (looks like `postgresql://user:pass@host/db`)

3. **Save Connection String**
   ```bash
   # Create .env file in project root
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

### Option 2: Supabase

1. **Create Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create new project

2. **Get Connection String**
   - Go to Settings > Database
   - Copy the "Connection string" (use "Session mode" for development)

3. **Add to .env**
   ```bash
   DATABASE_URL="postgresql://postgres:password@host:5432/postgres"
   ```

### Option 3: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   createdb mining_club
   ```

3. **Set Connection String**
   ```bash
   DATABASE_URL="postgresql://localhost:5432/mining_club"
   ```

### Initialize Database Tables

After setting up the database:

```bash
# Install dependencies
npm install

# Push schema to database
npm run db:push

# (Optional) Open database studio
npm run db:studio
```

---

## Firebase Configuration

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it "mining-club"
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication

1. Go to **Authentication** in sidebar
2. Click "Get started"
3. Enable **Email/Password** provider
4. Enable **Google** provider
5. (Optional) Enable **Apple** for iOS

### Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon `</>`
4. Register app with nickname "mining-club-web"
5. Copy the config object

### Add to Environment

Create `client/.env`:

```bash
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"
```

### Generate Admin SDK Key

1. Go to **Project Settings > Service accounts**
2. Click "Generate new private key"
3. Save the JSON file
4. Add to server `.env`:

```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
# Or path to file:
GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccount.json"
```

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/your-username/mining-club.git
cd mining-club
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

Create `.env` in project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@host/database"

# Server
NODE_ENV="development"
PORT=5000

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

Create `client/.env`:

```bash
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

### 4. Initialize Database

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

App runs at `http://localhost:5000`

### 6. Create First Admin

1. Register a new account in the app
2. Open database studio: `npm run db:studio`
3. Find your user in `users` table
4. Change `role` to `"admin"`
5. (Optional) Add your email to `admin_emails` table

---

## Web Deployment

### Option 1: Railway (Recommended)

1. **Sign Up**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL**
   - Click "New Service"
   - Select "PostgreSQL"
   - Railway auto-creates database

4. **Configure Variables**
   - Go to your service
   - Click "Variables"
   - Add all environment variables from `.env`
   - Railway auto-links `DATABASE_URL` from PostgreSQL

5. **Deploy**
   - Railway auto-deploys on push to main branch
   - Click "Generate Domain" for public URL

### Option 2: Render

1. **Create Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect GitHub repository

3. **Configure**
   ```yaml
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Add Database**
   - Create PostgreSQL database in Render
   - Copy connection string to environment variables

5. **Environment Variables**
   - Add all variables from `.env`
   - Click "Create Web Service"

### Option 3: DigitalOcean App Platform

1. Create app from GitHub repository
2. Add managed PostgreSQL database
3. Configure environment variables
4. Deploy

### Option 4: VPS (Manual)

```bash
# SSH into server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-username/mining-club.git
cd mining-club

# Install dependencies
npm install

# Build
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "mining-club" -- start
pm2 save
pm2 startup
```

---

## Custom Domain Setup

### 1. Buy Domain

Purchase from [Namecheap](https://namecheap.com), [GoDaddy](https://godaddy.com), or [Cloudflare](https://cloudflare.com).

### 2. Configure DNS

Add these records in your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | Your server IP |
| CNAME | www | your-app.railway.app (or hosting provider URL) |

### 3. Add to Hosting Provider

**Railway:**
1. Go to service settings
2. Click "Custom Domain"
3. Enter your domain
4. Railway provides verification record

**Render:**
1. Go to service settings
2. Click "Custom Domains"
3. Add domain and verify

### 4. Enable SSL

Most providers auto-provision SSL certificates. If manual:

```bash
# Using Certbot on VPS
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Android APK/AAB Build

### Prerequisites

- Android Studio installed
- Java JDK 11+
- Android SDK

### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Mining Club" "com.miningclub.app"
npx cap add android
```

### 2. Build Web App

```bash
npm run build
npx cap sync
```

### 3. Open in Android Studio

```bash
npx cap open android
```

### 4. Build APK (Debug)

In Android Studio:
1. Build > Build Bundle(s) / APK(s) > Build APK(s)
2. Find APK at `android/app/build/outputs/apk/debug/`

### 5. Build AAB (Release)

For Play Store:

1. **Generate Signing Key**
   ```bash
   keytool -genkey -v -keystore mining-club.keystore -alias mining-club -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing** in `android/app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('mining-club.keystore')
               storePassword 'your-password'
               keyAlias 'mining-club'
               keyPassword 'your-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
           }
       }
   }
   ```

3. **Build AAB**
   - Build > Build Bundle(s) / APK(s) > Build Bundle(s)
   - Find at `android/app/build/outputs/bundle/release/`

### 6. Generate Icons

Create icons at `android/app/src/main/res/`:
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

---

## iOS IPA Build

### Prerequisites

- macOS computer
- Xcode 14+ installed
- Apple Developer Account ($99/year)

### 1. Install Capacitor iOS

```bash
npm install @capacitor/ios
npx cap add ios
```

### 2. Build and Sync

```bash
npm run build
npx cap sync ios
```

### 3. Open in Xcode

```bash
npx cap open ios
```

### 4. Configure Signing

1. Select project in Xcode
2. Go to "Signing & Capabilities"
3. Select your Team
4. Set Bundle Identifier: `com.miningclub.app`

### 5. Build Archive

1. Select "Any iOS Device" as target
2. Product > Archive
3. Wait for build to complete

### 6. Export IPA

1. Window > Organizer
2. Select your archive
3. Click "Distribute App"
4. For testing: "Ad Hoc" or "Development"
5. For App Store: "App Store Connect"

### 7. App Icons

Add to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:
- Various sizes from 20x20 to 1024x1024
- See Apple's documentation for exact sizes

---

## App Store Submissions

### Google Play Store

1. **Create Developer Account**
   - Go to [Play Console](https://play.google.com/console)
   - Pay $25 one-time fee

2. **Create App**
   - Click "Create app"
   - Fill in app details

3. **Store Listing**
   - Title: "Mining Club"
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (2-8 per device type)
   - Feature graphic (1024x500)
   - App icon (512x512)

4. **Content Rating**
   - Complete questionnaire
   - Get rating certificate

5. **Pricing & Distribution**
   - Set as Free or Paid
   - Select countries

6. **Upload AAB**
   - Go to Production > Create release
   - Upload AAB file
   - Write release notes
   - Submit for review

### Apple App Store

1. **Create Developer Account**
   - Go to [Apple Developer](https://developer.apple.com)
   - Pay $99/year

2. **Create App in App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - My Apps > New App
   - Fill in details

3. **App Information**
   - Name: "Mining Club"
   - Subtitle (optional)
   - Categories
   - Privacy Policy URL
   - License Agreement

4. **Screenshots**
   Required sizes:
   - iPhone 6.7" (1290 x 2796)
   - iPhone 6.5" (1242 x 2688)
   - iPhone 5.5" (1242 x 2208)
   - iPad Pro 12.9" (2048 x 2732)

5. **Upload Build**
   - Use Xcode Organizer
   - Or Transporter app

6. **Submit for Review**
   - Fill in review information
   - Add demo account credentials
   - Submit

---

## Admin Panel Usage

### Accessing Admin Panel

1. Sign in with admin account
2. Navigate to Menu > Admin Panel
3. Or go to `/admin` directly

### User Management

**View Users:**
- See all registered users
- Filter by status, role, or search

**User Actions:**
- Edit user details
- Adjust wallet balances
- Change user role (user/admin)
- Suspend/activate accounts
- Delete users

### Investment Plans

**Create Plan:**
1. Go to "Plans" tab
2. Click "Add Plan"
3. Fill in:
   - Name (e.g., "Starter")
   - Minimum investment
   - Maximum investment
   - Duration (days)
   - Daily return percentage
   - Currency (BTC/LTC)

**Manage Plans:**
- Edit existing plans
- Enable/disable plans
- Set display order

### Miner Pricing

Configure available miners:
- Model name
- Hash rate
- Price
- Power consumption
- Daily earnings estimate

### Withdrawals

**Review Requests:**
1. Go to "Withdrawals" tab
2. See pending requests

**Approve/Reject:**
- Click "Approve" and optionally add TX hash
- Click "Reject" with reason (auto-refunds user)

### Notifications

**Broadcast:**
1. Go to "Notifications" tab
2. Click "Send Notification"
3. Leave user ID empty for all users
4. Enter title and message
5. Click "Broadcast to All"

**Send to User:**
1. Enter specific user ID
2. Enter title and message
3. Click "Send to User"

### Support Tickets

**View Tickets:**
- See all user support requests
- Filter by status

**Respond:**
1. Click on ticket
2. View message history
3. Type reply
4. Click send

**Close Ticket:**
- Click "Close Ticket" when resolved

### API Configuration

**Add Admin Email:**
1. Go to "API Config" tab
2. Enter email in "Admin Emails" section
3. Click "Add"

Users with these emails auto-get admin role.

**Feature Toggles:**
- Enable/disable app features
- Changes take effect immediately

**API Services:**
- Configure third-party API keys
- Toggle services on/off
- Update endpoints

### App Settings

Configure global settings:
- Daily return percentage
- Minimum withdrawal
- Withdrawal fee
- Referral bonus
- Maintenance mode
- Support email

---

## Environment Variables

### Complete Reference

```bash
# ===================
# SERVER (.env)
# ===================

# Database (required)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Server
NODE_ENV="production"
PORT=5000

# Firebase Admin (required)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
# Or use file path:
GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccount.json"

# Session (optional)
SESSION_SECRET="random-32-char-string"

# ===================
# CLIENT (client/.env)
# ===================

# Firebase (required)
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="project-id"
VITE_FIREBASE_STORAGE_BUCKET="project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123:web:abc"

# API (optional)
VITE_API_URL="https://api.yourdomain.com"
```

---

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection string format
# Should be: postgresql://user:password@host:5432/database
```

**Error: "SSL required"**
```bash
# Add ?sslmode=require to connection string
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### Firebase Auth Issues

**Error: "Invalid API key"**
- Verify VITE_FIREBASE_API_KEY is correct
- Check Firebase Console > Project Settings

**Error: "Admin SDK not initialized"**
- Verify FIREBASE_SERVICE_ACCOUNT JSON is valid
- Check for proper escaping in environment variable

### Build Issues

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "TypeScript errors"**
```bash
# Check for type errors
npm run check
```

### Mobile Build Issues

**Android: "SDK not found"**
- Set ANDROID_SDK_ROOT environment variable
- Or configure in Android Studio > SDK Manager

**iOS: "Signing failed"**
- Open Xcode Preferences > Accounts
- Download certificates
- Select team in project settings

### Deployment Issues

**502 Bad Gateway**
- Check if server is running
- Verify PORT environment variable
- Check hosting provider logs

**CORS Errors**
- API and client must be on same domain
- Or configure CORS in server

### Getting Help

1. Check GitHub Issues
2. Review hosting provider docs
3. Firebase documentation
4. Join community Discord (if available)

---

## GCP Compute Engine Quick Setup

1. Create VM: Compute Engine > VM instances → Create; machine type `e2-small` (2 vCPU, 2 GB) Ubuntu 22.04/24.04 LTS; allow HTTP/HTTPS; reserve a static IP.
2. SSH in: install Node 20+ (`nvm` or `apt`), `npm i -g pm2`, `sudo apt install nginx certbot python3-certbot-nginx`.
3. App setup: `mkdir -p /var/www/mining-club && cd /var/www/mining-club && git clone <repo> .`; add `.env` with `DATABASE_URL`, Firebase keys, etc.
4. Install/build/run: `npm ci`, `npm run build`, then `pm2 start npm --name mining-club -- run start` and `pm2 save`.
5. nginx reverse proxy: point `server_name yourdomain.com;` to `proxy_pass http://127.0.0.1:5000;` and `sudo ln -s /etc/nginx/sites-available/mining-club /etc/nginx/sites-enabled/` → `sudo systemctl reload nginx`.
6. TLS: `sudo certbot --nginx -d yourdomain.com` (auto renews via systemd timer).
7. Firewall: `sudo ufw allow OpenSSH`, `sudo ufw allow 80`, `sudo ufw allow 443`, then `sudo ufw enable`.

## CI/CD to VPS (GitHub Actions)

- Workflow: [.github/workflows/deploy.yml](.github/workflows/deploy.yml) triggers on push to `main`, SSHes to the VPS, runs `git pull`, `npm ci --omit=dev`, `npm run build`, then `pm2 restart mining-club || pm2 start npm --name mining-club -- run start`.
- Required GitHub secrets:
   - `VPS_HOST`: server IP or DNS
   - `VPS_USER`: SSH user (e.g., `ubuntu`)
   - `VPS_SSH_KEY`: private key with access (use a deploy key for this repo)
   - `VPS_APP_PATH`: deploy directory (e.g., `/var/www/mining-club`)
- Server prerequisites: `git`, `node`/`npm`, `pm2`, `.env` present on server, repo cloned to `VPS_APP_PATH`.
- If you prefer `systemd`, create `/etc/systemd/system/mining-club.service` with `ExecStart=/usr/bin/node /var/www/mining-club/dist/index.cjs`, `WorkingDirectory=/var/www/mining-club`, `EnvironmentFile=/var/www/mining-club/.env`, then `sudo systemctl daemon-reload && sudo systemctl enable --now mining-club`.
- To swap nginx to `systemd` (no pm2), keep the same reverse proxy; restart via `sudo systemctl restart mining-club` inside the deploy script.

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start development server
npm run db:push          # Push schema to database
npm run db:studio        # Open database GUI

# Building
npm run build            # Build for production
npm run check            # TypeScript check

# Mobile
npx cap sync             # Sync web to mobile
npx cap open android     # Open Android Studio
npx cap open ios         # Open Xcode

# Deployment
npm start                # Start production server
```

---

**Happy Mining! 🚀**

For updates and support, visit our [GitHub repository](https://github.com/your-username/mining-club).
