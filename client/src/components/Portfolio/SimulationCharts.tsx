import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart } from 'recharts';
import { TrendingUp, BarChart3, Activity, Target } from 'lucide-react';

interface SimulationResults {
  paths: number[][];
  statistics: {
    mean: number;
    volatility: number;
    skewness: number;
    kurtosis: number;
  };
  model: string;
  parameters: Record<string, number>;
  modelSpecificData?: {
    jumpTimes?: number[][];
    volatilityPaths?: number[][];
    regimePaths?: number[][];
    garchVolatility?: number[];
  };
}

interface SimulationChartsProps {
  results: SimulationResults;
  currentPrice: number;
  asset: string;
  holdingDays: number;
}

export const SimulationCharts = ({ results, currentPrice, asset, holdingDays }: SimulationChartsProps) => {
  // Sample paths for visualization (show max 50 paths)
  const samplePaths = useMemo(() => {
    const numSamplePaths = Math.min(50, results.paths.length);
    const step = Math.floor(results.paths.length / numSamplePaths);
    return results.paths.filter((_, index) => index % step === 0).slice(0, numSamplePaths);
  }, [results.paths]);

  // Price path data for line chart
  const pathData = useMemo(() => {
    const data: any[] = [];
    for (let day = 0; day <= holdingDays; day++) {
      const dataPoint: any = { day };
      
      // Add sample paths
      samplePaths.forEach((path, index) => {
        dataPoint[`path${index}`] = path[day];
      });
      
      // Add percentiles
      const dayPrices = results.paths.map(path => path[day]).sort((a, b) => a - b);
      dataPoint.p5 = dayPrices[Math.floor(dayPrices.length * 0.05)];
      dataPoint.p25 = dayPrices[Math.floor(dayPrices.length * 0.25)];
      dataPoint.p50 = dayPrices[Math.floor(dayPrices.length * 0.5)];
      dataPoint.p75 = dayPrices[Math.floor(dayPrices.length * 0.75)];
      dataPoint.p95 = dayPrices[Math.floor(dayPrices.length * 0.95)];
      
      data.push(dataPoint);
    }
    return data;
  }, [results.paths, holdingDays, samplePaths]);

  // Final price distribution for histogram
  const distributionData = useMemo(() => {
    const finalPrices = results.paths.map(path => path[path.length - 1]);
    const minPrice = Math.min(...finalPrices);
    const maxPrice = Math.max(...finalPrices);
    const numBins = 30;
    const binWidth = (maxPrice - minPrice) / numBins;
    
    const bins = Array(numBins).fill(0);
    const binLabels = Array(numBins).fill(0).map((_, i) => minPrice + i * binWidth);
    
    finalPrices.forEach(price => {
      const binIndex = Math.min(Math.floor((price - minPrice) / binWidth), numBins - 1);
      bins[binIndex]++;
    });
    
    return binLabels.map((label, index) => ({
      price: label.toFixed(0),
      count: bins[index],
      frequency: (bins[index] / finalPrices.length * 100).toFixed(1),
    }));
  }, [results.paths]);

  // Returns distribution
  const returnsData = useMemo(() => {
    const finalPrices = results.paths.map(path => path[path.length - 1]);
    const returns = finalPrices.map(price => ((price - currentPrice) / currentPrice) * 100);
    const minReturn = Math.min(...returns);
    const maxReturn = Math.max(...returns);
    const numBins = 30;
    const binWidth = (maxReturn - minReturn) / numBins;
    
    const bins = Array(numBins).fill(0);
    const binLabels = Array(numBins).fill(0).map((_, i) => minReturn + i * binWidth);
    
    returns.forEach(ret => {
      const binIndex = Math.min(Math.floor((ret - minReturn) / binWidth), numBins - 1);
      bins[binIndex]++;
    });
    
    return binLabels.map((label, index) => ({
      return: label.toFixed(1),
      count: bins[index],
      frequency: (bins[index] / returns.length * 100).toFixed(1),
    }));
  }, [results.paths, currentPrice]);

  const chartConfig = {
    paths: {
      label: "Sample Paths",
      color: "hsl(var(--primary))",
    },
    percentiles: {
      label: "Confidence Intervals",
      color: "hsl(var(--muted))",
    },
    distribution: {
      label: "Frequency",
      color: "hsl(var(--primary))",
    },
  };

  // Model-specific chart components
  const renderModelSpecificCharts = () => {
    switch (results.model) {
      case 'jump-diffusion':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-500" />
                  Jump Events Analysis
                </CardTitle>
                <CardDescription>Distribution and frequency of price jumps</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart data={distributionData} height={300}>
                    <XAxis dataKey="price" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Jump Impact Distribution</CardTitle>
                <CardDescription>Magnitude of price discontinuities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Jump Size:</span>
                    <span className="font-mono">{(results.parameters.jumpMean * 100)?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Jump Frequency:</span>
                    <span className="font-mono">{results.parameters.jumpIntensity?.toFixed(2)}/day</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Jump Volatility:</span>
                    <span className="font-mono">{results.parameters.jumpStd?.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );

      case 'heston':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Stochastic Volatility Evolution
                </CardTitle>
                <CardDescription>Time-varying volatility patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart data={pathData} height={300}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area dataKey="p75" stackId="1" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    <Area dataKey="p25" stackId="1" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    <Line dataKey="p50" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Volatility Clustering Parameters</CardTitle>
                <CardDescription>Mean reversion characteristics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mean Reversion Speed (κ):</span>
                    <span className="font-mono">{results.parameters.kappa?.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Long-term Volatility (θ):</span>
                    <span className="font-mono">{(results.parameters.theta * 100)?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Vol of Vol (σ):</span>
                    <span className="font-mono">{results.parameters.sigma?.toFixed(3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );

      case 'garch':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  GARCH Volatility Clustering
                </CardTitle>
                <CardDescription>Conditional heteroskedasticity patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ComposedChart data={pathData} height={300}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area dataKey="p75" stackId="1" stroke="none" fill="hsl(var(--muted))" fillOpacity={0.3} />
                    <Line dataKey="p50" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>GARCH Model Parameters</CardTitle>
                <CardDescription>Volatility persistence and clustering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ARCH Parameter (α₁):</span>
                    <span className="font-mono">{results.parameters.alpha?.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GARCH Parameter (β₁):</span>
                    <span className="font-mono">{results.parameters.beta?.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Persistence:</span>
                    <span className="font-mono">{((results.parameters.alpha || 0) + (results.parameters.beta || 0))?.toFixed(3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );

      case 'stable-levy':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Heavy-Tailed Distribution
                </CardTitle>
                <CardDescription>Stable Lévy characteristics</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart data={returnsData} height={300}>
                    <XAxis dataKey="return" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area dataKey="frequency" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Lévy Distribution Parameters</CardTitle>
                <CardDescription>Tail heaviness and skewness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stability Parameter (α):</span>
                    <span className="font-mono">{results.parameters.alpha?.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Skewness Parameter (β):</span>
                    <span className="font-mono">{results.parameters.beta?.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tail Index:</span>
                    <span className="font-mono">{(2 / (results.parameters.alpha || 2))?.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );

      case 'regime-switching':
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Market Regime Analysis
                </CardTitle>
                <CardDescription>Bull vs Bear market transitions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ComposedChart data={pathData} height={300}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area dataKey="p75" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Line dataKey="p50" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regime Characteristics</CardTitle>
                <CardDescription>Transition probabilities and persistence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bull Market Drift:</span>
                    <span className="font-mono">{(results.parameters.mu1 * 100)?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bear Market Drift:</span>
                    <span className="font-mono">{(results.parameters.mu2 * 100)?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Transition Probability:</span>
                    <span className="font-mono">{results.parameters.p?.toFixed(3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );

      default: // GBM
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Normal Distribution Analysis
                </CardTitle>
                <CardDescription>Classic lognormal price distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart data={distributionData} height={300}>
                    <XAxis dataKey="price" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>GBM Parameters</CardTitle>
                <CardDescription>Constant drift and volatility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Annual Drift (μ):</span>
                    <span className="font-mono">{(results.parameters.drift * 365 * 100)?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Annual Volatility (σ):</span>
                    <span className="font-mono">{(results.parameters.volatility * Math.sqrt(365) * 100)?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sharpe Ratio:</span>
                    <span className="font-mono">{(results.parameters.drift / results.parameters.volatility)?.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Price Paths Chart - Common for all models */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monte Carlo Price Paths - {results.model.toUpperCase()}
          </CardTitle>
          <CardDescription>
            Simulated price evolution for {asset} over {holdingDays} days ({results.paths.length.toLocaleString()} paths)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pathData}>
                <XAxis dataKey="day" tickFormatter={(value) => `Day ${value}`} />
                <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
                <ChartTooltip content={<ChartTooltipContent />} labelFormatter={(value) => `Day ${value}`} />
                
                {/* Confidence bands */}
                <Area dataKey="p95" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
                <Area dataKey="p75" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.2} />
                <Area dataKey="p25" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.2} />
                <Area dataKey="p5" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
                
                {/* Median line */}
                <Line dataKey="p50" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} name="Median" />
                
                {/* Sample paths */}
                {samplePaths.slice(0, 10).map((_, index) => (
                  <Line
                    key={index}
                    dataKey={`path${index}`}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeOpacity={0.3}
                    dot={false}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Model-Specific Charts */}
      {renderModelSpecificCharts()}
    </div>
  );
};