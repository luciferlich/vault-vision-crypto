import { useState, useEffect, useMemo } from 'react';
import { PortfolioOverview } from './PortfolioOverview';
import { AddAssetDialog } from './AddAssetDialog';
import { AssetTable, Asset } from './AssetTable';
import { useCryptoData } from '@/hooks/useCryptoData';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChart3 } from 'lucide-react';

interface PortfolioAsset {
  id: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
}

export const PortfolioDashboard = () => {
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([]);
  const { getPrice, fetchPrices } = useCryptoData();

  // Calculate enhanced asset data with current prices
  const enrichedAssets = useMemo((): Asset[] => {
    return portfolioAssets.map(asset => {
      const priceData = getPrice(asset.symbol);
      const value = asset.quantity * priceData.currentPrice;
      const gainLoss = value - (asset.quantity * asset.entryPrice);
      const gainLossPercent = ((priceData.currentPrice - asset.entryPrice) / asset.entryPrice) * 100;
      
      return {
        ...asset,
        name: priceData.name,
        currentPrice: priceData.currentPrice,
        value,
        gainLoss,
        gainLossPercent,
        allocation: 0, // Will be calculated below
        dayChange: asset.quantity * priceData.dayChange,
        dayChangePercent: priceData.dayChangePercent,
      };
    });
  }, [portfolioAssets, getPrice]);

  // Calculate portfolio totals and allocations
  const portfolioMetrics = useMemo(() => {
    const totalValue = enrichedAssets.reduce((sum, asset) => sum + asset.value, 0);
    const totalGainLoss = enrichedAssets.reduce((sum, asset) => sum + asset.gainLoss, 0);
    const totalDayChange = enrichedAssets.reduce((sum, asset) => sum + asset.dayChange, 0);
    
    const totalCost = enrichedAssets.reduce((sum, asset) => sum + (asset.quantity * asset.entryPrice), 0);
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const dayChangePercent = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0;

    // Update allocations
    const assetsWithAllocations = enrichedAssets.map(asset => ({
      ...asset,
      allocation: totalValue > 0 ? (asset.value / totalValue) * 100 : 0,
    }));

    return {
      totalValue,
      totalGainLoss,
      totalGainLossPercent,
      totalDayChange,
      dayChangePercent,
      assets: assetsWithAllocations,
    };
  }, [enrichedAssets]);

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
            <Button variant="outline" className="border-border/50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" className="border-border/50">
              <Sparkles className="h-4 w-4 mr-2" />
              Monte Carlo
            </Button>
            <AddAssetDialog onAddAsset={handleAddAsset} />
          </div>
        </div>

        {/* Portfolio Overview */}
        <PortfolioOverview
          totalValue={portfolioMetrics.totalValue}
          totalGainLoss={portfolioMetrics.totalGainLoss}
          totalGainLossPercent={portfolioMetrics.totalGainLossPercent}
          dayChange={portfolioMetrics.totalDayChange}
          dayChangePercent={portfolioMetrics.dayChangePercent}
        />

        {/* Assets Table */}
        <AssetTable
          assets={portfolioMetrics.assets}
          onRemoveAsset={handleRemoveAsset}
        />
      </div>
    </div>
  );
};