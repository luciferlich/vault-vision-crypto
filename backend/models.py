from pydantic import BaseModel

class SimulationRequest(BaseModel):
    symbol: str
    holding_days: int
    simulations: int
    model: str  # e.g., "GBM", "Brownian", etc.

class PredictionRequest(BaseModel):
    symbol: str
    target_return_pct: float
