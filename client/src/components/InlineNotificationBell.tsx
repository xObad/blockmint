/**
 * Inline Notification Bell
 * 
 * A reusable notification bell component that can be placed inline within cards
 * or headers. Shows notifications in a dropdown panel.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

interface InlineNotificationBellProps {
  className?: string;
  /** Custom size variant */
  size?: "sm" | "md";
}

export function InlineNotificationBell({ 
  className = "",
  size = "md"
}: InlineNotificationBellProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Safe Mode always has 0 notifications (no real data)
  const displayCount = 0;
  
  const iconSize = size === "sm" ? "w-4 h-4" : "w-[17px] h-[17px]";
  const buttonSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const dotSize = size === "sm" ? "w-2 h-2 top-1 right-1" : "w-2.5 h-2.5 top-1.5 right-1.5";

  return (
    <>
      <motion.button
        className={`${buttonSize} rounded-2xl liquid-glass flex items-center justify-center hover-elevate relative ${className}`}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className={`${iconSize} text-muted-foreground`} />
        {displayCount > 0 && (
          <span className={`absolute ${dotSize} bg-red-500 rounded-full shadow-lg shadow-red-500/50`} />
        )}
      </motion.button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
              exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-1/2 w-[min(92vw,28rem)] max-w-md bg-background border border-border rounded-2xl shadow-2xl z-[105] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              {/* Safe Mode always shows empty notifications */}
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">No Notifications</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default InlineNotificationBell;
