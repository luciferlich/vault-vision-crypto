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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Price Paths Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Price Evolution Paths
          </CardTitle>
          <CardDescription>
            Monte Carlo simulation paths with confidence intervals ({results.paths.length} simulations)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pathData}>
                <XAxis 
                  dataKey="day" 
                  type="number"
                  domain={[0, holdingDays]}
                  tickFormatter={(value) => `Day ${value}`}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `Day ${value}`}
                />
                
                {/* Confidence bands */}
                <Area
                  dataKey="p95"
                  stroke="none"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
                <Area
                  dataKey="p75"
                  stroke="none"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
                <Area
                  dataKey="p25"
                  stroke="none"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
                <Area
                  dataKey="p5"
                  stroke="none"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
                
                {/* Median line */}
                <Line
                  dataKey="p50"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  name="Median"
                />
                
                {/* Sample paths */}
                {samplePaths.slice(0, 10).map((_, index) => (
                  <Line
                    key={index}
                    dataKey={`path${index}`}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeOpacity={0.3}
                    dot={false}
                    name={`Path ${index + 1}`}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Price Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Final Price Distribution
          </CardTitle>
          <CardDescription>
            Distribution of {asset} prices after {holdingDays} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <XAxis 
                  dataKey="price" 
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `Price: $${value}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.8}
                  name="Frequency"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Returns Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Returns Distribution
          </CardTitle>
          <CardDescription>
            Distribution of percentage returns after {holdingDays} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returnsData}>
                <XAxis 
                  dataKey="return" 
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `Return: ${value}%`}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--chart-2))" 
                  fillOpacity={0.8}
                  name="Frequency"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Model Statistics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Model Statistics & Parameters
          </CardTitle>
          <CardDescription>
            Statistical properties of the {results.model.toUpperCase()} model results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Mean Log Return</p>
              <p className="text-2xl font-bold text-primary">
                {(results.statistics.mean * 100).toFixed(3)}%
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Volatility</p>
              <p className="text-2xl font-bold text-orange-400">
                {(results.statistics.volatility * 100).toFixed(2)}%
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Skewness</p>
              <p className="text-2xl font-bold text-blue-400">
                {results.statistics.skewness.toFixed(3)}
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Kurtosis</p>
              <p className="text-2xl font-bold text-purple-400">
                {results.statistics.kurtosis.toFixed(3)}
              </p>
            </div>
          </div>
          
          {Object.keys(results.parameters).length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3">Model Parameters</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(results.parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-sm font-mono">
                      {typeof value === 'number' ? value.toFixed(4) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};