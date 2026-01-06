import { motion } from "framer-motion";
import { Home, Wallet, TrendingUp, Pickaxe, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "home" | "wallet" | "invest" | "mining" | "solo";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "home" as const, icon: Home, label: "Home" },
  { id: "wallet" as const, icon: Wallet, label: "Wallet" },
  { id: "invest" as const, icon: TrendingUp, label: "Invest" },
  { id: "mining" as const, icon: Pickaxe, label: "Mining" },
  { id: "solo" as const, icon: Gem, label: "Solo" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.nav
        className={cn(
          "pointer-events-auto w-full max-w-md px-4 mb-6",
          "rounded-[28px]",
          "dark:bg-white/[0.06] bg-white/90",
          "backdrop-blur-2xl",
          "dark:border-white/[0.12] border border-border",
          "dark:shadow-[0_-8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.1)] shadow-[0_-4px_16px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]"
        )}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
      >
        <div 
          className="absolute inset-x-0 top-0 h-[1px] rounded-t-[28px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          aria-hidden="true"
        />
        
        <div className="flex items-center justify-around h-20">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              data-testid={`nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5",
                "w-16 h-16 rounded-2xl",
                "transition-all duration-300 ease-out",
                "relative"
              )}
              whileTap={{ scale: 0.92 }}
              animate={isActive ? { scale: 1.02 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlass"
                  className="absolute inset-0 rounded-2xl bg-white/[0.08] dark:bg-white/[0.06] backdrop-blur-xl border border-white/[0.15] dark:border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon 
                className={cn(
                  "w-6 h-6 relative z-10 transition-all duration-200",
                  isActive 
                    ? "text-primary stroke-[2.5px]" 
                    : "text-muted-foreground stroke-[1.5px]"
                )} 
                fill={isActive ? "hsl(var(--primary) / 0.15)" : "none"}
              />
              <motion.span 
                className={cn(
                  "text-[9px] font-medium tracking-tight relative z-10 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
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

export type { TabType };
