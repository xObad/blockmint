import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/firebase";
import { GlobalHeader } from "@/components/GlobalHeader";
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  Zap, 
  CheckCircle2,
  Calculator,
  Sparkles,
  ArrowRight,
  Wallet,
  Lock,
  Award,
  Timer,
  CalendarDays,
  Calendar,
  CalendarRange,
  HelpCircle,
  PiggyBank
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Crypto assets with their icons
const cryptoAssets = [
  { symbol: "USDT", name: "Tether", icon: "₮", color: "from-emerald-500 to-green-500", bgColor: "bg-emerald-500/20", textColor: "text-emerald-400" },
];

// APR Rates by duration - REAL FIXED APR
const aprRates = {
  daily: { rate: 17.90, label: "Daily", period: 1, icon: Timer },
  weekly: { rate: 18.00, label: "Weekly", period: 7, icon: CalendarDays },
  monthly: { rate: 18.25, label: "Monthly", period: 30, icon: Calendar },
  quarterly: { rate: 18.70, label: "Quarterly", period: 90, icon: CalendarRange },
  yearly: { rate: 19.25, label: "Yearly", period: 365, icon: CalendarRange },
};

// Trust badges for marketing
const trustBadges = [
  { icon: Shield, label: "100% Secure", description: "Bank-grade security", color: "text-emerald-400" },
  { icon: Lock, label: "Insured Funds", description: "Protected deposits", color: "text-blue-400" },
  { icon: Zap, label: "Instant Access", description: "Withdraw anytime", color: "text-amber-400" },
  { icon: Award, label: "19.25% APR", description: "Industry leading", color: "text-purple-400" },
];

// Partner logos (trust indicators) - well-known fund security services
const partnerLogos = [
  { name: "Ledger", icon: "🛡️" },
  { name: "Coinbase Custody", icon: "🔐" },
];

// FAQ items - Admin can override these from dashboard
const defaultFaqItems = [
  {
    question: "Why are your APR rates higher than Binance or other platforms?",
    answer: "Our competitive APR rates (up to 19.25%) are made possible through our optimized DeFi strategies, institutional-grade mining operations, and lower operational overhead. Unlike traditional platforms, we leverage advanced yield farming protocols, liquidity provision, and mining rewards to generate higher returns for our users while maintaining full security and transparency."
  },
  {
    question: "Is my investment safe? Can I withdraw anytime?",
    answer: "Absolutely! Your funds are 100% secure with bank-grade encryption and cold storage. Unlike traditional staking, we offer complete flexibility—you can withdraw your funds at any time with no penalties or lock-up periods. Your capital and earned interest are always accessible."
  },
  {
    question: "How are returns calculated and paid out?",
    answer: "Returns are calculated based on your selected plan duration. Daily plans earn 17.9% APR with payouts every 24 hours. Weekly plans earn 18.0% APR, monthly plans earn 18.25% APR, quarterly plans earn 18.70% APR, and yearly plans earn our maximum 19.25% APR. Interest is compounded and credited automatically to your wallet."
  },
  {
    question: "What cryptocurrencies can I invest?",
    answer: "We currently support Tether (USDT) for our investment platform. This provides a stable, predictable investment experience with no volatility risk, allowing you to focus on consistent returns with our competitive APR rates."
  },
  {
    question: "How does this differ from traditional staking?",
    answer: "Traditional staking often requires long lock-up periods and variable returns dependent on network conditions. Our yield platform offers fixed guaranteed APR rates with no lock-up requirements. You get the benefits of passive income with complete control over your assets—the best of both worlds."
  },
  {
    question: "What is the minimum investment amount?",
    answer: "The minimum investment for USDT is $100. There is no maximum limit—invest as much as you'd like to earn. All mining contracts are valid for 7 years from the purchase date."
  },
];

function TrustMarketingSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Main trust banner */}
      <GlassCard variant="strong" className="relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-28 h-28 pointer-events-none opacity-20">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-transparent blur-2xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10" />
        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-lg font-bold text-emerald-400">100% Secure & Protected</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Your assets are protected by industry-leading security protocols
          </p>
        </div>
      </GlassCard>

      {/* Trust badges grid */}
      <div className="grid grid-cols-2 gap-3">
        {trustBadges.map((badge, index) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <GlassCard className="p-3 text-center" variant="subtle" animate={false}>
              <badge.icon className={`w-6 h-6 mx-auto mb-1 ${badge.color}`} />
              <p className="text-xs font-medium text-foreground">{badge.label}</p>
              <p className="text-[10px] text-muted-foreground">{badge.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Partner logos */}
      <div className="flex items-center justify-center gap-4 py-3">
        <span className="text-xs text-muted-foreground">Secured by:</span>
        <div className="flex gap-4">
          {partnerLogos.map((partner) => (
            <div key={partner.name} className="flex items-center gap-1 text-muted-foreground">
              <span className="text-lg">{partner.icon}</span>
              <span className="text-xs hidden sm:inline">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function APRCalculator() {
  const { convert, getSymbol } = useCurrency();
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoAssets[0]);
  const [selectedDuration, setSelectedDuration] = useState<keyof typeof aprRates>("yearly"); // Default to annual (yearly)
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();

  // Fetch user's wallet balance
  const { data: wallets } = useQuery({
    queryKey: ["/api/wallets", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      const response = await fetch(`/api/users/${currentUser.uid}/wallets`);
      if (!response.ok) throw new Error("Failed to fetch wallets");
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Create earn subscription mutation
  const createSubscription = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Not authenticated");
      
      const response = await fetch("/api/earn/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          planId: "default", // You can map this to specific plan IDs
          amount: investmentAmount,
          symbol: selectedCrypto.symbol,
          durationType: selectedDuration,
          aprRate: aprRates[selectedDuration].rate,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create investment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Investment Created!",
        description: `Successfully invested ${getSymbol()}${convert(investmentAmount).toFixed(2)} in ${selectedCrypto.symbol}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Investment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartEarning = () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start investing.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has sufficient balance
    const wallet = wallets?.find((w: any) => w.symbol === selectedCrypto.symbol);
    if (!wallet || wallet.balance < investmentAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${getSymbol()}${convert(investmentAmount).toFixed(2)} in your ${selectedCrypto.symbol} wallet to invest.`,
        variant: "destructive",
      });
      return;
    }

    createSubscription.mutate();
  };

  // Fetch admin-configured APR rates
  const { data: adminRates } = useQuery<typeof aprRates>({
    queryKey: ["/api/earn-rates"],
    staleTime: 60000,
  });

  // Use admin rates if available, otherwise use defaults
  const currentRates = adminRates && Object.keys(adminRates).length > 0 ? adminRates : aprRates;

  const calculatedReturns = useMemo(() => {
    const rateData = currentRates[selectedDuration];
    const annualRate = rateData.rate / 100; // This is the annual rate (e.g., 18.25% for monthly)
    const period = rateData.period;
    
    // Calculate total return after the period using the annual rate
    // Total = Principal + (Principal * AnnualRate * (Days/365))
    const totalAfterPeriod = investmentAmount * (1 + (annualRate * period / 365));
    const periodReturn = totalAfterPeriod - investmentAmount;
    
    // Daily earning is the period return divided by the number of days
    const dailyEarning = periodReturn / period;
    
    return {
      periodReturn,
      annualReturn: investmentAmount * annualRate,
      total: totalAfterPeriod,
      dailyEarning,
    };
  }, [investmentAmount, selectedDuration, currentRates]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <GlassCard className="p-6" variant="strong">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Yield Calculator</h2>
            <p className="text-sm text-muted-foreground">Calculate your potential earnings</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Crypto Selection */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Select Asset</Label>
            <div className="flex gap-2 justify-center">
              {cryptoAssets.map((crypto) => (
                <button
                  key={crypto.symbol}
                  onClick={() => setSelectedCrypto(crypto)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    selectedCrypto.symbol === crypto.symbol
                      ? `${crypto.bgColor} border-current ${crypto.textColor}`
                      : "border-border hover:border-muted-foreground"
                  }`}
                  data-testid={`btn-crypto-${crypto.symbol.toLowerCase()}`}
                >
                  <span className={`font-bold ${selectedCrypto.symbol === crypto.symbol ? crypto.textColor : "text-foreground"}`}>
                    {crypto.icon}
                  </span>
                  <span className="text-sm font-medium">{crypto.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Investment Duration</Label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(aprRates).map(([key, value]) => {
                const DurationIcon = value.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDuration(key as keyof typeof aprRates)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                      selectedDuration === key
                        ? "border-primary text-primary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    data-testid={`btn-duration-${key}`}
                  >
                    <DurationIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{value.label}</span>
                    <span className={`text-[10px] ${selectedDuration === key ? "text-primary" : "text-muted-foreground"}`}>
                      {value.rate}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Investment Amount Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm text-muted-foreground">Investment Amount</Label>
              <span className={`text-2xl font-bold ${selectedCrypto.textColor}`} data-testid="text-investment-amount">
                {getSymbol()}{convert(investmentAmount).toLocaleString()}
              </span>
            </div>
            <Slider
              value={[investmentAmount]}
              onValueChange={(v) => setInvestmentAmount(v[0])}
              min={50}
              max={100000}
              step={50}
              className="py-2"
              data-testid="slider-investment"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{getSymbol()}50</span>
              <span>{getSymbol()}100,000</span>
            </div>
          </div>

          {/* Results Display */}
          <div className="p-5 rounded-xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">APR Rate</span>
              <span className={`text-2xl font-bold bg-gradient-to-r ${selectedCrypto.color} bg-clip-text text-transparent`} data-testid="text-apr-rate">
                {aprRates[selectedDuration].rate}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Daily Earnings</span>
                <p className="text-lg font-bold text-emerald-400" data-testid="text-daily-earnings">
                  +{getSymbol()}{convert(calculatedReturns.dailyEarning).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">{aprRates[selectedDuration].label} Return</span>
                <p className="text-lg font-bold text-emerald-400" data-testid="text-period-return">
                  +{getSymbol()}{convert(calculatedReturns.periodReturn).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-4">
              <span className="text-xs text-muted-foreground block mb-1">Total After {aprRates[selectedDuration].label} Period</span>
              <p className={`text-3xl font-bold bg-gradient-to-r ${selectedCrypto.color} bg-clip-text text-transparent`} data-testid="text-total-return">
                {getSymbol()}{convert(calculatedReturns.total).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Investment Protection Disclaimer */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-400 leading-relaxed">
                <strong>Investment Protection:</strong> Your initial investment is fully returned after the period ends. 
                Unlike cloud mining, this works like bank deposits or stock yields - you keep your principal and earn returns on top.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={handleStartEarning}
            disabled={createSubscription.isPending}
            className={`w-full bg-gradient-to-r ${selectedCrypto.color} text-white border-0 h-12 text-base`}
            size="lg"
            data-testid="btn-start-earning"
          >
            {createSubscription.isPending ? "Processing..." : `Start Earning with ${selectedCrypto.symbol}`}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 inline mr-1" />
            Withdraw your funds anytime with no penalties
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function CryptoYieldCard({ crypto, index }: { crypto: typeof cryptoAssets[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <GlassCard 
        className="relative overflow-hidden" 
        animate={false}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${crypto.color} opacity-5`} />
        
        <div className="relative p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${crypto.bgColor} flex items-center justify-center`}>
                <span className={`text-2xl font-bold ${crypto.textColor}`}>{crypto.icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{crypto.name}</h3>
                <span className="text-sm text-muted-foreground">{crypto.symbol}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${crypto.bgColor} ${crypto.textColor} border-0`}>
                <Sparkles className="w-3 h-3 mr-1" />
                Up to 19.25% APR
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {Object.entries(aprRates).slice(0, 4).map(([key, value]) => (
              <div key={key} className="text-center p-2">
                <span className="text-[10px] text-muted-foreground block">{value.label}</span>
                <span className={`text-sm font-bold ${crypto.textColor}`}>{value.rate}%</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>No lock-up • Instant withdrawals</span>
            </div>
            <Button 
              size="sm"
              className={`bg-gradient-to-r ${crypto.color} text-white border-0`}
              data-testid={`btn-invest-${crypto.symbol.toLowerCase()}`}
            >
              Invest
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function ActiveInvestments() {
  const { convert, getSymbol } = useCurrency();
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's active earn subscriptions
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["/api/users/earn-subscriptions", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      const response = await fetch(`/api/users/${currentUser.uid}/earn-subscriptions`);
      if (!response.ok) throw new Error("Failed to fetch investments");
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await fetch(`/api/earn/withdraw/${subscriptionId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to withdraw");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/earn-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({
        title: "Withdrawal Successful",
        description: "Funds have been returned to your wallet.",
      });
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description: "Unable to process withdrawal.",
        variant: "destructive",
      });
    },
  });

  const activeInvestments = subscriptions?.filter((s: any) => s.status === "active") || [];

  if (isLoading || activeInvestments.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-foreground">Your Active Investments</h2>
      </div>

      {activeInvestments.map((sub: any, index: number) => {
        const crypto = cryptoAssets.find(c => c.symbol === sub.symbol) || cryptoAssets[0];
        const dailyReturn = (sub.amount * (sub.aprRate / 100)) / 365;
        const annualReturn = sub.amount * (sub.aprRate / 100);
        
        return (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <GlassCard className="p-4" animate={false}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${crypto.bgColor} flex items-center justify-center`}>
                    <span className={`text-xl font-bold ${crypto.textColor}`}>{crypto.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{crypto.name}</h3>
                    <span className="text-xs text-muted-foreground capitalize">{sub.durationType} Plan</span>
                  </div>
                </div>
                <Badge className={`${crypto.bgColor} ${crypto.textColor} border-0`}>
                  {sub.aprRate}% APR
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Investment</span>
                  <p className="text-sm font-bold text-foreground">
                    {getSymbol()}{convert(sub.amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Daily Return</span>
                  <p className="text-sm font-bold text-emerald-400">
                    +{getSymbol()}{convert(dailyReturn).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Annual Return</span>
                  <p className="text-sm font-bold text-emerald-400">
                    +{getSymbol()}{convert(annualReturn).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Total Earned</span>
                  <p className="text-sm font-bold text-emerald-400">
                    +{getSymbol()}{convert(sub.totalEarned || 0).toFixed(2)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => withdrawMutation.mutate(sub.id)}
                  disabled={withdrawMutation.isPending}
                  className="text-xs"
                >
                  {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function FAQSection() {
  // Fetch admin-configured FAQs if available
  const { data: adminFaqs } = useQuery<Array<{ question: string; answer: string }>>({
    queryKey: ["/api/content/earn-faqs"],
    staleTime: 60000,
  });

  const faqItems: Array<{ question: string; answer: string }> =
    adminFaqs && adminFaqs.length > 0 ? adminFaqs : defaultFaqItems;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {faqItems.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="border border-border/50 rounded-lg px-4"
          >
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4 text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-4 text-left">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}

interface InvestProps {
  onNavigateToHome?: () => void;
  onNavigateToWallet?: () => void;
  onNavigateToInvest?: () => void;
  onOpenSettings?: () => void;
}

export function Invest({ onNavigateToHome, onNavigateToWallet, onNavigateToInvest, onOpenSettings }: InvestProps = {}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6 pb-6"
        data-testid="page-invest"
      >
      {/* Header */}
      <motion.div 
        className="text-center py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <PiggyBank className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Earn & Yield</h1>
        </div>
        
        <motion.div
          className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 bg-clip-text text-transparent mb-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          data-testid="text-headline-apr"
        >
          Up to 19.25% APR
        </motion.div>
        
        <p className="text-muted-foreground mb-4">
          Fixed returns • Withdraw anytime • Guaranteed profits
        </p>
        
        <div className="flex items-center justify-center gap-3">
          <Badge 
            variant="outline" 
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-3 py-1"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            No Lock-up Period
          </Badge>
          <Badge 
            variant="outline" 
            className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-3 py-1"
          >
            <Zap className="w-3 h-3 mr-1" />
            Instant Withdrawals
          </Badge>
        </div>
      </motion.div>

      {/* Trust & Marketing Section */}
      <TrustMarketingSection />

      {/* Active Investments */}
      <ActiveInvestments />

      {/* APR Calculator Card */}
      <APRCalculator />

      {/* Key Features */}
      <GlassCard className="p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Why Choose Our Yield Platform?
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Fully Insured</p>
              <p className="text-xs text-muted-foreground">Assets protected 100%</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Cold Storage</p>
              <p className="text-xs text-muted-foreground">Enterprise security</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Flexible Terms</p>
              <p className="text-xs text-muted-foreground">No lock-up required</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Fixed APR</p>
              <p className="text-xs text-muted-foreground">Guaranteed returns</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* FAQ Section */}
      <FAQSection />

      {/* Bottom CTA */}
      <GlassCard className="p-6 text-center" variant="strong">
        <h3 className="text-lg font-bold text-foreground mb-2">Ready to Start Earning?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Join thousands of users earning passive income with our industry-leading APR rates.
        </p>
        <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
          <Wallet className="w-5 h-5 mr-2" />
          Deposit & Earn Now
        </Button>
      </GlassCard>
      </motion.div>
    </>
  );
}
