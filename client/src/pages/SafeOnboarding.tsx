/**
 * Safe Onboarding (Compliance Mode)
 * 
 * Server monitoring tool onboarding - compact and clean design.
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
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Background blur effects - stronger colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-1/4 w-3/4 h-1/2 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -right-1/4 w-2/3 h-1/2 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Safe area container */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-lg mx-auto px-5">
        
        {/* Header - with status bar spacing */}
        <div className="h-[env(safe-area-inset-top,20px)]" />
        <div className="h-4" /> {/* Extra spacing after status bar */}
        
        <div className="flex items-center justify-between h-14">
          {/* Logo - 30% bigger (was 40px, now 52px) */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src="/attached_assets/App-Logo.png"
              alt="BlockMint"
              className="h-[52px] w-[52px] object-contain"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))' }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </motion.div>
          
          {/* Right actions - same size buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onComplete}
              className="w-10 h-10 rounded-xl bg-muted/60 backdrop-blur-sm flex items-center justify-center border border-border/50"
              whileTap={{ scale: 0.95 }}
              type="button"
              aria-label="Skip"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <ThemeToggle />
          </div>
        </div>

        {/* Main content area - compact spacing */}
        <div className="flex-1 flex flex-col justify-center">
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
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center cursor-grab active:cursor-grabbing"
            >
              {/* Icon - compact size */}
              <motion.div 
                className="relative w-20 h-20 mb-5"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-30 rounded-2xl blur-xl scale-125`} />
                {/* Icon container */}
                <div className="relative z-10 w-full h-full rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-15 rounded-2xl`} />
                  <div className={`relative z-10 p-3 rounded-xl bg-gradient-to-br ${slide.gradient}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Text content - tighter spacing */}
              <div className="text-center space-y-2 px-4 max-w-xs">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${slide.gradient} text-white text-xs font-medium`}
                >
                  <Icon className="w-3 h-3" />
                  {slide.subtitle}
                </motion.div>
                
                {/* Title */}
                <motion.h1 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-foreground"
                >
                  {slide.title}
                </motion.h1>
                
                {/* Description */}
                <motion.p 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground text-sm leading-relaxed"
                >
                  {slide.description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom section - same layout as main onboarding */}
        <div className="pb-[max(env(safe-area-inset-bottom),16px)]">
          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mb-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-6 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Continue button with glow */}
          <div className="relative mb-3">
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-40 blur-xl"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Button
              onClick={handleNext}
              className="relative w-full h-14 text-base font-bold bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-white shadow-xl shadow-emerald-500/30 rounded-xl overflow-hidden"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>
          </div>

          {/* Hint text below button */}
          <p className="text-center text-xs text-muted-foreground">
            Create a free account to start monitoring
          </p>
        </div>
      </div>
    </div>
  );
}

export default SafeOnboarding;
