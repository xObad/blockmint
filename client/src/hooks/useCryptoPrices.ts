import { useQuery } from "@tanstack/react-query";

export type CryptoType = "BTC" | "LTC" | "ETH" | "USDT" | "USDC" | "TON";

export interface CryptoPrice {
  symbol: CryptoType;
  name: string;
  price: number;
  change24h: number;
  logo: string;
  color: string;
}

// Fetch prices from CoinGecko API (free, no auth needed)
async function fetchCryptoPrices(): Promise<Record<CryptoType, CryptoPrice>> {
  try {
    // Fetch from CoinGecko
    const ids = "bitcoin,litecoin,ethereum,tether,usd-coin,the-open-network";
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=true&include_last_updated_at=false`,
      { 
        headers: { "Accept": "application/json" }
      }
    );

    if (!response.ok) throw new Error("Failed to fetch prices");

    const data = await response.json();

    return {
      BTC: {
        symbol: "BTC",
        name: "Bitcoin",
        price: data.bitcoin?.usd || 0,
        change24h: data.bitcoin?.usd_24h_change || 0,
        logo: "btc",
        color: "bg-amber-500",
      },
      LTC: {
        symbol: "LTC",
        name: "Litecoin",
        price: data.litecoin?.usd || 0,
        change24h: data.litecoin?.usd_24h_change || 0,
        logo: "ltc",
        color: "bg-slate-400",
      },
      ETH: {
        symbol: "ETH",
        name: "Ethereum",
        price: data.ethereum?.usd || 0,
        change24h: data.ethereum?.usd_24h_change || 0,
        logo: "eth",
        color: "bg-purple-500",
      },
      USDT: {
        symbol: "USDT",
        name: "Tether",
        price: data.tether?.usd || 1,
        change24h: data.tether?.usd_24h_change || 0,
        logo: "usdt",
        color: "bg-emerald-500",
      },
      USDC: {
        symbol: "USDC",
        name: "USD Coin",
        price: data["usd-coin"]?.usd || 1,
        change24h: data["usd-coin"]?.usd_24h_change || 0,
        logo: "usdc",
        color: "bg-blue-500",
      },
      TON: {
        symbol: "TON",
        name: "Toncoin",
        price: data["the-open-network"]?.usd || 0,
        change24h: data["the-open-network"]?.usd_24h_change || 0,
        logo: "ton",
        color: "bg-cyan-500",
      },
    };
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    // Return fallback prices
    return {
      BTC: { symbol: "BTC", name: "Bitcoin", price: 97245.32, change24h: 2.45, logo: "btc", color: "bg-amber-500" },
      LTC: { symbol: "LTC", name: "Litecoin", price: 102.34, change24h: 3.12, logo: "ltc", color: "bg-slate-400" },
      ETH: { symbol: "ETH", name: "Ethereum", price: 3450, change24h: -1.23, logo: "eth", color: "bg-purple-500" },
      USDT: { symbol: "USDT", name: "Tether", price: 1.00, change24h: 0.01, logo: "usdt", color: "bg-emerald-500" },
      USDC: { symbol: "USDC", name: "USD Coin", price: 1.00, change24h: -0.02, logo: "usdc", color: "bg-blue-500" },
      TON: { symbol: "TON", name: "Toncoin", price: 5.20, change24h: 1.56, logo: "ton", color: "bg-cyan-500" },
    };
  }
}

export function useCryptoPrices() {
  const { data: prices, isLoading, error } = useQuery({
    queryKey: ["crypto-prices"],
    queryFn: fetchCryptoPrices,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 120 * 1000, // Refresh every 2 minutes
    retry: 1,
  });

  return {
    prices: (prices ?? ({} as Record<CryptoType, CryptoPrice>)),
    isLoading,
    error,
  };
}

// Get a single crypto price
export function getCryptoPrice(prices: Record<CryptoType, CryptoPrice>, symbol: CryptoType): number {
  return prices[symbol]?.price || 0;
}

// Calculate USD value of a crypto holding
export function calculateUSDValue(amount: number, prices: Record<CryptoType, CryptoPrice>, symbol: CryptoType): number {
  const price = getCryptoPrice(prices, symbol);
  return amount * price;
}
