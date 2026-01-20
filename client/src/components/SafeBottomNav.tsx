/**
 * Safe Bottom Navigation (Compliance Mode)
 * 
 * A completely different bottom navigation for Safe Mode with 4 tabs:
 * Home, Metrics, News, Settings
 * 
 * NO crypto tabs (Wallet, Invest, Mining, Solo)
 */

import { Home, BarChart3, Newspaper, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

const safeNavItems: NavItem[] = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/metrics", icon: BarChart3, label: "Metrics" },
  { path: "/news", icon: Newspaper, label: "News" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function SafeBottomNav() {
  const [location, setLocation] = useLocation();

  // Map paths for matching
  const getActivePath = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      {/* Navigation items */}
      <div className="relative flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {safeNavItems.map((item) => {
          const isActive = getActivePath(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="safeActiveTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon */}
              <Icon
                className={`w-5 h-5 mb-1 transition-colors relative z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />

              {/* Label */}
              <span
                className={`text-[10px] font-medium transition-colors relative z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>

              {/* Active dot */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default SafeBottomNav;
