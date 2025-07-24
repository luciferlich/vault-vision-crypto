import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioOverviewProps {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  riskScore: number;
  riskLabel: string;
}

export const PortfolioOverview = ({
  totalValue,
  totalGainLoss,
  totalGainLossPercent,
  dayChange,
  dayChangePercent,
  riskScore,
  riskLabel,
}: PortfolioOverviewProps) => {
  const isPositiveTotal = totalGainLoss >= 0;
  const isPositiveDay = dayChange >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6 bg-gradient-card border-border/50 shadow-elevation">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Total Portfolio Value</span>
        </div>
        <div className="text-2xl font-bold text-foreground">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-border/50 shadow-elevation">
        <div className="flex items-center space-x-2 mb-2">
          <PieChart className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Total P&L</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-2xl font-bold",
            isPositiveTotal ? "text-success" : "text-danger"
          )}>
            ${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <Badge variant={isPositiveTotal ? "default" : "destructive"} className="text-xs">
            {isPositiveTotal ? "+" : ""}{totalGainLossPercent.toFixed(2)}%
          </Badge>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-border/50 shadow-elevation">
        <div className="flex items-center space-x-2 mb-2">
          {isPositiveDay ? (
            <TrendingUp className="h-5 w-5 text-success" />
          ) : (
            <TrendingDown className="h-5 w-5 text-danger" />
          )}
          <span className="text-sm font-medium text-muted-foreground">24h Change</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-2xl font-bold",
            isPositiveDay ? "text-success" : "text-danger"
          )}>
            ${Math.abs(dayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <Badge variant={isPositiveDay ? "default" : "destructive"} className="text-xs">
            {isPositiveDay ? "+" : ""}{dayChangePercent.toFixed(2)}%
          </Badge>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-border/50 shadow-elevation">
        <div className="flex items-center space-x-2 mb-2">
          <PieChart className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-2xl font-bold",
            riskScore >= 7.5 ? "text-danger" : 
            riskScore >= 5.5 ? "text-amber-500" : 
            "text-success"
          )}>
            {riskScore || 'N/A'}
          </span>
          <Badge 
            variant={
              riskScore >= 7.5 ? "destructive" : 
              riskScore >= 5.5 ? "secondary" : 
              "default"
            } 
            className="text-xs"
          >
            {riskLabel}
          </Badge>
        </div>
      </Card>
    </div>
  );
};