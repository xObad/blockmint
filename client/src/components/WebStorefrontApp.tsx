/**
 * Web Storefront App (Production-Safe Web Platform)
 * 
 * This is the web platform interface that App Store reviewers might visit.
 * It presents BlockMint as a "Cloud Node Infrastructure" platform:
 * - Allows signup (unlike mobile app in compliance mode)
 * - Has balance recharge via USDT (same deposit addresses as main app)
 * - No crypto mining references - uses "node hosting" terminology
 * - Professional server/cloud infrastructure branding
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Switch, Route, useLocation } from "wouter";
import { 
  Server, 
  CreditCard, 
  User, 
  Settings, 
  Bell,
  ChevronRight,
  Home,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { onAuthChange, logOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { User as FirebaseUser } from "firebase/auth";

// Import pages
import { StorefrontOnboarding } from "@/pages/StorefrontOnboarding";
import { StorefrontAuth } from "@/pages/StorefrontAuth";
import { StorefrontHome } from "@/pages/StorefrontHome";
import { StorefrontBalance } from "@/pages/StorefrontBalance";
import { StorefrontSettings } from "@/pages/StorefrontSettings";
import { SafeTermsOfService } from "@/pages/SafeTermsOfService";
import { SafePrivacyPolicy } from "@/pages/SafePrivacyPolicy";

type StorefrontView = "onboarding" | "auth" | "main";
type StorefrontTab = "dashboard" | "balance" | "settings";

export function WebStorefrontApp() {
  const [view, setView] = useState<StorefrontView>("onboarding");
  const [activeTab, setActiveTab] = useState<StorefrontTab>("dashboard");
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user has seen onboarding and is logged in
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (hasSeenOnboarding && isLoggedIn) {
      setView("main");
    } else if (hasSeenOnboarding) {
      setView("auth");
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user);
      if (user && view === "auth") {
        localStorage.setItem("isLoggedIn", "true");
        setView("main");
      }
    });
    return () => unsubscribe();
  }, [view]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setView("auth");
  };

  const handleAuthSuccess = () => {
    localStorage.setItem("isLoggedIn", "true");
    setView("main");
  };

  const handleLogout = async () => {
    try {
      await logOut();
      localStorage.removeItem("isLoggedIn");
      setView("auth");
      toast({
        title: "Logged Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Onboarding view
  if (view === "onboarding") {
    return <StorefrontOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Auth view
  if (view === "auth") {
    return (
      <StorefrontAuth 
        onAuthSuccess={handleAuthSuccess}
        onBack={() => setView("onboarding")}
      />
    );
  }

  // Main app view with sidebar navigation (web-optimized)
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">BlockMint</h1>
              <p className="text-xs text-muted-foreground">Node Infrastructure</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={Home} 
            label="Dashboard" 
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem 
            icon={CreditCard} 
            label="Balance" 
            active={activeTab === "balance"}
            onClick={() => setActiveTab("balance")}
          />
          <NavItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {firebaseUser?.email || 'Not signed in'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-2 justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Server className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">BlockMint</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border bg-card"
            >
              <nav className="p-4 space-y-2">
                <MobileNavItem 
                  icon={Home} 
                  label="Dashboard" 
                  active={activeTab === "dashboard"}
                  onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                />
                <MobileNavItem 
                  icon={CreditCard} 
                  label="Balance" 
                  active={activeTab === "balance"}
                  onClick={() => { setActiveTab("balance"); setMobileMenuOpen(false); }}
                />
                <MobileNavItem 
                  icon={Settings} 
                  label="Settings" 
                  active={activeTab === "settings"}
                  onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
                />
                <div className="pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:p-6 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto">
          {activeTab === "dashboard" && (
            <StorefrontHome 
              user={firebaseUser}
              onNavigateToBalance={() => setActiveTab("balance")}
            />
          )}
          {activeTab === "balance" && (
            <StorefrontBalance user={firebaseUser} />
          )}
          {activeTab === "settings" && (
            <StorefrontSettings 
              user={firebaseUser}
              onLogout={handleLogout}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Desktop navigation item
function NavItem({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

// Mobile navigation item
function MobileNavItem({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      <ChevronRight className="w-4 h-4 ml-auto" />
    </button>
  );
}

export default WebStorefrontApp;
