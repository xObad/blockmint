/**
 * News Page (Safe Mode)
 * 
 * Displays industry news and educational content.
 * Completely safe content with NO crypto trading/investment references.
 * Focuses on cloud computing and technology news.
 */

import { motion } from "framer-motion";
import { 
  Newspaper, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Server,
  Shield,
  Globe,
  Cpu
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

// Mock news articles (all cloud/tech focused, NO crypto)
const newsArticles = [
  {
    id: "1",
    title: "Cloud Computing Market Expected to Grow 20% in 2026",
    summary: "Industry analysts predict continued strong growth in cloud infrastructure spending as enterprises accelerate digital transformation initiatives.",
    category: "Industry",
    icon: TrendingUp,
    readTime: "3 min",
    date: "Jan 19, 2026",
    featured: true,
  },
  {
    id: "2",
    title: "New Data Center Efficiency Standards Announced",
    summary: "Leading cloud providers commit to new sustainability standards, aiming for carbon-neutral operations by 2030.",
    category: "Sustainability",
    icon: Globe,
    readTime: "4 min",
    date: "Jan 18, 2026",
    featured: false,
  },
  {
    id: "3",
    title: "Edge Computing Adoption Accelerates",
    summary: "Businesses increasingly deploy edge infrastructure to reduce latency and improve application performance.",
    category: "Technology",
    icon: Server,
    readTime: "5 min",
    date: "Jan 17, 2026",
    featured: false,
  },
  {
    id: "4",
    title: "Cybersecurity Best Practices for Cloud Infrastructure",
    summary: "Essential security measures every organization should implement to protect their cloud resources.",
    category: "Security",
    icon: Shield,
    readTime: "6 min",
    date: "Jan 16, 2026",
    featured: false,
  },
  {
    id: "5",
    title: "Next-Generation Server Processors: What to Expect",
    summary: "Upcoming processor architectures promise significant performance improvements for compute-intensive workloads.",
    category: "Hardware",
    icon: Cpu,
    readTime: "4 min",
    date: "Jan 15, 2026",
    featured: false,
  },
];

export function News() {
  const [, setLocation] = useLocation();

  const handleArticleClick = (articleId: string) => {
    setLocation(`/safe-news/${articleId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 pb-24"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">News</h1>
        <p className="text-sm text-muted-foreground">Industry updates and insights</p>
      </motion.div>

      {/* Featured Article */}
      {newsArticles.filter(a => a.featured).map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleArticleClick(article.id)}
          className="cursor-pointer"
        >
          <GlassCard className="p-5 relative overflow-hidden hover:bg-card/80 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <Badge className="mb-3">{article.category}</Badge>
            
            <h2 className="text-lg font-bold text-foreground mb-2">
              {article.title}
            </h2>
            
            <p className="text-sm text-muted-foreground mb-4">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
                <span>{article.date}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </GlassCard>
        </motion.div>
      ))}

      {/* Article List */}
      <div className="space-y-3">
        {newsArticles.filter(a => !a.featured).map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            onClick={() => handleArticleClick(article.id)}
            className="cursor-pointer"
          >
            <GlassCard className="p-4 hover:bg-card/80 transition-colors" variant="subtle">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <article.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{article.category}</Badge>
                  </div>
                  <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground">
          More articles coming soon
        </p>
      </motion.div>
    </motion.div>
  );
}

export default News;
