# backend/main.py

from fastapi import FastAPI, HTTPException
<<<<<<< HEAD
from fastapi.middleware.cors import CORSMiddleware
from kucoin import fetch_ohlcv
from simulation import run_simulation
from prediction import estimate_target_days
from models import SimulationRequest, PredictionRequest
=======
from pydantic import BaseModel
from simulation_utils import fetch_ohlcv, simulate_prices
>>>>>>> ff5bad2ca4f2b481d1d325285f93e4db8e45a78b

app = FastAPI()

class SimulationRequest(BaseModel):
    symbol: str
    holding_days: int
    simulations: int
    sim_type: str

@app.post("/simulate")
def run_simulation(request: SimulationRequest):
    try:
        data = fetch_ohlcv(request.symbol)
        if data.empty:
            raise ValueError("No data found for symbol.")
        results = simulate_prices(data, request.holding_days, request.simulations, request.sim_type)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# backend/main.py

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
<<<<<<< HEAD
    allow_origins=["*"],
=======
    allow_origins=["http://localhost:3000"],  # or "*" during development
>>>>>>> ff5bad2ca4f2b481d1d325285f93e4db8e45a78b
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
@app.get("/")
def root():
    return {"message": "✅ FastAPI backend is running!"}

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
    result = run_simulation(prices, req.holding_days, req.simulations, req.model)
    return result

@app.post("/api/predict")
def predict(req: PredictionRequest):
    df = fetch_ohlcv(req.symbol)
    if df.empty or len(df) < 30:
        raise HTTPException(status_code=400, detail="Insufficient data")
    
    prices = df["close"]
    days = estimate_target_days(prices, req.target_return_pct)
    return {"estimated_days": days}
=======
>>>>>>> ff5bad2ca4f2b481d1d325285f93e4db8e45a78b
