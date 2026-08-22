from __future__ import annotations

from fastapi import APIRouter

from app.analytics.scenario import run_scenario
from app.schemas.simulation import ScenarioInput, ScenarioOutput

router = APIRouter()


@router.post("/run", response_model=ScenarioOutput)
def simulate(input_data: ScenarioInput) -> ScenarioOutput:
    return run_scenario(input_data)
