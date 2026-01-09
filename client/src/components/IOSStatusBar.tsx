import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function IOSStatusBar() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
    >
      <div 
        className={`h-6 transition-all duration-300 ${
          hasScrolled ? "bg-background/80 backdrop-blur-xl" : "bg-transparent"
        }`}
      />
    </motion.div>
  );
}

export function IOSHomeIndicator() {
  return (
    <motion.div 
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="w-32 h-1 bg-foreground/30 rounded-full" />
    </motion.div>
  );
}
