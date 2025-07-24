import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol;
    const kucoinSymbol = `${symbol.toUpperCase()}-USDT`;
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - (365 * 24 * 60 * 60); // 1 year ago
    
    console.log(`Fetching historical data for: ${symbol}`);
    
    // Add timeout and better error handling
    const fetchWithTimeout = async (url: string, timeout = 15000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CryptoPortfolio/1.0)',
            'Accept': 'application/json',
          }
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    try {
      const response = await fetchWithTimeout(
        `https://api.kucoin.com/api/v1/market/candles?symbol=${kucoinSymbol}&type=1day&startAt=${startTime}&endAt=${endTime}`
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.code === '200000' && data.data && Array.isArray(data.data)) {
          const historicalPrices = data.data
            .map((candle: string[]) => parseFloat(candle[2]))
            .filter((price: number) => !isNaN(price) && price > 0)
            .reverse();
          
          console.log(`Historical data length: ${historicalPrices.length}`);
          
          if (historicalPrices.length > 0) {
            return NextResponse.json({ prices: historicalPrices });
          }
        }
      } else {
        const errorText = await response.text();
        console.warn(`KuCoin historical API error for ${symbol} - status ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.warn(`Network error fetching historical data for ${symbol}:`, error instanceof Error ? error.message : error);
    }

    // If we reach here, API failed - return error instead of mock data
    return NextResponse.json(
      { 
        error: "Historical data unavailable", 
        details: `Unable to fetch historical data for ${symbol} from external sources`
      },
      { status: 503 }
    );
    
  } catch (error) {
    console.error('Error in historical data endpoint:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch historical data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}