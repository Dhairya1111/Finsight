from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.database import init_db
from app.main import app

init_db()
client = TestClient(app)


def auth_headers(email: str = "test@example.com", password: str = "password123") -> dict[str, str]:
    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "full_name": "Test User",
            "password": password,
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_and_me() -> None:
    email = f"auth-{uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "full_name": "Auth User",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    token = response.json()["access_token"]

    me_response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == email


def test_finance_summary_requires_auth() -> None:
    response = client.get("/api/finance/summary")
    assert response.status_code == 401


def test_demo_finance_summary() -> None:
    headers = auth_headers("demo@example.com")
    client.post("/api/finance/reset", headers=headers)
    response = client.get("/api/finance/summary", headers=headers)
    assert response.status_code == 200
    payload = response.json()
    assert payload["transaction_count"] > 0
    assert payload["source"]["is_demo"] is True


def test_create_update_delete_transaction_flow() -> None:
    headers = auth_headers("ledger@example.com")
    client.post("/api/finance/reset", headers=headers)

    create_response = client.post(
        "/api/finance/transactions",
        headers=headers,
        json={
            "date": "2025-08-01",
            "description": "Salary",
            "category": "Salary",
            "amount": 90000,
            "type": "income",
            "account": "Primary Checking",
        },
    )
    assert create_response.status_code == 201
    created = create_response.json()

    summary_response = client.get("/api/finance/summary", headers=headers)
    summary = summary_response.json()
    assert summary["source"]["is_demo"] is False
    assert summary["transaction_count"] == 1

    update_response = client.put(
        f"/api/finance/transactions/{created['id']}",
        headers=headers,
        json={
            "date": "2025-08-01",
            "description": "Salary credited",
            "category": "Salary",
            "amount": 95000,
            "type": "income",
            "account": "Primary Checking",
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["description"] == "Salary credited"

    list_response = client.get("/api/finance/transactions", headers=headers)
    listed = list_response.json()
    assert len(listed) == 1
    assert listed[0]["amount"] == 95000

    delete_response = client.delete(f"/api/finance/transactions/{created['id']}", headers=headers)
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == "Transaction removed."


def test_voice_entry() -> None:
    headers = auth_headers("voice@example.com")
    client.post("/api/finance/reset", headers=headers)
    response = client.post(
        "/api/finance/voice-entry",
        headers=headers,
        json={"text": "Spent 500 on groceries using upi today"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["parsed_transaction"]["amount"] == 500
    assert payload["parsed_transaction"]["type"] == "expense"


def test_share_link_flow() -> None:
    headers = auth_headers("share@example.com")
    client.post("/api/finance/reset", headers=headers)
    client.post(
        "/api/finance/transactions",
        headers=headers,
        json={
            "date": "2025-08-01",
            "description": "Salary",
            "category": "Salary",
            "amount": 90000,
            "type": "income",
            "account": "Primary Checking",
        },
    )
    share_response = client.post("/api/finance/share", headers=headers)
    assert share_response.status_code == 200
    share = share_response.json()
    public_response = client.get(f"/api/finance/shared/{share['token']}")
    assert public_response.status_code == 200
    payload = public_response.json()
    assert payload["summary"]["transaction_count"] == 1
    assert len(payload["transactions"]) == 1


def test_markets_company() -> None:
    response = client.get("/api/markets/company/AAPL")
    assert response.status_code == 200
    assert response.json()["symbol"] == "AAPL"


def test_market_search() -> None:
    response = client.get("/api/markets/search?query=apple")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 1
    assert payload[0]["symbol"]


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
    assert response.json()["scenario"]["repo_rate"] == 8


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
        json={"question": "What is the price of oil in India?", "domain": "economics"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "oil" in payload["answer"].lower() or "crude" in payload["answer"].lower()


def test_finance_ai_requires_auth() -> None:
    response = client.post(
        "/api/ai/analyze",
        json={"question": "Summarize my spending.", "domain": "finance"},
    )
    assert response.status_code == 401


def test_manual_finance_analysis_replaces_active_ledger() -> None:
    headers = auth_headers("manual@example.com")
    response = client.post(
        "/api/finance/analyze-manual",
        headers=headers,
        json={
            "transactions": [
                {
                    "date": "2025-08-01",
                    "description": "Salary",
                    "category": "Salary",
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
