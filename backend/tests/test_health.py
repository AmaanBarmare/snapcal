from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok_with_mock_flag():
    client = TestClient(app)
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "version" in body
    assert isinstance(body["mocks"], bool)
