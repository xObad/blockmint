# DigitalOcean Environment Variables Setup

## Critical Configuration Required

To fix the current deployment issues on DigitalOcean, you **MUST** set these environment variables in the DigitalOcean App Platform dashboard:

### 1. Firebase Service Account (CRITICAL)
```bash
FIREBASE_SERVICE_ACCOUNT=<your-firebase-service-account-json>
```

**How to get this:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Copy the entire JSON content (minified, single line)
5. Paste it into DigitalOcean as the value for `FIREBASE_SERVICE_ACCOUNT`

**Example format:**
```
{"type":"service_account","project_id":"blockmint-393d2","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@blockmint-393d2.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### 2. Database Connection (CRITICAL)
```bash
DATABASE_URL_POOLER=<your-neon-pooler-connection-string>
DATABASE_URL=<your-neon-direct-connection-string>
```

**How to get this:**
1. Go to your Neon dashboard
2. Navigate to your project
3. Copy the "Pooled connection" string (for DATABASE_URL_POOLER)
4. Copy the "Direct connection" string (for DATABASE_URL)

**Example format:**
```
DATABASE_URL_POOLER=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 3. Port Configuration
The app automatically uses the PORT environment variable set by DigitalOcean (typically 8080).
No manual configuration needed.

---

## How to Set Environment Variables in DigitalOcean

1. Go to your DigitalOcean App Platform dashboard
2. Click on your app (mining-club)
3. Go to "Settings" → "App-Level Environment Variables"
4. Click "Edit" or "Add Variable"
5. Add each variable:
   - Key: `FIREBASE_SERVICE_ACCOUNT`
   - Value: (paste the JSON content)
   - Scope: Select all components
6. Repeat for `DATABASE_URL_POOLER` and `DATABASE_URL`
7. Click "Save"
8. DigitalOcean will automatically trigger a new deployment

---

## Verification

After setting the environment variables and redeploying, check the deployment logs:

✅ **Good logs** should show:
```
Firebase Admin SDK initialized successfully
Admin routes registered
serving on port 8080
```

❌ **Bad logs** (current state) show:
```
MASTER_WALLET_MNEMONIC not set - wallet functions disabled
FIREBASE_SERVICE_ACCOUNT present but unusable; falling back to projectId/ADC.
Firebase project ID not configured. Auth verification will be disabled.
```

---

## Common Issues

### Issue: "refresh once" error on deposit
**Cause:** Firebase authentication not properly configured
**Solution:** Set FIREBASE_SERVICE_ACCOUNT environment variable correctly

### Issue: Database connection errors
**Cause:** DATABASE_URL_POOLER not set or incorrect
**Solution:** Verify the connection string from Neon dashboard includes `?sslmode=require`

### Issue: Changes not appearing after redeploy
**Cause:** Environment variables not set at app level
**Solution:** Make sure variables are set as "App-Level" not component-specific

---

## Testing After Deployment

1. Try to login - should work without errors
2. Try to deposit - should not show "refresh once" error
3. Check deposit/withdrawal modals - should fit on mobile screens without scrolling
4. Check notification shade - should be centered on mobile

---

## Need Help?

If issues persist after setting environment variables:
1. Check deployment logs for specific error messages
2. Verify Firebase service account has correct permissions
3. Ensure database connection strings are correct
4. Contact support with deployment logs
