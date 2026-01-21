/**
 * Safe Header (Compliance Mode)
 * 
 * Minimal header for Safe Mode:
 * - Just the notification bell icon
 * - NO title bar
 * - Proper safe area for iOS status bar and Dynamic Island
 * - Notification panel drops down like main app
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

interface SafeHeaderProps {
  notificationCount?: number;
}

export function SafeHeader({ notificationCount: propNotificationCount }: SafeHeaderProps) {
  // For Safe Mode (review mode), we don't use real notifications
  // Always show empty notification panel
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Safe Mode always has 0 notifications (no real data)
  const displayCount = 0;

  return (
    <>
      {/* Minimal header - just bell icon on the right with safe area padding */}
      <div className="flex items-center justify-end px-4 h-12 mt-[max(env(safe-area-inset-top,44px),44px)]">
        <motion.button
          className="w-10 h-10 rounded-2xl liquid-glass flex items-center justify-center hover-elevate relative"
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="w-[17px] h-[17px] text-muted-foreground" />
          {displayCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
          )}
        </motion.button>
      </div>

      {/* Notifications Panel - Same as GlobalHeader (drops down from top) */}
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

export default SafeHeader;
