# Authentication Sync Debug Guide

## What was fixed

1. **User Sync to Database**: When a user logs in (Firebase), the client now calls `/api/auth/sync` with the Firebase ID token. The server verifies the token, creates/updates the user in the database, and returns the database user ID.

2. **Deposit Fix**: The deposit submission now uses the correct user ID (dbId) from localStorage, not the Firebase UID.

3. **DB Admin Users Tab**: Now auto-refreshes every 10 seconds to catch new users immediately, and has a manual refresh button.

## How to debug if users still don't appear or deposits still fail

### In Browser Console (F12)
After signing up or logging in, check the console for these log messages:

```
✅ "Syncing user with backend: user@example.com"
✅ "Auth sync success: { id: '...', email: '...', ... }"
✅ "User stored in localStorage: { uid: '...', id: '...', dbId: '...', ... }"
```

If you see errors:
```
❌ "Auth sync failed: { error: '...' }"
❌ "User sync failed: Error: ..."
```

Check the **Network tab** → `/api/auth/sync` POST request:
- Status should be `200`
- Response should have `{ user: { id, email, displayName, role, ... } }`

### Server Logs
If the sync endpoint is being called, you should see:
```
Syncing user with backend: user@example.com
Auth sync: Creating/updating user { uid: '...', email: '...' }
Auth sync: User created/updated { userId: '...', email: '...' }
```

If you see `Auth sync: No ID token provided`, the client isn't sending the token properly.

### Deposit Submission Debug
After filling out the deposit form and clicking submit, check the browser console for:
```
✅ "Submitting deposit request: { userId: '...', amount: '...', ... }"
✅ "Deposit submission success: { success: true, request: {...}, ... }"
```

If you see:
```
❌ "Deposit submission: No userId found in localStorage"
```

This means the user object wasn't synced. Go back to the **User Sync** section above.

## Storage Keys in localStorage
After successful login, `localStorage.user` should contain:
```json
{
  "uid": "firebase_uid_...",
  "email": "user@example.com",
  "displayName": "User Name",
  "id": "db_user_id_...",
  "dbId": "db_user_id_...",
  "role": "user"
}
```

Check it in browser console: `console.log(JSON.parse(localStorage.getItem('user')))`

## DB Admin Users Tab
- Users should appear **immediately** after registration
- Tab auto-refreshes every 10 seconds
- Has a manual "Refresh" button in the top right
- If users still don't appear:
  - Verify the server `/api/admin/users` endpoint returns users
  - Check Network tab for the query
  - Ensure the user was actually created (check server logs)

## Testing Flow

1. **Register a new user** via the app
2. **Check browser console** for sync logs
3. **Check localStorage** with `console.log(JSON.parse(localStorage.getItem('user')))`
4. **Go to Deposit page** and try submitting
5. **Check DB Admin → Users tab** (should auto-refresh)
6. **Check DB Admin → Deposits tab** (deposit request should appear)
