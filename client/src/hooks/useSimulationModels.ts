import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SimulationParams {
  model: string;
  currentPrice: number;
  holdingDays: number;
  numSimulations: number;
  historicalPrices: number[];
}

export interface SimulationResults {
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
  const { toast } = useToast();

  const calculateReturns = (prices: number[]): number[] => {
    return prices.slice(1).map((price, i) => Math.log(price / prices[i]));
  };

  const calculateStatistics = (returns: number[]) => {
    const n = returns.length;
    const mean = returns.reduce((sum, r) => sum + r, 0) / n;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (n - 1);
    const volatility = Math.sqrt(variance);
    
    const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / volatility, 3), 0) / n;
    const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / volatility, 4), 0) / n;
    
    return { mean, volatility, skewness, kurtosis };
  };

  const normalRandom = (): number => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const runGeometricBrownianMotion = (params: SimulationParams): { paths: number[][], parameters: Record<string, number> } => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
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
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return {
      paths,
      parameters: { drift, volatility }
    };
  };

  const runJumpDiffusion = (params: SimulationParams): { paths: number[][], parameters: Record<string, number> } => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
    const drift = stats.mean;
    const volatility = stats.volatility;
    const jumpIntensity = 0.1;
    const jumpMean = -0.02;
    const jumpStd = 0.1;
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      
      for (let day = 1; day <= holdingDays; day++) {
        const dW = normalRandom();
        let dS = price * (drift * dt + volatility * Math.sqrt(dt) * dW);
        
        if (Math.random() < jumpIntensity * dt) {
          const jumpSize = jumpMean + jumpStd * normalRandom();
          dS += price * (Math.exp(jumpSize) - 1);
        }
        
        price += dS;
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return {
      paths,
      parameters: { drift, volatility, jumpIntensity, jumpMean, jumpStd }
    };
  };

  const runHestonModel = (params: SimulationParams): { paths: number[][], parameters: Record<string, number> } => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
    const drift = stats.mean;
    const v0 = Math.pow(stats.volatility, 2);
    const kappa = 2.0;
    const theta = v0;
    const sigma = 0.3;
    const rho = -0.7;
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      let variance = v0;
      
      for (let day = 1; day <= holdingDays; day++) {
        const dW1 = normalRandom();
        const dW2 = rho * dW1 + Math.sqrt(1 - rho * rho) * normalRandom();
        
        const dV = kappa * (theta - variance) * dt + sigma * Math.sqrt(Math.max(variance, 0)) * Math.sqrt(dt) * dW2;
        variance = Math.max(variance + dV, 0.0001);
        
        const dS = price * (drift * dt + Math.sqrt(variance) * Math.sqrt(dt) * dW1);
        price += dS;
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return {
      paths,
      parameters: { drift, kappa, theta, sigma, rho }
    };
  };

  const runGARCH = (params: SimulationParams): { paths: number[][], parameters: Record<string, number> } => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
    const drift = stats.mean;
    const omega = 0.00001;
    const alpha = 0.1;
    const beta = 0.85;
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      let variance = Math.pow(stats.volatility, 2);
      let lastReturn = 0;
      
      for (let day = 1; day <= holdingDays; day++) {
        variance = omega + alpha * Math.pow(lastReturn, 2) + beta * variance;
        
        const dW = normalRandom();
        const ret = drift * dt + Math.sqrt(variance) * Math.sqrt(dt) * dW;
        lastReturn = ret;
        
        price *= Math.exp(ret);
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return {
      paths,
      parameters: { drift, omega, alpha, beta }
    };
  };

  const runStableLevy = (params: SimulationParams): { paths: number[][], parameters: Record<string, number> } => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
    const drift = stats.mean;
    const alpha = 1.7;
    const beta = 0;
    const scale = 0.02;
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      
      for (let day = 1; day <= holdingDays; day++) {
        const levy = generateStableLevy(alpha, beta, scale);
        const dS = price * (drift * dt + levy * Math.sqrt(dt));
        price += dS;
        path.push(Math.max(price, 0.01));
      }
      
      paths.push(path);
    }
    
    return {
      paths,
      parameters: { drift, alpha, beta, scale }
    };
  };

  const generateStableLevy = (alpha: number, beta: number, scale: number): number => {
    const u = Math.random() - 0.5;
    const v = Math.random();
    const xi = Math.atan(beta * Math.tan(Math.PI * alpha / 2)) / alpha;
    const cosU = Math.cos(u);
    
    return scale * Math.pow(v * cosU / Math.cos(u - xi), (1 - alpha) / alpha) * 
           Math.sin(alpha * (u + xi)) / Math.pow(cosU, 1 / alpha);
  };

  const runRegimeSwitching = (params: SimulationParams): { paths: number[][], parameters: Record<string, number> } => {
    const { currentPrice, holdingDays, numSimulations, historicalPrices } = params;
    
    const returns = calculateReturns(historicalPrices.slice(-252));
    const stats = calculateStatistics(returns);
    
    const dt = 1;
    const bullDrift = stats.mean * 1.5;
    const bearDrift = stats.mean * -0.5;
    const bullVol = stats.volatility * 0.8;
    const bearVol = stats.volatility * 1.3;
    const p11 = 0.95;
    const p22 = 0.9;
    const mu1 = bullDrift;
    const mu2 = bearDrift;
    const p = 0.05;
    
    const paths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const path = [currentPrice];
      let price = currentPrice;
      let regime = 1;
      
      for (let day = 1; day <= holdingDays; day++) {
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
    
    return {
      paths,
      parameters: { mu1, mu2, p, p11, p22 }
    };
  };

  const runSimulation = async (params: SimulationParams) => {
    setLoading(true);
    
    try {
      let simulationResult: { paths: number[][], parameters: Record<string, number> };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (params.model) {
        case 'gbm':
          simulationResult = runGeometricBrownianMotion(params);
          break;
        case 'jump-diffusion':
          simulationResult = runJumpDiffusion(params);
          break;
        case 'heston':
          simulationResult = runHestonModel(params);
          break;
        case 'garch':
          simulationResult = runGARCH(params);
          break;
        case 'stable-levy':
          simulationResult = runStableLevy(params);
          break;
        case 'regime-switching':
          simulationResult = runRegimeSwitching(params);
          break;
        default:
          simulationResult = runGeometricBrownianMotion(params);
      }
      
      const { paths, parameters } = simulationResult;
      const finalPrices = paths.map(path => path[path.length - 1]);
      const finalReturns = finalPrices.map(price => Math.log(price / params.currentPrice));
      const statistics = calculateStatistics(finalReturns);
      
      const results: SimulationResults = {
        paths,
        statistics,
        model: params.model,
        parameters,
      };
      
      setResults(results);
      console.log('Simulation completed:', results);
      
      toast({
        title: "Simulation Complete",
        description: `${params.model.toUpperCase()} simulation completed with ${params.numSimulations} paths`,
      });
      
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "Simulation Failed",
        description: "Failed to run simulation",
        variant: "destructive",
      });
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