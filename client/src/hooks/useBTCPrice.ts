import { useQuery } from "@tanstack/react-query";

export function useBTCPrice() {
  const { data: btcPrice = 60000, isLoading, error } = useQuery({
    queryKey: ["btc-price"],
    queryFn: async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await response.json();
        return data.bitcoin.usd || 60000;
      } catch {
        return 60000; // Fallback price
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  return {
    btcPrice,
    isLoading,
    error,
  };
}
