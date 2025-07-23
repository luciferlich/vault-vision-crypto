import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_24h: number;
}

interface CryptoPrice {
  symbol: string;
  name: string;
  currentPrice: number;
  dayChangePercent: number;
  dayChange: number;
}

const SYMBOL_TO_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'ADA': 'cardano',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'AAVE': 'aave',
  // Add more mappings as needed
};

export const useCryptoData = () => {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [loading, setLoading] = useState(false);

  const fetchPrices = async (symbols: string[]) => {
    if (symbols.length === 0) return;

    setLoading(true);
    try {
      // Convert symbols to CoinGecko IDs
      const ids = symbols.map(symbol => SYMBOL_TO_ID_MAP[symbol]).filter(Boolean);
      
      if (ids.length === 0) {
        toast.error('No supported crypto symbols found');
        return;
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch crypto data');
      }

      const data = await response.json();
      
      // Transform the data to our format
      const newPrices: Record<string, CryptoPrice> = {};
      
      Object.entries(SYMBOL_TO_ID_MAP).forEach(([symbol, id]) => {
        if (data[id] && symbols.includes(symbol)) {
          newPrices[symbol] = {
            symbol,
            name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            currentPrice: data[id].usd,
            dayChangePercent: data[id].usd_24h_change || 0,
            dayChange: (data[id].usd * (data[id].usd_24h_change || 0)) / 100,
          };
        }
      });

      setPrices(prevPrices => ({ ...prevPrices, ...newPrices }));
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      toast.error('Failed to fetch crypto prices');
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback for development
  const getMockPrice = (symbol: string): CryptoPrice => {
    const mockPrices: Record<string, CryptoPrice> = {
      'BTC': {
        symbol: 'BTC',
        name: 'Bitcoin',
        currentPrice: 43250.50,
        dayChangePercent: 2.35,
        dayChange: 991.75,
      },
      'ETH': {
        symbol: 'ETH',
        name: 'Ethereum',
        currentPrice: 2650.75,
        dayChangePercent: -1.25,
        dayChange: -33.50,
      },
      'SOL': {
        symbol: 'SOL',
        name: 'Solana',
        currentPrice: 98.45,
        dayChangePercent: 4.20,
        dayChange: 3.98,
      },
    };

    return mockPrices[symbol] || {
      symbol,
      name: symbol,
      currentPrice: Math.random() * 1000 + 10,
      dayChangePercent: (Math.random() - 0.5) * 10,
      dayChange: (Math.random() - 0.5) * 50,
    };
  };

  const getPrice = (symbol: string): CryptoPrice => {
    return prices[symbol] || getMockPrice(symbol);
  };

  return {
    prices,
    loading,
    fetchPrices,
    getPrice,
  };
};