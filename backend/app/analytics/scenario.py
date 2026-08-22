from __future__ import annotations

from app.schemas.simulation import ScenarioInput, ScenarioOutput

BASELINE = {
    "repo_rate": 6.5,
    "crude_oil": 78.0,
    "inflation": 5.1,
    "government_spending_change": 0.0,
    "gdp_growth": 6.8,
    "cpi_inflation": 5.1,
    "equity_sentiment": 50.0,
    "currency_pressure": 50.0,
}


def run_scenario(input_data: ScenarioInput) -> ScenarioOutput:
    delta_repo = input_data.repo_rate - BASELINE["repo_rate"]
    delta_oil = (input_data.crude_oil - BASELINE["crude_oil"]) / 10
    delta_inflation = input_data.inflation - BASELINE["inflation"]
    delta_govt = input_data.government_spending_change / 10

    scenario = {
        "repo_rate": input_data.repo_rate,
        "crude_oil": input_data.crude_oil,
        "inflation": input_data.inflation,
        "government_spending_change": input_data.government_spending_change,
        "gdp_growth": round(BASELINE["gdp_growth"] - 0.25 * delta_repo - 0.18 * delta_oil + 0.12 * delta_govt, 2),
        "cpi_inflation": round(
            BASELINE["cpi_inflation"] + 0.22 * delta_oil + 0.55 * delta_inflation + 0.06 * delta_govt, 2
        ),
        "equity_sentiment": round(
            BASELINE["equity_sentiment"]
            - 2.8 * delta_repo
            - 1.7 * delta_oil
            - 1.2 * delta_inflation
            + 1.1 * delta_govt,
            2,
        ),
        "currency_pressure": round(
            BASELINE["currency_pressure"] + 1.9 * delta_oil + 0.8 * delta_inflation - 1.5 * delta_repo, 2
        ),
    }
    differences = {key: round(scenario[key] - BASELINE[key], 2) for key in scenario if key in BASELINE}
    assumptions = [
        "This is a simplified educational sensitivity model, not a forecasting system.",
        "Linear relationships are used to illustrate directional effects of changes in rates, oil, inflation, and fiscal stance.",
        "Baseline values are fixed demo assumptions for a stylized India-focused macro scenario.",
        "Results should be interpreted as scenario intuition rather than empirical prediction.",
    ]
    methodology = (
        "FinSight applies a small set of transparent coefficients to baseline macro variables. "
        "Higher repo rates reduce modeled growth and equity sentiment, while higher crude oil raises modeled inflation and currency pressure. "
        "Government spending partially offsets growth drag. Coefficients are pedagogical and intentionally conservative."
    )
    return ScenarioOutput(
        baseline=BASELINE,
        scenario=scenario,
        differences=differences,
        assumptions=assumptions,
        methodology=methodology,
    )
