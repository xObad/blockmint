/**
 * Safe Mode App Lock - Face ID/PIN protection for Safe Mode (Compliance Mode)
 * 
 * This is a simplified version of AppLock that works in compliance mode.
 * It provides Face ID / PIN lock functionality with a 30-minute timeout.
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { PinEntry } from "./PinEntry";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  checkBiometricAvailability, 
  authenticateWithBiometrics,
  isNativePlatform 
} from "@/lib/nativeServices";

interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  lockOnBackground: boolean;
}

interface ServerSecuritySettings {
  pinLockEnabled?: boolean;
  biometricEnabled?: boolean;
  lockOnBackground?: boolean;
}

interface SafeAppLockContextType {
  isLocked: boolean;
  securityEnabled: boolean;
  unlock: () => void;
  lock: () => void;
  settings: SecuritySettings | null;
  showPinSetup: (onComplete?: () => void) => void;
  hidePinSetup: () => void;
  isSettingUpPin: boolean;
  triggerBiometricAuth: () => Promise<boolean>;
}

const SafeAppLockContext = createContext<SafeAppLockContextType | null>(null);

export function useSafeAppLock() {
  const context = useContext(SafeAppLockContext);
  if (!context) {
    throw new Error("useSafeAppLock must be used within SafeAppLockProvider");
  }
  return context;
}

interface SafeAppLockProviderProps {
  children: ReactNode;
  userId?: string;
}

export function SafeAppLockProvider({ children, userId }: SafeAppLockProviderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isLocked, setIsLocked] = useState(false);
  const [isSettingUpPin, setIsSettingUpPin] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [biometricType, setBiometricType] = useState<"face" | "fingerprint" | "none">("none");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Refs for preventing multiple simultaneous auth attempts
  const authInProgressRef = useRef(false);
  const hasTriedAutoAuthRef = useRef(false);
  const pinSetupCompleteCallbackRef = useRef<(() => void) | null>(null);
  
  // Track last activity time for 30-minute timeout
  const lastActivityRef = useRef<number>(Date.now());
  const LOCK_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  // Fetch security settings
  const { data: settings } = useQuery<ServerSecuritySettings, Error, SecuritySettings>({
    queryKey: ["/api/security/settings", userId],
    enabled: !!userId,
    refetchOnWindowFocus: false,
    select: (data) => ({
      pinEnabled: Boolean(data?.pinLockEnabled),
      biometricEnabled: Boolean(data?.biometricEnabled),
      lockOnBackground: Boolean(data?.lockOnBackground),
    }),
  });

  // Verify PIN mutation
  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      if (!userId) {
        throw new Error("Missing user id for PIN verification");
      }
      const response = await apiRequest("POST", "/api/security/verify-pin", { pin, userId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsLocked(false);
        setFailedAttempts(0);
        sessionStorage.setItem("safe_app_unlocked", "true");
        lastActivityRef.current = Date.now();
      } else {
        handleFailedAttempt();
      }
    },
    onError: () => {
      handleFailedAttempt();
    },
  });

  // Setup PIN mutation
  const setupPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      if (!userId) {
        throw new Error("Missing user id for PIN setup");
      }
      const response = await apiRequest("POST", "/api/security/pin", { pin, userId });
      return response.json();
    },
    onSuccess: () => {
      setIsSettingUpPin(false);
      queryClient.invalidateQueries({ queryKey: ["/api/security/settings", userId] });
      toast({
        title: "PIN Created",
        description: "Your app is now protected with a PIN code",
      });
      
      if (pinSetupCompleteCallbackRef.current) {
        setTimeout(() => {
          pinSetupCompleteCallbackRef.current?.();
          pinSetupCompleteCallbackRef.current = null;
        }, 500);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create PIN. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFailedAttempt = useCallback(() => {
    const attempts = failedAttempts + 1;
    setFailedAttempts(attempts);
    
    if (attempts >= 5) {
      const lockout = new Date(Date.now() + 30 * 60 * 1000);
      setLockoutUntil(lockout);
      toast({
        title: "Too many attempts",
        description: "Try again in 30 minutes",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Incorrect PIN",
        description: `${5 - attempts} attempts remaining`,
        variant: "destructive",
      });
    }
  }, [failedAttempts, toast]);

  const handleBiometricRequest = useCallback(async (): Promise<boolean> => {
    if (authInProgressRef.current) {
      console.log('[SafeAppLock] Auth already in progress, skipping...');
      return false;
    }
    
    hasTriedAutoAuthRef.current = true;
    
    try {
      authInProgressRef.current = true;
      setIsAuthenticating(true);
      
      if (!settings?.biometricEnabled) {
        console.log('[SafeAppLock] Biometrics not enabled in settings');
        return false;
      }
      
      if (isNativePlatform()) {
        console.log('[SafeAppLock] Checking biometric availability...');
        const availability = await checkBiometricAvailability();
        
        if (!availability.isAvailable) {
          console.log('[SafeAppLock] Biometrics not available:', availability.errorMessage);
          toast({
            title: "Biometrics Unavailable",
            description: availability.errorMessage || "Please use your PIN instead",
            variant: "destructive",
          });
          return false;
        }
        
        console.log('[SafeAppLock] Requesting biometric authentication...');
        const result = await authenticateWithBiometrics('Unlock BlockMint');
        
        if (result.success) {
          console.log('[SafeAppLock] Biometric auth successful!');
          setIsLocked(false);
          setFailedAttempts(0);
          sessionStorage.setItem("safe_app_unlocked", "true");
          lastActivityRef.current = Date.now();
          return true;
        } else {
          console.log('[SafeAppLock] Biometric auth failed:', result.error);
          if (!result.error?.toLowerCase().includes('cancel')) {
            toast({
              title: "Authentication Failed",
              description: result.error || "Please try again or use your PIN",
              variant: "destructive",
            });
          }
          return false;
        }
      }
      
      console.log('[SafeAppLock] Web platform - biometrics not natively available');
      return false;
    } catch (e) {
      console.error("[SafeAppLock] Biometric auth error:", e);
      return false;
    } finally {
      authInProgressRef.current = false;
      setIsAuthenticating(false);
    }
  }, [settings?.biometricEnabled, toast]);

  // Detect biometric capability
  useEffect(() => {
    async function detectBiometrics() {
      if (isNativePlatform()) {
        try {
          const availability = await checkBiometricAvailability();
          console.log('[SafeAppLock] Biometric availability:', availability);
          if (availability.biometryType === 'face') {
            setBiometricType('face');
          } else if (availability.biometryType === 'fingerprint') {
            setBiometricType('fingerprint');
          } else {
            setBiometricType('none');
          }
        } catch (e) {
          console.error('[SafeAppLock] Failed to detect biometrics:', e);
          setBiometricType('none');
        }
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        if (isIOS) setBiometricType('face');
        else if (isAndroid) setBiometricType('fingerprint');
        else setBiometricType('none');
      }
    }
    detectBiometrics();
  }, []);

  // Lock with 30-minute timeout
  useEffect(() => {
    if (!settings?.pinEnabled) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };
    
    document.addEventListener("touchstart", updateActivity, { passive: true });
    document.addEventListener("click", updateActivity, { passive: true });
    document.addEventListener("keydown", updateActivity, { passive: true });
    document.addEventListener("scroll", updateActivity, { passive: true });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[SafeAppLock] App went to background');
      } else {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        console.log('[SafeAppLock] App returned, time since last activity:', Math.round(timeSinceLastActivity / 1000 / 60), 'minutes');
        
        if (timeSinceLastActivity >= LOCK_TIMEOUT_MS) {
          console.log('[SafeAppLock] 30+ minutes passed, locking app...');
          setIsLocked(true);
          hasTriedAutoAuthRef.current = false;
          sessionStorage.removeItem("safe_app_unlocked");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    let removeAppListener: (() => void) | null = null;
    if (isNativePlatform()) {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) {
            console.log('[SafeAppLock] Capacitor: App became inactive');
          } else if (settings?.pinEnabled) {
            const timeSinceLastActivity = Date.now() - lastActivityRef.current;
            console.log('[SafeAppLock] Capacitor: App returned, time since activity:', Math.round(timeSinceLastActivity / 1000 / 60), 'minutes');
            
            if (timeSinceLastActivity >= LOCK_TIMEOUT_MS) {
              console.log('[SafeAppLock] Capacitor: 30+ minutes passed, locking...');
              setIsLocked(true);
              hasTriedAutoAuthRef.current = false;
              sessionStorage.removeItem("safe_app_unlocked");
            }
          }
        }).then(listener => {
          removeAppListener = () => listener.remove();
        });
      }).catch(e => console.log('[SafeAppLock] Capacitor App plugin not available'));
    }
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("touchstart", updateActivity);
      document.removeEventListener("click", updateActivity);
      document.removeEventListener("keydown", updateActivity);
      document.removeEventListener("scroll", updateActivity);
      if (removeAppListener) removeAppListener();
    };
  }, [settings?.pinEnabled]);

  // Initial lock check
  useEffect(() => {
    if (settings?.pinEnabled && !isLocked) {
      const hasUnlockedRecently = sessionStorage.getItem("safe_app_unlocked");
      if (!hasUnlockedRecently) {
        console.log('[SafeAppLock] Initial lock - PIN enabled, no recent unlock');
        setIsLocked(true);
      }
    }
  }, [settings?.pinEnabled, isLocked]);

  // Auto-trigger biometric authentication when locked
  useEffect(() => {
    if (isLocked && settings?.biometricEnabled && !isSettingUpPin && !hasTriedAutoAuthRef.current && !authInProgressRef.current) {
      const timer = setTimeout(() => {
        if (!authInProgressRef.current && !hasTriedAutoAuthRef.current) {
          console.log('[SafeAppLock] Auto-triggering biometric auth...');
          hasTriedAutoAuthRef.current = true;
          handleBiometricRequest();
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLocked, settings?.biometricEnabled, isSettingUpPin, handleBiometricRequest]);

  const handlePinSuccess = useCallback((pin: string) => {
    if (pin === "biometric") {
      setIsLocked(false);
      setFailedAttempts(0);
      sessionStorage.setItem("safe_app_unlocked", "true");
      lastActivityRef.current = Date.now();
      return;
    }

    if (isSettingUpPin) {
      setupPinMutation.mutate(pin);
    } else {
      verifyPinMutation.mutate(pin);
    }
  }, [isSettingUpPin, setupPinMutation, verifyPinMutation]);

  const triggerBiometricAuth = useCallback(async (): Promise<boolean> => {
    hasTriedAutoAuthRef.current = false;
    return handleBiometricRequest();
  }, [handleBiometricRequest]);

  const handleForgotPin = useCallback(() => {
    toast({
      title: "Forgot PIN?",
      description: "Please contact support to reset your PIN",
    });
  }, [toast]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    sessionStorage.setItem("safe_app_unlocked", "true");
    lastActivityRef.current = Date.now();
  }, []);

  const lock = useCallback(() => {
    setIsLocked(true);
    sessionStorage.removeItem("safe_app_unlocked");
  }, []);

  const showPinSetup = useCallback((onComplete?: () => void) => {
    pinSetupCompleteCallbackRef.current = onComplete || null;
    setIsSettingUpPin(true);
  }, []);
  
  const hidePinSetup = useCallback(() => {
    pinSetupCompleteCallbackRef.current = null;
    setIsSettingUpPin(false);
  }, []);

  const isLockedOut = lockoutUntil && new Date() < lockoutUntil;

  const value: SafeAppLockContextType = {
    isLocked,
    securityEnabled: settings?.pinEnabled || false,
    unlock,
    lock,
    settings: settings || null,
    showPinSetup,
    hidePinSetup,
    isSettingUpPin,
    triggerBiometricAuth,
  };

  return (
    <SafeAppLockContext.Provider value={value}>
      {children}
      
      <AnimatePresence>
        {isLocked && settings?.pinEnabled && !isSettingUpPin && !isLockedOut && (
          <PinEntry
            mode="verify"
            onSuccess={handlePinSuccess}
            onCancel={handleForgotPin}
            onBiometricRequest={settings.biometricEnabled ? handleBiometricRequest : undefined}
            biometricType={settings.biometricEnabled ? biometricType : "none"}
          />
        )}
        
        {isSettingUpPin && (
          <PinEntry
            mode="setup"
            onSuccess={handlePinSuccess}
            onCancel={hidePinSetup}
            biometricType="none"
          />
        )}
      </AnimatePresence>
      
      {isLockedOut && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-8 text-center">
          <div className="w-20 h-20 mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Account Locked</h1>
          <p className="text-muted-foreground">
            Too many failed attempts. Please try again later.
          </p>
        </div>
      )}
    </SafeAppLockContext.Provider>
  );
}
