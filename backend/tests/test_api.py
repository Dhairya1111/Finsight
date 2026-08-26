from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_demo_finance_summary() -> None:
    client.post("/api/finance/reset")
    response = client.get("/api/finance/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["transaction_count"] > 0
    assert payload["source"]["is_demo"] is True


def test_create_update_delete_transaction_flow() -> None:
    client.post("/api/finance/reset")

    create_response = client.post(
        "/api/finance/transactions",
        json={
            "date": "2025-08-01",
            "description": "Salary",
            "category": "Income",
            "amount": 90000,
            "type": "income",
            "account": "Primary Checking",
        },
    )
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["description"] == "Salary"

    summary_response = client.get("/api/finance/summary")
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["source"]["is_demo"] is False
    assert summary["transaction_count"] == 1

    update_response = client.put(
        f"/api/finance/transactions/{created['id']}",
        json={
            "date": "2025-08-01",
            "description": "Salary credited",
            "category": "Income",
            "amount": 95000,
            "type": "income",
            "account": "Primary Checking",
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["description"] == "Salary credited"

    list_response = client.get("/api/finance/transactions")
    assert list_response.status_code == 200
    listed = list_response.json()
    assert len(listed) == 1
    assert listed[0]["amount"] == 95000

    delete_response = client.delete(f"/api/finance/transactions/{created['id']}")
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == "Transaction removed."


def test_markets_company() -> None:
    response = client.get("/api/markets/company/AAPL")
    assert response.status_code == 200
    assert response.json()["symbol"] == "AAPL"


def test_simulation() -> None:
    response = client.post(
        "/api/simulation/run",
        json={
            "repo_rate": 8,
            "crude_oil": 110,
            "inflation": 6.5,
            "government_spending_change": 10,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert "scenario" in payload
    assert payload["scenario"]["repo_rate"] == 8


def test_ai_fallback() -> None:
    response = client.post(
        "/api/ai/analyze",
        json={
            "question": "Explain inflation.",
            "domain": "economics",
            "indicator_id": "cpi_inflation",
        },
    )
    assert response.status_code == 200
    assert response.json()["used_fallback"] is True


def test_ai_oil_question_returns_relevant_context() -> None:
    response = client.post(
        "/api/ai/analyze",
        json={
            "question": "What is the price of oil in India?",
            "domain": "economics",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert "oil" in payload["answer"].lower() or "crude" in payload["answer"].lower()


def test_manual_finance_analysis_replaces_active_ledger() -> None:
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
