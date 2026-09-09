"""
Integration tests for FastAPI endpoints
"""

import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app_name" in data


def test_sample_report_endpoint():
    response = client.post("/api/reports/sample?language=en")
    assert response.status_code == 200
    data = response.json()
    assert data["report_id"] == "demo-sample-01"
    assert data["summary"]["within_range"] == 3
    assert data["summary"]["outside_range"] == 2
    assert data["summary"]["unable_to_determine"] == 1
    assert data["summary"]["total_tests"] == 6
    assert len(data["tests"]) == 6


def test_translate_endpoint():
    # Load sample first
    client.post("/api/reports/sample?language=en")
    
    # Translate to Tamil
    response = client.post("/api/reports/demo-sample-01/translate", json={"target_language": "ta"})
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "ta"
    # Verify tamil explanation in first test
    first_test = data["tests"][0]
    assert "ஹீமோகுளோபின்" in first_test["explanation"]["test_explanation"]


def test_doctor_summary_endpoint():
    client.post("/api/reports/sample?language=en")
    response = client.get("/api/reports/demo-sample-01/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["outside_range_count"] == 2
    assert len(data["items"]) == 2
    assert "Important:" in data["disclaimer"]


def test_upload_demo_pdf():
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_reports", "demo_report.pdf"))
    with open(pdf_path, "rb") as f:
        response = client.post(
            "/api/reports/upload",
            files={"file": ("demo_report.pdf", f, "application/pdf")},
            data={"language": "en"}
        )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["within_range"] == 3
    assert data["summary"]["outside_range"] == 2
    assert data["summary"]["unable_to_determine"] == 1
