import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./AnimatedCounter";
import { useRef } from "react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  unit?: string;
  suffix?: string;
  decimals?: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "green" | "orange" | "blue";
  delay?: number;
  interactive?: boolean;
}

// iOS 26.2 color theming with glass effects
const colorThemes = {
  primary: {
    gradient: "from-primary/25 to-primary/10",
    text: "text-primary",
    glow: "rgba(16, 185, 129, 0.2)",
    accent: "rgba(16, 185, 129, 0.3)",
  },
  green: {
    gradient: "from-emerald-500/25 to-emerald-500/10",
    text: "text-emerald-400",
    glow: "rgba(16, 185, 129, 0.2)",
    accent: "rgba(16, 185, 129, 0.3)",
  },
  orange: {
    gradient: "from-orange-500/25 to-orange-500/10",
    text: "text-orange-400",
    glow: "rgba(247, 147, 26, 0.2)",
    accent: "rgba(247, 147, 26, 0.3)",
  },
  blue: {
    gradient: "from-cyan-500/25 to-cyan-500/10",
    text: "text-cyan-400",
    glow: "rgba(59, 130, 246, 0.2)",
    accent: "rgba(59, 130, 246, 0.3)",
  },
};

// iOS 26.2 fluid spring
const springConfig = { stiffness: 300, damping: 28, mass: 0.8 };

export function StatCard({
  icon: Icon,
  label,
  value,
  unit = "",
  suffix = "",
  decimals = 0,
  trend,
  trendValue,
  color = "primary",
  delay = 0,
  interactive = true,
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = colorThemes[color];
  
  // iOS 26.2 parallax motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  const handleMouseEnter = () => interactive && scale.set(1.03);
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative rounded-2xl p-3 sm:p-4 overflow-hidden",
        "liquid-glass"
      )}
      style={{
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
        scale: interactive ? scale : 1,
        transformPerspective: 800,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ 
        delay, 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      {/* iOS 26.2 specular highlight */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none z-0"
        style={{
          background: `
            linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.glow} 0%, transparent 50%)
          `,
        }}
      />

      <div className="flex items-start justify-between mb-2 sm:mb-3 relative z-10">
        <motion.div
          className={cn(
            "w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl",
            "flex items-center justify-center",
            "bg-gradient-to-br",
            theme.gradient,
            theme.text,
            // iOS 26.2 glass icon container
            "backdrop-blur-lg",
            "border border-white/[0.1]",
            "shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]"
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
        </motion.div>
        
        {trend && trendValue && (
          <motion.span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              "backdrop-blur-lg border",
              trend === "up" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
              trend === "down" && "bg-red-500/20 text-red-400 border-red-500/20",
              trend === "neutral" && "bg-white/10 text-muted-foreground border-white/10"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.3 }}
          >
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}{trendValue}
          </motion.span>
        )}
      </div>

      <p className="text-muted-foreground text-sm mb-1 relative z-10">{label}</p>
      <div className="flex items-baseline gap-1.5 relative z-10">
        <AnimatedCounter
          value={value}
          decimals={decimals}
          className="text-2xl sm:text-[1.7rem] font-bold text-foreground tracking-tight"
          suffix={suffix}
        />
        {unit && <span className="text-sm text-muted-foreground/80">{unit}</span>}
      </div>
    </motion.div>
  );
}
