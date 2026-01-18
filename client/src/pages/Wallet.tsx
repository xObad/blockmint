import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Copy, Check, AlertCircle, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Info, Loader2, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { CryptoCard } from "@/components/CryptoCard";
import { TransactionItem } from "@/components/TransactionItem";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { auth } from "@/lib/firebase";
import type { WalletBalance, Transaction } from "@/lib/types";
import btcLogo from "@assets/bitcoin-sign-3d-icon-png-download-4466132_1766014388601.png";
import ltcLogo from "@assets/litecoin-3d-icon-png-download-4466121_1766014388608.png";
import ethLogo from "@assets/ethereum-eth-3d-logo.png";
import zcashLogo from "@assets/zcash-zec-3d-logo.png";
import tonLogo from "@assets/ton-coin-3d-logo.png";
import bnbLogo from "@assets/bnb-binance-3d-logo.png";
import usdtLogo from "@assets/tether-usdt-coin-3d-icon-png-download-3478983@0_1766038564971.webp";
import usdcLogo from "@assets/usd-coin-usdc-logo_1766038726866.png";

type CryptoType = "USDT" | "USDC" | "BTC" | "LTC" | "ETH" | "ZCASH" | "TON" | "BNB";

interface NetworkOption {
  id: string;
  name: string;
  fee: number;
  estimatedTime: string;
}

const cryptoNetworks: Record<CryptoType, NetworkOption[]> = {
  USDT: [
    { id: "usdt-trc20", name: "Tron (TRC-20)", fee: 1, estimatedTime: "1-3 min" },
    { id: "usdt-erc20", name: "Ethereum (ERC-20)", fee: 5, estimatedTime: "5-15 min" },
    { id: "usdt-bsc", name: "BNB Smart Chain (BSC/BEP-20)", fee: 0.5, estimatedTime: "1-3 min" },
    { id: "usdt-ton", name: "TON Network", fee: 0.5, estimatedTime: "1-2 min" },
  ],
  USDC: [
    { id: "usdc-erc20", name: "Ethereum (ERC-20)", fee: 5, estimatedTime: "5-15 min" },
    { id: "usdc-bsc", name: "BNB Smart Chain (BSC/BEP-20)", fee: 0.5, estimatedTime: "1-3 min" },
    { id: "usdc-ton", name: "TON Network", fee: 0.5, estimatedTime: "1-2 min" },
  ],
  BTC: [
    { id: "btc-native", name: "Bitcoin (Native)", fee: 0.0001, estimatedTime: "30-60 min" },
  ],
  LTC: [
    { id: "ltc-native", name: "Litecoin (Native)", fee: 0.001, estimatedTime: "5-10 min" },
  ],
  ETH: [
    { id: "eth-erc20", name: "Ethereum (ERC-20)", fee: 0.005, estimatedTime: "5-15 min" },
    { id: "eth-arbitrum", name: "Arbitrum", fee: 0.0005, estimatedTime: "1-5 min" },
    { id: "eth-optimism", name: "Optimism", fee: 0.0005, estimatedTime: "1-5 min" },
  ],
  ZCASH: [
    { id: "zcash-native", name: "Zcash (Native)", fee: 0.0001, estimatedTime: "5-10 min" },
  ],
  TON: [
    { id: "ton-native", name: "TON Network", fee: 0.01, estimatedTime: "1-2 min" },
  ],
  BNB: [
    { id: "bnb-bsc", name: "BNB Smart Chain (BSC)", fee: 0.0005, estimatedTime: "1-3 min" },
    { id: "bnb-bep2", name: "BNB Beacon Chain (BEP-2)", fee: 0.001, estimatedTime: "1-2 min" },
  ],
};

const generateDepositAddress = (crypto: CryptoType, network: string): string => {
  // Placeholder - actual addresses will be fetched from database
  return "Loading...";
};

