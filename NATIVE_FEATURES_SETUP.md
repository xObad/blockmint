# Native Features Setup Guide

This guide covers the setup for:
1. **Push Notifications** (FCM + APNs)
2. **Biometrics** (Face ID, Touch ID, Fingerprint)
3. **Sign in with Apple**

---

## Prerequisites

Ensure Capacitor is initialized:
```bash
npx cap init
npx cap add ios
npx cap add android
```

---

## 1. Push Notifications Setup

### Firebase Cloud Messaging (FCM)

#### Step 1: Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Cloud Messaging**
4. Note your **Server Key** and **Sender ID**

#### Step 2: iOS APNs Configuration

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create an **APNs Key**:
   - Go to **Keys** → **Create a key**
   - Enable **Apple Push Notifications service (APNs)**
   - Download the `.p8` file
   - Note the **Key ID**
4. In Firebase Console:
   - Go to **Project Settings** → **Cloud Messaging** → **Apple app configuration**
   - Upload the APNs Key (.p8 file)
   - Enter Key ID and Team ID

#### Step 3: iOS Info.plist

Add to `ios/App/App/Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

#### Step 4: Android Configuration

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>

<!-- Inside <application> tag -->
<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@drawable/ic_notification" />
<meta-data
    android:name="com.google.firebase.messaging.default_notification_color"
    android:resource="@color/colorAccent" />
```

#### Step 5: Environment Variables

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

To get VAPID key:
1. Firebase Console → Project Settings → Cloud Messaging
2. Under "Web Push certificates", generate a key pair

### Testing Push Notifications

```javascript
// In your app
import { registerPushNotifications, addPushNotificationListener } from '@/lib/nativeServices';

// Request permissions and get token
const token = await registerPushNotifications();
console.log('Push token:', token);

// Send token to your server
await fetch('/api/user/push-token', {
  method: 'POST',
  body: JSON.stringify({ token })
});

// Listen for notifications
addPushNotificationListener((notification) => {
  console.log('Received:', notification);
});
```

---

## 2. Biometrics Setup (Face ID / Touch ID / Fingerprint)

### iOS Configuration

Add to `ios/App/App/Info.plist`:
```xml
<key>NSFaceIDUsageDescription</key>
<string>BlockMint uses Face ID to securely unlock your account</string>
```

### Android Configuration

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.USE_FINGERPRINT"/>
```

### Usage in App

```javascript
import { 
  checkBiometricAvailability, 
  authenticateWithBiometrics,
  setCredentials,
  getCredentials 
} from '@/lib/nativeServices';

// Check availability
const availability = await checkBiometricAvailability();
console.log('Biometric type:', availability.biometryType); // 'face', 'fingerprint', 'none'
console.log('Available:', availability.isAvailable);

// Authenticate
if (availability.isAvailable) {
  const result = await authenticateWithBiometrics('Unlock BlockMint');
  if (result.success) {
    console.log('Authenticated!');
  } else {
    console.log('Failed:', result.error);
  }
}

// Store credentials securely (protected by biometric)
await setCredentials('blockmint-app', 'user@email.com', 'secure-token');

// Retrieve credentials (requires biometric)
const creds = await getCredentials('blockmint-app');
```

### Testing Biometrics

**On Simulator/Emulator:**

- **iOS Simulator**: Hardware → Face ID/Touch ID → Enrolled, then Matching Face/Touch
- **Android Emulator**: Extended Controls → Fingerprint → Touch Sensor

**On Real Device:**
- Ensure biometrics are enrolled in device settings
- Test with actual Face ID/Touch ID/Fingerprint

---

## 3. Sign in with Apple Setup

### Step 1: Apple Developer Configuration

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Identifiers** → Your App ID
3. Enable **Sign in with Apple** capability
4. For web auth, create a **Services ID**:
   - Identifiers → Services IDs → Create
   - Enable "Sign in with Apple"
   - Configure Domains and Return URLs:
     - Domain: `hardisk.co`
     - Return URL: `https://hardisk.co/__/auth/handler`

### Step 2: Firebase Configuration

1. Firebase Console → Authentication → Sign-in method
2. Enable **Apple** provider
3. Enter:
   - **Services ID**: Your web Services ID (e.g., `co.hardisk.blockmint.web`)
   - **Team ID**: Your Apple Team ID
   - **Key ID**: Your Sign in with Apple key ID
   - **Private Key**: The `.p8` file contents

### Step 3: iOS Xcode Configuration

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select your target → Signing & Capabilities
3. Add **Sign in with Apple** capability
4. Ensure your Apple Developer account is connected

### Step 4: Code Configuration

The `firebase.ts` already handles native Apple Sign-In automatically:
- On iOS: Uses native Sign in with Apple plugin
- On Web/Android: Uses Firebase popup

### Testing Sign in with Apple

**On iOS Simulator:**
1. Simulator must be signed into iCloud with an Apple ID
2. Sign in with Apple will work in simulator

**On Web:**
1. Click "Continue with Apple" button
2. Apple popup will appear
3. Authenticate with Apple ID

---

## Testing All Features Before App Store Submission

### 1. Local Testing (Web)

```bash
npm run dev
```
- Biometrics: Will simulate success on web
- Push: Uses Firebase web messaging
- Apple Sign-In: Uses Firebase popup

### 2. iOS Simulator Testing

```bash
npm run build
npx cap sync ios
npx cap open ios
```

In Xcode:
1. Select a simulator with Face ID/Touch ID support
2. Run the app
3. Test biometrics: Hardware → Face ID → Enrolled → Matching Face
4. Test push: Send test notification from Firebase Console

### 3. Android Emulator Testing

```bash
npm run build
npx cap sync android
npx cap open android
```

In Android Studio:
1. Run on emulator with fingerprint support
2. Test biometrics: Extended Controls → Fingerprint → Touch
3. Test push: Send test notification from Firebase Console

### 4. Real Device Testing (Recommended before App Store)

**iOS TestFlight:**
```bash
npm run build
npx cap sync ios
# Archive and upload in Xcode
```

**Android Internal Testing:**
```bash
npm run build
npx cap sync android
# Build signed APK in Android Studio
```

---

## Environment Variables Checklist

```env
# Firebase (Required)
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_FIREBASE_VAPID_KEY=xxx

# Firebase Admin (Server-side push notifications)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Database
DATABASE_URL=xxx
```

---

## Troubleshooting

### Push Notifications Not Working

1. Check APNs key is uploaded to Firebase
2. Verify app bundle ID matches Firebase config
3. Check notification permissions in device settings
4. Test with Firebase Console → Cloud Messaging → Send test message

### Biometrics Not Working

1. Ensure `NSFaceIDUsageDescription` is in Info.plist (iOS)
2. Check biometrics are enrolled on device
3. On simulator, enable Face ID/Touch ID in Hardware menu

### Apple Sign-In Errors

1. Verify Services ID is configured correctly
2. Check return URL matches Firebase auth handler
3. Ensure Sign in with Apple capability is added in Xcode
4. Test on device (some simulators have issues)

---

## Compliance Mode Behavior

When `compliance_mode` is enabled:
- **Biometrics**: Work the same (device security)
- **Push Notifications**: Work but are always empty in review mode
- **Apple Sign-In**: Works but shows "Account Not Found" for unregistered users

This ensures reviewers can test all native features while seeing the production-safe UI.
