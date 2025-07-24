from pydantic import BaseModel
from typing import Literal

class SimulationRequest(BaseModel):
    symbol: str
    holding_days: int
    simulations: int
    current_price: float
    model: Literal[
        "gbm", "jump-diffusion", "heston", "garch", "stable-levy", "regime-switching"
    ]