// Wallet address mapping from network to config key
const networkToConfigKey: Record<string, string> = {
  "usdt-trc20": "wallet_usdt_trc20",
  "usdt-erc20": "wallet_usdt_erc20",
  "usdt-bsc": "wallet_usdt_bsc",
  "usdt-ton": "wallet_usdt_ton",
  "usdc-erc20": "wallet_usdc_erc20",
  "usdc-bsc": "wallet_usdc_bsc",
  "usdc-ton": "wallet_usdc_ton",
  "btc-native": "wallet_btc_native",
  "ltc-native": "wallet_ltc_native",
  "eth-erc20": "wallet_eth_erc20",
  "eth-arbitrum": "wallet_eth_arbitrum",
  "eth-optimism": "wallet_eth_optimism",
  "zcash-native": "wallet_zcash_native",
  "ton-native": "wallet_ton_native",
  "bnb-bsc": "wallet_bnb_bsc",
  "bnb-bep2": "wallet_bnb_bep2",
};

const cryptoConfig: Record<CryptoType, { name: string; color: string; iconBg: string }> = {
  USDT: { name: "Tether", color: "text-emerald-400", iconBg: "bg-emerald-500/20" },
  USDC: { name: "USD Coin", color: "text-blue-400", iconBg: "bg-blue-500/20" },
  BTC: { name: "Bitcoin", color: "text-amber-400", iconBg: "bg-amber-500/20" },
  LTC: { name: "Litecoin", color: "text-blue-300", iconBg: "bg-blue-400/20" },
  ETH: { name: "Ethereum", color: "text-purple-400", iconBg: "bg-purple-500/20" },
  ZCASH: { name: "Zcash", color: "text-amber-400", iconBg: "bg-amber-500/20" },
  TON: { name: "Toncoin", color: "text-cyan-400", iconBg: "bg-cyan-500/20" },
  BNB: { name: "BNB", color: "text-yellow-400", iconBg: "bg-yellow-500/20" },
};

const defaultBalances: WalletBalance[] = [
  { id: "btc", symbol: "BTC", name: "Bitcoin", balance: 0, usdValue: 0, change24h: 2.34, icon: "bitcoin" },
  { id: "ltc", symbol: "LTC", name: "Litecoin", balance: 0, usdValue: 0, change24h: -1.23, icon: "litecoin" },
  { id: "usdt", symbol: "USDT", name: "Tether", balance: 0, usdValue: 0, change24h: 0.01, icon: "tether" },
  { id: "usdc", symbol: "USDC", name: "USD Coin", balance: 0, usdValue: 0, change24h: 0.02, icon: "usdc" },
];

interface WalletProps {
  balances?: WalletBalance[];
  transactions: Transaction[];
  totalBalance?: number;
  change24h?: number;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToWallet?: () => void;
  onNavigateToInvest?: () => void;
  onOpenSettings?: () => void;
}

