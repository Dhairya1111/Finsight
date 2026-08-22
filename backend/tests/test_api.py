from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_demo_finance_summary() -> None:
    response = client.get("/api/finance/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["transaction_count"] > 0


def test_markets_company() -> None:
    response = client.get("/api/markets/company/AAPL")
    assert response.status_code == 200
    assert response.json()["symbol"] == "AAPL"


def test_simulation() -> None:
    response = client.post(
        "/api/simulation/run",
        json={"repo_rate": 8, "crude_oil": 110, "inflation": 6.5, "government_spending_change": 10},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "scenario" in payload
    assert payload["scenario"]["repo_rate"] == 8


def test_ai_fallback() -> None:
    response = client.post(
        "/api/ai/analyze",
        json={"question": "Explain inflation.", "domain": "economics", "indicator_id": "cpi_inflation"},
    )
    assert response.status_code == 200
    assert response.json()["used_fallback"] is True


def test_manual_finance_analysis() -> None:
    response = client.post(
        "/api/finance/analyze-manual",
        json={
            "transactions": [
                {
                    "date": "2025-08-01",
                    "description": "Salary",
                    "category": "Income",
                    "amount": 90000,
                    "type": "income",
                    "account": "Primary Checking",
                },
                {
                    "date": "2025-08-03",
                    "description": "Rent",
                    "category": "Housing",
                    "amount": 25000,
                    "type": "expense",
                    "account": "Primary Checking",
                },
            ]
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["transaction_count"] == 2
    assert payload["total_income"] == 90000
    assert payload["total_expenses"] == 25000
