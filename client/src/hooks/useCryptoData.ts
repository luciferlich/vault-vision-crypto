import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CryptoPrice {
  price: number;
  change24h: number;
  volume24h: number;
  symbol: string;
}

// Using direct API calls through backend proxy

export const useCryptoData = () => {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPrices = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return;

    setLoading(true);
    
    try {
      // Use backend proxy to fetch prices (avoids CORS issues)
      const response = await fetch(`/api/crypto/prices?symbols=${symbols.join(',')}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices from backend');
      }

      const newPrices = await response.json();
      setPrices(prevPrices => ({ ...prevPrices, ...newPrices }));
      
      if (Object.keys(newPrices).length > 0) {
        toast({
          title: "Prices Updated",
          description: `Updated prices for ${Object.keys(newPrices).length} assets`,
        });
      }
      
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cryptocurrency prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getPrice = useCallback((symbol: string): CryptoPrice | null => {
    return prices[symbol.toLowerCase()] || null;
  }, [prices]);

  // Add historical data fetching for simulations
  const fetchHistoricalData = useCallback(async (symbol: string): Promise<number[]> => {
    try {
      const response = await fetch(`/api/crypto/historical/${symbol}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const data = await response.json();
      return data.prices;
      
    } catch (error) {
      console.warn(`Failed to fetch historical data for ${symbol}`);
      throw new Error(`Unable to fetch historical data for ${symbol}`);
    }
  }, [prices]);

  return {
    prices,
    loading,
    fetchPrices,
    getPrice,
    fetchHistoricalData,
  };
};