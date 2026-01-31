/**
 * Native Services - Capacitor Plugin Wrappers
 * 
 * This module provides unified access to native device features:
 * - Biometrics (Face ID, Touch ID, Fingerprint)
 * - Push Notifications
 * - Apple Sign-In (native implementation)
 * 
 * All functions gracefully handle web browser environment
 * by providing fallbacks or no-op implementations.
 */

import { Capacitor } from '@capacitor/core';

// ============================================================
// PLATFORM DETECTION
// ============================================================

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

export function isIOS(): boolean {
  return getPlatform() === 'ios';
}

export function isAndroid(): boolean {
  return getPlatform() === 'android';
}

// ============================================================
// BIOMETRICS (Face ID / Touch ID / Fingerprint)
// ============================================================

interface BiometricResult {
  success: boolean;
  error?: string;
}

interface BiometricAvailability {
  isAvailable: boolean;
  biometryType: 'face' | 'fingerprint' | 'iris' | 'none';
  errorMessage?: string;
}

let NativeBiometric: any = null;

// Lazy load the biometric plugin
async function getBiometricPlugin() {
  if (NativeBiometric) return NativeBiometric;
  
  if (!isNativePlatform()) {
    console.log('Biometrics: Not available on web');
    return null;
  }
  
  try {
    const module = await import('capacitor-native-biometric');
    NativeBiometric = module.NativeBiometric;
    return NativeBiometric;
  } catch (error) {
    console.error('Failed to load biometric plugin:', error);
    return null;
  }
}

// Helper to add timeout to async operations
function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMsg)), ms)
    )
  ]);
}

/**
 * Check if biometric authentication is available on this device
 */
export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  console.log('[Biometrics] checkBiometricAvailability starting...');
  
  const plugin = await getBiometricPlugin();
  
  if (!plugin) {
    console.log('[Biometrics] No plugin available');
    return {
      isAvailable: false,
      biometryType: 'none',
      errorMessage: 'Biometrics not available on this platform'
    };
  }
  
  try {
    console.log('[Biometrics] Calling plugin.isAvailable...');
    // Use useFallback: true to allow device passcode as fallback
    // Add 5 second timeout to prevent hanging
    const result = await withTimeout(
      plugin.isAvailable({ useFallback: true }),
      5000,
      'Biometric availability check timed out'
    );
    
    console.log('[Biometrics] Availability check result:', JSON.stringify(result));
    
    // Map biometry type from native plugin
    // 0 = none, 1 = fingerprint/TouchID, 2 = Face ID, 3 = iris
    let biometryType: 'face' | 'fingerprint' | 'iris' | 'none' = 'none';
    if (result.biometryType === 1) biometryType = 'fingerprint';
    else if (result.biometryType === 2) biometryType = 'face';
    else if (result.biometryType === 3) biometryType = 'iris';
    
    // Even if specific biometry is not available, device passcode might be
    const isAvailable = result.isAvailable === true;
    
    return {
      isAvailable,
      biometryType,
      errorMessage: result.errorCode ? `Error code: ${result.errorCode}` : undefined
    };
  } catch (error: any) {
    console.error('[Biometrics] Availability check error:', error);
    return {
      isAvailable: false,
      biometryType: 'none',
      errorMessage: error.message || 'Failed to check biometric availability'
    };
  }
}

/**
 * Authenticate user with biometrics
 */
