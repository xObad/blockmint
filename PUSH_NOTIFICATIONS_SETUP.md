# Push Notifications Setup Guide

## Overview
Push notifications are now configured for both Android and iOS using Firebase Cloud Messaging (FCM).

## Files Added/Modified

### 1. `/client/src/lib/firebase.ts`
- Added Firebase Messaging initialization
- Added `requestNotificationPermission()` function
- Added `onForegroundMessage()` listener

### 2. `/client/public/firebase-messaging-sw.js`
- Service worker for background push notifications
- Handles notifications when app is in background/closed
- Shows notification with custom actions

## Configuration Required

### Environment Variables
Add to `.env` file:
```env
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

To get your VAPID key:
1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Web Push certificates", generate a new key pair
3. Copy the "Key pair" value

### Firebase Console Setup
1. Enable Cloud Messaging API in Firebase Console
2. Add your domain to authorized domains
3. For iOS: Upload APNs certificate (Apple Push Notification service)
4. For Android: FCM is automatically configured

## How to Use

### Request Permission (Client-Side)
```typescript
import { requestNotificationPermission } from '@/lib/firebase';

// Request permission and get token
const token = await requestNotificationPermission();
if (token) {
  // Save token to your backend
  await fetch('/api/users/fcm-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
```

### Send Notifications (Server-Side)
The server already has Firebase Admin SDK configured in `server/firebase-admin.ts`.

Example sending notification:
```typescript
import admin from './firebase-admin';

await admin.messaging().send({
  token: userFcmToken,
  notification: {
    title: 'Withdrawal Approved',
    body: 'Your withdrawal of 100 USDT has been processed',
  },
  data: {
    type: 'withdrawal',
    amount: '100',
    currency: 'USDT',
  },
  webpush: {
    fcmOptions: {
      link: 'https://your-app.com/wallet'
    }
  }
});
```

## Testing

### Android Testing (via Chrome)
1. Open app in Chrome on Android
2. Click notification bell icon in app
3. Grant permission when prompted
4. Send test notification from Firebase Console
5. Verify notification appears in system tray

### iOS Testing (via PWA)
1. Open app in Safari on iOS
2. Add to Home Screen
3. Open from Home Screen
4. Grant notification permission
5. Test notifications from Firebase Console

### Testing from Firebase Console
1. Go to Firebase Console → Engage → Messaging
2. Click "Send your first message"
3. Enter notification title and text
4. Select your app
5. Click "Test on device"
6. Enter the FCM token from your test device
7. Send

## Current Notification Types

The app already sends notifications for:
- ✅ Deposit confirmed
- ✅ Deposit rejected
- ✅ Withdrawal approved
- ✅ Withdrawal rejected
- ✅ Mining contract activated
- ✅ Mining contract ended
- ✅ Balance adjustments
- ✅ Promotional messages

All these will now support push notifications when FCM token is saved.

## Database Schema Update Needed

Add FCM token storage to users table:
```sql
ALTER TABLE users ADD COLUMN fcm_token TEXT;
ALTER TABLE users ADD COLUMN fcm_token_updated_at TIMESTAMP;
```

## Next Steps

1. ✅ Firebase Messaging added to client
2. ✅ Service worker created for background notifications
3. ⏳ Add VAPID key to environment variables
4. ⏳ Create endpoint to save FCM tokens: `POST /api/users/fcm-token`
5. ⏳ Update notification service to send FCM pushes
6. ⏳ Test on Android device
7. ⏳ Test on iOS device (requires HTTPS)

## Production Checklist

- [ ] VAPID key added to production environment
- [ ] APNs certificate uploaded for iOS
- [ ] Domain added to Firebase authorized domains
- [ ] HTTPS enabled (required for PWA notifications)
- [ ] Service worker registered in production build
- [ ] Test notifications on both platforms
- [ ] Monitor FCM quota and delivery rates

## Troubleshooting

### Notifications not received on Android
- Check if notification permission is granted
- Verify FCM token is saved to database
- Check Chrome flags: `chrome://flags/#enable-experimental-web-platform-features`
- Ensure service worker is registered: Check DevTools → Application → Service Workers

### Notifications not received on iOS
- iOS requires HTTPS (localhost is exempt for testing)
- App must be added to Home Screen and opened from there
- Check Safari Settings → [Your Site] → Notifications
- Verify APNs certificate is uploaded to Firebase

### Token Issues
- Tokens can expire or become invalid
- Implement token refresh logic
- Delete old/invalid tokens from database
