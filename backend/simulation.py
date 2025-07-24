import numpy as np
import pandas as pd
from scipy import stats

def normal_random():
    """Generate normal random number using Box-Muller transform"""
    u = np.random.random()
    v = np.random.random()
    return np.sqrt(-2 * np.log(u)) * np.cos(2 * np.pi * v)

def stable_levy(alpha=1.5, beta=0):
    """Generate stable Lévy random number"""
    u = np.random.random() - 0.5
    w = -np.log(np.random.random())
    
    if alpha == 1:
        return (2 / np.pi) * ((np.pi / 2 + beta * u) * np.tan(u) - beta * np.log((np.pi / 2) * w * np.cos(u) / (np.pi / 2 + beta * u)))
    
    cos_u = np.cos(u)
    zeta = beta * np.tan(np.pi * alpha / 2)
    xi = (1 / alpha) * np.arctan(-zeta)
    
    return np.power(w * cos_u / np.cos(u - xi), (1 - alpha) / alpha) * \
           np.sin(alpha * (u + xi)) / np.power(cos_u, 1 / alpha)

def run_simulation(prices, holding_days, simulations, model, current_price=None):
    returns = np.log(prices / prices.shift(1)).dropna()
    mu = returns.mean()
    sigma = returns.std()
    start_price = current_price if current_price else prices.iloc[-1]
    dt = 1

    all_paths = []
    results = []

    for _ in range(simulations):
        path = [start_price]
        price = start_price
        
        if model == "gbm":
            for day in range(1, holding_days + 1):
                dW = normal_random()
                dS = price * (mu * dt + sigma * np.sqrt(dt) * dW)
                price += dS
                price = max(price, 0.01)  # Prevent negative prices
                path.append(price)
                
        elif model == "jump-diffusion":
            jump_intensity = 0.1
            jump_mean = -0.02
            jump_std = 0.1
            
            for day in range(1, holding_days + 1):
                dW = normal_random()
                dS = price * (mu * dt + sigma * np.sqrt(dt) * dW)
                
                # Jump component
                if np.random.random() < jump_intensity * dt:
                    jump_size = jump_mean + jump_std * normal_random()
                    dS += price * (np.exp(jump_size) - 1)
                
                price += dS
                price = max(price, 0.01)
                path.append(price)
                
        elif model == "heston":
            v0 = sigma**2
            kappa = 2.0
            theta = v0
            sigma_v = 0.3
            rho = -0.7
            variance = v0
            
            for day in range(1, holding_days + 1):
                dW1 = normal_random()
                dW2 = rho * dW1 + np.sqrt(1 - rho**2) * normal_random()
                
                # Update variance (CIR process)
                dV = kappa * (theta - variance) * dt + sigma_v * np.sqrt(max(variance, 0)) * np.sqrt(dt) * dW2
                variance = max(variance + dV, 0.0001)
                
                # Update price
                dS = price * (mu * dt + np.sqrt(variance) * np.sqrt(dt) * dW1)
                price += dS
                price = max(price, 0.01)
                path.append(price)
                
        elif model == "garch":
            omega = 0.00001
            alpha = 0.1
            beta = 0.85
            variance = sigma**2
            last_return = 0
            
            for day in range(1, holding_days + 1):
                # Update variance using GARCH(1,1)
                variance = omega + alpha * last_return**2 + beta * variance
                
                dW = normal_random()
                ret = mu * dt + np.sqrt(variance) * np.sqrt(dt) * dW
                
                price *= np.exp(ret)
                last_return = ret
                price = max(price, 0.01)
                path.append(price)
                
        elif model == "stable-levy":
            drift = 0.0001
            scale = 0.02
            alpha = 1.7
            
            for day in range(1, holding_days + 1):
                levy = stable_levy(alpha, 0)
                ret = drift * dt + scale * np.sqrt(dt) * levy
                
                price *= np.exp(ret)
                price = max(price, 0.01)
                path.append(price)
                
        elif model == "regime-switching":
            # Bull market regime
            bull_drift = mu * 2
            bull_vol = sigma * 0.8
            # Bear market regime
            bear_drift = mu * -1
            bear_vol = sigma * 1.5
            
            p11 = 0.95  # Probability of staying in bull market
            p22 = 0.9   # Probability of staying in bear market
            regime = 1 if np.random.random() > 0.5 else 2  # Start randomly
            
            for day in range(1, holding_days + 1):
                # Regime switching
                if regime == 1:
                    regime = 1 if np.random.random() < p11 else 2
                else:
                    regime = 2 if np.random.random() < p22 else 1
                
                drift = bull_drift if regime == 1 else bear_drift
                volatility = bull_vol if regime == 1 else bear_vol
                
                dW = normal_random()
                dS = price * (drift * dt + volatility * np.sqrt(dt) * dW)
                price += dS
                price = max(price, 0.01)
                path.append(price)
        else:
            path = [start_price] * (holding_days + 1)

        all_paths.append(path)
        final_return = (path[-1] / start_price) - 1
        results.append(final_return)

    # Calculate statistics
    results_array = np.array(results)
    final_prices = [path[-1] for path in all_paths]
    
    return {
        "paths": all_paths,
        "expected_return": float(np.mean(results_array)),
        "std_dev": float(np.std(results_array)),
        "prob_gain": float((results_array > 0).mean()),
        "var_95": float(np.percentile(results_array, 5)),
        "var_99": float(np.percentile(results_array, 1)),
        "skewness": float(stats.skew(results_array)),
        "kurtosis": float(stats.kurtosis(results_array)),
        "final_prices": final_prices,
        "mean_final_price": float(np.mean(final_prices)),
        "percentiles": {
            "p5": float(np.percentile(final_prices, 5)),
            "p25": float(np.percentile(final_prices, 25)),
            "p50": float(np.percentile(final_prices, 50)),
            "p75": float(np.percentile(final_prices, 75)),
            "p95": float(np.percentile(final_prices, 95))
        }
    }
