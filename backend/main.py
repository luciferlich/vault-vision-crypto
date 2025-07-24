from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kucoin import fetch_ohlcv
from simulation import run_simulation
from models import SimulationRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/historical")
def get_historical(symbol: str = "BTC/USDT"):
    try:
        df = fetch_ohlcv(symbol)
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/simulate")
def simulate(req: SimulationRequest):
    df = fetch_ohlcv(req.symbol)
    if df.empty or len(df) < 30:
        raise HTTPException(status_code=400, detail="Insufficient data")

    prices = df["close"]
    result = run_simulation(prices, req.holding_days, req.simulations, req.model, req.current_price)
    return result
