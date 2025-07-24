import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPortfolioAssetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Portfolio Assets Routes
  app.get("/api/portfolio/assets", async (req, res) => {
    try {
      const assets = await storage.getPortfolioAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio assets" });
    }
  });

  app.post("/api/portfolio/assets", async (req, res) => {
    try {
      const validatedData = insertPortfolioAssetSchema.parse(req.body);
      const asset = await storage.createPortfolioAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid asset data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create portfolio asset" });
      }
    }
  });

  app.put("/api/portfolio/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPortfolioAssetSchema.partial().parse(req.body);
      const asset = await storage.updatePortfolioAsset(id, validatedData);
      
      if (!asset) {
        res.status(404).json({ error: "Asset not found" });
        return;
      }
      
      res.json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid asset data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update portfolio asset" });
      }
    }
  });

  app.delete("/api/portfolio/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePortfolioAsset(id);
      
      if (!success) {
        res.status(404).json({ error: "Asset not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete portfolio asset" });
    }
  });

  // Crypto data proxy routes to avoid CORS issues
  app.get("/api/crypto/prices", async (req, res) => {
    try {
      const symbols = req.query.symbols as string;
      if (!symbols) {
        res.status(400).json({ error: "Symbols parameter required" });
        return;
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
        res.status(503).json({ 
          error: "Unable to fetch prices from external API", 
          details: "All cryptocurrency price sources are currently unavailable"
        });
        return;
      }

      res.json(prices);
    } catch (error) {
      console.error('Error in crypto prices endpoint:', error);
      res.status(500).json({ 
        error: "Failed to fetch crypto prices",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/crypto/historical/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
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
              res.json({ prices: historicalPrices });
              return;
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
      res.status(503).json({ 
        error: "Historical data unavailable", 
        details: `Unable to fetch historical data for ${symbol} from external sources`
      });
      
    } catch (error) {
      console.error('Error in historical data endpoint:', error);
      res.status(500).json({ 
        error: "Failed to fetch historical data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
