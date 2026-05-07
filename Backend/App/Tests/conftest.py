import os
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from App.db import Base, get_db
from App.main import app

TEST_DB_PATH = Path(__file__).parent / "test_finsight.db"
TEST_DB = f"sqlite:///{TEST_DB_PATH.as_posix()}"
engine = create_engine(TEST_DB, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables unless KEEP_TEST_DB is set (useful for debugging/inspection)
    if not os.getenv("KEEP_TEST_DB"):
        Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def db_session():
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def auth_token(client):
    user_data = {
        "full_name": "Shared Test User",
        "email": "sharedtest@example.com",
        "password": "testpassword123"
    }
    client.post("/auth/register", json=user_data)
    response = client.post("/auth/login", json={"email": user_data["email"], "password": user_data["password"]})
    return response.json().get("access_token")