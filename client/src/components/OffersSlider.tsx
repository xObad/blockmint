import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface Offer {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  backgroundType: number;
  ctaText: string | null;
  ctaLink: string | null;
  isActive: boolean;
  order: number;
}

export function OffersSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
    queryFn: async () => {
      const res = await fetch("/api/offers");
      if (!res.ok) throw new Error("Failed to fetch offers");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const goToNext = useCallback(() => {
    if (offers.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % offers.length);
    setProgress(0);
  }, [offers.length]);

  const goToPrev = useCallback(() => {
    if (offers.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
    setProgress(0);
  }, [offers.length]);

  // Auto-rotate every 5 seconds with progress bar
  useEffect(() => {
    if (!isAutoPlaying || offers.length <= 1) return;
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / 50); // 50 intervals for 5 seconds (100ms each)
      });
    }, 100);

    const slideInterval = setInterval(goToNext, 5000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, [isAutoPlaying, goToNext, offers.length]);

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (offers.length === 0) {
    return null;
  }

  const currentOffer = offers[currentIndex];

  return (
    <div 
      className="relative overflow-hidden rounded-2xl h-48"
      onMouseEnter={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentOffer.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {/* Image Only - No Background Gradients */}
          {currentOffer.imageUrl && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentOffer.imageUrl})` }}
            >
              {/* Dark gradient overlay at bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            </div>
          )}
          
          {/* Content - Positioned at bottom with proper spacing */}
          <div className="relative h-full flex flex-col justify-end p-5">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white drop-shadow-2xl leading-tight">
                {currentOffer.title}
              </h3>
              {currentOffer.subtitle && (
                <p className="text-sm text-white/95 font-semibold drop-shadow-lg leading-snug">
                  {currentOffer.subtitle}
                </p>
              )}
              {currentOffer.description && (
                <p className="text-xs text-white/90 leading-relaxed line-clamp-2 drop-shadow-md">
                  {currentOffer.description}
                </p>
              )}
              {currentOffer.ctaText && currentOffer.ctaLink && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-4 text-xs bg-white hover:bg-white/90 text-black font-bold shadow-lg"
                    onClick={() => window.open(currentOffer.ctaLink!, '_blank')}
                  >
                    {currentOffer.ctaText}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {offers.length > 1 && (
        <>
          <button
            onClick={() => { handleInteraction(); goToPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors z-10 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => { handleInteraction(); goToNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors z-10 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Progress Bars */}
          <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-10">
            {offers.map((_, idx) => (
              <div
                key={idx}
                className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <motion.div
                  className="h-full bg-white rounded-full shadow-lg"
                  initial={{ width: idx < currentIndex ? "100%" : "0%" }}
                  animate={{ 
                    width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%"
                  }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
