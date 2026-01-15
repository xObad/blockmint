import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

interface LiveGrowingBalanceProps {
  value: number;
  perSecond?: number;
  active?: boolean;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  triggerGlow?: boolean;
}

export function LiveGrowingBalance({
  value,
  perSecond = 0,
  active = true,
  decimals = 2,
  className = "",
  prefix = "",
  suffix = "",
  triggerGlow = false,
}: LiveGrowingBalanceProps) {
  const [anchor, setAnchor] = useState(() => ({ base: value, atMs: Date.now() }));
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Reset growth baseline when the real value changes.
  useEffect(() => {
    setAnchor({ base: value, atMs: Date.now() });
    setNowMs(Date.now());
  }, [value]);

  useEffect(() => {
    if (!active || perSecond <= 0) return;

    const id = setInterval(() => setNowMs(Date.now()), 500);
    return () => clearInterval(id);
  }, [active, perSecond]);

  const displayValue = useMemo(() => {
    if (!active || perSecond <= 0) return value;
    const elapsedSeconds = Math.max(0, (nowMs - anchor.atMs) / 1000);
    return anchor.base + perSecond * elapsedSeconds;
  }, [active, perSecond, value, nowMs, anchor]);

  const showLive = active && perSecond > 0;

  return (
    <span className="inline-flex items-center gap-2">
      <AnimatedCounter
        value={displayValue}
        decimals={decimals}
        className={className}
        prefix={prefix}
        suffix={suffix}
        triggerGlow={triggerGlow}
      />
      {showLive ? (
        <motion.span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          >
            <TrendingUp className="w-3 h-3" />
          </motion.span>
          Live
        </motion.span>
      ) : null}
    </span>
  );
}
