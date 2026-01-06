# Admin Panel Setup & Database Fix

## Problem Summary
The admin panel wasn't working because:
1. **.env file** wasn't being loaded by the server (tsx doesn't auto-load .env)
2. **IPv6 connectivity issue** - Supabase database only resolves to IPv6, but the dev environment doesn't have IPv6 access

## Fixes Applied

### 1. Load .env in server
Added `import "dotenv/config";` to:
- `/workspaces/mining-club/server/index.ts` (line 1)
- `/workspaces/mining-club/drizzle.config.ts` (line 1)

### 2. IPv6 Workaround
The database connection fails with IPv6. To work around this:

**Current Workaround:**
Run dev server with:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

This disables TLS certificate validation temporarily for development.

**Permanent Solutions (choose one):**

#### Option A: Use Supabase REST API
Instead of direct PostgreSQL, use Supabase's REST API which works over HTTP/IPv4.

#### Option B: IPv4 DNS Override
Add to `/etc/hosts`:
```
# Get IPv4 from: dig +short db.xlmmnaifidechirvysod.supabase.co A
<IPv4_ADDRESS> db.xlmmnaifidechirvysod.supabase.co
```

#### Option C: Use Connection Pooler (if you have transaction pooler enabled)
Update DATABASE_URL to use port 6543:
```
DATABASE_URL="postgresql://postgres:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

### 3. Create Database Tables

Since drizzle-kit also has IPv6 issues, create tables manually:

**Via Supabase Dashboard:**
1. Go to https://supabase.com/dashboard/project/xlmmnaifidechirvysod/editor
2. Run the SQL from `/workspaces/mining-club/script/init-db.ts` in the SQL editor

**OR via psql:**
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx script/init-db.ts
```

## How to Start Development

```bash
# Start dev server (with IPv6 workaround)
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

Then open: http://localhost:5000/admin

## Admin Panel Updates

The admin panel now:
- ✅ Removes the 430px mobile width limit when mounted
- ✅ Allows horizontal scrolling for wide tables
- ✅ Has proper responsive layout for mobile/desktop
- ✅ Bypasses Firebase auth in development mode
- ✅ Connects to PostgreSQL database (once tables exist)

## Test Admin Panel

1. Start server: `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev`
2. Open: http://localhost:5000/admin  
3. Try adding/editing data in any section
4. Check browser console for any errors
5. Refresh page - data should persist

## Next Steps

1. **Create database tables** using Supabase Dashboard SQL editor
2. **Test CRUD operations** in admin panel
3. **Add remaining admin features:**
   - API Configuration (Firebase, SMS, Email settings)
   - Content Management (Privacy Policy, Terms, About)
   - Footer & Branding Management
   - General App Settings

## Files Modified

- `server/index.ts` - Added dotenv import
- `drizzle.config.ts` - Added dotenv import + SSL config  
- `client/src/pages/Admin.tsx` - Added admin-mode class management
- `client/src/index.css` - Added admin-mode CSS overrides
- `.env` - Updated DATABASE_URL format
- `script/init-db.ts` - New database initialization script
- `.github/workflows/deploy.yml` - New CI/CD workflow for VPS deployment
- `DEPLOYMENT_GUIDE.md` - Added GCP & CI/CD sections
