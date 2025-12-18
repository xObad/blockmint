import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { HashRateChart } from "@/components/HashRateChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wifi, Clock, Zap, TrendingUp, Server, AlertCircle } from "lucide-react";
import type { ChartDataPoint, MiningContract, PoolStatus } from "@/lib/types";

import serverMiningImg from "@assets/Server_Mining_1766014388610.png";
import btcMineImg from "@assets/Bitcoin_Mine_1766014388617.png";
import ltcMineImg from "@assets/Gemini_Generated_Image_1ri2av1ri2av1ri2_(1)_1766014388604.png";

interface MiningProps {
  chartData: ChartDataPoint[];
  onNavigateToInvest: () => void;
}

const mockContracts: MiningContract[] = [
  {
    id: "1",
    cryptoType: "BTC",
    hashrate: 125.5,
    hashrateUnit: "TH/s",
    daysRemaining: 45,
    totalDays: 90,
    earnedSoFar: 0.00234,
    dailyEarningRate: 0.000052,
    hourlyEarningRate: 0.0000022,
    startDate: new Date("2024-11-01"),
    status: "active",
  },
  {
    id: "2",
    cryptoType: "LTC",
    hashrate: 850,
    hashrateUnit: "MH/s",
    daysRemaining: 67,
    totalDays: 120,
    earnedSoFar: 1.245,
    dailyEarningRate: 0.0235,
    hourlyEarningRate: 0.00098,
    startDate: new Date("2024-10-15"),
    status: "active",
  },
];

const mockPoolStatus: PoolStatus = {
  connected: true,
  poolName: "CryptoPool Pro",
  hashRate: "976.5 TH/s",
  uptime: 99.98,
  workers: 2,
};

