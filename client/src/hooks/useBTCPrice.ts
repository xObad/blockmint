import { useQuery } from "@tanstack/react-query";

export function useBTCPrice() {
  const { data: btcPrice = 60000, isLoading, error } = useQuery({
    queryKey: ["btc-price"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
          { signal: controller.signal, headers: { Accept: "application/json" } }
        );

        if (!response.ok) return 60000;

        const data = (await response.json().catch(() => null)) as any;
        const price = Number(data?.bitcoin?.usd);
        return Number.isFinite(price) && price > 0 ? price : 60000;
      } catch {
        return 60000; // Fallback price
      } finally {
        clearTimeout(timeoutId);
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
