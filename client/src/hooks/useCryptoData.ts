import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CryptoPrice {
  price: number;
  change24h: number;
  volume24h: number;
  symbol: string;
}

// KuCoin symbol mapping
const SYMBOL_MAPPING: Record<string, string> = {
  'BTC': 'BTC-USDT',
  'ETH': 'ETH-USDT', 
  'SOL': 'SOL-USDT',
  'ADA': 'ADA-USDT',
  'DOT': 'DOT-USDT',
  'LINK': 'LINK-USDT',
  'MATIC': 'MATIC-USDT',
  'AVAX': 'AVAX-USDT',
  'UNI': 'UNI-USDT',
  'ATOM': 'ATOM-USDT',
};

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
      
      // Provide fallback data for demo purposes
      const mockPrices: Record<string, CryptoPrice> = {};
      symbols.forEach(symbol => {
        mockPrices[symbol.toLowerCase()] = {
          price: Math.random() * 50000 + 1000,
          change24h: (Math.random() - 0.5) * 20,
          volume24h: Math.random() * 1000000000,
          symbol: symbol.toUpperCase(),
        };
      });
      
      setPrices(prevPrices => ({ ...prevPrices, ...mockPrices }));
      toast({
        title: "Demo Mode",
        description: "Using demo data - API temporarily unavailable",
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
      console.warn(`Failed to fetch historical data for ${symbol}, using mock data`);
      
      // Generate realistic mock historical data
      const days = 365;
      const startPrice = prices[symbol.toLowerCase()]?.price || 30000;
      const historicalPrices = [];
      let price = startPrice * 0.8; // Start lower
      
      for (let i = 0; i < days; i++) {
        const change = (Math.random() - 0.5) * 0.1; // 10% max daily change
        price *= (1 + change);
        historicalPrices.push(price);
      }
      
      return historicalPrices;
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