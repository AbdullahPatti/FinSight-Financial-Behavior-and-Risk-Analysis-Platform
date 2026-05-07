import pytest
from datetime import date
from App.Crud.transaction import get_transactions
from App.Models.transactions import Transaction
from App.Models.users import User

@pytest.fixture
def setup_test_transactions(db_session, auth_token):
    # Get user
    test_user = db_session.query(User).filter(User.email == "sharedtest@example.com").first()

    # Clear existing transactions for this user first
    db_session.query(Transaction).filter(Transaction.user_id == test_user.id).delete()

    transactions = [
        Transaction(
            transaction_id="TXN-101",
            date=date(2026, 1, 1),
            amount_pkr=1000.0,
            expense_category="Travel",
            department="IT",
            is_anomaly=False,
            user_id=test_user.id
        ),
        Transaction(
            transaction_id="TXN-102",
            date=date(2026, 1, 2),
            amount_pkr=5000.0,
            expense_category="Software",
            department="IT",
            is_anomaly=True,
            user_id=test_user.id
        ),
        Transaction(
            transaction_id="TXN-103",
            date=date(2026, 1, 3),
            amount_pkr=2000.0,
            expense_category="Office Supplies",
            department="HR",
            is_anomaly=False,
            user_id=test_user.id
        )
    ]
    
    db_session.add_all(transactions)
    db_session.commit()
    return test_user.id

def test_get_transactions_pagination(db_session, setup_test_transactions):
    user_id = setup_test_transactions
    
    # Test Limit
    txns = get_transactions(db_session, user_id=user_id, skip=0, limit=2)
    assert len(txns) == 2
    
    # Test Skip
    txns_skip = get_transactions(db_session, user_id=user_id, skip=2, limit=5)
    assert len(txns_skip) == 1
    assert txns_skip[0].transaction_id == "TXN-103"

def test_get_transactions_department_filter(db_session, setup_test_transactions):
    user_id = setup_test_transactions
    
    txns_it = get_transactions(db_session, user_id=user_id, department="IT")
    assert len(txns_it) == 2
    assert all(t.department == "IT" for t in txns_it)
    
    txns_hr = get_transactions(db_session, user_id=user_id, department="HR")
    assert len(txns_hr) == 1
    assert txns_hr[0].department == "HR"

def test_get_transactions_category_filter(db_session, setup_test_transactions):
    user_id = setup_test_transactions
    
    txns_travel = get_transactions(db_session, user_id=user_id, category="Travel")
    assert len(txns_travel) == 1
    assert txns_travel[0].expense_category == "Travel"

def test_get_transactions_anomaly_filter(db_session, setup_test_transactions):
    user_id = setup_test_transactions
    
    txns_anomaly = get_transactions(db_session, user_id=user_id, anomaly=True)
    assert len(txns_anomaly) == 1
    assert txns_anomaly[0].is_anomaly is True

    txns_normal = get_transactions(db_session, user_id=user_id, anomaly=False)
    assert len(txns_normal) == 2
    assert all(t.is_anomaly is False for t in txns_normal)

def test_get_transactions_combined_filters(db_session, setup_test_transactions):
    user_id = setup_test_transactions
    
    # Filter by IT AND Anomaly
    txns = get_transactions(db_session, user_id=user_id, department="IT", anomaly=True)
    assert len(txns) == 1
    assert txns[0].transaction_id == "TXN-102"