function AnimatedHashrateDisplay({ value, unit }: { value: number; unit: string }) {
  return (
    <motion.div
      className="flex items-baseline gap-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="text-4xl font-bold text-foreground"
        data-testid="text-total-hashrate"
        animate={{ 
          textShadow: [
            "0 0 10px rgba(247, 147, 26, 0.3)",
            "0 0 20px rgba(247, 147, 26, 0.5)",
            "0 0 10px rgba(247, 147, 26, 0.3)",
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {value.toFixed(1)}
      </motion.span>
      <span className="text-lg text-muted-foreground">{unit}</span>
    </motion.div>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          initial={{ 
            x: Math.random() * 100 + "%",
            y: "100%",
            opacity: 0 
          }}
          animate={{ 
            y: "-10%",
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function ContractCard({ contract, index }: { contract: MiningContract; index: number }) {
  const isBTC = contract.cryptoType === "BTC";
  const progressPercent = ((contract.totalDays - contract.daysRemaining) / contract.totalDays) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
      data-testid={`card-contract-${contract.id}`}
    >
      <GlassCard 
        animate={false} 
        glow={isBTC ? "btc" : "ltc"}
        className="relative"
      >
        <FloatingParticles />
        
        <div className="flex items-start gap-4">
          <motion.div 
            className="relative w-16 h-16 flex-shrink-0"
            animate={{ 
              y: [0, -3, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img 
              src={isBTC ? btcMineImg : ltcMineImg} 
              alt={`${contract.cryptoType} Mining`}
              className="w-full h-full object-contain drop-shadow-lg"
              data-testid={`img-contract-${contract.cryptoType.toLowerCase()}`}
            />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-foreground" data-testid={`text-contract-type-${contract.id}`}>
                {contract.cryptoType} Mining
              </span>
              <Badge 
                variant="secondary" 
                className={isBTC ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}
                data-testid={`badge-contract-status-${contract.id}`}
              >
                Active
              </Badge>
            </div>
            
            <div className="text-2xl font-bold text-foreground" data-testid={`text-contract-hashrate-${contract.id}`}>
              {contract.hashrate} {contract.hashrateUnit}
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Days Remaining
            </span>
            <span className="font-medium text-foreground" data-testid={`text-days-remaining-${contract.id}`}>
              {contract.daysRemaining} / {contract.totalDays}
            </span>
          </div>
          
          <Progress value={progressPercent} className="h-1.5" />
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="liquid-glass-subtle rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Earned So Far</div>
              <div className="font-semibold text-foreground" data-testid={`text-earned-${contract.id}`}>
                {contract.earnedSoFar.toFixed(isBTC ? 5 : 3)} {contract.cryptoType}
              </div>
            </div>
            <div className="liquid-glass-subtle rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Daily Rate</div>
              <div className="font-semibold text-emerald-400" data-testid={`text-daily-rate-${contract.id}`}>
                +{contract.dailyEarningRate.toFixed(isBTC ? 6 : 4)} {contract.cryptoType}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-1 flex-wrap">
            <span>Hourly: +{contract.hourlyEarningRate.toFixed(isBTC ? 7 : 5)} {contract.cryptoType}</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Mining
            </span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function PoolStatusCard({ status }: { status: PoolStatus }) {
  return (
    <GlassCard delay={0.25}>
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-5 h-5 text-primary" />
        <h2 className="text-base font-semibold text-foreground">Pool Status</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${status.connected ? "bg-emerald-400" : "bg-red-400"}`}>
            {status.connected && (
              <motion.div
                className="w-full h-full rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="font-medium text-foreground" data-testid="text-pool-status">
              {status.connected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Pool Hash Rate</div>
            <div className="font-medium text-foreground" data-testid="text-pool-hashrate">
              {status.hashRate}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Uptime</div>
            <div className="font-medium text-foreground" data-testid="text-pool-uptime">
              {status.uptime}%
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Wifi className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Active Workers</div>
            <div className="font-medium text-foreground" data-testid="text-pool-workers">
              {status.workers}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function EmptyState({ onNavigateToInvest }: { onNavigateToInvest: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="text-center py-12">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
          <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground/50" />
        </motion.div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-empty-title">
          No Active Contracts
        </h3>
        <p className="text-muted-foreground mb-6 max-w-xs mx-auto" data-testid="text-empty-description">
          Start mining crypto by purchasing hashpower contracts from our investment plans.
        </p>
        
        <Button
          size="lg"
          onClick={onNavigateToInvest}
          data-testid="button-start-mining"
        >
          Start Mining
        </Button>
      </GlassCard>
    </motion.div>
  );
}

export function Mining({ chartData, onNavigateToInvest }: MiningProps) {
  const contracts = mockContracts;
  const poolStatus = mockPoolStatus;
  const hasContracts = contracts.length > 0;
  
  const totalHashrate = contracts.reduce((sum, c) => {
    if (c.hashrateUnit === "TH/s") return sum + c.hashrate;
    if (c.hashrateUnit === "MH/s") return sum + c.hashrate / 1000000;
    return sum + c.hashrate / 1000;
  }, 0);

  return (
    <motion.div
      className="flex flex-col gap-6 pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-testid="page-mining"
    >
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Mining</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your active hashpower contracts
            </p>
          </div>
          <motion.img
            src={serverMiningImg}
            alt="Mining Server"
            className="w-20 h-20 object-contain drop-shadow-2xl"
            animate={{ 
              y: [0, -5, 0],
              rotateY: [0, 5, 0, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            data-testid="img-header-server"
          />
        </div>
      </motion.div>

      {hasContracts ? (
        <>
          <GlassCard delay={0.1} variant="strong" className="relative">
            <FloatingParticles />
            <h2 className="text-base font-semibold text-foreground mb-4">
              Your Active Hashpower
            </h2>
            <AnimatedHashrateDisplay value={totalHashrate} unit="TH/s" />
            <div className="flex items-center gap-2 mt-3">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm text-muted-foreground">
                {contracts.length} active contract{contracts.length > 1 ? "s" : ""}
              </span>
            </div>
          </GlassCard>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Active Contracts</h2>
            <div className="flex flex-col gap-4">
              {contracts.map((contract, index) => (
                <ContractCard key={contract.id} contract={contract} index={index} />
              ))}
            </div>
          </div>

          <HashRateChart data={chartData} title="Earnings Over Time" />

          <PoolStatusCard status={poolStatus} />
        </>
      ) : (
        <EmptyState onNavigateToInvest={onNavigateToInvest} />
      )}
    </motion.div>
  );
}
