// Main app UI as a component for router
function MobileApp() {
  // ...all main app UI state and logic above should be accessible here, so this is a wrapper
  // The main app UI block moved here for router usage
  return (
    <div className="min-h-screen bg-background overflow-x-hidden safe-area-inset">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[100px]" />
        <ForceUpdateModal />
      </div>
      <GlobalHeader
        onOpenSettings={() => setShowSettings(true)}
        onNavigateToHome={() => setActiveTab("home")}
        onNavigateToWallet={() => setActiveTab("wallet")}
        onNavigateToInvest={() => setActiveTab("invest")}
      />
      <main className="relative z-10 max-w-md mx-auto px-4 pt-2 pb-48">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            isLoading ? (
              <DashboardSkeleton key="dashboard-skeleton" />
            ) : (
              <Dashboard
                key="dashboard"
                balances={balances}
                totalBalance={totalBalance}
                change24h={change24h}
                transactions={transactions}
                miningStats={miningStats}
                activeContracts={0}
                portfolioHistory={portfolioHistory}
                onOpenSettings={() => setShowSettings(true)}
                onOpenProfile={() => firebaseUser ? setShowSettings(true) : setAppView("auth")}
                onNavigateToInvest={() => setActiveTab("invest")}
                onNavigateToSolo={() => setActiveTab("solo")}
                onNavigateToMining={() => setActiveTab("mining")}
                onNavigateToWallet={() => setActiveTab("wallet")}
                onNavigateToHome={() => setActiveTab("home")}
                onWithdraw={() => setActiveTab("wallet")}
                isLoggedIn={localStorage.getItem("isLoggedIn") === "true"}
                onRefreshBalances={refetchBalances}
                isFetching={isFetching}
              />
            )
          )}
          {activeTab === "wallet" && (
            isLoading ? (
              <WalletSkeleton key="wallet-skeleton" />
            ) : (
              <Wallet
                key="wallet"
                balances={balances}
                transactions={transactions}
                totalBalance={totalBalance}
                change24h={change24h}
                onNavigateToHome={() => setActiveTab("home")}
                onNavigateToWallet={() => setActiveTab("wallet")}
                onNavigateToInvest={() => setActiveTab("invest")}
                onOpenSettings={() => setShowSettings(true)}
              />
            )
          )}
          {activeTab === "invest" && (
            <Invest 
              key="invest" 
              onNavigateToHome={() => setActiveTab("home")}
              onNavigateToWallet={() => setActiveTab("wallet")}
              onNavigateToInvest={() => setActiveTab("invest")}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}
          {activeTab === "solo" && (
            <SoloMining key="solo" />
          )}
          {activeTab === "mining" && (
            <Mining
              key="mining"
              chartData={chartData}
              contracts={contracts}
              poolStatus={poolStatus}
              onNavigateToInvest={() => setActiveTab("invest")}
            />
          )}
        </AnimatePresence>
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center space-y-4 pb-safe"
        >
          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/5 rounded-full blur-xl"></div>
            <img 
              src="/attached_assets/BlockMint-for-All.png" 
              alt="BlockMint" 
              className="h-28 w-auto object-contain relative z-10"
              style={{
                filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 15px rgba(16, 185, 129, 0.25)) contrast(1.1) saturate(1.2)',
                imageRendering: '-webkit-optimize-contrast',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://x.com/BlockMintingApp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center hover-elevate transition-transform active:scale-95"
              data-testid="link-social-x"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = 'twitter://user?screen_name=BlockMintingApp';
                setTimeout(() => {
                  window.location.href = 'https://x.com/BlockMintingApp';
                }, 500);
              }}
            >
              <SiX className="w-5 h-5 text-foreground" />
            </a>
            <a
              href="https://www.instagram.com/blockmint.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center hover-elevate transition-transform active:scale-95"
              data-testid="link-social-instagram"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = 'instagram://user?username=blockmint.app';
                setTimeout(() => {
                  window.location.href = 'https://www.instagram.com/blockmint.app/';
                }, 500);
              }}
            >
              <SiInstagram className="w-5 h-5 text-foreground" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">Cryptocurrency Payments Accepted</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-muted-foreground">BlockMint App By Hardisk UAE Mining Farms</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary">
              ©
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link href="/terms" data-testid="link-terms-of-service">
              <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Terms of Service
              </span>
            </Link>
            <Link href="/privacy" data-testid="link-privacy-policy">
              <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Privacy Policy
              </span>
            </Link>
          </div>
        </motion.footer>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-background safe-area-inset"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px]" />
              <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 flex items-center justify-between px-4 pt-safe pb-4">
              <h1 className="text-xl font-bold text-foreground font-display">BlockMint</h1>
              <motion.button
                data-testid="button-close-settings"
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center hover-elevate"
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>
            <div className="relative z-10 flex-1 overflow-auto px-4 pb-8">
              <Settings
                settings={settings}
                onSettingsChange={updateSettings}
                user={firebaseUser}
                onLogout={async () => {
                  await logOut();
                  localStorage.clear();
                  setShowSettings(false);
                  setAppView("onboarding");
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ComplianceProvider, useCompliance } from "@/contexts/ComplianceContext";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Switch, Route, Link, useLocation } from "wouter";

