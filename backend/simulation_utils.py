import ccxt
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Binance client
binance = ccxt.binance()

def fetch_ohlcv(symbol: str, days: int = 365) -> pd.DataFrame:
    """Fetch historical daily OHLCV data from Binance."""
    try:
        since = binance.parse8601((datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S"))
        ohlcv = binance.fetch_ohlcv(symbol, timeframe='1d', since=since)
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    except Exception as e:
        raise ValueError(f"Error fetching data: {e}")


def simulate_prices(data: pd.DataFrame, holding_days: int, simulations: int, sim_type: str) -> dict:
    """Run Monte Carlo simulations on price data."""
    returns = np.log(data['close'] / data['close'].shift(1)).dropna()
    mu = returns.mean()
    sigma = returns.std()
    start_price = data['close'].iloc[-1]

    dt = 1
    results = []
    simulated_prices = []
    batch_size = 5000

    for start in range(0, simulations, batch_size):
        end = min(start + batch_size, simulations)
        size = end - start

        if sim_type == "Geometric Brownian Motion (GBM)":
            rand_matrix = np.random.normal(0, 1, size=(size, holding_days))
            daily_returns = np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * rand_matrix)
            prices = start_price * daily_returns.cumprod(axis=1)
        elif sim_type == "Standard Brownian Motion":
            increments = np.random.normal(mu * dt, sigma * np.sqrt(dt), size=(size, holding_days))
            log_prices = np.cumsum(increments, axis=1) + np.log(start_price)
            prices = np.exp(log_prices)
        elif sim_type == "Jump Diffusion":
            jump_lambda = 0.1
            jump_mu = -0.01
            jump_sigma = 0.02
            rand_matrix = np.random.normal(0, 1, size=(size, holding_days))
            jumps = np.random.poisson(jump_lambda, size=(size, holding_days)) * np.random.normal(jump_mu, jump_sigma, size=(size, holding_days))
            daily_returns = np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) + jumps)
            prices = start_price * daily_returns.cumprod(axis=1)
        elif sim_type == "Historical Bootstrap":
            bootstrapped_returns = np.random.choice(returns, size=(size, holding_days), replace=True)
            prices = start_price * np.exp(np.cumsum(bootstrapped_returns, axis=1))
        elif sim_type == "GARCH + GBM hybrid":
            garch_vol = np.clip(sigma + np.random.normal(0, 0.01, (size, holding_days)), 0, 1)
            rand_matrix = np.random.normal(0, 1, size=(size, holding_days))
            daily_returns = np.exp((mu - 0.5 * garch_vol**2) * dt + garch_vol * np.sqrt(dt) * rand_matrix)
            prices = start_price * daily_returns.cumprod(axis=1)
        else:
            prices = np.full((size, holding_days), start_price)

        final_returns = prices[:, -1] / start_price - 1
        results.extend(final_returns)
        simulated_prices.append(prices)

    results = np.array(results)
    simulated_prices = np.vstack(simulated_prices)

    expected_return = results.mean()
    std_dev = results.std()
    prob_gain = (results > 0).mean()
    percentiles = [10, 25, 40, 50, 60, 75, 90]
    price_percentiles = np.percentile(simulated_prices[:, -1], percentiles)

    return {
        "expected_return": float(expected_return),
        "std_dev": float(std_dev),
        "prob_gain": float(prob_gain),
        "price_percentiles": price_percentiles.tolist(),
        "sample_paths": simulated_prices[:10].tolist()
    }