export async function authenticateWithBiometrics(
  reason: string = 'Verify your identity'
): Promise<BiometricResult> {
  console.log('[Biometrics] authenticateWithBiometrics called');
  
  const plugin = await getBiometricPlugin();
  
  if (!plugin) {
    console.log('[Biometrics] No plugin available for authentication');
    return {
      success: false,
      error: 'Biometrics not available'
    };
  }
  
  try {
    console.log('[Biometrics] Starting authentication with reason:', reason);
    console.log('[Biometrics] Plugin verifyIdentity available:', typeof plugin.verifyIdentity);
    
    // Add timeout to prevent hanging - 30 seconds should be plenty for user interaction
    const authPromise = plugin.verifyIdentity({
      reason,
      title: 'BlockMint',
      subtitle: 'Authentication Required',
      description: reason,
      useFallback: true,
      fallbackTitle: 'Use Passcode',
      maxAttempts: 5
    });
    
    console.log('[Biometrics] verifyIdentity called, waiting for result...');
    
    await withTimeout(authPromise, 30000, 'Biometric authentication timed out');
    
    console.log('[Biometrics] Authentication successful');
    return { success: true };
  } catch (error: any) {
    console.error('[Biometrics] Authentication error:', error);
    console.error('[Biometrics] Error details:', JSON.stringify(error, null, 2));
    
    // Parse error code if available (plugin returns code as string)
    const errorCode = parseInt(error.code || error.errorCode || '0', 10);
    
    // Map common LAError codes to user-friendly messages
    let errorMessage = error.message || 'Authentication failed';
    switch (errorCode) {
      case -1: // authenticationFailed
        errorMessage = 'Authentication failed. Please try again.';
        break;
      case -2: // userCancel
        errorMessage = 'Authentication cancelled';
        break;
      case -3: // userFallback
        errorMessage = 'User chose passcode fallback';
        break;
      case -4: // systemCancel
        errorMessage = 'Authentication was cancelled by the system';
        break;
      case -5: // passcodeNotSet
        errorMessage = 'Device passcode is not set';
        break;
      case -6: // touchIDNotAvailable (deprecated, now biometryNotAvailable)
      case -7: // biometryNotAvailable
        errorMessage = 'Biometric authentication is not available';
        break;
      case -8: // biometryNotEnrolled
        errorMessage = 'No biometrics enrolled. Please set up Face ID or Touch ID in Settings.';
        break;
      case -9: // biometryLockout
        errorMessage = 'Biometrics locked due to too many failed attempts. Use device passcode.';
        break;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Store credentials securely using biometric-protected keychain/keystore
 */
export async function setCredentials(
  server: string,
  username: string,
  password: string
): Promise<boolean> {
  const plugin = await getBiometricPlugin();
  
  if (!plugin) return false;
  
  try {
    await plugin.setCredentials({
      server,
      username,
      password
    });
    return true;
  } catch (error) {
    console.error('Failed to store credentials:', error);
    return false;
  }
}

/**
 * Get stored credentials after biometric verification
 */
export async function getCredentials(
  server: string
): Promise<{ username: string; password: string } | null> {
  const plugin = await getBiometricPlugin();
  
  if (!plugin) return null;
  
  try {
    const credentials = await plugin.getCredentials({ server });
    return {
      username: credentials.username,
      password: credentials.password
    };
  } catch (error) {
    console.error('Failed to get credentials:', error);
    return null;
  }
}

/**
 * Delete stored credentials
 */
export async function deleteCredentials(server: string): Promise<boolean> {
  const plugin = await getBiometricPlugin();
  
  if (!plugin) return false;
  
  try {
    await plugin.deleteCredentials({ server });
    return true;
  } catch (error) {
    console.error('Failed to delete credentials:', error);
    return false;
  }
}

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================

interface PushNotificationToken {
  token: string;
}

let PushNotifications: any = null;

// Lazy load push notifications plugin
async function getPushPlugin() {
  if (PushNotifications) return PushNotifications;
  
  if (!isNativePlatform()) {
    console.log('Push Notifications: Using Firebase web SDK');
    return null;
  }
  
  try {
    const module = await import('@capacitor/push-notifications');
    PushNotifications = module.PushNotifications;
    return PushNotifications;
  } catch (error) {
    console.error('Failed to load push plugin:', error);
    return null;
  }
}

/**
 * Request push notification permissions
 */
export async function requestPushPermissions(): Promise<boolean> {
  const plugin = await getPushPlugin();
  
  if (!plugin) {
    // Fall back to web notifications API
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
  
  try {
    const result = await plugin.requestPermissions();
    return result.receive === 'granted';
  } catch (error) {
    console.error('Failed to request push permissions:', error);
    return false;
  }
}

/**
 * Register for push notifications and get device token
 */
export async function registerPushNotifications(): Promise<string | null> {
  const plugin = await getPushPlugin();
  
  if (!plugin) {
    // Use Firebase web messaging
    try {
      const { requestNotificationPermission } = await import('@/lib/firebase');
      return await requestNotificationPermission();
    } catch (error) {
      console.error('Firebase messaging error:', error);
      return null;
    }
  }
  
  try {
    // Register with APNs/FCM
    await plugin.register();
    
    // Get the token
    return new Promise((resolve) => {
      plugin.addListener('registration', (token: PushNotificationToken) => {
        console.log('Push registration success, token:', token.token);
        resolve(token.token);
      });
      
      plugin.addListener('registrationError', (error: any) => {
        console.error('Push registration error:', error);
        resolve(null);
      });
      
      // Timeout after 10 seconds
      setTimeout(() => resolve(null), 10000);
    });
  } catch (error) {
    console.error('Failed to register for push:', error);
    return null;
  }
}

/**
 * Add listener for received push notifications
 */
export async function addPushNotificationListener(
  callback: (notification: any) => void
): Promise<() => void> {
  const plugin = await getPushPlugin();
  
  if (!plugin) {
    // Use Firebase web messaging
    try {
      const { onForegroundMessage } = await import('@/lib/firebase');
      return onForegroundMessage(callback);
    } catch (error) {
      return () => {};
    }
  }
  
  const listener = await plugin.addListener('pushNotificationReceived', callback);
  return () => listener.remove();
}

/**
 * Add listener for when user taps a notification
 */
export async function addPushNotificationActionListener(
  callback: (notification: any) => void
): Promise<() => void> {
  const plugin = await getPushPlugin();
  
  if (!plugin) return () => {};
  
  const listener = await plugin.addListener('pushNotificationActionPerformed', callback);
  return () => listener.remove();
}

// ============================================================
// APPLE SIGN-IN (Native)
// ============================================================

interface AppleSignInResult {
  success: boolean;
  user?: {
    email: string | null;
    givenName: string | null;
    familyName: string | null;
    identityToken: string;
    authorizationCode: string;
  };
  error?: string;
}

let SignInWithApple: any = null;

// Lazy load Apple Sign-In plugin
async function getAppleSignInPlugin() {
  if (SignInWithApple) return SignInWithApple;
  
  if (!isIOS()) {
    console.log('Apple Sign-In: Only available on iOS');
    return null;
  }
  
  try {
    const module = await import('@capacitor-community/apple-sign-in');
    SignInWithApple = module.SignInWithApple;
    return SignInWithApple;
  } catch (error) {
    console.error('Failed to load Apple Sign-In plugin:', error);
    return null;
  }
}

/**
 * Perform native Apple Sign-In on iOS
 */
export async function nativeAppleSignIn(): Promise<AppleSignInResult> {
  const plugin = await getAppleSignInPlugin();
  
  if (!plugin) {
    return {
      success: false,
      error: 'Apple Sign-In not available on this platform'
    };
  }
  
  try {
    // Add timeout for the native call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('APPLE_SIGNIN_TIMEOUT')), 60000);
    });
    
    const authPromise = plugin.authorize({
      clientId: 'co.hardisk.blockmint', // Your app's bundle ID
      redirectURI: 'https://hardisk.co/__/auth/handler', // Firebase auth handler
      scopes: 'email name',
      state: Math.random().toString(36).substring(7),
      nonce: Math.random().toString(36).substring(7)
    });
    
    const response = await Promise.race([authPromise, timeoutPromise]);
    
    return {
      success: true,
      user: {
        email: response.response.email,
        givenName: response.response.givenName,
        familyName: response.response.familyName,
        identityToken: response.response.identityToken,
        authorizationCode: response.response.authorizationCode
      }
    };
  } catch (error: any) {
    console.error('Apple Sign-In Error:', error);
    
    // Handle user cancellation gracefully
    // Check various cancellation patterns: 1001 is standard, but some versions use localized strings
    const isCancelled = 
      error.message?.toLowerCase().includes('cancel') || 
      error.code === 1001 || 
      error.code === '1001' ||
      JSON.stringify(error).toLowerCase().includes('cancel');

    if (isCancelled) {
      return {
        success: false,
        error: 'User cancelled Apple Sign-In'
      };
    }
    return {
      success: false,
      error: error.message || 'Apple Sign-In failed'
    };
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize all native services
 */
export async function initializeNativeServices(): Promise<void> {
  if (!isNativePlatform()) {
    console.log('Native services: Running on web, using web fallbacks');
    return;
  }
  
  console.log('Native services: Initializing for', getPlatform());
  
  // Pre-load plugins
  await Promise.allSettled([
    getBiometricPlugin(),
    getPushPlugin(),
    getAppleSignInPlugin()
  ]);
  
  console.log('Native services: Initialization complete');
}

export default {
  isNativePlatform,
  getPlatform,
  isIOS,
  isAndroid,
  
  // Biometrics
  checkBiometricAvailability,
  authenticateWithBiometrics,
  setCredentials,
  getCredentials,
  deleteCredentials,
  
  // Push Notifications
  requestPushPermissions,
  registerPushNotifications,
  addPushNotificationListener,
  addPushNotificationActionListener,
  
  // Apple Sign-In
  nativeAppleSignIn,
  
  // Init
  initializeNativeServices
};
