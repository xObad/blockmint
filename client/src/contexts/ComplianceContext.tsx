/**
 * Compliance Context
 * 
 * This context provides global access to the compliance mode state.
 * 
 * ARCHITECTURE:
 * - When compliance_mode is true AND we're on a native app (Capacitor),
 *   the app shows "Safe Mode" (Server Management Dashboard - NO signup)
 * - When compliance_mode is true AND user navigates to /console,
 *   the app shows "Web Console" (Cloud Node Infrastructure - WITH signup)
 * - When compliance_mode is false, normal crypto mining app is shown
 * 
 * SMART MODE DETECTION:
 * - In production mobile app (Capacitor detected): Always use Safe Mode
 * - In production web browser: Use Safe Mode on main routes, Console on /console
 * - During development: Same as production, but can test both
 * 
 * URL ROUTES:
 * - / → Safe Mode (review version) when compliance is ON
 * - /console → Web Console (allows signup, USDT deposit)
 * - / → Normal app when compliance is OFF
 * 
 * This ensures:
 * 1. App Store reviewer on mobile sees: Safe Mode (no crypto, no signup)
 * 2. App Store reviewer on web sees: Safe Mode by default, Console available at /console
 * 3. Normal users see: Full mining app
 * 
 * The compliance mode is fetched from the admin config API and cached.
 * It's checked once on app load and can be controlled via the /db-admin panel.
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
  
  // SMART MODE DETECTION:
  // - If compliance is ON → Safe Mode is default (main page shows review-safe app)
  // - Console is ONLY shown when user navigates to /console route
  // - Mobile app (Capacitor) NEVER shows storefront
  // - If compliance is OFF → Normal crypto mining app
  
  // Safe Mode: compliance ON and (native app OR not on storefront route)
  const isComplianceMode = complianceModeEnabled && (isMobileApp || !onStorefrontRoute);
  
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
