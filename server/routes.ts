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

  const httpServer = createServer(app);

  return httpServer;
}
