import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { LiquidGlassCard } from "@/components/GlassCard";
import { useLocation } from "wouter";

interface Article {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export function EducationalSlider() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [, navigate] = useLocation();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  // Filter and sort active articles
  const activeArticles = articles
    .filter((article) => article.isActive)
    .sort((a, b) => a.order - b.order);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition(target.scrollLeft);
  };

  const extractTextFromHTML = (html: string, maxLength: number = 150): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (isLoading) {
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
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </motion.div>
    );
  }

  if (activeArticles.length === 0) {
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
        </div>
        <div className="text-center p-8 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No articles available yet</p>
        </div>
      </motion.div>
    );
  }

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
        {activeArticles.map((article, index) => (
          <LiquidGlassCard
            key={article.id}
            className="flex-shrink-0 w-[85vw] max-w-[340px] p-4 snap-start cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            delay={0.49 + index * 0.02}
            onClick={() => navigate(`/article/${article.id}`)}
          >
            <div className="flex flex-col h-full">
              {/* Icon/Image and Category */}
              <div className="flex items-center justify-between mb-3">
                {article.icon ? (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl shadow-lg">
                    {article.icon}
                  </div>
                ) : article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-12 h-12 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                )}
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Article
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                  {extractTextFromHTML(article.description)}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Learn More
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
      {activeArticles.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {activeArticles.map((_, index) => {
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
      )}

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
