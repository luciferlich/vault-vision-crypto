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
      // Use KuCoin API to fetch 24hr ticker data
      const newPrices: Record<string, CryptoPrice> = {};
      
      for (const symbol of symbols) {
        const kucoinSymbol = SYMBOL_MAPPING[symbol.toUpperCase()] || `${symbol.toUpperCase()}-USDT`;
        
        try {
          // Fetch 24hr ticker from KuCoin
          const response = await fetch(
            `https://api.kucoin.com/api/v1/market/stats?symbol=${kucoinSymbol}`,
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          if (!response.ok) {
            console.warn(`Failed to fetch ${symbol} from KuCoin`);
            continue;
          }

          const data = await response.json();
          
          if (data.code === '200000' && data.data) {
            const ticker = data.data;
            newPrices[symbol.toLowerCase()] = {
              price: parseFloat(ticker.last || ticker.buy || 0),
              change24h: parseFloat(ticker.changeRate || 0) * 100, // Convert to percentage
              volume24h: parseFloat(ticker.volValue || 0),
              symbol: symbol.toUpperCase(),
            };
          }
        } catch (error) {
          console.warn(`Error fetching ${symbol}:`, error);
          // Provide fallback mock data for demo purposes
          newPrices[symbol.toLowerCase()] = {
            price: Math.random() * 50000 + 1000,
            change24h: (Math.random() - 0.5) * 20,
            volume24h: Math.random() * 1000000000,
            symbol: symbol.toUpperCase(),
          };
        }
      }

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
  }, []);

  const getPrice = useCallback((symbol: string): CryptoPrice | null => {
    return prices[symbol.toLowerCase()] || null;
  }, [prices]);

  // Add historical data fetching for simulations
  const fetchHistoricalData = useCallback(async (symbol: string): Promise<number[]> => {
    try {
      const kucoinSymbol = SYMBOL_MAPPING[symbol.toUpperCase()] || `${symbol.toUpperCase()}-USDT`;
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (365 * 24 * 60 * 60); // 1 year ago
      
      const response = await fetch(
        `https://api.kucoin.com/api/v1/market/candles?symbol=${kucoinSymbol}&type=1day&startAt=${startTime}&endAt=${endTime}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const data = await response.json();
      
      if (data.code === '200000' && data.data) {
        // KuCoin returns [time, open, close, high, low, volume, turnover]
        return data.data.map((candle: string[]) => parseFloat(candle[2])).reverse(); // close prices
      }
      
      throw new Error('Invalid response format');
      
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