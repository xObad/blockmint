/**
 * Storefront Onboarding - Web Platform Introduction
 * 
 * Welcome screen for new web platform visitors.
 * Presents BlockMint as a Cloud Node Infrastructure provider.
 * Professional, clean, web-optimized design.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Shield,
  Zap,
  Globe,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorefrontOnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Server,
    iconBg: "from-emerald-500 to-teal-600",
    title: "Cloud Node Infrastructure",
    description: "Deploy and manage high-performance compute nodes with enterprise-grade reliability and 99.9% uptime guarantee.",
  },
  {
    icon: Globe,
    iconBg: "from-blue-500 to-indigo-600",
    title: "Global Network",
    description: "Access data centers across multiple regions worldwide. Choose the location that best suits your needs.",
  },
  {
    icon: Zap,
    iconBg: "from-amber-500 to-orange-600",
    title: "Instant Deployment",
    description: "Get your nodes up and running in minutes, not hours. Simple setup with powerful configuration options.",
  },
  {
    icon: Shield,
    iconBg: "from-purple-500 to-pink-600",
    title: "Enterprise Security",
    description: "Bank-level security with encrypted connections, DDoS protection, and automated backups included.",
  },
];

export function StorefrontOnboarding({ onComplete }: StorefrontOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">BlockMint</h1>
            <p className="text-xs text-muted-foreground">Node Infrastructure</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleSkip}>
          Skip
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-lg"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${slides[currentSlide].iconBg} flex items-center justify-center shadow-2xl`}
            >
              <CurrentIcon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              {slides[currentSlide].title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-lg">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 px-6 pb-8">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleNext}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {currentSlide < slides.length - 1 ? (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StorefrontOnboarding;
