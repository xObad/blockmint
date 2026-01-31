import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  glow?: "btc" | "ltc" | "primary" | "none";
  variant?: "default" | "strong" | "subtle" | "frosted";
  onClick?: () => void;
  interactive?: boolean;
  shimmer?: boolean;
  pulse?: boolean;
}

// iOS 26.2 fluid spring configuration
const springConfig = { stiffness: 300, damping: 30, mass: 0.8 };
const gentleSpring = { stiffness: 150, damping: 25, mass: 1 };

export function GlassCard({ 
  children, 
  className, 
  animate = true, 
  delay = 0,
  glow = "none",
  variant = "default",
  onClick,
  interactive = false,
  shimmer = false,
  pulse = false
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for iOS 26.2 parallax/tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring-based transforms for fluid motion
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), gentleSpring);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), gentleSpring);
  const scale = useSpring(1, springConfig);
  
  // Handle mouse move for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  };
  
  const handleMouseEnter = () => {
    if (interactive) scale.set(1.02);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  };
  
  const glowClass = glow === "btc" ? "glass-glow-btc" : glow === "ltc" ? "glass-glow-ltc" : glow === "primary" ? "glass-glow-primary" : "";
  const variantClass = variant === "strong" ? "liquid-glass-strong" : variant === "subtle" ? "liquid-glass-subtle" : variant === "frosted" ? "liquid-glass-frosted" : "";
  const shimmerClass = shimmer ? "liquid-glass-shimmer" : "";
  const pulseClass = pulse ? "liquid-glass-pulse" : "";
  
  const content = (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative rounded-3xl p-4 sm:p-5 overflow-hidden",
        "liquid-glass",
        variantClass,
        glowClass,
        shimmerClass,
        pulseClass,
        interactive && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={interactive ? {
        rotateX,
        rotateY,
        scale,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* iOS 26.2 inner shine layer */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none z-0 opacity-60"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 50%)",
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ 
        duration: 0.6, 
        delay, 
        ease: [0.16, 1, 0.3, 1] // iOS 26.2 fluid ease-out
      }}
    >
      {content}
    </motion.div>
  );
}

// iOS 26.2 style elevated card with stronger effects
export function LiquidGlassCard(props: GlassCardProps) {
  return <GlassCard {...props} variant={props.variant || "strong"} />;
}

// iOS 26.2 style interactive card that responds to touch/hover
export function InteractiveGlassCard(props: Omit<GlassCardProps, 'interactive'>) {
  return <GlassCard {...props} interactive={true} />;
}
