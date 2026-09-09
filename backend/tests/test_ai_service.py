"""
Tests for PDF Parser and AI Service
"""

import os
import pytest
from app.services.pdf_parser import extract_text_from_pdf
from app.services.ai_service import get_mock_explanation, get_patient_summary_text
from app.schemas.report import TestStatus


def test_pdf_parser_demo_file():
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_reports", "demo_report.pdf"))
    assert os.path.exists(pdf_path), "Demo PDF should exist"
    
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    text, pages, is_scanned = extract_text_from_pdf(pdf_bytes)
    assert pages >= 1
    assert not is_scanned
    assert "Hemoglobin" in text
    assert "WBC" in text
    assert "Platelets" in text


def test_ai_service_deterministic_explanations_en():
    exp = get_mock_explanation("Hemoglobin", 13.5, "g/dL", TestStatus.WITHIN_PROVIDED_RANGE, "12-16 g/dL", "en")
    assert "Hemoglobin" in exp.test_explanation or "red blood cells" in exp.test_explanation
    assert "falls within the reference range" in exp.simple_meaning
    assert exp.attention_reason == ""

    exp_out = get_mock_explanation("Example Test A", 120, "units", TestStatus.OUTSIDE_PROVIDED_RANGE, "80-100 units", "en")
    assert "outside the reference range" in exp_out.simple_meaning
    assert "outside" in exp_out.attention_reason
    assert "discussing" in exp_out.professional_discussion.lower()


def test_ai_service_deterministic_explanations_tamil():
    exp_ta = get_mock_explanation("Hemoglobin", 13.5, "g/dL", TestStatus.WITHIN_PROVIDED_RANGE, "12-16 g/dL", "ta")
    assert "ஹீமோகுளோபின்" in exp_ta.test_explanation
    assert "குறிப்பு வரம்பிற்குள் உள்ளது" in exp_ta.simple_meaning


def test_patient_summary_text():
    sum_en = get_patient_summary_text(6, 3, 2, 1, "en")
    assert "contains 6 test results" in sum_en
    assert "3 results are within" in sum_en
    assert "2 results are outside" in sum_en
    assert "1 results could not be classified" in sum_en
    assert "does not by itself establish a diagnosis" in sum_en
