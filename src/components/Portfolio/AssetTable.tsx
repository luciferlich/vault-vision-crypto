import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  allocation: number;
  dayChange: number;
  dayChangePercent: number;
}

interface AssetTableProps {
  assets: Asset[];
  onRemoveAsset: (id: string) => void;
}

export const AssetTable = ({ assets, onRemoveAsset }: AssetTableProps) => {
  if (assets.length === 0) {
    return (
      <Card className="p-8 bg-gradient-card border-border/50 shadow-elevation text-center">
        <div className="text-muted-foreground">
          <p className="text-lg mb-2">No assets in portfolio</p>
          <p className="text-sm">Add your first crypto asset to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-elevation overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <h3 className="text-lg font-semibold text-foreground">Portfolio Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Asset</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">24h</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Holdings</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Value</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">P&L</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Allocation</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const isPositiveGainLoss = asset.gainLoss >= 0;
              const isPositiveDayChange = asset.dayChange >= 0;
              
              return (
                <tr key={asset.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">{asset.name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-medium text-foreground">
                      ${asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {isPositiveDayChange ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-danger" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        isPositiveDayChange ? "text-success" : "text-danger"
                      )}>
                        {isPositiveDayChange ? "+" : ""}{asset.dayChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-foreground">{asset.quantity}</div>
                    <div className="text-xs text-muted-foreground">
                      @ ${asset.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-medium text-foreground">
                      ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={cn(
                      "font-medium",
                      isPositiveGainLoss ? "text-success" : "text-danger"
                    )}>
                      ${Math.abs(asset.gainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <Badge 
                      variant={isPositiveGainLoss ? "default" : "destructive"} 
                      className="text-xs mt-1"
                    >
                      {isPositiveGainLoss ? "+" : ""}{asset.gainLossPercent.toFixed(2)}%
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-medium text-foreground">{asset.allocation.toFixed(1)}%</div>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveAsset(asset.id)}
                      className="border-border/50 hover:bg-danger/20 hover:border-danger/50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};