import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Sun, Moon, X, Home, Wallet, PieChart, HelpCircle, LogOut, Settings as SettingsIcon, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { logOut } from "@/lib/firebase";
import { ScrollAwareStatusBar } from "./ScrollAwareStatusBar";
import { cn } from "@/lib/utils";

interface GlobalHeaderProps {
  onOpenSettings?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToWallet?: () => void;
  onNavigateToInvest?: () => void;
}

// iOS 26.2 fluid spring configuration
const springConfig = { stiffness: 400, damping: 30, mass: 0.8 };
const slideSpring = { type: "spring", stiffness: 350, damping: 35 };

export function GlobalHeader({
  onOpenSettings,
  onNavigateToHome,
  onNavigateToWallet,
  onNavigateToInvest,
}: GlobalHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logOut();
    localStorage.clear();
    window.location.href = '/';
  };

  // iOS 26.2 glass button style
  const glassButtonClass = cn(
    "w-10 h-10 rounded-[14px]",
    "flex items-center justify-center",
    "dark:bg-white/[0.06] bg-white/80",
    "dark:backdrop-blur-xl backdrop-blur-lg",
    "border dark:border-white/[0.12] border-black/[0.05]",
    "dark:shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]",
    "shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]",
    "transition-all duration-200",
    "hover:dark:bg-white/[0.1] hover:bg-white/90",
    "active:scale-95"
  );

  return (
    <>
      {/* Scroll-aware background for system status bar */}
      <ScrollAwareStatusBar />
      
      {/* Spacer for system status bar - reduced spacing */}
      <div className="h-[max(calc(env(safe-area-inset-top,44px)*2-15px),73px)]" />
      
      <header className="bg-transparent">
        <div className="flex items-center gap-3 px-4 h-16">
          {/* Left Side - Hamburger Menu & Settings */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowMenu(!showMenu)}
              className={glassButtonClass}
              whileTap={{ scale: 0.92 }}
              transition={springConfig}
              type="button"
            >
              <Menu className="w-[18px] h-[18px] text-muted-foreground" />
            </motion.button>
            <motion.button
              onClick={onOpenSettings}
              className={glassButtonClass}
              whileTap={{ scale: 0.92 }}
              transition={springConfig}
              type="button"
            >
              <SettingsIcon className="w-[18px] h-[18px] text-muted-foreground" />
            </motion.button>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 ml-auto">
            <motion.button
              onClick={toggleTheme}
              className={glassButtonClass}
              whileTap={{ scale: 0.92 }}
              transition={springConfig}
              type="button"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="moon"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-[18px] h-[18px] text-muted-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-[18px] h-[18px] text-amber-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <div className="relative">
              <motion.button
                className={glassButtonClass}
                whileTap={{ scale: 0.92 }}
                transition={springConfig}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-[18px] h-[18px] text-muted-foreground" />
                {unreadCount > 0 && (
                  <motion.span 
                    className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      boxShadow: "0 0 8px rgba(239, 68, 68, 0.6), 0 0 16px rgba(239, 68, 68, 0.3)"
                    }}
                  />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* iOS 26.2 Hamburger Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-md z-[100]"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={slideSpring}
              className={cn(
                "fixed left-0 top-0 bottom-0 w-80 z-[101]",
                "dark:bg-black/80 bg-white/95",
                "dark:backdrop-blur-[60px] dark:backdrop-saturate-[180%] backdrop-blur-2xl",
                "border-r dark:border-white/[0.1] border-black/[0.05]",
                "shadow-[20px_0_60px_-15px_rgba(0,0,0,0.4)]"
              )}
            >
              {/* iOS 26.2 specular highlight */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 30%)",
                }}
              />
              
              <div className="flex flex-col h-full p-6 pt-safe relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">BlockMint</h2>
                    <p className="text-sm text-muted-foreground">Mining Dashboard</p>
                  </div>
                  <motion.button
                    onClick={() => setShowMenu(false)}
                    className={cn(
                      "w-9 h-9 rounded-xl",
                      "flex items-center justify-center",
                      "dark:bg-white/[0.08] bg-black/[0.05]",
                      "dark:border dark:border-white/[0.1]",
                      "transition-colors duration-200"
                    )}
                    whileTap={{ scale: 0.92 }}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                </div>

                <nav className="flex-1 space-y-1.5">
                  {[
                    { icon: Home, label: "Home", color: "text-emerald-500", action: onNavigateToHome },
                    { icon: Wallet, label: "Wallet", color: "text-blue-500", action: onNavigateToWallet },
                    { icon: PieChart, label: "Yield", color: "text-purple-500", action: onNavigateToInvest },
                    { icon: HelpCircle, label: "Support", color: "text-cyan-500", action: undefined },
                  ].map((item, index) => (
                    <motion.button
                      key={item.label}
                      onClick={() => { item.action?.(); setShowMenu(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl",
                        "dark:hover:bg-white/[0.06] hover:bg-black/[0.03]",
                        "transition-all duration-200"
                      )}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.08)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        "dark:bg-white/[0.08] bg-black/[0.04]",
                        "dark:border dark:border-white/[0.08]"
                      )}>
                        <item.icon className={cn("w-[18px] h-[18px]", item.color)} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </motion.button>
                  ))}

                  <div className="pt-4 mt-4 border-t dark:border-white/[0.08] border-black/[0.05]">
                    <motion.button
                      onClick={() => { onOpenSettings?.(); setShowMenu(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl",
                        "dark:hover:bg-white/[0.06] hover:bg-black/[0.03]",
                        "transition-all duration-200"
                      )}
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        "dark:bg-white/[0.08] bg-black/[0.04]"
                      )}>
                        <SettingsIcon className="w-[18px] h-[18px] text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Settings</span>
                    </motion.button>
                  </div>
                </nav>

                <div className="pt-4 border-t dark:border-white/[0.08] border-black/[0.05]">
                  <motion.button
                    onClick={handleLogout}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-2xl",
                      "hover:bg-red-500/10 transition-all duration-200",
                      "text-red-500"
                    )}
                    whileHover={{ x: 6 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10">
                      <LogOut className="w-[18px] h-[18px]" />
                    </div>
                    <span className="text-sm font-medium">Sign Out</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PieChart className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-foreground">Yield</span>
                  </motion.button>
                  
                  <motion.button
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <HelpCircle className="w-5 h-5 text-cyan-500" />
                    <span className="text-sm font-medium text-foreground">Support</span>
                  </motion.button>

                  <div className="pt-4 border-t border-white/10">
                    <motion.button
                      onClick={() => { onOpenSettings?.(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SettingsIcon className="w-5 h-5 text-slate-500" />
                      <span className="text-sm font-medium text-foreground">Settings</span>
                    </motion.button>
                  </div>
                </nav>

                <div className="pt-4 border-t border-white/10">
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-500"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* iOS 26.2 Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-md z-[100]"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -30, x: "-50%", scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, x: "-50%", scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95, filter: "blur(5px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "fixed top-20 left-1/2 w-[min(92vw,26rem)] max-w-md z-[105] overflow-hidden",
                "rounded-3xl",
                "dark:bg-black/80 bg-white/95",
                "dark:backdrop-blur-[60px] dark:backdrop-saturate-[180%] backdrop-blur-2xl",
                "border dark:border-white/[0.12] border-black/[0.06]",
                "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* iOS 26.2 specular highlight */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
                }}
              />
              
              <div className="flex items-center justify-between p-4 border-b dark:border-white/[0.08] border-black/[0.05] relative z-10">
                <h3 className="font-semibold text-foreground text-base">Notifications</h3>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <motion.button
                      onClick={() => markAllAsRead()}
                      className="text-xs text-primary font-medium hover:underline"
                      whileTap={{ scale: 0.95 }}
                    >
                      Mark all read
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setShowNotifications(false)}
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center",
                      "dark:bg-white/[0.08] bg-black/[0.04]",
                      "transition-colors duration-200"
                    )}
                    whileTap={{ scale: 0.92 }}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>
              {notifications.length > 0 ? (
                <div className="max-h-80 overflow-y-auto relative z-10">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={cn(
                        "p-4 border-b dark:border-white/[0.05] border-black/[0.03]",
                        "hover:dark:bg-white/[0.04] hover:bg-black/[0.02]",
                        "transition-colors cursor-pointer",
                        !notif.read && "dark:bg-primary/[0.08] bg-primary/[0.05]"
                      )}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="flex items-start gap-3">
                        {!notif.read && (
                          <motion.span 
                            className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)"
                            }}
                          />
                        )}
                        <div className={!notif.read ? '' : 'pl-5'}>
                          <p className="font-medium text-foreground text-sm">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>
                          <p className="text-xs text-muted-foreground/50 mt-2">{notif.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center relative z-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-14 h-14 mx-auto mb-4 rounded-2xl dark:bg-white/[0.06] bg-black/[0.03] flex items-center justify-center"
                  >
                    <Bell className="w-7 h-7 text-muted-foreground/40" />
                  </motion.div>
                  <p className="text-sm font-medium text-foreground">No Notifications</p>
                  <p className="text-xs text-muted-foreground mt-1.5">You're all caught up!</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
