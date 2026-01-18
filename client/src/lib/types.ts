export interface MiningStats {
  hashRate: number;
  hashRateUnit: string;
  miningTime: number;
  powerUsage: number;
  temperature: number;
  isActive: boolean;
  poolName: string;
  efficiency: number;
}

export interface WalletBalance {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'earned' | 'withdrawn' | 'received' | 'deposit' | 'exchange' | 'withdrawal' | 'purchase' | 'promotion' | 'balance';
  amount: number;
  symbol?: string;
  currency?: string;
  usdValue?: number;
  timestamp?: Date | string;
  createdAt?: string;
  status: 'completed' | 'pending' | 'failed' | 'confirmed' | 'rejected';
  description?: string;
}

export interface CryptoNetwork {
  id: string;
  name: string;
  fee: number;
  estimatedTime: string;
}

export interface SupportedCrypto {
  symbol: string;
  name: string;
  networks: CryptoNetwork[];
  color: string;
  iconBg: string;
}

export interface MiningPool {
  id: string;
  name: string;
  apy: number;
  miners: number;
  hashRate: string;
  fee: number;
  isActive: boolean;
}

export interface ChartDataPoint {
  time: string;
  hashRate: number;
  earnings: number;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  selectedPool: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  pinLockEnabled: boolean;
  pinCode?: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'AED';
  language: string;
  sessionTimeout: number;
}

export interface MiningContract {
  id: string;
  cryptoType: "BTC" | "LTC";
  hashrate: number;
  hashrateUnit: string;
  daysRemaining: number;
  totalDays: number;
  earnedSoFar: number;
  dailyEarningRate: number;
  hourlyEarningRate: number;
  startDate: Date;
  status: "active" | "expired";
}

export interface PoolStatus {
  connected: boolean;
  poolName: string;
  hashRate: string;
  uptime: number;
  workers: number;
}
