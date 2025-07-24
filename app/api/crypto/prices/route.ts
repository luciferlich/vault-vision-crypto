import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');
    if (!symbols) {
      return NextResponse.json({ error: "Symbols parameter required" }, { status: 400 });
    }

    const symbolList = symbols.split(',');
    const prices: Record<string, any> = {};

    // Add timeout and better error handling for production
    const fetchWithTimeout = async (url: string, timeout = 10000) => {
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

    for (const symbol of symbolList) {
      const kucoinSymbol = `${symbol.toUpperCase()}-USDT`;
      
      try {
        const response = await fetchWithTimeout(
          `https://api.kucoin.com/api/v1/market/stats?symbol=${kucoinSymbol}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`KuCoin response for ${symbol}:`, JSON.stringify(data, null, 2));
          
          if (data.code === '200000' && data.data) {
            const ticker = data.data;
            const price = parseFloat(ticker.last || ticker.buy || 0);
            console.log(`Parsed price for ${symbol}: ${price}`);
            
            prices[symbol.toLowerCase()] = {
              price: price,
              change24h: parseFloat(ticker.changeRate || 0) * 100,
              volume24h: parseFloat(ticker.volValue || 0),
              symbol: symbol.toUpperCase(),
            };
          } else {
            console.warn(`Invalid KuCoin response for ${symbol}:`, data);
          }
        } else {
          const errorText = await response.text();
          console.warn(`KuCoin API error for ${symbol} - status ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.warn(`Network error fetching ${symbol}:`, error instanceof Error ? error.message : error);
        
        // Fallback: try alternative endpoint
        try {
          const fallbackResponse = await fetchWithTimeout(
            `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${kucoinSymbol}`
          );
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.code === '200000' && fallbackData.data) {
              const price = parseFloat(fallbackData.data.price || fallbackData.data.bestAsk || 0);
              prices[symbol.toLowerCase()] = {
                price: price,
                change24h: 0, // Not available in this endpoint
                volume24h: 0,
                symbol: symbol.toUpperCase(),
              };
              console.log(`Fallback price for ${symbol}: ${price}`);
            }
          }
        } catch (fallbackError) {
          console.warn(`Fallback also failed for ${symbol}:`, fallbackError instanceof Error ? fallbackError.message : fallbackError);
        }
      }
    }

    if (Object.keys(prices).length === 0) {
      return NextResponse.json(
        { 
          error: "Unable to fetch prices from external API", 
          details: "All cryptocurrency price sources are currently unavailable"
        },
        { status: 503 }
      );
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error in crypto prices endpoint:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch crypto prices",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}