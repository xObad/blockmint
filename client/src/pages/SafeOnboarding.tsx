/**
 * Safe Onboarding (Compliance Mode)
 * 
 * This is a separate onboarding flow for Safe Mode.
 * NO crypto references, NO sign up option.
 * Only allows existing users to sign in.
 * 
 * Matches the design of the main Onboarding component.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, BarChart3, Bell, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SafeOnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Server,
    title: "Node Manager",
    subtitle: "Infrastructure Control",
    description: "Track server health, uptime, and performance metrics in real-time with our intuitive dashboard.",
    gradient: "from-cyan-500 via-blue-400 to-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    subtitle: "Data Insights",
    description: "Visualize CPU, memory, and network performance with detailed charts and historical data.",
    gradient: "from-purple-500 via-pink-400 to-purple-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    subtitle: "Stay Informed",
    description: "Receive instant alerts when your servers need attention or performance drops below thresholds.",
    gradient: "from-orange-500 via-amber-400 to-orange-600",
  },
  {
    icon: Shield,
    title: "Secure Access",
    subtitle: "Enterprise Security",
    description: "Enterprise-grade security with biometric authentication and encrypted connections.",
    gradient: "from-emerald-500 via-teal-400 to-emerald-600",
  },
];

export function SafeOnboarding({ onComplete }: SafeOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-safe pb-safe">
        {/* Header with Logo and Skip button */}
        <div className="flex items-center justify-between pt-6 pb-1">
          <motion.div 
            className="h-20 flex items-center justify-center relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <img
              src="/attached_assets/App-Logo.png"
              alt="BlockMint"
              className="h-16 w-auto object-contain relative z-10"
              style={{
                filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 20px rgba(16, 185, 129, 0.35)) contrast(1.1) saturate(1.2)',
                imageRendering: '-webkit-optimize-contrast',
              }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </motion.div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.button
              onClick={onComplete}
              className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center hover-elevate"
              whileTap={{ scale: 0.95 }}
              type="button"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                handleNext();
              } else if (swipe > 10000) {
                handlePrevious();
              }
            }}
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex-1 flex flex-col cursor-grab active:cursor-grabbing"
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Icon Container - 3D glass style */}
              <motion.div 
                className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-30 rounded-2xl blur-xl scale-110`} />
                {/* Glass container with gradient border */}
                <div className="relative z-10 w-full h-full rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl overflow-hidden">
                  {/* Inner gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20`} />
                  {/* Icon with gradient */}
                  <div className={`relative z-10 p-3 rounded-xl bg-gradient-to-br ${slide.gradient}`}>
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                  </div>
                </div>
              </motion.div>

              {/* Text Content */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${slide.gradient} text-white text-sm font-semibold`}
                >
                  <Icon className="w-4 h-4" />
                  {slide.subtitle}
                </motion.div>
                
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {slide.title}
                </h1>
                
                <p className="text-muted-foreground leading-relaxed max-w-sm text-sm">
                  {slide.description}
                </p>
              </div>
            </div>

            {/* Dots Indicator - 5px above button */}
            <div className="flex justify-center gap-2 mb-3">
              {slides.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 bg-primary' 
                      : 'w-2 bg-muted-foreground/30'
                  }`}
                  animate={{ scale: index === currentSlide ? 1.1 : 1 }}
                  onClick={() => setCurrentSlide(index)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="space-y-1 pb-1">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {/* Pulsing glow effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 opacity-60 blur-xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Button
              onClick={handleNext}
              className="relative w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-white shadow-lg shadow-emerald-400/30 hover:shadow-xl hover:shadow-emerald-400/50 active:shadow-md active:shadow-emerald-400/40 transition-all duration-300 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
              </span>
            </Button>
          </motion.div>

          {/* Sign in hint */}
          <p className="text-center text-xs text-muted-foreground/80 pt-0 pb-1">
            Sign in to access your infrastructure dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SafeOnboarding;
