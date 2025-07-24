import numpy as np

def run_simulation(prices, holding_days, simulations, model):
    returns = np.log(prices / prices.shift(1)).dropna()
    mu = returns.mean()
    sigma = returns.std()
    start_price = prices.iloc[-1]

    dt = 1
    results = []

    for _ in range(simulations):
        if model == "GBM":
            rand = np.random.normal(0, 1, holding_days)
            daily_returns = np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * rand)
            price_path = start_price * daily_returns.cumprod()
        elif model == "Brownian":
            increments = np.random.normal(mu * dt, sigma * np.sqrt(dt), holding_days)
            log_prices = np.cumsum(increments) + np.log(start_price)
            price_path = np.exp(log_prices)
        else:
            price_path = np.full(holding_days, start_price)

        final_return = price_path[-1] / start_price - 1
        results.append(final_return)

    expected_return = np.mean(results)
    std_dev = np.std(results)
    prob_gain = (np.array(results) > 0).mean()

    return {
        "expected_return": expected_return,
        "std_dev": std_dev,
        "prob_gain": prob_gain
    }
