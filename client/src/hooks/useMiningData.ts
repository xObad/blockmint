import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { 
  MiningStats, 
  WalletBalance, 
  Transaction, 
  MiningPool, 
  ChartDataPoint, 
  UserSettings,
  MiningContract,
  PoolStatus
} from "@/lib/types";

interface WalletResponse {
  balances: WalletBalance[];
  totalBalance: number;
  change24h: number;
}

interface PortfolioHistoryPoint {
  day: string;
  value: number;
  timestamp: string;
}

const stableQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export function useMiningData() {
  // Get user ID from localStorage
  const userStr = typeof localStorage !== 'undefined' ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.dbId || user?.id || user?.uid;

  const miningStatsQuery = useQuery<MiningStats>({
    ...stableQueryOptions,
    queryKey: ["/api/mining/stats"],
    refetchInterval: 30000, // Increased from 15s to 30s
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
    staleTime: 15000,
  });

  const walletQuery = useQuery<any>({
    ...stableQueryOptions,
    queryKey: ["/api/balances", userId],
    queryFn: async () => {
      if (!userId) {
        return { balances: [], totalBalance: 0, change24h: 0, pending: {} };
      }
      const res = await fetch(`/api/balances/${userId}`);
      if (!res.ok) return { balances: [], totalBalance: 0, change24h: 0, pending: {} };
      const data = await res.json();

      // Fetch crypto prices (never let CoinGecko downtime break the app)
      let priceMap: Record<string, number> = {
        BTC: 0,
        LTC: 0,
        ETH: 0,
        USDT: 1,
        USDC: 1,
        BNB: 0,
        ZCASH: 0,
        TON: 0,
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const pricesRes = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,litecoin,ethereum,tether,usd-coin,binancecoin,zcash,ton&vs_currencies=usd",
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (pricesRes.ok) {
          const prices = await pricesRes.json();
          priceMap = {
            BTC: prices.bitcoin?.usd || 0,
            LTC: prices.litecoin?.usd || 0,
            ETH: prices.ethereum?.usd || 0,
            USDT: prices.tether?.usd || 1,
            USDC: prices["usd-coin"]?.usd || 1,
            BNB: prices.binancecoin?.usd || 0,
            ZCASH: prices.zcash?.usd || 0,
            TON: prices.ton?.usd || 0,
          };
        }
      } catch (err) {
        console.warn("Failed to fetch crypto prices:", err);
      }
      
      // Calculate total balance from wallet balances
      const totalBalance = data.balances?.reduce((sum: number, wallet: any) => {
        const price = priceMap[wallet.symbol] || 0;
        return sum + (wallet.balance * price);
      }, 0) || 0;
      
      return {
        balances: data.balances || [],
        totalBalance: totalBalance,
        change24h: 0,
        pending: data.pending || {}
      };
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every 1 minute (faster than 2 minutes for balance updates)
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  const transactionsQuery = useQuery<Transaction[]>({
    ...stableQueryOptions,
    queryKey: ["/api/wallet/transactions"],
    placeholderData: keepPreviousData,
  });

  const poolsQuery = useQuery<MiningPool[]>({
    ...stableQueryOptions,
    queryKey: ["/api/pools"],
    placeholderData: keepPreviousData,
  });

  const chartQuery = useQuery<ChartDataPoint[]>({
    ...stableQueryOptions,
    queryKey: ["/api/chart"],
    placeholderData: keepPreviousData,
  });

  const portfolioHistoryQuery = useQuery<PortfolioHistoryPoint[]>({
    ...stableQueryOptions,
    queryKey: ["/api/portfolio/history"],
    refetchInterval: 120000, // Refresh every 2 minutes
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
    staleTime: 60000,
  });

  const settingsQuery = useQuery<UserSettings>({
    ...stableQueryOptions,
    queryKey: ["/api/settings"],
    placeholderData: keepPreviousData,
  });

  const contractsQuery = useQuery<MiningContract[]>({
    ...stableQueryOptions,
    queryKey: ["/api/mining/contracts"],
    refetchInterval: 60000, // Increased from 20s to 60s
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  const poolStatusQuery = useQuery<PoolStatus>({
    ...stableQueryOptions,
    queryKey: ["/api/mining/pool-status"],
    refetchInterval: 60000, // Increased from 20s to 60s
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  const toggleMiningMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/mining/toggle");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mining/stats"] });
    },
  });

  const selectPoolMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/pools/${id}/select`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mining/stats"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      const response = await apiRequest("PATCH", "/api/settings", settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const defaultMiningStats: MiningStats = {
    hashRate: 0,
    hashRateUnit: "MH/s",
    miningTime: 0,
    powerUsage: 0,
    temperature: 35,
    isActive: false,
    poolName: "CryptoPool Pro",
    efficiency: 0,
  };

  const defaultSettings: UserSettings = {
    notificationsEnabled: true,
    selectedPool: "1",
    twoFactorEnabled: false,
    biometricEnabled: false,
    pinLockEnabled: false,
    currency: "USD",
    language: "English",
    sessionTimeout: 30,
  };

  return {
    miningStats: miningStatsQuery.data ?? defaultMiningStats,
    balances: walletQuery.data?.balances ?? [],
    transactions: transactionsQuery.data ?? [],
    pools: poolsQuery.data ?? [],
    settings: settingsQuery.data ?? defaultSettings,
    chartData: chartQuery.data ?? [],
    portfolioHistory: portfolioHistoryQuery.data ?? [],
    contracts: contractsQuery.data ?? [],
    poolStatus: poolStatusQuery.data ?? { connected: false, poolName: "", hashRate: "0 TH/s", uptime: 0, workers: 0 },
    totalBalance: walletQuery.data?.totalBalance ?? 0,
    change24h: walletQuery.data?.change24h ?? 0,
    isPending: toggleMiningMutation.isPending || contractsQuery.isPending,
    isLoading: miningStatsQuery.isLoading || walletQuery.isLoading || contractsQuery.isLoading,
    isFetching: walletQuery.isFetching,
    toggleMining: () => toggleMiningMutation.mutate(),
    selectPool: (id: string) => selectPoolMutation.mutate(id),
    updateSettings: (settings: Partial<UserSettings>) => updateSettingsMutation.mutate(settings),
    refetchBalances: () => walletQuery.refetch(),
  };
}
