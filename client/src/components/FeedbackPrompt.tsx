import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Gift, Sparkles, MessageSquare, ThumbsUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function FeedbackPrompt() {
  const [dismissed, setDismissed] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [feedbackStep, setFeedbackStep] = useState<"initial" | "positive" | "negative">("initial");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userStr = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
  const storedUser = userStr ? (() => {
    try { return JSON.parse(userStr); } catch { return null; }
  })() : null;
  const userId = storedUser?.id || storedUser?.dbId;

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("feedbackPromptDismissed");
    if (wasDismissed) setDismissed(true);
  }, []);

  const { data: eligibility } = useQuery({
    queryKey: ["/api/feedback/eligibility", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch(`/api/feedback/eligibility/${userId}`);
      return res.json();
    },
    enabled: !!userId && !dismissed,
    refetchInterval: false,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const platform = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" : 
                       /Android/.test(navigator.userAgent) ? "android" : "web";
      const res = await fetch("/api/feedback/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, platform }),
      });
      if (!res.ok) throw new Error("Failed to claim");
      return res.json();
    },
    onSuccess: () => {
      setShowReward(true);
      queryClient.invalidateQueries({ queryKey: ["/api/mining/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/eligibility"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to claim reward.", variant: "destructive" });
    },
  });

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("feedbackPromptDismissed", "true");
  };

  const handlePositiveFeedback = () => setFeedbackStep("positive");

  const handleNegativeFeedback = () => {
    setFeedbackStep("negative");
    claimMutation.mutate();
  };

  const handleLeaveReview = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.open("https://apps.apple.com/app/blockmint/id6740003498?action=write-review", "_blank");
    } else {
      window.open("https://play.google.com/store/apps/details?id=com.blockmint.app", "_blank");
    }
    claimMutation.mutate();
  };

  const handleContactSupport = () => {
    window.open("mailto:support@blockmint.app?subject=App Feedback", "_blank");
    handleDismiss();
  };

  const handleCloseReward = () => {
    setShowReward(false);
    setDismissed(true);
    sessionStorage.setItem("feedbackPromptDismissed", "true");
  };

  if (!eligibility?.eligible || dismissed) return null;

  return (
    <>
      <AnimatePresence>
        {!showReward && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-50">
            <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-4 border border-primary/30 shadow-2xl">
              <button onClick={handleDismiss} className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {feedbackStep === "initial" && (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div className="pr-6">
                      <h3 className="font-semibold text-foreground">How is Your Experience?</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">We would love to hear your feedback!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Gift className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-sm text-emerald-400 font-medium">Loyalty Bonus Available</span>
                      <span className="text-xs text-muted-foreground ml-1">for active users</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleNegativeFeedback}>
                      <ThumbsUp className="w-4 h-4 mr-2 rotate-180" />Could Be Better
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-primary to-emerald-600" onClick={handlePositiveFeedback}>
                      <ThumbsUp className="w-4 h-4 mr-2" />Loving It!
                    </Button>
                  </div>
                </>
              )}

              {feedbackStep === "positive" && (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div className="pr-6">
                      <h3 className="font-semibold text-foreground">Awesome!</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Would you mind sharing your experience?</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Your review helps other users discover BlockMint!</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => claimMutation.mutate()} disabled={claimMutation.isPending}>Not Now</Button>
                    <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500" onClick={handleLeaveReview} disabled={claimMutation.isPending}>
                      <ExternalLink className="w-4 h-4 mr-2" />Leave Review
                    </Button>
                  </div>
                </>
              )}

              {feedbackStep === "negative" && (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div className="pr-6">
                      <h3 className="font-semibold text-foreground">We are Sorry!</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Let us know how we can improve.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleDismiss}>Maybe Later</Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500" onClick={handleContactSupport}>Contact Support</Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReward && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleCloseReward}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} transition={{ type: "spring" }}
              className="bg-background rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl border border-border/50 relative" onClick={(e) => e.stopPropagation()}>
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Gift className="w-12 h-12 text-white" />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="absolute top-16 left-8">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="absolute top-20 right-8">
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-bold text-foreground mb-2">
                Loyalty Bonus!
              </motion.h2>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2 mb-6">
                <p className="text-muted-foreground">Thank you for being an active user!</p>
                <div className="flex justify-center gap-4">
                  <div className="text-center"><p className="text-2xl font-bold text-emerald-400">\$20</p><p className="text-xs text-muted-foreground">Mining Credits</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-primary">0.8 TH/s</p><p className="text-xs text-muted-foreground">Hashrate (1 Year)</p></div>
                </div>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm text-muted-foreground mb-6">
                Check your mining dashboard to see your new hashrate!
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Button className="w-full" onClick={handleCloseReward}>Awesome!</Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
