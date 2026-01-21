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
  // Always visible status bar background
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[90] pointer-events-none ${className}`}
      style={{
        // Height covers Dynamic Island area + buffer
        height: "calc(env(safe-area-inset-top, 59px) + 44px)",
        // Smooth gradient fading to invisible at bottom
        background: `linear-gradient(
          180deg, 
          hsl(var(--background) / 0.5) 0%, 
          hsl(var(--background) / 0.35) 25%,
          hsl(var(--background) / 0.2) 50%,
          hsl(var(--background) / 0.08) 75%,
          transparent 100%
        )`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    />
  );
}

export default ScrollAwareStatusBar;
