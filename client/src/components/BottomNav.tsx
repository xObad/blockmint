import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Home, Wallet, TrendingUp, Pickaxe, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "home" | "wallet" | "invest" | "mining" | "solo";

export type { TabType };

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "home" as const, icon: Home, label: "Home" },
  { id: "wallet" as const, icon: Wallet, label: "Wallet" },
  { id: "invest" as const, icon: TrendingUp, label: "Yield" },
  { id: "mining" as const, icon: Pickaxe, label: "Mining" },
  { id: "solo" as const, icon: Gem, label: "Solo" },
];

// iOS 26.2 fluid spring configuration
const springConfig = { stiffness: 400, damping: 30, mass: 0.8 };

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-safe">
      <motion.nav
        className={cn(
          "pointer-events-auto w-[92%] max-w-md mx-4 mb-4",
          "rounded-[28px]",
          // iOS 26.2 liquid glass styling
          "dark:bg-white/[0.04] bg-white/90",
          "dark:backdrop-blur-[40px] dark:backdrop-saturate-[180%] backdrop-blur-xl",
          "border border-transparent",
          "dark:border-t-white/[0.18] dark:border-l-white/[0.08] dark:border-r-black/[0.15] dark:border-b-black/[0.25]",
          "border-black/[0.06]",
          // iOS 26.2 shadow system
          "dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)]",
          "shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
        )}
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ 
          delay: 0.2, 
          duration: 0.6, 
          type: "spring", 
          stiffness: 300, 
          damping: 28 
        }}
      >
        {/* iOS 26.2 top specular highlight */}
        <div 
          className="absolute inset-x-0 top-0 h-[1px] rounded-t-[28px] dark:bg-gradient-to-r dark:from-transparent dark:via-white/30 dark:to-transparent bg-gradient-to-r from-transparent via-white/50 to-transparent"
          aria-hidden="true"
        />
        
        {/* iOS 26.2 inner light refraction */}
        <div 
          className="absolute inset-0 rounded-[28px] pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div 
            className="absolute inset-0 dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.08)_0%,transparent_50%)] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.4)_0%,transparent_50%)]"
          />
        </div>
        
        <div className="flex items-center justify-around px-2 h-[68px] relative">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              data-testid={`nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center",
                "w-[56px] h-[56px] rounded-[20px]",
                "transition-colors duration-200",
                "relative"
              )}
              whileTap={{ scale: 0.88 }}
              animate={isActive ? { scale: 1.05 } : { scale: 1 }}
              transition={{ type: "spring", ...springConfig }}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlass"
                    className={cn(
                      "absolute inset-0 rounded-[20px]",
                      // iOS 26.2 active tab glass
                      "dark:bg-white/[0.10] bg-white/80",
                      "dark:backdrop-blur-xl backdrop-blur-lg",
                      "dark:border dark:border-white/[0.18] border border-black/[0.05]",
                      "dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]",
                      "shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  >
                    {/* Active tab inner shine */}
                    <div 
                      className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.12)_0%,transparent_50%)] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.5)_0%,transparent_50%)]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div
                className="relative z-10"
                animate={isActive ? { y: -1 } : { y: 0 }}
                transition={{ type: "spring", ...springConfig }}
              >
                <Icon 
                  className={cn(
                    "w-[26px] h-[26px] transition-all duration-200",
                    isActive 
                      ? "text-primary stroke-[2.5px] drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                      : "dark:text-white/50 text-muted-foreground/70 stroke-[1.8px]"
                  )} 
                  fill={isActive ? "hsl(var(--primary) / 0.12)" : "none"}
                />
              </motion.div>
              
              {/* iOS 26.2 style label */}
              <motion.span
                className={cn(
                  "text-[10px] mt-1 font-medium relative z-10 transition-colors duration-200",
                  isActive 
                    ? "text-primary" 
                    : "dark:text-white/40 text-muted-foreground/60"
                )}
                animate={isActive ? { opacity: 1 } : { opacity: 0.7 }}
              >
                {tab.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
    </div>
  );
}