export function Wallet({ 
  balances = defaultBalances, 
  transactions, 
  totalBalance, 
  change24h = 0,
  onOpenDeposit,
  onOpenWithdraw,
  onNavigateToHome,
  onNavigateToWallet,
  onNavigateToInvest,
  onOpenSettings
}: WalletProps) {
  const { convert, getSymbol } = useCurrency();
  const { toast } = useToast();
  const { prices: cryptoPricesData } = useCryptoPrices();
  
  // Create cryptoPrices object early so it can be used in calculations
  const cryptoPrices: Record<string, number> = {
    BTC: cryptoPricesData.BTC?.price || 67000,
    LTC: cryptoPricesData.LTC?.price || 85,
    ETH: cryptoPricesData.ETH?.price || 3500,
    USDT: cryptoPricesData.USDT?.price || 1,
    USDC: cryptoPricesData.USDC?.price || 1,
    TON: cryptoPricesData.TON?.price || 5.5,
    ZCASH: cryptoPricesData.ZCASH?.price || 30,
    BNB: cryptoPricesData.BNB?.price || 600,
  };
  
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [depositAddress, setDepositAddress] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  const [showDepositQR, setShowDepositQR] = useState(false);

  const queryClient = useQueryClient();

  // Fetch wallet addresses from database
  const { data: walletAddresses } = useQuery<{ map: Record<string, string>; entries?: any[] } | Record<string, string>>({
    queryKey: ["wallet-addresses"],
    queryFn: async () => {
      const res = await fetch("/api/config/wallets/all");
      if (!res.ok) return { map: {}, entries: [] };
      const data = await res.json();
      if (data?.map || data?.entries) return data;
      return { map: data, entries: [] };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Update deposit address when crypto/network changes
  useEffect(() => {
    if (selectedNetwork && walletAddresses) {
      const configKey = networkToConfigKey[selectedNetwork];
      const walletMap = (walletAddresses as any)?.map || walletAddresses;
      const address = walletMap[configKey] || "Address not configured - contact support";
      setDepositAddress(address);
    }
  }, [selectedNetwork, walletAddresses]);

  // Get user ID (from database)
  const userStr = typeof localStorage !== 'undefined' ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.dbId || user?.id || user?.uid;
  
  console.log("Wallet user check:", { userStr: !!userStr, user: !!user, userId });

  // Fetch pending deposits
  const { data: pendingDeposits } = useQuery({
    queryKey: ["pending-deposits", userId],
    queryFn: async () => {
      if (!userId) return { requests: [], totals: {} };
      const res = await fetch(`/api/deposits/pending/${userId}`);
      if (!res.ok) return { requests: [], totals: {} };
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate total pending value
  const pendingTotal = Object.entries(pendingDeposits?.totals || {}).reduce((sum, [currency, amount]) => {
    const price = cryptoPrices[currency] ?? 0;
    return sum + (amount as number) * price;
  }, 0);

  // Submit deposit request mutation
  const submitDepositMutation = useMutation({
    mutationFn: async (data: { amount: string; currency: string; network: string; walletAddress: string }) => {
      // Recheck userId at submission time
      const currentUserStr = localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      // Fallback to Firebase auth instance if localStorage is missing/stale
      const currentUserId = currentUser?.dbId || currentUser?.id || currentUser?.uid || auth?.currentUser?.uid;
      
      console.log("Submitting deposit:", { currentUser, currentUserId, data });
      
      if (!currentUserId) {
        console.error("Deposit submission: No userId found in localStorage or Auth state:", { currentUserStr, currentUser, authUser: auth?.currentUser?.uid });
        throw new Error("Authentication error. Please log out and log in again.");
      }

      // Get Firebase ID token for authorization
      const idToken = auth?.currentUser ? await auth.currentUser.getIdToken() : null;

      console.log("Submitting deposit request:", { userId: currentUserId, ...data });
      const res = await fetch("/api/deposits/request", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(idToken && { "Authorization": `Bearer ${idToken}` })
        },
        body: JSON.stringify({
          userId: currentUserId,
          amount: data.amount,
          currency: data.currency,
          network: data.network,
          walletAddress: data.walletAddress,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        console.error("Deposit submission failed:", error);
        throw new Error(error.error || "Failed to submit deposit request");
      }
      const result = await res.json();
      console.log("Deposit submission success:", result);
      return result;
    },
    onSuccess: () => {
      setDepositSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["pending-deposits"] });
      toast({
        title: "Deposit Request Submitted!",
        description: "We'll confirm your deposit once we verify the transaction. This usually takes 10-30 minutes.",
      });
    },
    onError: (error) => {
      console.error("Deposit mutation error:", error);
      toast({
        title: "Failed to Submit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Enter Amount",
        description: "Please enter the amount you deposited.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate USD value and check minimum deposit of $20
    const amount = parseFloat(depositAmount);
    const price = cryptoPrices[selectedCrypto] || 0;
    
    // Only validate if price is loaded (not 0)
    if (price > 0) {
      const usdValue = amount * price;
      
      if (usdValue < 20) {
        const minAmount = (20 / price).toFixed(8);
        toast({
          title: "Minimum Deposit Not Met",
          description: `Minimum deposit is $20. Please deposit at least ${minAmount} ${selectedCrypto} (${getSymbol()}${convert(20).toFixed(2)}).`,
          variant: "destructive",
        });
        return;
      }
    }
    
    submitDepositMutation.mutate({
      amount: depositAmount,
      currency: selectedCrypto,
      network: selectedNetwork,
      walletAddress: depositAddress,
    });
  };

  const pricedBalances = useMemo(() => {
    // Ensure all required currencies are shown even with 0 balance - ORDER: USDT, BTC, LTC, ETH
    const requiredAssets = ["USDT", "BTC", "LTC", "ETH"];
    
    // Create map of existing balances (case-insensitive key)
    const balanceMap = new Map(balances.map(b => [b.symbol.toUpperCase(), b]));
    
    // Merge with required assets - maintains order from requiredAssets array
    const mergedBalances = requiredAssets.map(symbol => {
      const existing = balanceMap.get(symbol.toUpperCase());
      if (existing) return { ...existing, symbol: symbol.toUpperCase() }; // Normalize symbol to uppercase
      
      return {
         id: `zero-${symbol}`, 
         symbol, 
         name: cryptoConfig[symbol as CryptoType]?.name || symbol, 
         balance: 0, 
         usdValue: 0, 
         change24h: 0 
      } as WalletBalance;
    });

    return mergedBalances.map((balance) => {
      const symbol = balance.symbol as CryptoType;
      const price = cryptoPrices[symbol] ?? 0;
      const usdValue = (balance.balance ?? 0) * price;
      // Use price change if balance change is not available or 0
      const change24h = cryptoPricesData[symbol]?.change24h ?? balance.change24h ?? 0;

      return {
        ...balance,
        usdValue,
        change24h,
      };
    });
  }, [balances, cryptoPrices, cryptoPricesData]);

  const orderedBalances = useMemo(() => {
    const assetPriority: Record<string, number> = { USDT: 0, BTC: 1, LTC: 2, ETH: 3 };
    
    // pricedBalances now already contains exactly the assets we want (merged and filtered)
    return [...pricedBalances].sort((a, b) => {
      const aPri = assetPriority[a.symbol] ?? 999;
      const bPri = assetPriority[b.symbol] ?? 999;
      if (aPri !== bPri) return aPri - bPri;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [pricedBalances]);

  const calculatedTotalBalance = pricedBalances.length > 0
    ? pricedBalances.reduce((sum, b) => sum + (b.usdValue ?? 0), 0)
    : (totalBalance ?? 0);

  const convertedBalance = convert(calculatedTotalBalance);
  const isPositive = change24h >= 0;
  const hasNoBalance = calculatedTotalBalance === 0;

  const handleCryptoChange = (crypto: CryptoType) => {
    setSelectedCrypto(crypto);
    const networks = cryptoNetworks[crypto];
    if (networks && networks.length > 0) {
      setSelectedNetwork(networks[0].id);
      // Address will be set by useEffect watching selectedNetwork
    }
    // Reset deposit submitted state when changing crypto
    setDepositSubmitted(false);
  };

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    // Address will be set by useEffect watching selectedNetwork
    setDepositSubmitted(false);
  };

  const copyAddress = async () => {
    if (depositAddress) {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSelectedNetworkFee = () => {
    const network = cryptoNetworks[selectedCrypto]?.find(n => n.id === selectedNetwork);
    return network?.fee || 0;
  };

  const getSelectedNetworkTime = () => {
    const network = cryptoNetworks[selectedCrypto]?.find(n => n.id === selectedNetwork);
    return network?.estimatedTime || "Unknown";
  };

  const getWithdrawReceiveAmount = () => {
    const amount = parseFloat(withdrawAmount) || 0;
    const fee = getSelectedNetworkFee();
    const receive = amount - fee;
    return receive > 0 ? receive.toFixed(8) : "0.00000000";
  };

  const getCurrentBalance = (crypto: CryptoType) => {
    return balances.find(b => b.symbol === crypto)?.balance || 0;
  };

  const logoMap: Record<string, string> = {
    USDT: usdtLogo,
    USDC: usdcLogo,
    BTC: btcLogo,
    LTC: ltcLogo,
    ETH: ethLogo,
    ZCASH: zcashLogo,
    TON: tonLogo,
    BNB: bnbLogo,
  };

  const openDepositModal = (crypto?: string) => {
    const cryptoType = (crypto as CryptoType) || "USDT";
    setSelectedCrypto(cryptoType);
    const networks = cryptoNetworks[cryptoType];
    if (networks && networks.length > 0) {
      setSelectedNetwork(networks[0].id);
    }
    // Reset deposit state
    setDepositAmount("");
    setDepositSubmitted(false);
    setShowDepositQR(false);
    setDepositOpen(true);
  };

  const openWithdrawModal = (crypto?: string) => {
    const cryptoType = (crypto as CryptoType) || "BTC";
    setSelectedCrypto(cryptoType);
    const networks = cryptoNetworks[cryptoType];
    if (networks && networks.length > 0) {
      setSelectedNetwork(networks[0].id);
    }
    setWithdrawAmount("");
    setWithdrawAddress("");
    setWithdrawOpen(true);
  };

  const handleWithdraw = async () => {
    const balance = getCurrentBalance(selectedCrypto);
    const amount = parseFloat(withdrawAmount);
    const fee = getSelectedNetworkFee();
    
    // Validate address first
    if (!withdrawAddress || withdrawAddress.trim().length === 0) {
      toast({
        title: "Address Required",
        description: "Please enter a withdrawal address.",
        variant: "destructive",
      });
      return;
    }
    
    if (amount <= 0 || isNaN(amount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if amount exceeds balance
    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedCrypto}. Your balance is ${balance.toFixed(8)} ${selectedCrypto}.`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if amount is greater than fee
    if (amount <= fee) {
      toast({
        title: "Amount Too Low",
        description: `Withdrawal amount must be greater than the network fee of ${fee} ${selectedCrypto}.`,
        variant: "destructive",
      });
      return;
    }

    // Check minimum $20 USD equivalent
    const price = cryptoPrices[selectedCrypto] || 0;
    const usdValue = amount * price;
    
    if (price > 0 && usdValue < 20) {
      const minAmount = (20 / price).toFixed(8);
      toast({
        title: "Minimum Withdrawal Not Met",
        description: `Minimum withdrawal is $20 USD. Please withdraw at least ${minAmount} ${selectedCrypto}.`,
        variant: "destructive",
      });
      return;
    }

    // Get userId
    const currentUserStr = localStorage.getItem("user");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    const currentUserId = currentUser?.dbId || currentUser?.id || currentUser?.uid;

    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit withdrawal request.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Submitting withdrawal:", {
        userId: currentUserId,
        symbol: selectedCrypto,
        network: selectedNetwork,
        amount: amount,
        toAddress: withdrawAddress,
      });

      // Submit withdrawal request to API
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          symbol: selectedCrypto,
          network: selectedNetwork,
          amount: amount,
          toAddress: withdrawAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Withdrawal error:", error);
        throw new Error(error.error || "Failed to submit withdrawal request");
      }

      const result = await response.json();
      console.log("Withdrawal success:", result);
      
      toast({
        title: "Withdrawal Submitted",
        description: `Your withdrawal of ${(amount - fee).toFixed(6)} ${selectedCrypto} is being processed.`,
      });
      
      setWithdrawOpen(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
      
      // Refresh balances
      queryClient.invalidateQueries({ queryKey: ["balances"] });
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    }
  };

  const CryptoIcon = ({ crypto, className }: { crypto: CryptoType; className?: string }) => {
    if (logoMap[crypto]) {
      return <img src={logoMap[crypto]} alt={crypto} className={cn("w-5 h-5 object-contain", className)} />;
    }
    return (
      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold", cryptoConfig[crypto].iconBg, cryptoConfig[crypto].color, className)}>
        {crypto.charAt(0)}
      </div>
    );
  };

  return (
    <>
      <motion.div
        className="flex flex-col gap-6 pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Multi-crypto portfolio</p>
        </motion.header>

      <GlassCard delay={0.1} className="relative overflow-visible">
        <div className="absolute -right-4 -top-4 w-28 h-28 pointer-events-none opacity-20">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-transparent blur-2xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-muted-foreground">Total Balance</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg text-muted-foreground">{getSymbol()}</span>
            <AnimatedCounter
              value={convertedBalance}
              decimals={2}
              className="text-3xl font-bold text-foreground tracking-tight"
              data-testid="text-total-balance"
            />
          </div>
          <div className={`flex items-center gap-2 mb-6 text-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            <span data-testid="text-balance-change">{isPositive ? "+" : ""}{change24h.toFixed(2)}%</span>
            <span className="text-muted-foreground">24H Change</span>
          </div>

          {/* Pending Deposits Display */}
          {pendingTotal > 0 && (
            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <div className="flex-1">
                <p className="text-xs text-amber-400 font-medium">Pending Deposits</p>
                <p className="text-sm text-amber-300">
                  {getSymbol()}{convert(pendingTotal).toFixed(2)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({Object.entries(pendingDeposits?.totals || {}).map(([c, a]) => `${a} ${c}`).join(", ")})
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <div className="flex gap-3">
              <Popover open={depositOpen} onOpenChange={setDepositOpen}>
                <PopoverTrigger asChild>
                  <Button
                    data-testid="button-wallet-deposit"
                    variant="secondary"
                    className="flex-1 liquid-glass border-0 bg-emerald-500/20"
                    onClick={() => openDepositModal()}
                  >
                    <ArrowDownToLine className="w-5 h-5 mr-2" />
                    Deposit
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="center"
                  sideOffset={10}
                  className="liquid-glass border-white/10 bg-background/95 backdrop-blur-xl w-[min(400px,calc(100vw-2rem))] max-h-[60vh] overflow-y-auto p-2 md:p-4"
                  data-testid="popover-wallet-deposit"
                >
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-foreground">Deposit Crypto</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Select a cryptocurrency and network to receive funds</p>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="deposit-crypto" className="text-xs">Cryptocurrency</Label>
                        <Select
                          value={selectedCrypto}
                          onValueChange={(value) => handleCryptoChange(value as CryptoType)}
                        >
                          <SelectTrigger 
                            id="deposit-crypto" 
                            className="liquid-glass border-white/10"
                            data-testid="select-deposit-crypto"
                          >
                            <SelectValue placeholder="Select crypto" />
                          </SelectTrigger>
                          <SelectContent className="liquid-glass border-white/10 bg-background/95 backdrop-blur-xl">
                            {(["USDT", "BTC", "ETH", "LTC"] as CryptoType[]).map((crypto) => (
                              <SelectItem key={crypto} value={crypto} data-testid={`option-deposit-crypto-${crypto.toLowerCase()}`}>
                                <div className="flex items-center gap-2">
                                  <CryptoIcon crypto={crypto} className="w-4 h-4" />
                                  <span>{cryptoConfig[crypto].name}</span>
                                  <span className="text-muted-foreground">({crypto})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="deposit-network" className="text-xs">Network</Label>
                        <Select
                          value={selectedNetwork}
                          onValueChange={handleNetworkChange}
                        >
                          <SelectTrigger 
                            id="deposit-network" 
                            className="liquid-glass border-white/10"
                            data-testid="select-deposit-network"
                          >
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent className="liquid-glass border-white/10 bg-background/95 backdrop-blur-xl">
                            {cryptoNetworks[selectedCrypto]?.map((network) => (
                              <SelectItem key={network.id} value={network.id} data-testid={`option-deposit-network-${network.id}`}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{network.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 md:space-y-2">
                        <Label className="text-xs">Your Deposit Address</Label>
                        <div className="liquid-glass rounded-xl p-2 md:p-3 border border-white/10">
                          <p 
                            className="text-[10px] md:text-xs font-mono break-all text-foreground mb-2"
                            data-testid="text-deposit-address"
                          >
                            {depositAddress || "Select network to generate address"}
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full liquid-glass border-0 h-8 text-xs"
                            onClick={copyAddress}
                            disabled={!depositAddress}
                            data-testid="button-copy-address"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3 h-3 mr-2 text-emerald-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-2" />
                                Copy Address
                              </>
                            )}
                          </Button>
                          
                          {/* QR Code */}
                          {depositAddress && depositAddress !== "Select network to generate address" && (
                            <div className="flex flex-col items-center gap-2 mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/10">
                              {!showDepositQR ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs h-8 border-white/10 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400"
                                  onClick={() => setShowDepositQR(true)}
                                  type="button"
                                >
                                  Show QR Code
                                </Button>
                              ) : (
                                <>
                                  <div className="relative group">
                                    <img
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(depositAddress)}&margin=8`}
                                      alt="Deposit QR Code"
                                      className="w-24 h-24 md:w-28 md:h-28 rounded-lg border-2 border-white/20 bg-white p-1 cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(depositAddress)}&margin=10`, '_blank')}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      <div className="bg-black/60 text-white text-[10px] md:text-xs px-2 py-1 rounded-full">
                                        Click to enlarge
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-[10px] md:text-xs text-center text-muted-foreground">
                                    Scan QR to deposit. Tap to enlarge.
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center justify-between text-[10px] md:text-xs">
                          <span className="text-muted-foreground">Estimated Arrival</span>
                          <span>{getSelectedNetworkTime()}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-xs">
                          <span className="text-muted-foreground">Minimum Deposit</span>
                          <span className="text-emerald-400">{getSymbol()}20.00 ({((20 / (cryptoPrices[selectedCrypto] || 1))).toFixed(8)} {selectedCrypto})</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2 md:p-3 rounded-lg border border-amber-500/20">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] md:text-xs text-amber-200/80">
                          Only send {selectedCrypto} via {cryptoNetworks[selectedCrypto]?.find(n => n.id === selectedNetwork)?.name || "selected network"} to this address. Sending via wrong network may result in permanent loss of funds.
                        </p>
                      </div>

                      {/* Deposit Amount and Confirmation */}
                      {!depositSubmitted ? (
                        <div className="space-y-2 md:space-y-3 pt-2 border-t border-white/10">
                          <div className="space-y-1 md:space-y-2">
                            <Label htmlFor="deposit-amount" className="text-xs">Amount Deposited</Label>
                            <Input
                              id="deposit-amount"
                              type="number"
                              step="any"
                              placeholder={`Enter ${selectedCrypto} amount`}
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              className="liquid-glass border-white/10 h-9 text-xs"
                              data-testid="input-deposit-amount"
                            />
                          </div>
                          <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-9 text-xs"
                            onClick={handleSubmitDeposit}
                            disabled={submitDepositMutation.isPending || !depositAmount || !depositAddress}
                            data-testid="button-confirm-deposit"
                          >
                            {submitDepositMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                I Have Completed My Deposit
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-emerald-400">Deposit Request Submitted!</p>
                              <p className="text-xs text-muted-foreground">We'll verify your transaction and credit your balance within 10-30 minutes.</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setDepositSubmitted(false);
                              setDepositAmount("");
                            }}
                          >
                            Submit Another Deposit
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <PopoverTrigger asChild>
                  <Button
                    data-testid="button-wallet-withdraw"
                    variant="secondary"
                    className="flex-1 liquid-glass border-0 bg-amber-500/20"
                    onClick={() => openWithdrawModal()}
                  >
                    <ArrowUpFromLine className="w-5 h-5 mr-2" />
                    Withdraw
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="center"
                  sideOffset={10}
                  className="liquid-glass border-white/10 bg-background/95 backdrop-blur-xl w-[min(400px,calc(100vw-2rem))] max-h-[60vh] overflow-y-auto p-2 md:p-4"
                  data-testid="popover-wallet-withdraw"
                >
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-foreground">Withdraw Crypto</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Transfer funds to your external wallet</p>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="withdraw-crypto" className="text-xs">Cryptocurrency</Label>
                        <Select
                          value={selectedCrypto}
                          onValueChange={(value) => setSelectedCrypto(value as CryptoType)}
                        >
                          <SelectTrigger 
                            id="withdraw-crypto" 
                            className="liquid-glass border-white/10"
                            data-testid="select-withdraw-crypto"
                          >
                            <SelectValue placeholder="Select crypto" />
                          </SelectTrigger>
                          <SelectContent className="liquid-glass border-white/10 bg-background/95 backdrop-blur-xl">
                            {(["USDT", "BTC", "ETH", "LTC"] as CryptoType[]).map((crypto) => (
                              <SelectItem key={crypto} value={crypto} data-testid={`option-withdraw-crypto-${crypto.toLowerCase()}`}>
                                <div className="flex items-center gap-2">
                                  <CryptoIcon crypto={crypto} className="w-4 h-4" />
                                  <span>{cryptoConfig[crypto].name}</span>
                                  <span className="text-muted-foreground">({crypto})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="withdraw-network" className="text-xs">Network</Label>
                        <Select
                          value={selectedNetwork}
                          onValueChange={setSelectedNetwork}
                        >
                          <SelectTrigger 
                            id="withdraw-network" 
                            className="liquid-glass border-white/10"
                            data-testid="select-withdraw-network"
                          >
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent className="liquid-glass border-white/10 bg-background/95 backdrop-blur-xl">
                            {cryptoNetworks[selectedCrypto]?.map((network) => (
                              <SelectItem key={network.id} value={network.id} data-testid={`option-withdraw-network-${network.id}`}>
                                <span>{network.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 md:space-y-2">
                        <Label htmlFor="withdraw-address" className="text-xs">Withdrawal Address</Label>
                        <div className="relative">
                          <Input
                            id="withdraw-address"
                            placeholder={`Enter ${selectedCrypto} address`}
                            value={withdrawAddress}
                            onChange={(e) => setWithdrawAddress(e.target.value)}
                            className="liquid-glass border-white/10 font-mono text-xs pr-16 h-9"
                            data-testid="input-withdraw-address"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-[10px]"
                            onClick={async () => {
                              try {
                                const text = await navigator.clipboard.readText();
                                setWithdrawAddress(text);
                                toast({
                                  title: "Pasted",
                                  description: "Address pasted from clipboard",
                                });
                              } catch (err) {
                                toast({
                                  title: "Error",
                                  description: "Failed to read clipboard",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Paste
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="withdraw-amount" className="text-xs">Amount</Label>
                          <button
                            type="button"
                            className="text-[10px] text-primary hover:text-primary/80 font-medium"
                            onClick={() => {
                              const balance = pricedBalances.find(b => b.symbol === selectedCrypto);
                              if (balance) {
                                setWithdrawAmount(balance.balance.toString());
                              }
                            }}
                          >
                            MAX
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            id="withdraw-amount"
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            step="0.00000001"
                            className="liquid-glass border-white/10 pr-16 h-9 text-xs"
                            data-testid="input-withdraw-amount"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {selectedCrypto}
                          </span>
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Available: {(pricedBalances.find(b => b.symbol === selectedCrypto)?.balance ?? 0).toFixed(8)} {selectedCrypto}
                        </p>
                      </div>

                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center justify-between text-[10px] md:text-xs">
                          <span className="text-muted-foreground">Network Fee</span>
                          <span>{getSelectedNetworkFee()} {selectedCrypto}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-xs">
                          <span className="text-muted-foreground">You Will Receive</span>
                          <span className="font-semibold">{getWithdrawReceiveAmount()} {selectedCrypto}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-xs">
                          <span className="text-muted-foreground">Estimated Time</span>
                          <span>{getSelectedNetworkTime()}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2 md:p-3 rounded-lg border border-amber-500/20">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] md:text-xs text-amber-200/80">
                          Double check the address and network before confirming. Transactions cannot be reversed.
                        </p>
                      </div>

                      <Button
                        onClick={handleWithdraw}
                        className="w-full liquid-glass border-0 bg-primary/20 hover:bg-primary/30 h-9 text-xs"
                        disabled={!withdrawAddress || !withdrawAmount || Number(withdrawAmount) <= 0}
                        data-testid="button-confirm-withdraw"
                      >
                        Confirm Withdrawal
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </GlassCard>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Assets</h2>
        <div className="flex flex-col gap-3">
          {orderedBalances.map((crypto, index) => (
            <CryptoCard 
              key={crypto.id} 
              crypto={crypto} 
              index={index}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <GlassCard delay={0.3} className="p-4">
          {transactions.length > 0 ? (
            transactions.map((tx, index) => (
              <TransactionItem key={tx.id} transaction={tx} index={index} />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Start mining or deposit funds to see activity
              </p>
            </div>
          )}
        </GlassCard>
      </div>
      </motion.div>
    </>
  );
}
