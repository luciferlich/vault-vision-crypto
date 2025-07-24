# Crypto Portfolio Backend

A FastAPI backend for crypto portfolio analytics and Monte Carlo simulations.

## Features

- Historical OHLCV data fetching from KuCoin
- Advanced Monte Carlo simulation models:
  - Geometric Brownian Motion (GBM)
  - Jump Diffusion
  - Heston Stochastic Volatility
  - GARCH
  - Stable Lévy
  - Regime-Switching GBM
- Comprehensive risk analytics and statistics

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
# Method 1: Direct
python run.py

# Method 2: Using uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Method 3: Using bash script
chmod +x start.sh
./start.sh
```

## API Endpoints

### GET /api/historical
Fetch historical OHLCV data for a crypto symbol.

**Parameters:**
- `symbol` (optional): Trading pair (default: "BTC/USDT")

**Example:**
```
GET /api/historical?symbol=ETH/USDT
```

### POST /api/simulate
Run Monte Carlo simulation for price prediction.

**Request Body:**
```json
{
  "symbol": "BTC/USDT",
  "holding_days": 30,
  "simulations": 1000,
  "current_price": 50000.0,
  "model": "gbm"
}
```

**Available Models:**
- `gbm`: Geometric Brownian Motion
- `jump-diffusion`: Jump Diffusion Model
- `heston`: Heston Stochastic Volatility
- `garch`: GARCH Model
- `stable-levy`: Stable Lévy Process
- `regime-switching`: Regime-Switching GBM

**Response:**
```json
{
  "paths": [...],
  "expected_return": 0.05,
  "std_dev": 0.25,
  "prob_gain": 0.65,
  "var_95": -0.15,
  "var_99": -0.25,
  "skewness": 0.1,
  "kurtosis": 3.5,
  "final_prices": [...],
  "mean_final_price": 52500.0,
  "percentiles": {
    "p5": 35000.0,
    "p25": 45000.0,
    "p50": 52000.0,
    "p75": 60000.0,
    "p95": 75000.0
  }
}
```

## Development

The server runs on `http://localhost:8000` by default with auto-reload enabled for development.

API documentation is available at `http://localhost:8000/docs` (Swagger UI).