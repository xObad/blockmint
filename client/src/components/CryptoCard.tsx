import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRef } from "react";
import type { WalletBalance } from "@/lib/types";

import btcLogo from "@assets/bitcoin-sign-3d-icon-png-download-4466132_1766014388601.png";
import ltcLogo from "@assets/litecoin-3d-icon-png-download-4466121_1766014388608.png";
import ethLogo from "@assets/ethereum-eth-3d-logo.png";
import zcashLogo from "@assets/zcash-zec-3d-logo.png";
import tonLogo from "@assets/ton-coin-3d-logo.png";
import bnbLogo from "@assets/bnb-binance-3d-logo.png";
import usdtLogo from "@assets/tether-usdt-coin-3d-icon-png-download-3478983@0_1766038564971.webp";
import usdcLogo from "@assets/usd-coin-3d-icon-png-download-4102016_1766038596188.webp";

interface CryptoCardProps {
  crypto: WalletBalance;
  index: number;
  onExchange?: (symbol: string) => void;
}

const logoMap: Record<string, string> = {
  BTC: btcLogo,
  LTC: ltcLogo,
  ETH: ethLogo,
  ZCASH: zcashLogo,
  TON: tonLogo,
  BNB: bnbLogo,
  USDT: usdtLogo,
  USDC: usdcLogo,
};

// iOS 26.2 style crypto-specific glass theming
const glassTheme: Record<string, { glow: string; accent: string; highlight: string }> = {
  BTC: {
    glow: "rgba(247, 147, 26, 0.15)",
    accent: "rgba(247, 147, 26, 0.25)",
    highlight: "rgba(247, 147, 26, 0.12)",
  },
  LTC: {
    glow: "rgba(52, 93, 157, 0.18)",
    accent: "rgba(52, 93, 157, 0.28)",
    highlight: "rgba(52, 93, 157, 0.12)",
  },
  USDT: {
    glow: "rgba(16, 185, 129, 0.15)",
    accent: "rgba(16, 185, 129, 0.25)",
    highlight: "rgba(16, 185, 129, 0.12)",
  },
  USDC: {
    glow: "rgba(59, 130, 246, 0.15)",
    accent: "rgba(59, 130, 246, 0.25)",
    highlight: "rgba(59, 130, 246, 0.12)",
  },
  ETH: {
    glow: "rgba(139, 92, 246, 0.15)",
    accent: "rgba(139, 92, 246, 0.25)",
    highlight: "rgba(139, 92, 246, 0.12)",
  },
};

// iOS 26.2 fluid spring configuration
const springConfig = { stiffness: 300, damping: 25, mass: 0.8 };

export function CryptoCard({ crypto, index, onExchange }: CryptoCardProps) {
  const { format } = useCurrency();
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = glassTheme[crypto.symbol] || glassTheme.BTC;
  const logo = logoMap[crypto.symbol] || btcLogo;
  const isPositive = crypto.change24h >= 0;

  // iOS 26.2 parallax motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  const handleMouseEnter = () => scale.set(1.02);
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={cardRef}
      data-testid={`crypto-card-${crypto.symbol.toLowerCase()}`}
      className={cn(
        "relative rounded-3xl p-4 overflow-hidden cursor-pointer",
        "liquid-glass"
      )}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 2px 8px rgba(0, 0, 0, 0.25),
          0 0 0 0.5px rgba(255, 255, 255, 0.1),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
          0 0 60px ${theme.glow}
        `,
        borderTopColor: theme.accent,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ 
        delay: index * 0.08, 
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* iOS 26.2 crypto-themed specular highlight */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none z-0"
        style={{
          background: `
            linear-gradient(135deg, ${theme.highlight} 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.glow} 0%, transparent 50%)
          `,
        }}
      />
      
      {/* iOS 26.2 inner light refraction */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none z-0 opacity-60"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(255,255,255,0.03) 0%, transparent 50%)",
        }}
      />
      
      <div className="flex items-center gap-4 relative z-10">
        <motion.div
          className="relative"
          animate={{ 
            y: [0, -3, 0],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <img 
            src={logo} 
            alt={crypto.symbol}
            className="w-12 h-12 object-contain drop-shadow-lg"
          />
          {/* Glow under logo */}
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-40 -z-10"
            style={{ background: theme.glow }}
          />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground text-base">{crypto.symbol}</h4>
            <span className="text-sm text-muted-foreground truncate">{crypto.name}</span>
          </div>
          <p className="text-sm text-muted-foreground/80 mt-0.5 font-mono" data-testid={`text-balance-${crypto.symbol.toLowerCase()}`}>
            {crypto.balance.toFixed(6)} {crypto.symbol}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-foreground text-lg" data-testid={`text-usd-value-${crypto.symbol.toLowerCase()}`}>
            {format(crypto.usdValue)}
          </p>
          <motion.div
            className={cn(
              "flex items-center justify-end gap-1 text-sm mt-0.5 font-medium",
              isPositive ? "text-emerald-400" : "text-red-400"
            )}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 + 0.2 }}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span data-testid={`text-change-${crypto.symbol.toLowerCase()}`}>
              {isPositive ? "+" : ""}{crypto.change24h.toFixed(2)}%
            </span>
          </motion.div>
        </div>
      </div>

      {onExchange && (
        <motion.div 
          className="flex gap-2 mt-3 relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 + 0.3 }}
        >
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "flex-1 text-xs gap-1.5 h-9 rounded-xl",
              "bg-white/[0.06] hover:bg-white/[0.12]",
              "border border-white/[0.1] hover:border-white/[0.2]",
              "backdrop-blur-lg",
              "transition-all duration-200"
            )}
            onClick={() => onExchange?.(crypto.symbol)}
            data-testid={`button-exchange-${crypto.symbol.toLowerCase()}`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Exchange
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
