import pytest


def test_profile_requires_auth(client):
    # No token provided -> should be 401
    resp = client.get("/auth/profile")
    assert resp.status_code == 401


def test_register_login_and_profile_flow(client):
    user = {
        "full_name": "Test User",
        "email": "testuser@example.com",
        "password": "testpassword123"
    }

    # Register
    r = client.post("/auth/register", json=user)
    print("Register response status:", r.status_code)
    print("Register response body:", r.json())
    assert r.status_code == 201
    assert r.json().get("message") == "User created successfully"

    # Login
    r2 = client.post("/auth/login", json={"email": user["email"], "password": user["password"]})
    print("Login response status:", r2.status_code)
    print("Login response body:", r2.json())
    assert r2.status_code == 200
    body = r2.json()
    assert "access_token" in body
    token = body["access_token"]

    # Access protected profile
    headers = {"Authorization": f"Bearer {token}"}
    r3 = client.get("/auth/profile", headers=headers)
    print("Profile response status:", r3.status_code)
    print("Profile response body:", r3.json())
    assert r3.status_code == 200
    profile = r3.json()
    print(f"Assert check - profile.email: {profile.get('email')} vs expected: {user['email']}")
    print(f"Assert check - profile.full_name: {profile.get('full_name')} vs expected: {user['full_name']}")
    assert profile.get("email") == user["email"]
    assert profile.get("full_name") == user["full_name"]
