import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { SiBitcoin, SiLitecoin, SiTether } from "react-icons/si";
import { cn } from "@/lib/utils";
import type { WalletBalance } from "@/lib/types";

interface CryptoCardProps {
  crypto: WalletBalance;
  index: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BTC: SiBitcoin,
  LTC: SiLitecoin,
  USDT: SiTether,
};

const USDCIcon = ({ className }: { className?: string }) => (
  <div className={cn("w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs", className)}>
    $
  </div>
);

const colorMap: Record<string, { gradient: string; icon: string; border: string }> = {
  BTC: {
    gradient: "from-amber-500/20 to-orange-500/10",
    icon: "text-amber-400",
    border: "border-amber-500/20",
  },
  LTC: {
    gradient: "from-blue-400/20 to-slate-400/10",
    icon: "text-blue-300",
    border: "border-blue-400/20",
  },
  USDT: {
    gradient: "from-emerald-500/20 to-green-500/10",
    icon: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  USDC: {
    gradient: "from-blue-500/20 to-indigo-500/10",
    icon: "text-blue-400",
    border: "border-blue-500/20",
  },
};

export function CryptoCard({ crypto, index }: CryptoCardProps) {
  const isUSDC = crypto.symbol === "USDC";
  const Icon = isUSDC ? USDCIcon : (iconMap[crypto.symbol] || SiBitcoin);
  const colors = colorMap[crypto.symbol] || colorMap.BTC;
  const isPositive = crypto.change24h >= 0;

  return (
    <motion.div
      data-testid={`crypto-card-${crypto.symbol.toLowerCase()}`}
      className={cn(
        "relative rounded-2xl p-4",
        "liquid-glass",
        "border",
        colors.border,
        "hover-elevate active-elevate-2"
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50 pointer-events-none" 
           style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))` }} />
      
      <div className="flex items-center gap-4 relative z-10">
        <div
          className={cn(
            "w-12 h-12 rounded-xl",
            "flex items-center justify-center",
            "bg-gradient-to-br",
            colors.gradient
          )}
        >
          {isUSDC ? (
            <USDCIcon />
          ) : (
            <Icon className={cn("w-6 h-6", colors.icon)} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{crypto.symbol}</h4>
            <span className="text-sm text-muted-foreground truncate">{crypto.name}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5" data-testid={`text-balance-${crypto.symbol.toLowerCase()}`}>
            {crypto.balance.toFixed(6)} {crypto.symbol}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-foreground" data-testid={`text-usd-value-${crypto.symbol.toLowerCase()}`}>
            ${crypto.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div
            className={cn(
              "flex items-center justify-end gap-1 text-sm mt-0.5",
              isPositive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span data-testid={`text-change-${crypto.symbol.toLowerCase()}`}>
              {isPositive ? "+" : ""}{crypto.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
