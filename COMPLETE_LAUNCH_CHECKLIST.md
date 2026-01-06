# Complete App Launch & Continuous Development Checklist

## 🎯 Overview
This guide covers:
1. ✅ Full local development setup
2. ✅ Database configuration
3. ✅ Building for app stores (Android APK/AAB, iOS IPA)
4. ✅ CI/CD pipeline for GitHub Codespaces + GitHub Actions
5. ✅ VPS deployment with auto-updates from GitHub
6. ✅ App store submission

---

## Part 1: Local Development Setup

### Requirements Checklist

#### Software (Free/Open-source)
- [ ] **Node.js 20+** - Download from [nodejs.org](https://nodejs.org)
- [ ] **Git** - Download from [git-scm.com](https://git-scm.com)
- [ ] **GitHub Account** - Sign up at [github.com](https://github.com)
- [ ] **GitHub Codespaces** - Included with GitHub Pro or free tier (60 hours/month)

#### Cloud Services (Free tier available)
- [ ] **Supabase Database** - Free PostgreSQL - [supabase.com](https://supabase.com)
- [ ] **Firebase Project** - Free tier - [firebase.google.com](https://firebase.google.com)
- [ ] **Google Cloud Console** - Free trial $300 - [console.cloud.google.com](https://console.cloud.google.com)

#### Mobile Development (Android)
- [ ] **Android Studio** - Free - [developer.android.com](https://developer.android.com/studio)
- [ ] **Android SDK** - Included with Android Studio
- [ ] **JDK 11+** - Included with Android Studio

#### Mobile Development (iOS)
- [ ] **Xcode** - Free on macOS (App Store)
- [ ] **CocoaPods** - Package manager for iOS - `sudo gem install cocoapods`
- [ ] **macOS development machine** - Required for building iOS apps

---

## Part 2: Database Setup

### Supabase PostgreSQL Setup (5 minutes)

1. **Create Project**
   ```
   Go to https://supabase.com
   → New Project
   → Name: "mining-club"
   → Region: Closest to your users
   → Create
   ```

2. **Get Connection String**
   ```
   Settings → Database → Connection String (Session Mode)
   Copy the full URL
   ```

3. **Add to .env**
   ```bash
   # IMPORTANT: use the Supabase Connection Pooler URL (IPv4-friendly)
   # Codespaces/containers often cannot reach Supabase IPv6-only hosts.
   DATABASE_URL_POOLER="postgresql://postgres:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
   # Optional: keep direct URL too (may fail in IPv4-only environments)
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
   ```

4. **Create Tables**
   ```
   In Supabase Dashboard → SQL Editor
   IMPORTANT: do NOT paste TypeScript files (like script/init-db.ts) into SQL Editor.
   Paste a pure .sql script (CREATE TABLE statements) that matches shared/schema.ts.
   ```

### Firebase Setup (5 minutes)

1. **Create Project**
   ```
   Go to https://console.firebase.google.com
   → Add Project
   → Name: "mining-club"
   → Enable Google Analytics (optional)
   → Create Project
   ```

2. **Enable Authentication**
   ```
   Authentication → Get Started
   → Email/Password: Enable
   → Google: Enable
   → (Optional) Apple: Enable for iOS
   ```

3. **Get Web Config**
   ```
   Project Settings → Your Apps → Web
   → Register App
   → Copy Firebase config
   → Add to .env as VITE_FIREBASE_*
   ```

4. **Create Service Account**
   ```
   Project Settings → Service Accounts
   → Generate New Private Key
   → Add to .env as FIREBASE_SERVICE_ACCOUNT
   ```

---

## Part 3: Local App Setup (10 minutes)

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/mining-club.git
cd mining-club

# 2. Create .env file
cp .env.example .env
# Edit .env with your Supabase and Firebase credentials

# 3. Install dependencies
npm install

# 4. Start development server
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
# Open http://localhost:5000
```

---

## Part 4: Building for App Stores

### Android APK/AAB Build (20 minutes)

#### Prerequisites
```bash
# Install Capacitor
npm install @capacitor/cli @capacitor/core

# Initialize Capacitor (if not already done)
npx cap init

# Add Android platform
npx cap add android
```

#### Build Process
```bash
# 1. Build web assets
npm run build

# 2. Copy to Android
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. In Android Studio:
#    - Build → Generate Signed Bundle/APK
#    - Create/use signing key
#    - Select "Bundle (Google Play)" for release
#    - This generates .aab file (for Play Store)
#    - Or select "APK" for direct distribution
```

#### Output Files
- **APK**: Direct installation file (users can install directly)
- **AAB**: Google Play preferred format (smaller, automatically optimized)

### iOS IPA Build (30 minutes, macOS only)

#### Prerequisites (macOS only)
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Install Capacitor iOS
npm install @capacitor/ios

# Add iOS platform
npx cap add ios
```

#### Build Process
```bash
# 1. Build web assets
npm run build

# 2. Copy to iOS
npx cap sync ios

# 3. Open Xcode
npx cap open ios

# 4. In Xcode:
#    - Product → Archive
#    - Distribute App
#    - Select "App Store Connect"
#    - Automatically upload to App Store Connect
```

#### Output Files
- **IPA**: iOS distribution file (uploaded to App Store)

---

## Part 5: Continuous Development Setup 🔑 (MOST IMPORTANT)

### Recommended Architecture

```
GitHub Repository
    ↓
GitHub Codespaces (for editing)
    ↓
GitHub Actions (CI/CD)
    ↓
Google Cloud Run OR Compute Engine (VPS)
    ↓
Users access live app
```

### GitHub Codespaces Setup (GitHub Pro or Free)

1. **Open Codespace**
   ```
   Go to https://github.com/YOUR_USERNAME/mining-club
   → Code → Codespaces → Create codespace on main
   ```

2. **Dev Server in Codespace**
   ```bash
   NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
   # Automatically exposes port 5000 publicly
   ```

3. **Edit Code & Push**
   ```bash
   # Make changes in Codespace editor
   git add .
   git commit -m "Add new feature"
   git push origin main
   # Triggers GitHub Actions automatically
   ```

### GitHub Actions CI/CD Pipeline (✅ Already created)

**File**: `.github/workflows/deploy.yml`

This workflow automatically:
1. Runs on every push to `main`
2. Builds the app (`npm run build`)
3. Deploys to your VPS
4. Restarts the server

**What you need:**
```
Repository Settings → Secrets and Variables → Actions
Add these secrets:
  - VPS_HOST: Your server IP
  - VPS_USER: SSH user (ubuntu/admin)
  - VPS_SSH_KEY: Private SSH key
  - VPS_APP_PATH: /var/www/mining-club
```

---

## Part 6: Recommended VPS Setup

### Option 1: Google Cloud Run (RECOMMENDED for continuous updates)

**Why Google Cloud Run?**
- ✅ Serverless (no server management)
- ✅ Auto-scales with traffic
- ✅ Integrates perfectly with GitHub Actions
- ✅ Free tier: 180,000 vCPU-seconds/month (enough for small apps)
- ✅ Pay-as-you-go ($0.40/vCPU-hour after free tier)
- ✅ Auto-deploys from GitHub with push

**Setup (20 minutes)**

1. **Enable APIs in Google Cloud Console**
   ```
APIs & Services → Enable APIs
→ Cloud Run API
 → Cloud Build API
→ Artifact Registry API
 ```

2. **Create Service Account**
IAM & Admin → Service Accounts
 → Create Service Account
  → Grant: Cloud Run Deployer, Cloud Build Editor
→ Create JSON key
 → Add to GitHub Secrets as GCP_SA_KEY
    ```
    3. **Create Docker Image**
  ```Cloud Build → Create trigger
 → GitHub
→ Connect repository
→ Setup automated builds
  ```

    4. **Update GitHub Actions**
```yaml
# Add to .github/workflows/deploy.yml
 - name: Deploy to Cloud Run
  uses: google-github-actions/deploy-cloudrun@v2
with:
    service: mining-club
        reentral1
            image: gcr.io/${{ secrets.GCP_PROJECT_ID }}/mining-club
   ```

**Cost**: $0-50/month (depending on traffic)

---

### Option 2: Google Compute Engine (Traditional VPS)

**Why Google Compute Engine?**
- ✅ Full control over the server
- ✅ Cheaper for constant load ($10-30/month)
- ✅ Easy GitHub Actions integration
- ✅ Can install anything (Docker, PM2, nginx, etc.)

**Setup (30 minutes)**

1. **Create VM Instance**
   ```
   Compute Engine → VM Instances → Create Instance
   Machine type: e2-small (2 vCPU, 2 GB RAM)
   OS: Ubuntu 24.04 LTS
   Boot disk: 20 GB
   Network: Allow HTTP/HTTPS traffic
   Reserve static IP
   ```

2. **SSH Setup**
   ```bash
   # In Google Cloud Console
   VM Instance → SSH → Open in browser
   
   # Setup key-based auth
   mkdir -p ~/.ssh
   ssh-keygen -t rsa -f ~/.ssh/github_key
   cat ~/.ssh/github_key.pub >> ~/.ssh/authorized_keys
   # Add private key to GitHub Secrets as VPS_SSH_KEY
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs nginx certbot python3-certbot-nginx pm2
   npm install -g pm2
   ```

4. **Clone & Setup App**
   ```bash
   mkdir -p /var/www/mining-club
   cd /var/www/mining-club
   git clone https://github.com/YOUR_USERNAME/mining-club .
   npm install
   npm run build
   pm2 start npm --name mining-club -- run start
   pm2 save
   sudo pm2 startup
   ```

5. **Configure nginx Reverse Proxy**
   ```bash
   sudo nano /etc/nginx/sites-available/mining-club
   ```
   
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/mining-club /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d yourdomain.com
   ```

6. **GitHub Actions Auto-Deploy**
   ```bash
   # GitHub Actions will automatically:
   # 1. Pull latest code
   # 2. npm install & npm run build
   # 3. pm2 restart mining-club
   # Done! (no manual deployment needed)
   ```

**Cost**: $10-30/month

---

### Option 3: Docker + Cloud Run (Best of Both)

Combine Cloud Run's simplicity with Docker for easy deployment.

```dockerfile
# Dockerfile in root
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/index.cjs"]
```

Then GitHub Actions builds and pushes to Cloud Run automatically.

**Cost**: $0-50/month

---

## Part 7: App Store Submission

### Google Play Store (Android)

**Timeline**: 1-2 hours setup, 3-24 hours review

1. **Create Developer Account**
   ```
   Go to https://play.google.com/console
   → Create Account
   → Pay $25 one-time fee
   ```

2. **Upload AAB**
   ```
   Create App → Manage → Release
   → Production → Create Release
   → Upload .aab file from Android Studio
   → Fill store listing (description, screenshots, etc.)
   → Submit for review
   ```

3. **Required**
   - App icon (512x512 PNG)
   - 2-8 screenshots (1080x1920)
   - Short description (50 chars)
   - Full description (4000 chars)
   - Privacy policy URL
   - Content rating questionnaire

### Apple App Store (iOS)

**Timeline**: 2-3 hours setup, 24-48 hours review

1. **Create Developer Account**
   ```
   Go to https://developer.apple.com
   → Enroll in Apple Developer Program
   → Pay $99/year
   ```

2. **Create App in App Store Connect**
   ```
   https://appstoreconnect.apple.com
   → My Apps → New App
   → Bundle ID: com.yourcompany.miningclub
   → Create
   ```

3. **Upload IPA**
   ```
   In Xcode:
   Product → Archive
   → Distribute App
   → App Store Connect
   → Upload
   ```

4. **Required**
   - App icon (1024x1024 PNG)
   - 2-5 screenshots per device
   - App preview video (optional but recommended)
   - Description (4000 chars)
   - Keywords
   - Support URL
   - Privacy policy URL
   - Age rating

---

## Part 8: Complete Workflow Example

### Day 1: Initial Setup (2-3 hours)

```bash
# 1. Setup databases
# → Create Supabase project
# → Create Firebase project
# → Get credentials

# 2. Setup local dev
git clone https://github.com/YOUR_USERNAME/mining-club.git
cd mining-club
echo "DATABASE_URL=..." > .env
echo "VITE_FIREBASE_API_KEY=..." >> .env
npm install
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev

# 3. Setup VPS (if using Compute Engine)
# → Create VM
# → Install dependencies
# → Setup nginx + SSL

# 4. Setup CI/CD
# → Add GitHub secrets
# → Enable GitHub Actions
```

### Ongoing Development (with GitHub Codespaces)

```bash
# 1. Open Codespace
github.com/YOUR_USERNAME/mining-club
→ Code → Codespaces → Create

# 2. Make changes (in Codespace editor)
# Edit files in VS Code browser interface

# 3. Test locally
npm run dev
# Opens preview in port 5000

# 4. Commit & Push
git add .
git commit -m "Add new feature"
git push origin main

# 5. Automatic Deployment! 🚀
# → GitHub Actions runs
# → Tests build
# → Deploys to VPS
# → Server restarts
# → Users see changes immediately
```

### Publishing Updates to App Stores

```bash
# Every week or monthly:

# 1. Build for Android
npm run build
npx cap sync android
# Open Android Studio → Generate Signed Bundle
# Upload new .aab to Google Play Console

# 2. Build for iOS (on Mac)
npm run build
npx cap sync ios
# Open Xcode → Archive → Upload to App Store

# Done! Web app updated instantly, app stores updated within hours.
```

---

## ⭐ RECOMMENDED SETUP FOR YOUR USE CASE

Given your requirements (edit through GitHub Codespaces + publish today):

### Tier 1: Immediate Launch (This Week)
```
✅ GitHub Codespaces (edit code)
✅ Google Cloud Run (host web app)
✅ GitHub Actions (auto-deploy on push)
✅ Firebase (auth + storage)
✅ Supabase (database)

Cost: $0-50/month
Time: 2-3 hours setup
```

### Tier 2: Add App Stores (Next 2 Weeks)
```
✅ Google Play Store (Android)
✅ Apple App Store (iOS)
✅ Same web app = same backend for all platforms

Cost: +$25 (Google) + $99/year (Apple)
Time: 3-4 hours per app
```

### Tier 3: Scale & Optimize (Later)
```
✅ Google Cloud CDN (faster delivery)
✅ Monitoring & analytics
✅ Advanced security
```

---

## Quick Commands Reference

```bash
# Local development
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev

# Production build
npm run build
npm run start

# Deploy to VPS (automatic with GitHub Actions)
git push origin main

# Build Android APK
npm run build
npx cap sync android
# Open Android Studio → Generate Signed APK

# Build iOS IPA (macOS only)
npm run build
npx cap sync ios
# Open Xcode → Archive → Upload

# Deploy web update (automatic)
# Just push to GitHub!
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection fails | Use pooler URL (port 6543), set `NODE_TLS_REJECT_UNAUTHORIZED=0` |
| GitHub Actions fails | Check VPS_HOST, VPS_USER, VPS_SSH_KEY secrets |
| App not updating on VPS | Check GitHub Actions logs, verify pm2/systemd restarted |
| iOS build fails | Must use macOS, update Xcode and CocoaPods |
| Android APK too large | Use AAB format instead (Google Play preferred) |

---

## Summary Checklist

- [ ] Supabase database created and tables initialized
- [ ] Firebase project created with auth enabled
- [ ] GitHub repository created and secrets added
- [ ] .env file with all credentials
- [ ] Local dev server working (`npm run dev`)
- [ ] Google Cloud project created (for Cloud Run)
- [ ] VPS deployed and auto-deployment working
- [ ] Android APK built and tested
- [ ] iOS IPA built (on Mac) and tested
- [ ] Google Play Console account created
- [ ] Apple Developer account enrolled
- [ ] Both apps submitted to stores
- [ ] GitHub Codespaces tested for editing

---

**🎉 After completing this checklist, your app will be:**
- ✅ Live on web (auto-updates with every GitHub push)
- ✅ Available on Google Play Store (Android)
- ✅ Available on Apple App Store (iOS)
- ✅ Continuously updateable through GitHub Codespaces
- ✅ Fully functional with database, auth, and all features
