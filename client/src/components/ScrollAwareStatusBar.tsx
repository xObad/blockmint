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
  const opacity = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Smooth opacity transition based on scroll position
      // Starts fading in at threshold, fully visible at threshold + 30px
      const fadeStart = threshold;
      const fadeEnd = threshold + 30;
      
      if (currentScrollY <= fadeStart) {
        opacity.set(0);
      } else if (currentScrollY >= fadeEnd) {
        opacity.set(1);
      } else {
        // Smooth interpolation between fadeStart and fadeEnd
        const progress = (currentScrollY - fadeStart) / (fadeEnd - fadeStart);
        opacity.set(progress);
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, opacity]);

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
            // Extra height for Dynamic Island (59px notch + extra buffer)
            height: "calc(env(safe-area-inset-top, 59px) + 50px)",
            // Very smooth gradient - no visible edge at bottom
            background: `linear-gradient(
              180deg, 
              hsl(var(--background) / 0.5) 0%, 
              hsl(var(--background) / 0.35) 30%,
              hsl(var(--background) / 0.2) 55%,
              hsl(var(--background) / 0.08) 75%,
              hsl(var(--background) / 0.02) 90%,
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
