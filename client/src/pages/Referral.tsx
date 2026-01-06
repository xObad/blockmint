import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Share2, Copy, Users, Trophy, Gift, 
  Star, DollarSign, Check, Clock, Info, ChevronRight,
  Crown, Medal
} from "lucide-react";
import { Link } from "wouter";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

interface LeaderboardEntry {
  rank: number;
  name: string;
  referrals: number;
  earnings: number;
  isVip: boolean;
}

const topReferrers: LeaderboardEntry[] = [
  { rank: 1, name: "Alex★Johnson", referrals: 183, earnings: 915, isVip: true },
  { rank: 2, name: "Maria★Chen", referrals: 155, earnings: 775, isVip: true },
  { rank: 3, name: "David★Smith", referrals: 109, earnings: 545, isVip: true },
];

export function Referral() {
  const { toast } = useToast();
  const { convert, getSymbol } = useCurrency();
  const [copied, setCopied] = useState(false);
  
  const referralCode = "MINING" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const referralLink = `https://miningclub.app/ref/${referralCode}`;
  const myReferrals = 0;
  const myEarnings = 0;
  const rewardPerReferral = 5;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share it with your friends to earn rewards.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join BlockMint",
          text: `Join BlockMint and start earning Bitcoin! Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="relative z-10 max-w-md mx-auto px-4 pt-16 pb-8 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.header
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Referral Program</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Earn {getSymbol()}{rewardPerReferral} per friend</p>
            </div>
          </div>
        </motion.header>

        <GlassCard delay={0.1} className="p-5 overflow-visible" glow="primary">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Invite Friends & Earn</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get <span className="text-primary font-semibold">{getSymbol()}{rewardPerReferral}</span> for each friend who signs up
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 rounded-xl border border-white/10">
                <p className="text-2xl font-bold text-foreground" data-testid="text-my-referrals">{myReferrals}</p>
                <p className="text-xs text-muted-foreground">Your Referrals</p>
              </div>
              <div className="text-center p-3 rounded-xl border border-white/10">
                <p className="text-2xl font-bold text-emerald-400" data-testid="text-my-earnings">{getSymbol()}{convert(myEarnings).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="p-5">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Your Referral Link</h3>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-white/10">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-foreground truncate outline-none"
                data-testid="input-referral-link"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
                data-testid="button-copy-link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 liquid-glass bg-primary/80 border-0"
                onClick={handleShare}
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
              <Button
                variant="outline"
                className="flex-1 liquid-glass border-white/10"
                onClick={handleCopyLink}
                data-testid="button-copy"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </GlassCard>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Top Referrers
          </h2>
          <GlassCard delay={0.2} className="p-4">
            <div className="space-y-3">
              {topReferrers.map((referrer, index) => (
                <motion.div
                  key={referrer.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    referrer.rank === 1 
                      ? 'border border-amber-500/20' 
                      : 'border border-white/10'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  data-testid={`leaderboard-entry-${referrer.rank}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                    {getRankIcon(referrer.rank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{referrer.name}</p>
                      {referrer.isVip && (
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{referrer.referrals} referrals</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-emerald-400">{getSymbol()}{convert(referrer.earnings).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">earned</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            How It Works
          </h2>
          <GlassCard delay={0.3} className="p-5">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Share Your Link</p>
                  <p className="text-sm text-muted-foreground">Send your unique referral link to friends and family</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Friend Signs Up</p>
                  <p className="text-sm text-muted-foreground">Your friend creates an account using your referral link</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">30-Day Verification</p>
                  <p className="text-sm text-muted-foreground">After 30 days of your friend being active, rewards are unlocked</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Get Paid</p>
                  <p className="text-sm text-muted-foreground">Receive {getSymbol()}{rewardPerReferral} instantly credited to your wallet</p>
                </div>
              </div>
            </div>
            
            <div className="mt-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-200/80">
                  Referral rewards are paid on the first of each month for referrals that completed their 30-day verification period during the previous month.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            By participating, you agree to our{" "}
            <Link href="/privacy" data-testid="link-terms">
              <span className="text-primary hover:underline">Terms of Service</span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Referral;
