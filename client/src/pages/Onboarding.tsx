import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Gem, Shield, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";

import btcMine from "@assets/Bitcoin_Mine_1766014388617.webp";
import mixedMain from "@assets/Mixed_main_1766014388605.webp";
import serverMining from "@assets/Server_Mining_1766014388610.webp";

interface OnboardingProps {
  onComplete: () => void;
  onSignIn: () => void;
  onSkip?: () => void;
}

const onboardingPages = [
  {
    id: 1,
    title: "Welcome to BlockMint",
    subtitle: "The Future of Bitcoin Mining",
    description: "Purchase hashpower contracts and earn Bitcoin passively. No hardware required, no electricity bills.",
    image: mixedMain,
    icon: Zap,
    gradient: "from-blue-500 via-cyan-400 to-blue-600"
  },
  {
    id: 2,
    title: "Secure & Transparent",
    subtitle: "Bank-Grade Security",
    description: "Your funds are protected with enterprise-grade security. Track every transaction on the blockchain.",
    image: serverMining,
    icon: Shield,
    gradient: "from-emerald-500 via-teal-400 to-emerald-600"
  },
  {
    id: 3,
    title: "Solo Block Discovery",
    subtitle: "Full Block Rewards",
    description: "Join our solo mining pools for full 3.125 BTC block rewards. Mine independently for maximum returns.",
    image: btcMine,
    icon: Gem,
    gradient: "from-amber-500 via-orange-400 to-amber-600"
  }
];

export function Onboarding({ onComplete, onSignIn, onSkip }: OnboardingProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const page = onboardingPages[currentPage];
  const Icon = page.icon;

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-1/4 w-3/4 h-1/2 bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -right-1/4 w-2/3 h-1/2 bg-purple-500/8 rounded-full blur-[100px]" />
      </div>

      {/* Main container */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-md mx-auto px-5">
        
        {/* Safe area for status bar / Dynamic Island */}
        <div className="pt-[max(env(safe-area-inset-top),12px)]" />
        
        {/* Header row - Logo centered, skip + theme on right */}
        <div className="flex items-center justify-between py-2">
          {/* Spacer for balance */}
          <div className="w-[88px]" />
          
          {/* Logo - centered, larger */}
          <motion.img
            src="/attached_assets/App-Logo.png"
            alt="BlockMint"
            className="h-14 w-14 object-contain"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          
          {/* Right actions - Skip and Theme Toggle - same size */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onSkip ? onSkip() : onSignIn()}
              className="w-10 h-10 rounded-xl bg-muted/60 backdrop-blur-sm flex items-center justify-center border border-border/50"
              whileTap={{ scale: 0.95 }}
              type="button"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <ThemeToggle />
          </div>
        </div>

        {/* Swipeable content area - takes remaining space */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -8000) handleNext();
              else if (swipe > 8000) handlePrevious();
            }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* Main illustration - responsive size */}
            <motion.div 
              className="relative w-[55vw] max-w-[220px] aspect-square mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${page.gradient} opacity-20 rounded-full blur-3xl scale-110`} />
              <img 
                src={page.image} 
                alt={page.title}
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Text content */}
            <div className="text-center space-y-3 px-2">
              {/* Subtitle badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${page.gradient} text-white text-xs font-semibold shadow-lg`}
              >
                <Icon className="w-3.5 h-3.5" />
                {page.subtitle}
              </motion.div>
              
              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground"
              >
                {page.title}
              </motion.h1>
              
              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto"
              >
                {page.description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom section - fixed height */}
        <div className="pb-[max(env(safe-area-inset-bottom),16px)]">
          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mb-4">
            {onboardingPages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentPage 
                    ? 'w-6 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to page ${index + 1}`}
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
                {currentPage === onboardingPages.length - 1 ? "Get Started" : "Continue"}
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>
          </div>

          {/* Sign in link on last page */}
          {currentPage === onboardingPages.length - 1 ? (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={onSignIn}
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Swipe to explore • Create a free account
            </p>
          )}

          {/* Legal links */}
          <div className="flex justify-center items-center gap-3 mt-3">
            <Link 
              href="/terms" 
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground"
            >
              Terms
            </Link>
            <span className="text-xs text-muted-foreground/30">•</span>
            <Link 
              href="/privacy" 
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
