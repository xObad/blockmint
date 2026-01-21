/**
 * Scroll-Aware Status Bar Background
 * 
 * This component provides a subtle background for system status bar elements
 * that fades in when the user scrolls down and fades out when scrolling back up.
 * Works like professional mobile apps.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollAwareStatusBarProps {
  /** Scroll threshold to show background (in pixels) */
  threshold?: number;
  /** Custom class for the background */
  className?: string;
}

export function ScrollAwareStatusBar({ 
  threshold = 20,
  className = ""
}: ScrollAwareStatusBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > threshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`fixed top-0 left-0 right-0 z-[90] pointer-events-none ${className}`}
          style={{
            height: "calc(env(safe-area-inset-top, 44px) + 16px)",
            background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default ScrollAwareStatusBar;
