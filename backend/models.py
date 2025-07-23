from pydantic import BaseModel
from typing import Literal

class SimulationRequest(BaseModel):
    symbol: str
    holding_days: int
    simulations: int
    model: Literal[
        "gbm", "brownian", "jump", "bootstrap", "garch"
    ]