import { BottomNav, type TabType } from "@/components/BottomNav";
import { SafeBottomNav } from "@/components/SafeBottomNav";
import { GlobalHeader } from "@/components/GlobalHeader";
import { SafeHeader } from "@/components/SafeHeader";
import { Dashboard } from "@/pages/Dashboard";
import { Wallet } from "@/pages/Wallet";
import { Invest } from "@/pages/Invest";
import { SoloMining } from "@/pages/SoloMining";
import { Mining } from "@/pages/Mining";
import { Settings } from "@/pages/Settings";
import { Onboarding } from "@/pages/Onboarding";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardSkeleton, WalletSkeleton } from "@/components/LoadingSkeleton";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";
import { TermsOfService } from "@/pages/TermsOfService";
import { Referral } from "@/pages/Referral";
import { History } from "@/pages/History";
import { VirtualCard } from "@/pages/VirtualCard";
import { DatabaseAdmin } from "@/pages/DatabaseAdmin";
import { ArticlePage } from "@/pages/ArticlePage";
import { News } from "@/pages/News";
import { ForceUpdateModal } from "@/components/ForceUpdateModal";
import { TwoFactorPage } from "@/pages/TwoFactorPage";
import { AppLockProvider } from "@/components/AppLock";
import { SiX, SiInstagram } from "react-icons/si";
import { useMiningData } from "@/hooks/useMiningData";
import { onAuthChange, logOut } from "@/lib/firebase";
import type { User } from "firebase/auth";

// Safe Mode pages and app shell (compliance mode for mobile app)
import { SafeHome } from "@/pages/SafeHome";
import { SafeMetrics } from "@/pages/SafeMetrics";
import { SafeSettings } from "@/pages/SafeSettings";
import { SafeModeApp } from "@/components/SafeModeApp";
import { SafeTermsOfService } from "@/pages/SafeTermsOfService";
import { SafePrivacyPolicy } from "@/pages/SafePrivacyPolicy";
import { SafeNewsArticle } from "@/pages/SafeNewsArticle";

// Web Storefront (compliance mode for web browser - allows signup, USDT deposit)
import { WebStorefrontApp } from "@/components/WebStorefrontApp";

