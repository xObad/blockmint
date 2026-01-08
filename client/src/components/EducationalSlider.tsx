import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Lightbulb, Shield, TrendingUp, Zap } from "lucide-react";
import { LiquidGlassCard } from "@/components/GlassCard";
import { useTheme } from "@/contexts/ThemeContext";

interface EducationalCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  readTime: string;
  category: string;
}

const educationalContent: EducationalCard[] = [
  {
    id: 1,
    title: "What is Cryptocurrency Mining?",
    description: "Learn the fundamentals of crypto mining and how blockchain technology validates transactions through proof-of-work.",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "from-amber-500 to-orange-500",
    readTime: "5 min read",
    category: "Basics"
  },
  {
    id: 2,
    title: "Mining Pool Benefits",
    description: "Discover why joining a mining pool increases your chances of earning rewards and stabilizes your mining income.",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-emerald-500 to-teal-500",
    readTime: "4 min read",
    category: "Strategy"
  },
  {
    id: 3,
    title: "Secure Your Wallet",
    description: "Best practices for protecting your crypto assets with multi-factor authentication, cold storage, and backup strategies.",
    icon: <Shield className="w-6 h-6" />,
    color: "from-blue-500 to-indigo-500",
    readTime: "6 min read",
    category: "Security"
  },
  {
    id: 4,
    title: "Maximize Hash Rate",
    description: "Optimize your mining hardware and configuration to achieve peak performance and maximize your earning potential.",
    icon: <Zap className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    readTime: "7 min read",
    category: "Advanced"
  },
  {
    id: 5,
    title: "Understanding Block Rewards",
    description: "Learn how mining rewards work, including block subsidies, transaction fees, and halving events.",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-cyan-500 to-blue-500",
    readTime: "5 min read",
    category: "Economics"
  }
];

export function EducationalSlider() {
  const { theme } = useTheme();
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition(target.scrollLeft);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.48 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground font-display flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Learn & Earn
        </h2>
        <span className="text-xs text-muted-foreground">Swipe to explore →</span>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onScroll={handleScroll}
      >
        {educationalContent.map((card, index) => (
          <LiquidGlassCard
            key={card.id}
            className="flex-shrink-0 w-[85vw] max-w-[340px] p-4 snap-start cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            delay={0.49 + index * 0.02}
          >
            <div className="flex flex-col h-full">
              {/* Icon and Category */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}
                >
                  {card.icon}
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {card.category}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                  {card.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {card.readTime}
                </span>
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                  Read More
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </LiquidGlassCard>
        ))}

        {/* Spacer for scroll padding */}
        <div className="flex-shrink-0 w-1" />
      </div>

      {/* Scroll Indicator Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {educationalContent.map((_, index) => {
          const cardWidth = 340 + 16; // card width + gap
          const isActive = Math.round(scrollPosition / cardWidth) === index;
          return (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                isActive ? "w-6 bg-primary" : "w-1 bg-white/20"
              }`}
            />
          );
        })}
      </div>

      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </motion.div>
  );
}
