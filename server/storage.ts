import { users, portfolioAssets, type User, type InsertUser, type PortfolioAsset, type InsertPortfolioAsset } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Portfolio asset CRUD operations
  getPortfolioAssets(): Promise<PortfolioAsset[]>;
  getPortfolioAsset(id: number): Promise<PortfolioAsset | undefined>;
  createPortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset>;
  updatePortfolioAsset(id: number, asset: Partial<InsertPortfolioAsset>): Promise<PortfolioAsset | undefined>;
  deletePortfolioAsset(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolioAssets: Map<number, PortfolioAsset>;
  private currentUserId: number;
  private currentAssetId: number;

  constructor() {
    this.users = new Map();
    this.portfolioAssets = new Map();
    this.currentUserId = 1;
    this.currentAssetId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPortfolioAssets(): Promise<PortfolioAsset[]> {
    return Array.from(this.portfolioAssets.values());
  }

  async getPortfolioAsset(id: number): Promise<PortfolioAsset | undefined> {
    return this.portfolioAssets.get(id);
  }

  async createPortfolioAsset(insertAsset: InsertPortfolioAsset): Promise<PortfolioAsset> {
    const id = this.currentAssetId++;
    const asset: PortfolioAsset = { 
      ...insertAsset, 
      id,
      createdAt: new Date()
    };
    this.portfolioAssets.set(id, asset);
    return asset;
  }

  async updatePortfolioAsset(id: number, updates: Partial<InsertPortfolioAsset>): Promise<PortfolioAsset | undefined> {
    const existing = this.portfolioAssets.get(id);
    if (!existing) return undefined;
    
    const updated: PortfolioAsset = { ...existing, ...updates };
    this.portfolioAssets.set(id, updated);
    return updated;
  }

  async deletePortfolioAsset(id: number): Promise<boolean> {
    return this.portfolioAssets.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPortfolioAssets(): Promise<PortfolioAsset[]> {
    return await db.select().from(portfolioAssets);
  }

  async getPortfolioAsset(id: number): Promise<PortfolioAsset | undefined> {
    const [asset] = await db.select().from(portfolioAssets).where(eq(portfolioAssets.id, id));
    return asset || undefined;
  }

  async createPortfolioAsset(insertAsset: InsertPortfolioAsset): Promise<PortfolioAsset> {
    const [asset] = await db
      .insert(portfolioAssets)
      .values(insertAsset)
      .returning();
    return asset;
  }

  async updatePortfolioAsset(id: number, updates: Partial<InsertPortfolioAsset>): Promise<PortfolioAsset | undefined> {
    const [asset] = await db
      .update(portfolioAssets)
      .set(updates)
      .where(eq(portfolioAssets.id, id))
      .returning();
    return asset || undefined;
  }

  async deletePortfolioAsset(id: number): Promise<boolean> {
    const result = await db
      .delete(portfolioAssets)
      .where(eq(portfolioAssets.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