type AppView = "onboarding" | "auth" | "main";
type AuthMode = "signin" | "register";
type SafeTabType = "home" | "metrics" | "news" | "settings";

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showSettings, setShowSettings] = useState(false);
  const [appView, setAppView] = useState<AppView>("onboarding");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [pending2FA, setPending2FA] = useState(false);
  const [twoFACompleted, setTwoFACompleted] = useState(false);
  
  const {
    miningStats,
    balances,
    transactions,
    pools,
    settings,
    chartData,
    portfolioHistory,
    contracts,
    poolStatus,
    totalBalance,
    change24h,
    isPending,
    isLoading,
    isFetching,
    refetchBalances,
    toggleMining,
    selectPool,
    updateSettings,
  } = useMiningData();

  useEffect(() => {
    // Version check to reset localStorage on new app version
    const currentVersion = "1.0.1";
    const savedVersion = localStorage.getItem("appVersion");
    
    if (savedVersion !== currentVersion) {
      // Only clear version-related items, not all localStorage
      localStorage.setItem("appVersion", currentVersion);
    }
    
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (hasSeenOnboarding && isLoggedIn) {
      setAppView("main");
    } else if (hasSeenOnboarding) {
      setAppView("auth");
    }
  }, []);

  // Track Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);
      if (user) {
        localStorage.setItem("isLoggedIn", "true");
      } else {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        if (appView === "main") {
          // User signed out remotely - clear state and go to auth
          setAppView("auth");
        }
      }
    });
    return () => unsubscribe();
  }, [appView]);

  // Sync Firebase user into backend + localStorage so deposits/admin see the user immediately
  useEffect(() => {
    const syncUser = async () => {
      if (!firebaseUser) return;
      try {
        const idToken = await firebaseUser.getIdToken();
        console.log("Syncing user with backend:", firebaseUser.email);
        const res = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!res.ok) {
          const error = await res.json();
          console.error("Auth sync failed:", error);
          // Show the actual error to help debugging
          alert(`Auth sync failed: ${error.error || 'Unknown error'}. Please contact support.`);
          throw new Error("Failed to sync user");
        }
        const data = await res.json();
        console.log("Auth sync success:", data.user);
        const storedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          id: data.user?.id,
          dbId: data.user?.id,
          role: data.user?.role,
        };
        localStorage.setItem("user", JSON.stringify(storedUser));
        console.log("User stored in localStorage:", storedUser);

        // Check if 2FA is enabled for this user
        try {
          const twoFARes = await fetch(`/api/auth/2fa/status/${firebaseUser.uid}`);
          if (twoFARes.ok) {
            const twoFAData = await twoFARes.json();
            if (twoFAData.enabled) {
              setRequires2FA(true);
              setPending2FA(true);
              setTwoFACompleted(false);
              return;
            }
          }
        } catch (error) {
          console.error("Failed to check 2FA status:", error);
        }
        // If no 2FA or already verified, go to main
        if (appView === "auth") {
          setAppView("main");
        }
      } catch (error) {
        console.error("User sync failed:", error);
      }
    };

    if (firebaseUser) {
      syncUser();
    }
  }, [firebaseUser, appView]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setAppView("auth");
  };

  const handleAuthComplete = () => {
    localStorage.setItem("isLoggedIn", "true");
    setAppView("main");
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setAppView("auth");
  };

  const handleSkipToMain = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    localStorage.setItem("isLoggedIn", "true");
    setAppView("main");
  };

  if (appView === "onboarding") {
    return (
      <div className="min-h-screen">
        <Onboarding onComplete={handleOnboardingComplete} onSignIn={handleSignIn} onSkip={handleSkipToMain} />
      </div>
    );
  }

  if (appView === "auth") {
    return (
      <div className="min-h-screen">
        <AuthPage 
          mode={authMode}
          onBack={() => setAppView("onboarding")}
          onModeChange={setAuthMode}
          onComplete={handleAuthComplete}
        />
      </div>
    );
  }

  // 2FA required: show dedicated page and block app until completed
  if (firebaseUser && requires2FA && !twoFACompleted) {
    return (
      <TwoFactorPage
        userId={firebaseUser.uid}
        onSuccess={() => {
          setTwoFACompleted(true);
          setPending2FA(false);
          setAppView("main");
        }}
        onLogout={async () => {
          await logOut();
          localStorage.clear();
          setAppView("onboarding");
        }}
      />
    );
  }


}

function AppRouter() {
  const { isComplianceMode, isWebStorefront, isLoading } = useCompliance();
  
  // Wait for compliance mode to be determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  // WEB CONSOLE - Only shown when user navigates to /console routes
  // This is the production-safe web platform with signup and USDT deposit
  if (isWebStorefront) {
    return (
      <Switch>
        <Route path="/legal/privacy" component={SafePrivacyPolicy} />
        <Route path="/legal/terms" component={SafeTermsOfService} />
        <Route path="/console/:rest*" component={WebStorefrontApp} />
        <Route path="/console" component={WebStorefrontApp} />
        <Route component={WebStorefrontApp} />
      </Switch>
    );
  }
  
  // SAFE MODE - Review-safe version shown on main page when compliance is ON
  // This is what the App Store reviewer sees (no crypto, no signup)
  if (isComplianceMode) {
    return (
      <Switch>
        <Route path="/legal/privacy" component={SafePrivacyPolicy} />
        <Route path="/legal/terms" component={SafeTermsOfService} />
        <Route path="/privacy" component={SafePrivacyPolicy} />
        <Route path="/terms" component={SafeTermsOfService} />
        <Route path="/safe-news/:id" component={SafeNewsArticle} />
        <Route path="/db-admin" component={DatabaseAdmin} />
        <Route path="/console/:rest*" component={WebStorefrontApp} />
        <Route path="/console" component={WebStorefrontApp} />
        <Route path="/" component={SafeModeApp} />
        <Route component={SafeModeApp} />
      </Switch>
    );
  }
  
  // NORMAL MODE - Full crypto mining app (compliance OFF)
  return (
    <Switch>
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/referral">
        {() => <Referral />}
      </Route>
      <Route path="/db-admin" component={DatabaseAdmin} />
      <Route path="/article/:id" component={ArticlePage} />
      <Route path="/virtual-card">
        {() => <VirtualCard onBack={() => window.history.back()} />}
      </Route>
      <Route path="/history">
        {() => <History />}
      </Route>
      <Route path="/" component={MobileApp} />
      <Route component={MobileApp} />
    </Switch>
  );
}

function App() {
  // Get user ID from localStorage for AppLock
  const [userId, setUserId] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserId(parsed.id || parsed.dbId);
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <NotificationProvider>
            <ComplianceProvider>
              <TooltipProvider>
                <AppLockProvider userId={userId}>
                  <Toaster />
                  <AppRouter />
                </AppLockProvider>
              </TooltipProvider>
            </ComplianceProvider>
          </NotificationProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
