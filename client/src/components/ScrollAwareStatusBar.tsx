/**
 * Scroll-Aware Status Bar Background
 * 
 * This component provides a subtle background for system status bar elements
 * that fades in when the user scrolls down and fades out when scrolling back up.
 * Works like professional mobile apps. Supports iPhone Dynamic Island.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

interface ScrollAwareStatusBarProps {
  /** Scroll threshold to show background (in pixels) */
  threshold?: number;
  /** Custom class for the background */
  className?: string;
}

export function ScrollAwareStatusBar({ 
  threshold = 15,
  className = ""
}: ScrollAwareStatusBarProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isVisible = scrollY > threshold;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`fixed top-0 left-0 right-0 z-[90] pointer-events-none ${className}`}
          style={{
            // Height covers Dynamic Island area + buffer
            height: "calc(env(safe-area-inset-top, 59px) + 41px)",
            // Smooth gradient fading to transparent at bottom (no visible edge)
            background: `linear-gradient(
              180deg, 
              hsl(var(--background) / 0.6) 0%, 
              hsl(var(--background) / 0.45) 30%,
              hsl(var(--background) / 0.25) 60%,
              hsl(var(--background) / 0.1) 80%,
              transparent 100%
            )`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default ScrollAwareStatusBar;
