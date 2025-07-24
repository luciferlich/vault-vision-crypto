import { useState, useEffect, useMemo, useCallback } from 'react';
import { PortfolioOverview } from './PortfolioOverview';
import { AddAssetDialog } from './AddAssetDialog';
import { AssetTable, Asset } from './AssetTable';
import { SimulationPanel } from './SimulationPanel';
import { useCryptoData } from '@/hooks/useCryptoData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, BarChart3, Activity } from 'lucide-react';

interface PortfolioAsset {
  id: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
}

export const PortfolioDashboard = () => {
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([]);
  const { getPrice, fetchPrices, fetchHistoricalData } = useCryptoData();

  // Calculate enhanced asset data with current prices
  const enrichedAssets = useMemo(() => {
    return portfolioAssets.map(asset => {
      const priceData = getPrice(asset.symbol);
      const currentPrice = priceData?.price || asset.entryPrice;
      const currentValue = asset.quantity * currentPrice;
      const totalCost = asset.quantity * asset.entryPrice;
      const unrealizedPnL = currentValue - totalCost;
      const unrealizedPnLPercent = (unrealizedPnL / totalCost) * 100;

      return {
        id: asset.id,
        symbol: asset.symbol,
        name: priceData?.symbol || asset.symbol,
        quantity: asset.quantity,
        entryPrice: asset.entryPrice,
        currentPrice,
        value: currentValue,
        gainLoss: unrealizedPnL,
        gainLossPercent: unrealizedPnLPercent,
        allocation: 0, // Will be calculated below
        dayChange: priceData?.change24h ? (priceData.change24h / 100) * currentValue : 0,
        dayChangePercent: priceData?.change24h || 0,
      };
    });
  }, [portfolioAssets, getPrice]);

  // Calculate dynamic risk score based on portfolio composition
  const calculateRiskScore = useCallback((assets: any[]) => {
    if (assets.length === 0) return { score: 0, label: 'N/A' };

    // Risk factors for different cryptocurrencies
    const cryptoRiskFactors: Record<string, number> = {
      'BTC': 3.5,   // Lower risk - most established
      'ETH': 4.2,   // Medium-low risk
      'SOL': 6.8,   // Medium-high risk - newer, more volatile
      'ADA': 5.5,   // Medium risk
      'DOT': 6.2,   // Medium-high risk
      'LINK': 5.8,  // Medium risk
      'MATIC': 6.5, // Medium-high risk
      'AVAX': 6.3,  // Medium-high risk
      'UNI': 6.0,   // Medium risk
      'ATOM': 5.9,  // Medium risk
      'WIF': 8.5,   // High risk - meme coin
    };

    // Calculate weighted risk score based on portfolio allocation
    let weightedRiskScore = 0;
    let totalWeight = 0;

    assets.forEach(asset => {
      const baseRisk = cryptoRiskFactors[asset.symbol] || 7.0; // Default risk for unknown coins
      const volatilityMultiplier = Math.abs(asset.dayChangePercent) / 10; // Higher daily volatility = higher risk
      const adjustedRisk = Math.min(10, baseRisk + volatilityMultiplier);
      
      const weight = asset.allocation / 100;
      weightedRiskScore += adjustedRisk * weight;
      totalWeight += weight;
    });

    const finalScore = totalWeight > 0 ? weightedRiskScore : 0;
    
    // Determine risk label
    let label = 'Low';
    if (finalScore >= 7.5) label = 'High';
    else if (finalScore >= 5.5) label = 'Moderate';
    else if (finalScore >= 3.5) label = 'Low-Medium';

    return { score: Math.round(finalScore * 10) / 10, label };
  }, []);

  // Calculate total portfolio metrics with allocations and risk
  const portfolioSummary = useMemo(() => {
    const totalValue = enrichedAssets.reduce((sum, asset) => sum + asset.value, 0);
    const totalCost = enrichedAssets.reduce((sum, asset) => sum + (asset.quantity * asset.entryPrice), 0);
    const totalUnrealizedPnL = enrichedAssets.reduce((sum, asset) => sum + asset.gainLoss, 0);
    const totalUnrealizedPnLPercent = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;

    // Calculate 24h change
    const total24hChange = enrichedAssets.reduce((sum, asset) => sum + asset.dayChange, 0);
    const total24hChangePercent = totalValue > 0 ? (total24hChange / (totalValue - total24hChange)) * 100 : 0;

    // Update allocations
    const assetsWithAllocations = enrichedAssets.map(asset => ({
      ...asset,
      allocation: totalValue > 0 ? (asset.value / totalValue) * 100 : 0,
    }));

    // Calculate dynamic risk score
    const riskData = calculateRiskScore(assetsWithAllocations);

    return {
      totalValue,
      totalCost,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent,
      total24hChange: total24hChange,
      total24hChangePercent: total24hChangePercent,
      assetCount: enrichedAssets.length,
      assets: assetsWithAllocations,
      riskScore: riskData.score,
      riskLabel: riskData.label,
    };
  }, [enrichedAssets, calculateRiskScore]);

  // Fetch prices when assets change
  useEffect(() => {
    if (portfolioAssets.length > 0) {
      const symbols = portfolioAssets.map(asset => asset.symbol);
      fetchPrices(symbols);
    }
  }, [portfolioAssets, fetchPrices]);

  const handleAddAsset = (assetData: { symbol: string; quantity: number; entryPrice: number }) => {
    const newAsset: PortfolioAsset = {
      id: Date.now().toString(),
      ...assetData,
    };
    setPortfolioAssets(prev => [...prev, newAsset]);
  };

  const handleRemoveAsset = (id: string) => {
    setPortfolioAssets(prev => prev.filter(asset => asset.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Crypto Portfolio Analytics</h1>
            <p className="text-muted-foreground">Professional risk management and portfolio optimization</p>
          </div>
          <div className="flex space-x-3">
            <AddAssetDialog onAddAsset={handleAddAsset} />
          </div>
        </div>

        {/* Portfolio Overview */}
        <PortfolioOverview
          totalValue={portfolioSummary.totalValue}
          totalGainLoss={portfolioSummary.totalUnrealizedPnL}
          totalGainLossPercent={portfolioSummary.totalUnrealizedPnLPercent}
          dayChange={portfolioSummary.total24hChange}
          dayChangePercent={portfolioSummary.total24hChangePercent}
          riskScore={portfolioSummary.riskScore}
          riskLabel={portfolioSummary.riskLabel}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Risk Simulation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <AssetTable
              assets={portfolioSummary.assets}
              onRemoveAsset={handleRemoveAsset}
            />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            {portfolioSummary.assets.length > 0 ? (
              <SimulationPanel 
                selectedAsset={portfolioSummary.assets[0].symbol}
                currentPrice={portfolioSummary.assets[0].currentPrice}
                fetchHistoricalData={fetchHistoricalData}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Assets for Simulation</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Add some crypto assets to your portfolio to run advanced risk simulations and predictions.
                  </p>
                  <AddAssetDialog onAddAsset={handleAddAsset} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};