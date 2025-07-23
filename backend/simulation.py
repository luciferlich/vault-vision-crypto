import numpy as np
import pandas as pd

def run_simulation(prices, holding_days, simulations, model):
    returns = np.log(prices / prices.shift(1)).dropna()
    mu = returns.mean()
    sigma = returns.std()
    start_price = prices.iloc[-1]
    dt = 1

    results = []

    for _ in range(simulations):
        if model == "gbm":
            rand = np.random.normal(0, 1, holding_days)
            daily_returns = np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * rand)
            path = start_price * daily_returns.cumprod()
        elif model == "brownian":
            increments = np.random.normal(mu * dt, sigma * np.sqrt(dt), holding_days)
            log_prices = np.cumsum(increments) + np.log(start_price)
            path = np.exp(log_prices)
        elif model == "jump":
            rand = np.random.normal(0, 1, holding_days)
            jumps = np.random.poisson(0.1, holding_days) * np.random.normal(-0.01, 0.02, holding_days)
            daily_returns = np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) + jumps)
            path = start_price * daily_returns.cumprod()
        elif model == "bootstrap":
            boot_returns = np.random.choice(returns, holding_days, replace=True)
            path = start_price * np.exp(np.cumsum(boot_returns))
        elif model == "garch":
            vol = np.clip(sigma + np.random.normal(0, 0.01, holding_days), 0, 1)
            rand = np.random.normal(0, 1, holding_days)
            daily_returns = np.exp((mu - 0.5 * vol**2) * dt + vol * np.sqrt(dt) * rand)
            path = start_price * daily_returns.cumprod()
        else:
            path = np.full(holding_days, start_price)

        final_return = path[-1] / start_price - 1
        results.append(final_return)

    return {
        "expected_return": float(np.mean(results)),
        "std_dev": float(np.std(results)),
        "prob_gain": float((np.array(results) > 0).mean())
    }
