import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  triggerGlow?: boolean; // New prop to trigger glow animation
}

export function AnimatedCounter({
  value,
  decimals = 2,
  duration = 0.8,
  className = "",
  prefix = "",
  suffix = "",
  triggerGlow = false
}: AnimatedCounterProps) {
  const [showGlow, setShowGlow] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    // Trigger glow when value increases (deposit confirmed)
    if (value > prevValue && triggerGlow) {
      setShowGlow(true);
      const timer = setTimeout(() => setShowGlow(false), 1000);
      return () => clearTimeout(timer);
    }
    setPrevValue(value);
  }, [value, prevValue, triggerGlow]);

  const displayText = `${prefix}${value.toFixed(decimals)}${suffix}`;

  return (
    <motion.span
      className={`${className} ${showGlow ? 'neon-glow-green' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayText}
    </motion.span>
  );
}
