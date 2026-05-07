import pytest
from datetime import date
from App.Models.transactions import Transaction
from App.Models.users import User

def test_health_check(client):
    """Basic: does the API respond?"""
    response = client.get("/")
    assert response.status_code == 200

def test_dashboard_route_no_auth(client):
    response = client.get("/dashboard/")
    assert response.status_code == 401

def test_dashboard_route_with_auth(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/dashboard/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "overview" in data
    assert "total_transactions" in data["overview"]
    assert "total_expense" in data["overview"]
    
def test_transactions_route_with_auth(client, auth_token, db_session):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/transactions/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "transactions" in data
    
    # Check single transaction error
    response = client.get("/transactions/nonexistent_id", headers=headers)
    assert response.status_code == 200 # Current implementation returns 200 with error key
    assert response.json() == {"error": "Transaction not found"}

def test_export_anomalies_route(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/transactions/export-anomalies", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"

def test_get_single_transaction_content(client, auth_token, db_session):
    # 1. Get the current user created by our auth_token fixture
    test_user = db_session.query(User).filter(User.email == "sharedtest@example.com").first()
    
    # 2. Directly add a synthetic transaction to the test database
    test_txn = Transaction(
        transaction_id="TXN-TEST-999",
        date=date.today(),
        amount_pkr=5000.0,
        expense_category="Travel",
        transaction_description="Test Travel Expense",
        user_id=test_user.id
    )
    db_session.add(test_txn)
    db_session.commit()

    # 3. Request the inserted transaction from the API
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get(f"/transactions/{test_txn.transaction_id}", headers=headers)
    
    # 4. Assert the request succeeds and the content matches what we inserted
    assert response.status_code == 200
    
    data = response.json()
    assert data["transaction_id"] == "TXN-TEST-999"
    assert data["amount_pkr"] == 5000.0
    assert data["expense_category"] == "Travel"
    assert data["transaction_description"] == "Test Travel Expense"


