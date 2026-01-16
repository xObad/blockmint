import { useQuery } from "@tanstack/react-query";

export function useBTCPrice() {
  const { data: btcPrice = 60000, isLoading, error } = useQuery({
    queryKey: ["btc-price"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/prices/btc");
        if (!response.ok) return 60000;
        const data = await response.json();
        return Number.isFinite(data.price) && data.price > 0 ? data.price : 60000;
      } catch {
        return 60000; // Fallback price
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
    retry: 1,
  });

  return {
    btcPrice,
    isLoading,
    error,
  };
}
