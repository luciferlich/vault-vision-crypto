import { useState } from 'react';
import { toast } from 'sonner';

interface SimulationParams {
  model: 'gbm' | 'jump-diffusion' | 'heston' | 'garch' | 'stable-levy' | 'regime-switching';
  asset: string;
  currentPrice: number;
  holdingDays: number;
  numSimulations: number;
  historicalPrices: number[];
}

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

export const useSimulationModels = () => {
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateReturns = (prices: number[]): number[] => {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    return returns;
  };

  const calculateStatistics = (returns: number[]) => {
    const n = returns.length;
    const mean = returns.reduce((sum, r) => sum + r, 0) / n;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (n - 1);
    const volatility = Math.sqrt(variance);
    
    // Skewness and Kurtosis
    const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / volatility, 3), 0) / n;
    const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / volatility, 4), 0) / n - 3;
    
    return { mean, volatility, skewness, kurtosis };
  };

  const normalRandom = (): number => {
    // Box-Muller transformation
    const u = Math.random();
    const v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const stableLevy = (alpha: number = 1.5, beta: number = 0): number => {
    // Simplified stable Lévy random number generator
    const u = Math.random() - 0.5;
    const w = -Math.log(Math.random());
    
    if (alpha === 1) {
      return (2 / Math.PI) * ((Math.PI / 2 + beta * u) * Math.tan(u) - beta * Math.log((Math.PI / 2) * w * Math.cos(u) / (Math.PI / 2 + beta * u)));
    }
    
    const cosU = Math.cos(u);
    const zeta = beta * Math.tan(Math.PI * alpha / 2);
    const xi = (1 / alpha) * Math.atan(-zeta);
    
    return Math.pow(w * cosU / Math.cos(u - xi), (1 - alpha) / alpha) * 
           Math.sin(alpha * (u + xi)) / Math.pow(cosU, 1 / alpha);
  };

  const runGeometricBrownianMotion = (params: SimulationParams): number[][] => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252)); // Last year of data
    const stats = calculateStatistics(returns);
    
    const dt = 1; // Daily steps
    const drift = stats.mean;
    const volatility = stats.volatility;
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      
      for (let day = 1; day <= holdingDays; day++) {
        const dW = normalRandom();
        const dS = price * (drift * dt + volatility * Math.sqrt(dt) * dW);
        price += dS;
        path.push(Math.max(price, 0.01)); // Prevent negative prices
      }
      
      paths.push(path);
    }
    
    return paths;
  };

  const runJumpDiffusion = (params: SimulationParams): number[][] => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
    const drift = stats.mean;
    const volatility = stats.volatility;
    const jumpIntensity = 0.1; // Jumps per day
    const jumpMean = -0.02; // Average jump size
    const jumpStd = 0.1; // Jump volatility
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      
      for (let day = 1; day <= holdingDays; day++) {
        // Diffusion component
        const dW = normalRandom();
        let dS = price * (drift * dt + volatility * Math.sqrt(dt) * dW);
        
        // Jump component
        if (Math.random() < jumpIntensity * dt) {
          const jumpSize = jumpMean + jumpStd * normalRandom();
          dS += price * (Math.exp(jumpSize) - 1);
        }
        
        price += dS;
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return paths;
  };

  const runHestonModel = (params: SimulationParams): number[][] => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
    const drift = stats.mean;
    const v0 = Math.pow(stats.volatility, 2); // Initial variance
    const kappa = 2.0; // Mean reversion speed
    const theta = v0; // Long-term variance
    const sigma = 0.3; // Volatility of volatility
    const rho = -0.7; // Correlation between price and volatility
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      let variance = v0;
      
      for (let day = 1; day <= holdingDays; day++) {
        const dW1 = normalRandom();
        const dW2 = rho * dW1 + Math.sqrt(1 - rho * rho) * normalRandom();
        
        // Update variance (CIR process)
        const dV = kappa * (theta - variance) * dt + sigma * Math.sqrt(Math.max(variance, 0)) * Math.sqrt(dt) * dW2;
        variance = Math.max(variance + dV, 0.0001);
        
        // Update price
        const dS = price * (drift * dt + Math.sqrt(variance) * Math.sqrt(dt) * dW1);
        price += dS;
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return paths;
  };

  const runGARCH = (params: SimulationParams): number[][] => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
    const drift = stats.mean;
    const omega = 0.00001; // GARCH constant
    const alpha = 0.1; // ARCH parameter
    const beta = 0.85; // GARCH parameter
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      let variance = Math.pow(stats.volatility, 2);
      let lastReturn = 0;
      
      for (let day = 1; day <= holdingDays; day++) {
        // Update variance using GARCH(1,1)
        variance = omega + alpha * Math.pow(lastReturn, 2) + beta * variance;
        
        const dW = normalRandom();
        const ret = drift * dt + Math.sqrt(variance) * Math.sqrt(dt) * dW;
        
        price *= Math.exp(ret);
        lastReturn = ret;
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return paths;
  };

  const runStableLevy = (params: SimulationParams): number[][] => {
    const { currentPrice, holdingDays, numSimulations } = params;
    
    const dt = 1;
    const drift = 0.0001;
    const scale = 0.02;
    const alpha = 1.7; // Stability parameter
    const beta = 0; // Skewness parameter
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      
      for (let day = 1; day <= holdingDays; day++) {
        const levy = stableLevy(alpha, beta);
        const ret = drift * dt + scale * Math.sqrt(dt) * levy;
        
        price *= Math.exp(ret);
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return paths;
  };

  const runRegimeSwitching = (params: SimulationParams): number[][] => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
    // Bull market regime
    const bullDrift = stats.mean * 2;
    const bullVol = stats.volatility * 0.8;
    // Bear market regime
    const bearDrift = stats.mean * -1;
    const bearVol = stats.volatility * 1.5;
    
    const p11 = 0.95; // Probability of staying in bull market
    const p22 = 0.9;  // Probability of staying in bear market
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      let regime = Math.random() > 0.5 ? 1 : 2; // Start randomly
      
      for (let day = 1; day <= holdingDays; day++) {
        // Regime switching
        if (regime === 1) {
          regime = Math.random() < p11 ? 1 : 2;
        } else {
          regime = Math.random() < p22 ? 2 : 1;
        }
        
        const drift = regime === 1 ? bullDrift : bearDrift;
        const volatility = regime === 1 ? bullVol : bearVol;
        
        const dW = normalRandom();
        const dS = price * (drift * dt + volatility * Math.sqrt(dt) * dW);
        price += dS;
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return paths;
  };

  const runSimulation = async (params: SimulationParams) => {
    setLoading(true);
    
    try {
      let paths: number[][];
      let modelParams: Record<string, number> = {};
      
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (params.model) {
        case 'gbm':
          paths = runGeometricBrownianMotion(params);
          const returns = calculateReturns(params.historicalPrices.slice(-252));
          const stats = calculateStatistics(returns);
          modelParams = { drift: stats.mean, volatility: stats.volatility };
          break;
        case 'jump-diffusion':
          paths = runJumpDiffusion(params);
          modelParams = { jumpIntensity: 0.1, jumpMean: -0.02, jumpStd: 0.1 };
          break;
        case 'heston':
          paths = runHestonModel(params);
          modelParams = { kappa: 2.0, theta: 0.04, sigma: 0.3, rho: -0.7 };
          break;
        case 'garch':
          paths = runGARCH(params);
          modelParams = { omega: 0.00001, alpha: 0.1, beta: 0.85 };
          break;
        case 'stable-levy':
          paths = runStableLevy(params);
          modelParams = { alpha: 1.7, beta: 0, scale: 0.02 };
          break;
        case 'regime-switching':
          paths = runRegimeSwitching(params);
          modelParams = { p11: 0.95, p22: 0.9 };
          break;
        default:
          throw new Error('Unknown model type');
      }
      
      // Calculate final price returns for statistics
      const finalPrices = paths.map(path => path[path.length - 1]);
      const finalReturns = finalPrices.map(price => Math.log(price / params.currentPrice));
      const statistics = calculateStatistics(finalReturns);
      
      const results: SimulationResults = {
        paths,
        statistics,
        model: params.model,
        parameters: modelParams,
      };
      
      setResults(results);
      console.log('Simulation completed:', results); // Debug log
      toast.success(`${params.model.toUpperCase()} simulation completed with ${params.numSimulations} paths`);
      
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    runSimulation,
  };
};