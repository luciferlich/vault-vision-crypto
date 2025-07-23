import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { SimulationCharts } from './SimulationCharts';
import { useSimulationModels } from '@/hooks/useSimulationModels';

interface SimulationPanelProps {
  selectedAsset: string;
  currentPrice: number;
  historicalData?: number[];
}

type ModelType = 'gbm' | 'jump-diffusion' | 'heston' | 'garch' | 'stable-levy' | 'regime-switching';

export const SimulationPanel = ({ selectedAsset, currentPrice, historicalData = [] }: SimulationPanelProps) => {
  const [holdingDays, setHoldingDays] = useState([30]);
  const [numSimulations, setNumSimulations] = useState([1000]);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gbm');
  const [isRunning, setIsRunning] = useState(false);

  const { runSimulation, results } = useSimulationModels();

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      await runSimulation({
        model: selectedModel,
        asset: selectedAsset,
        currentPrice,
        holdingDays: holdingDays[0],
        numSimulations: numSimulations[0],
        historicalPrices: historicalData,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const modelDescriptions = {
    'gbm': 'Geometric Brownian Motion - Classic Black-Scholes model',
    'jump-diffusion': 'Merton Jump Diffusion - Accounts for sudden price jumps',
    'heston': 'Heston Stochastic Volatility - Variable volatility modeling',
    'garch': 'GARCH - Volatility clustering and time-varying variance',
    'stable-levy': 'Stable Lévy Process - Heavy-tailed distributions',
    'regime-switching': 'Regime-Switching GBM - Multiple market regimes'
  };

  const riskMetrics = useMemo(() => {
    if (!results) return null;

    const finalPrices = results.paths.map(path => path[path.length - 1]);
    const returns = finalPrices.map(price => (price - currentPrice) / currentPrice);
    
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95 = sortedReturns[Math.floor(sortedReturns.length * 0.05)];
    const var99 = sortedReturns[Math.floor(sortedReturns.length * 0.01)];
    
    const expectedReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - expectedReturn, 2), 0) / returns.length);
    
    const profitProbability = returns.filter(r => r > 0).length / returns.length;
    
    return {
      expectedReturn: expectedReturn * 100,
      volatility: volatility * 100,
      var95: var95 * 100,
      var99: var99 * 100,
      profitProbability: profitProbability * 100,
      maxGain: Math.max(...returns) * 100,
      maxLoss: Math.min(...returns) * 100,
    };
  }, [results, currentPrice]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-background to-background/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Monte Carlo Simulation
          </CardTitle>
          <CardDescription>
            Advanced risk modeling and price prediction for {selectedAsset}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Simulation Model</label>
            <Select value={selectedModel} onValueChange={(value: ModelType) => setSelectedModel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gbm">Geometric Brownian Motion (GBM)</SelectItem>
                <SelectItem value="jump-diffusion">Jump Diffusion Model</SelectItem>
                <SelectItem value="heston">Heston Stochastic Volatility</SelectItem>
                <SelectItem value="garch">GARCH Model</SelectItem>
                <SelectItem value="stable-levy">Stable Lévy Process</SelectItem>
                <SelectItem value="regime-switching">Regime-Switching GBM</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{modelDescriptions[selectedModel]}</p>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Holding Period (Days)</label>
              <div className="px-2">
                <Slider
                  value={holdingDays}
                  onValueChange={setHoldingDays}
                  max={365}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 day</span>
                <Badge variant="outline">{holdingDays[0]} days</Badge>
                <span>1 year</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Number of Simulations</label>
              <div className="px-2">
                <Slider
                  value={numSimulations}
                  onValueChange={setNumSimulations}
                  max={10000}
                  min={100}
                  step={100}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100</span>
                <Badge variant="outline">{numSimulations[0].toLocaleString()}</Badge>
                <span>10,000</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleRunSimulation} 
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? 'Running Simulation...' : 'Run Monte Carlo Simulation'}
          </Button>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      {riskMetrics && (
        <Card className="bg-gradient-to-br from-background to-background/50 border-primary/20">
          <CardHeader>
            <CardTitle>Risk Analytics</CardTitle>
            <CardDescription>Statistical analysis of simulation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Expected Return</p>
                <p className={`text-lg font-semibold ${riskMetrics.expectedReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {riskMetrics.expectedReturn >= 0 ? '+' : ''}{riskMetrics.expectedReturn.toFixed(2)}%
                </p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Volatility</p>
                <p className="text-lg font-semibold text-orange-400">
                  {riskMetrics.volatility.toFixed(2)}%
                </p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">VaR (95%)</p>
                <p className="text-lg font-semibold text-red-400">
                  {riskMetrics.var95.toFixed(2)}%
                </p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Profit Probability</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {riskMetrics.profitProbability.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm">Max Gain</span>
                </div>
                <span className="font-semibold text-emerald-400">
                  +{riskMetrics.maxGain.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-sm">Max Loss</span>
                </div>
                <span className="font-semibold text-red-400">
                  {riskMetrics.maxLoss.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {results && (
        <SimulationCharts 
          results={results}
          currentPrice={currentPrice}
          asset={selectedAsset}
          holdingDays={holdingDays[0]}
        />
      )}
    </div>
  );
};