// Firebase client configuration - using blueprint:firebase_barebones_javascript
import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup,
  getRedirectResult, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User
} from "firebase/auth";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

const firebaseConfigured = Boolean(apiKey && projectId && appId);

let app: FirebaseApp | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let messagingInstance: Messaging | null = null;

if (firebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: `${projectId}.firebasestorage.app`,
      appId,
    };
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    
    // Initialize messaging for push notifications
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        messagingInstance = getMessaging(app);
      } catch (msgError) {
        console.warn("Firebase Messaging not available:", msgError);
      }
    }
  } catch (e) {
    console.error("Failed to initialize Firebase:", e);
    app = null;
    authInstance = null;
  }
} else {
  console.warn("Firebase not configured — client will run in read-only/mock mode.");
}

export const auth = authInstance;

const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export async function signInWithGoogle() {
  try {
    if (!auth) {
      console.warn("signInWithGoogle called but Firebase is not configured");
      return null;
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

// Sign in with Apple
export async function signInWithApple() {
  try {
    throw new Error("Sign in with Apple is temporarily disabled");
  } catch (error) {
    console.error("Apple sign-in error:", error);
    throw error;
  }
}

// Sign in with email/password
export async function signInWithEmail(email: string, password: string) {
  try {
    if (!auth) {
      console.warn("signInWithEmail called but Firebase is not configured");
      return null;
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
}

// Register with email/password and optional display name
export async function registerWithEmail(email: string, password: string, displayName?: string) {
  try {
    if (!auth) {
      console.warn("registerWithEmail called but Firebase is not configured");
      return null;
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    if (result.user) {
      await sendEmailVerification(result.user);
    }
    return result.user;
  } catch (error) {
    console.error("Email registration error:", error);
    throw error;
  }
}

// Resend email verification
export async function resendVerificationEmail() {
  try {
    if (!auth) {
      console.warn("resendVerificationEmail called but Firebase is not configured");
      return false;
    }
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Resend verification error:", error);
    throw error;
  }
}

// Send password reset email
export async function resetPassword(email: string) {
  try {
    if (!auth) {
      console.warn("resetPassword called but Firebase is not configured");
      return;
    }
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

// Sign out
export async function logOut() {
  try {
    if (!auth) {
      console.warn("logOut called but Firebase is not configured");
      return;
    }
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

// Handle redirect result (call on page load)
export async function handleRedirectResult() {
  try {
    if (!auth) {
      return null;
    }
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Redirect result error:", error);
    throw error;
  }
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    // No-op unsubscribe
    const unsub = () => {};
    return unsub;
  }
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
}

// Get ID token for API calls
export async function getIdToken(): Promise<string | null> {
  if (!auth) return null;
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

// Re-export User type
export type { User };

// Push Notifications
export const messaging = messagingInstance;

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messagingInstance) {
    console.warn("Firebase Messaging not initialized");
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      const token = await getToken(messagingInstance, { vapidKey });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messagingInstance) {
    return () => {}; // No-op unsubscribe
  }
  return onMessage(messagingInstance, callback);
}
