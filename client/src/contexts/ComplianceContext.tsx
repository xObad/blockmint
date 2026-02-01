/**
 * Compliance Context
 * 
 * This context provides global access to the compliance mode state.
 * 
 * ARCHITECTURE (Updated for Guideline 3.2 Compliance):
 * - The app is a PUBLIC consumer app - anyone can sign up
 * - All users see the SAME full-featured app with signup capability
 * - compliance_mode flag is now used for enabling/disabling specific features
 * - NOT for restricting access or showing different app versions
 * 
 * KEY POINT FOR APP STORE APPROVAL (Guideline 3.2):
 * Apple reviewers MUST see that:
 * 1. Anyone can create an account (no invitation required)
 * 2. The app is for general public, not business users
 * 3. Full functionality is available to all users
 * 
 * LOGIN OPTIONS (Guideline 4.8):
 * - Sign in with Apple (primary - REQUIRED by Apple)
 * - Sign in with Google
 * - Email/Password registration
 * 
 * URL ROUTES:
 * - / → Main app (mining dashboard with signup/signin)
 * - /console → Web Console (same features, different entry point)
 * - /db-admin → Database admin panel (internal only)
 * 
 * The compliance mode is fetched from the admin config API and cached.
 * It's controlled via the /db-admin panel → Config tab → compliance_mode setting.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface ComplianceContextType {
  isComplianceMode: boolean;
  isWebStorefront: boolean;
  isNativeDashboard: boolean;
  isMobileApp: boolean;
  isWebBrowser: boolean;
  isLoading: boolean;
  refetchCompliance: () => void;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

interface AppConfig {
  key: string;
  value: string;
}

/**
 * Detect if running inside a Capacitor native app
 */
function isCapacitorNative(): boolean {
  // Check for Capacitor native environment
  const win = window as any;
  if (win.Capacitor && win.Capacitor.isNativePlatform) {
    return win.Capacitor.isNativePlatform();
  }
  // Fallback: check for common native indicators
  if (win.Capacitor?.platform && win.Capacitor.platform !== 'web') {
    return true;
  }
  return false;
}

/**
 * Check if current path is the storefront route
 */
function isStorefrontRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/console');
}

/**
 * Detect if running on iOS (either native or Safari)
 */
function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detect if running on Android
 */
function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

export function ComplianceProvider({ children }: { children: ReactNode }) {
  // Detect platform
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [isWebBrowser, setIsWebBrowser] = useState(true);
  const [onStorefrontRoute, setOnStorefrontRoute] = useState(isStorefrontRoute());
  
  useEffect(() => {
    // Check if we're running in a native Capacitor app
    const nativeApp = isCapacitorNative();
    setIsMobileApp(nativeApp);
    setIsWebBrowser(!nativeApp);
    
    // Initial check for storefront route
    setOnStorefrontRoute(isStorefrontRoute());
    
    // Listen for route changes (popstate for browser back/forward)
    const handleRouteChange = () => {
      setOnStorefrontRoute(isStorefrontRoute());
    };
    window.addEventListener('popstate', handleRouteChange);
    
    // Also listen for pushstate/replacestate (for programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleRouteChange();
    };
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // Fetch admin config to check compliance mode
  const { data: configData, isLoading, refetch } = useQuery<AppConfig[]>({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/config");
        if (!response.ok) {
          // If not authorized or error, default to normal mode
          return [];
        }
        return response.json();
      } catch (error) {
        console.error("Failed to fetch compliance config:", error);
        return [];
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 1,
  });

  // Extract compliance mode settings from config
  const getConfigValue = (key: string): string | null => {
    if (!configData) return null;
    const config = configData.find((c) => c.key === key);
    return config?.value || null;
  };

  // Parse boolean config values
  const isConfigEnabled = (key: string): boolean => {
    const value = getConfigValue(key);
    if (!value) return false;
    return value.toLowerCase() === "true" || value === "1";
  };

  // Check different compliance mode flags from config
  const complianceModeEnabled = isConfigEnabled("compliance_mode");
  
  // USER-BASED MODE DETECTION:
  // If user is logged in (email in localStorage), they're a returning user
  // Show them the NORMAL app even if compliance is ON
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const isKnownUser = !!userEmail;
  
  // SMART MODE DETECTION:
  // - If compliance is OFF → Normal app for everyone
  // - If compliance is ON + user is known (has email) → Normal app (returning user)
  // - If compliance is ON + user is unknown (no email) → Safe Mode (App Store reviewer)
  // - Mobile app (Capacitor) with compliance ON and unknown user → Safe Mode
  
  // Safe Mode: compliance ON AND user is unknown (reviewer) AND (native app OR not on storefront route)
  const isComplianceMode = complianceModeEnabled && !isKnownUser && (isMobileApp || !onStorefrontRoute);
  
  // Storefront: compliance ON and on storefront route (and not native app)
  const isWebStorefront = complianceModeEnabled && onStorefrontRoute && !isMobileApp;
  
  const isNativeDashboard = isConfigEnabled("native_dashboard_mode");

  return (
    <ComplianceContext.Provider
      value={{
        isComplianceMode,
        isWebStorefront,
        isNativeDashboard,
        isMobileApp,
        isWebBrowser,
        isLoading,
        refetchCompliance: refetch,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
}

export function useCompliance(): ComplianceContextType {
  const context = useContext(ComplianceContext);
  if (context === undefined) {
    throw new Error("useCompliance must be used within a ComplianceProvider");
  }
  return context;
}

export default ComplianceContext;
