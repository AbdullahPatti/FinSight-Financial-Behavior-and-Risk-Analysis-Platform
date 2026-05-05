import pytest

def test_health_check(client):
    """Basic: does the API respond?"""
    response = client.get("/")
    assert response.status_code == 200
