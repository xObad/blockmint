/**
 * Safe Onboarding (Compliance Mode)
 * 
 * This is a separate onboarding flow for Safe Mode.
 * A legitimate PUBLIC server monitoring tool.
 * NO crypto references.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, BarChart3, Bell, Shield, X, ChevronRight } from "lucide-react";
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
    description: "Track server health, uptime, and performance metrics in real-time.",
    gradient: "from-cyan-500 via-blue-400 to-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    subtitle: "Data Insights",
    description: "Visualize CPU, memory, and network performance with detailed charts.",
    gradient: "from-purple-500 via-pink-400 to-purple-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    subtitle: "Stay Informed",
    description: "Receive instant alerts when your servers need attention.",
    gradient: "from-orange-500 via-amber-400 to-orange-600",
  },
  {
    icon: Shield,
    title: "Secure Access",
    subtitle: "Enterprise Security",
    description: "Enterprise-grade security with biometric authentication.",
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
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] -left-[30%] w-[80%] h-[60%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[30%] w-[70%] h-[50%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Safe area container */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-lg mx-auto px-5">
        
        {/* Header - Fixed height with safe area */}
        <div className="pt-safe">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src="/attached_assets/App-Logo.png"
                alt="BlockMint"
                className="h-10 w-10 object-contain"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))' }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </motion.div>
            
            {/* Right actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                onClick={onComplete}
                className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                type="button"
                aria-label="Skip"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main content area - flex grow */}
        <div className="flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -5000) handleNext();
                else if (swipe > 5000) handlePrevious();
              }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing py-8"
            >
              {/* Icon - responsive size */}
              <motion.div 
                className="relative w-24 h-24 sm:w-28 sm:h-28 mb-8"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-30 rounded-3xl blur-xl scale-125`} />
                {/* Icon container */}
                <div className="relative z-10 w-full h-full rounded-3xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-15 rounded-3xl`} />
                  <div className={`relative z-10 p-4 rounded-2xl bg-gradient-to-br ${slide.gradient}`}>
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Text content */}
              <div className="text-center space-y-4 px-4 max-w-sm">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${slide.gradient} text-white text-xs font-medium`}
                >
                  <Icon className="w-3 h-3" />
                  {slide.subtitle}
                </motion.div>
                
                {/* Title */}
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl font-bold text-foreground"
                >
                  {slide.title}
                </motion.h1>
                
                {/* Description */}
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-muted-foreground text-sm sm:text-base leading-relaxed"
                >
                  {slide.description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom section - Fixed */}
        <div className="pb-safe">
          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Button */}
          <Button
            onClick={handleNext}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <span className="flex items-center justify-center gap-2">
              {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
              <ChevronRight className="w-5 h-5" />
            </span>
          </Button>

          {/* Hint */}
          <p className="text-center text-xs text-muted-foreground mt-4 mb-2">
            Create a free account to start monitoring
          </p>
        </div>
      </div>
    </div>
  );
}

export default SafeOnboarding;
