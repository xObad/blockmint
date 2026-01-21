/**
 * Safe Onboarding (Compliance Mode)
 * 
 * This is a separate onboarding flow for Safe Mode.
 * NO crypto references, NO sign up option.
 * Only allows existing users to sign in.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, BarChart3, Bell, Shield, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SafeOnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Server,
    title: "Monitor Your Infrastructure",
    description: "Track server health, uptime, and performance metrics in real-time with our intuitive dashboard.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Visualize CPU, memory, and network performance with detailed charts and historical data.",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Receive instant alerts when your servers need attention or performance drops below thresholds.",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Shield,
    title: "Secure Access",
    description: "Enterprise-grade security with biometric authentication and encrypted connections.",
    color: "from-green-500 to-emerald-600",
  },
];

export function SafeOnboarding({ onComplete }: SafeOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Skip button */}
      <div className="absolute top-safe right-4 z-10 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="text-gray-400 hover:text-white"
        >
          Skip
        </Button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-md"
          >
            {/* Icon */}
            <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center shadow-2xl`}>
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon className="w-12 h-12 text-white" />;
              })()}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-4">
              {slides[currentSlide].title}
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-lg leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex gap-2 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-cyan-500 w-8"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-8 pb-safe space-y-4">
        <div className="flex gap-4">
          {currentSlide > 0 && (
            <Button
              variant="outline"
              onClick={prevSlide}
              className="flex-1 py-6 border-gray-700 text-gray-300"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}
          
          <Button
            onClick={isLastSlide ? onComplete : nextSlide}
            className={`flex-1 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 ${
              currentSlide === 0 ? "w-full" : ""
            }`}
          >
            {isLastSlide ? "Get Started" : "Next"}
            {!isLastSlide && <ChevronRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>

        {/* Sign in only - NO sign up */}
        {isLastSlide && (
          <p className="text-center text-gray-500 text-sm">
            Already have an account? Sign in to continue.
          </p>
        )}
      </div>
    </div>
  );
}

export default SafeOnboarding;
