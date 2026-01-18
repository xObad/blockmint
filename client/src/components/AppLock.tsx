import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { PinEntry } from "./PinEntry";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  lockOnBackground: boolean;
}

interface AppLockContextType {
  isLocked: boolean;
  securityEnabled: boolean;
  unlock: () => void;
  lock: () => void;
  settings: SecuritySettings | null;
  showPinSetup: () => void;
  hidePinSetup: () => void;
  isSettingUpPin: boolean;
}

const AppLockContext = createContext<AppLockContextType | null>(null);

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error("useAppLock must be used within AppLockProvider");
  }
  return context;
}

interface AppLockProviderProps {
  children: ReactNode;
  userId?: number;
}

export function AppLockProvider({ children, userId }: AppLockProviderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isLocked, setIsLocked] = useState(false);
  const [isSettingUpPin, setIsSettingUpPin] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [biometricType, setBiometricType] = useState<"face" | "fingerprint" | "none">("none");

  // Fetch security settings
  const { data: settings } = useQuery<SecuritySettings>({
    queryKey: ["/api/security/settings"],
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });

  // Detect biometric capability (simplified - in production use Capacitor/Cordova)
  useEffect(() => {
    // Check if we're on iOS or Android
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    // In a real app, you'd use native plugins to check biometric availability
    if (isIOS) {
      setBiometricType("face"); // Assume Face ID on iOS (simplified)
    } else if (isAndroid) {
      setBiometricType("fingerprint"); // Assume fingerprint on Android
    }
  }, []);

  // Lock on visibility change (app backgrounded)
  useEffect(() => {
    if (!settings?.pinEnabled || !settings?.lockOnBackground) return;

    const handleVisibilityChange = () => {
      if (document.hidden && settings.pinEnabled) {
        setIsLocked(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [settings]);

  // Initial lock if PIN is enabled
  useEffect(() => {
    if (settings?.pinEnabled && !isLocked) {
      // Lock on first load if security is enabled
      const hasUnlockedRecently = sessionStorage.getItem("app_unlocked");
      if (!hasUnlockedRecently) {
        setIsLocked(true);
      }
    }
  }, [settings?.pinEnabled]);

  // Verify PIN mutation
  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const response = await apiRequest("POST", "/api/security/verify-pin", { pin });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsLocked(false);
        setFailedAttempts(0);
        sessionStorage.setItem("app_unlocked", "true");
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
      const response = await apiRequest("POST", "/api/security/pin", { pin });
      return response.json();
    },
    onSuccess: () => {
      setIsSettingUpPin(false);
      queryClient.invalidateQueries({ queryKey: ["/api/security/settings"] });
      toast({
        title: "PIN Created",
        description: "Your app is now protected with a PIN code",
      });
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
      const lockout = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
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

  const handlePinSuccess = useCallback((pin: string) => {
    if (pin === "biometric") {
      // Biometric succeeded
      setIsLocked(false);
      sessionStorage.setItem("app_unlocked", "true");
      return;
    }

    if (isSettingUpPin) {
      setupPinMutation.mutate(pin);
    } else {
      verifyPinMutation.mutate(pin);
    }
  }, [isSettingUpPin, setupPinMutation, verifyPinMutation]);

  const handleBiometricRequest = useCallback(async (): Promise<boolean> => {
    // In a real app, you'd use native biometric APIs here
    // For now, we'll simulate with Web Crypto API or show a prompt
    try {
      // Simulate biometric success for demo
      // In production: use Capacitor BiometricAuth plugin or similar
      if (settings?.biometricEnabled) {
        // Try Web Credential API (if available)
        if ('credentials' in navigator && 'PublicKeyCredential' in window) {
          // Web Authentication API would go here
          // For demo, we'll just show it as successful
          return true;
        }
        // Fallback: simulate success
        return true;
      }
      return false;
    } catch (e) {
      console.error("Biometric auth failed:", e);
      return false;
    }
  }, [settings?.biometricEnabled]);

  const handleForgotPin = useCallback(() => {
    toast({
      title: "Forgot PIN?",
      description: "Please contact support to reset your PIN",
    });
  }, [toast]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    sessionStorage.setItem("app_unlocked", "true");
  }, []);

  const lock = useCallback(() => {
    setIsLocked(true);
    sessionStorage.removeItem("app_unlocked");
  }, []);

  const showPinSetup = useCallback(() => setIsSettingUpPin(true), []);
  const hidePinSetup = useCallback(() => setIsSettingUpPin(false), []);

  // Check lockout
  const isLockedOut = lockoutUntil && new Date() < lockoutUntil;

  const value: AppLockContextType = {
    isLocked,
    securityEnabled: settings?.pinEnabled || false,
    unlock,
    lock,
    settings: settings || null,
    showPinSetup,
    hidePinSetup,
    isSettingUpPin,
  };

  return (
    <AppLockContext.Provider value={value}>
      {children}
      
      <AnimatePresence>
        {/* PIN Verification */}
        {isLocked && settings?.pinEnabled && !isSettingUpPin && !isLockedOut && (
          <PinEntry
            mode="verify"
            onSuccess={handlePinSuccess}
            onCancel={handleForgotPin}
            onBiometricRequest={settings.biometricEnabled ? handleBiometricRequest : undefined}
            biometricType={settings.biometricEnabled ? biometricType : "none"}
          />
        )}
        
        {/* PIN Setup */}
        {isSettingUpPin && (
          <PinEntry
            mode="setup"
            onSuccess={handlePinSuccess}
            onCancel={hidePinSetup}
            biometricType="none"
          />
        )}
      </AnimatePresence>
      
      {/* Lockout Screen */}
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
    </AppLockContext.Provider>
  );
}
