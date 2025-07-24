# backend/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from simulation_utils import fetch_ohlcv, simulate_prices

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
