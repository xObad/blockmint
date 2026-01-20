/**
 * Storefront Balance - Account Balance & Recharge
 * 
 * This page allows users to:
 * - View their current balance
 * - Recharge balance via USDT (same deposit addresses as main app)
 * - View transaction history
 * 
 * Uses "Balance Recharge" terminology instead of "Crypto Deposit"
 * Same USDT wallet addresses from admin config
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  Wallet,
  QrCode,
  ExternalLink,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import type { User } from "firebase/auth";

interface StorefrontBalanceProps {
  user: User | null;
}

// Network options for USDT recharge
const usdtNetworks = [
  { id: "usdt-trc20", name: "Tron (TRC-20)", configKey: "wallet_usdt_trc20", fee: "~$1", time: "1-5 min" },
  { id: "usdt-erc20", name: "Ethereum (ERC-20)", configKey: "wallet_usdt_erc20", fee: "~$5-15", time: "2-10 min" },
  { id: "usdt-bsc", name: "BNB Chain (BEP-20)", configKey: "wallet_usdt_bsc", fee: "~$0.30", time: "1-3 min" },
  { id: "usdt-ton", name: "TON Network", configKey: "wallet_usdt_ton", fee: "~$0.01", time: "1-2 min" },
];

export function StorefrontBalance({ user }: StorefrontBalanceProps) {
  const [showRecharge, setShowRecharge] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(usdtNetworks[0]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ["/api/user", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const res = await fetch(`/api/user/firebase/${user.uid}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user?.uid,
  });

  // Fetch balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/user/balance", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return { balances: [] };
      const res = await fetch(`/api/wallet/balances/${userData.id}`);
      if (!res.ok) return { balances: [] };
      return res.json();
    },
    enabled: !!userData?.id,
  });

  // Fetch wallet addresses from admin config
  const { data: configData } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const res = await fetch("/api/admin/config");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Get deposit address for selected network
  const getDepositAddress = (configKey: string): string => {
    if (!configData) return "Loading...";
    const config = configData.find((c: any) => c.key === configKey);
    return config?.value || "Address not configured";
  };

  const depositAddress = getDepositAddress(selectedNetwork.configKey);

  // Calculate balances
  const usdtBalance = balanceData?.balances?.find((b: any) => b.symbol === "USDT")?.balance || 0;
  const usdcBalance = balanceData?.balances?.find((b: any) => b.symbol === "USDC")?.balance || 0;
  const totalBalance = usdtBalance + usdcBalance;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    toast({
      title: "Address Copied",
      description: "Deposit address copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Account Balance</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account funds
        </p>
      </motion.div>

      {/* Balance Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid lg:grid-cols-3 gap-4"
      >
        {/* Total Balance */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-3xl font-bold text-foreground">
                ${totalBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-muted-foreground mb-1">USDT Balance</p>
              <p className="text-lg font-semibold text-foreground">${usdtBalance.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-muted-foreground mb-1">USDC Balance</p>
              <p className="text-lg font-semibold text-foreground">${usdcBalance.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => setShowRecharge(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Recharge Balance
            </Button>
          </div>
        </GlassCard>

        {/* Quick Info */}
        <GlassCard className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Quick Info</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-muted-foreground">Instant processing</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-muted-foreground">Multiple networks supported</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-muted-foreground">Secure transactions</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-muted-foreground">Low network fees</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recharge Section */}
      <AnimatePresence>
        {showRecharge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Recharge via USDT</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecharge(false)}
                >
                  Cancel
                </Button>
              </div>

              {/* Network Selection */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Select Network
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {usdtNetworks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => setSelectedNetwork(network)}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        selectedNetwork.id === network.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium text-foreground text-sm">{network.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Fee: {network.fee}</p>
                      <p className="text-xs text-muted-foreground">{network.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Address */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Send USDT to this address ({selectedNetwork.name})
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-4 rounded-xl bg-white/5 border border-border font-mono text-sm break-all text-foreground">
                    {depositAddress}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyAddress}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Important Notice */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-400 mb-1">Important</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Only send USDT on the {selectedNetwork.name} network</li>
                      <li>• Minimum recharge: $10 USDT</li>
                      <li>• Your balance will be credited after network confirmation</li>
                      <li>• Processing time: {selectedNetwork.time}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Transaction History</h2>
        <GlassCard className="divide-y divide-border">
          <TransactionItem
            type="recharge"
            amount={100}
            status="completed"
            network="Tron (TRC-20)"
            date="Jan 18, 2026"
          />
          <TransactionItem
            type="usage"
            amount={-59.99}
            status="completed"
            network="Node Subscription"
            date="Jan 15, 2026"
          />
          <TransactionItem
            type="recharge"
            amount={200}
            status="completed"
            network="BNB Chain (BEP-20)"
            date="Jan 10, 2026"
          />
          <TransactionItem
            type="usage"
            amount={-29.99}
            status="completed"
            network="Node Subscription"
            date="Jan 1, 2026"
          />
        </GlassCard>
      </motion.div>
    </div>
  );
}

// Transaction Item Component
function TransactionItem({
  type,
  amount,
  status,
  network,
  date,
}: {
  type: "recharge" | "usage";
  amount: number;
  status: "completed" | "pending" | "failed";
  network: string;
  date: string;
}) {
  const isPositive = amount > 0;

  return (
    <div className="flex items-center gap-4 p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        isPositive ? 'bg-emerald-500/10' : 'bg-amber-500/10'
      }`}>
        {isPositive ? (
          <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
        ) : (
          <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">
          {type === "recharge" ? "Balance Recharge" : "Service Payment"}
        </p>
        <p className="text-xs text-muted-foreground">{network}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-foreground'}`}>
          {isPositive ? '+' : ''}{amount.toFixed(2)} USDT
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}

export default StorefrontBalance;
