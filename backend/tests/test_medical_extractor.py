"""
Tests for Medical Extractor and Reference Range parsing
"""

import pytest
from app.services.medical_extractor import parse_reference_range, extract_tests_from_text, extract_metadata
from app.schemas.report import TestStatus


def test_parse_reference_range_formats():
    # Format: 12-16
    low, high, txt = parse_reference_range("12-16")
    assert low == 12.0
    assert high == 16.0

    # Format: 12 – 16 (en-dash)
    low, high, txt = parse_reference_range("12 – 16 g/dL")
    assert low == 12.0
    assert high == 16.0

    # Format: 12 to 16
    low, high, txt = parse_reference_range("12 to 16")
    assert low == 12.0
    assert high == 16.0

    # Format: < 5
    low, high, txt = parse_reference_range("< 5")
    assert low is None
    assert high == 5.0

    # Format: > 10
    low, high, txt = parse_reference_range("> 10")
    assert low == 10.0
    assert high is None

    # Format: ≤ 5
    low, high, txt = parse_reference_range("≤ 5")
    assert low is None
    assert high == 5.0

    # Format: ≥ 10
    low, high, txt = parse_reference_range("≥ 10")
    assert low == 10.0
    assert high is None

    # Format: Reference unavailable
    low, high, txt = parse_reference_range("Reference unavailable")
    assert low is None
    assert high is None


def test_extract_tests_from_demo_sample():
    sample_text = """
MEDEASE AI DEMO LAB REPORT
Patient: Demo User        Date: 05/09/2026

TEST              RESULT     REFERENCE RANGE
Hemoglobin        13.5       12–16 g/dL
WBC               7200       4000–11000 /µL
Platelets         250000     150000–450000 /µL
Example Test A    120        80–100 units
Example Test B    3.8        4–6 units
Example Test C    50         Reference unavailable
"""
    tests = extract_tests_from_text(sample_text)
    assert len(tests) == 6

    # 3 within / 2 outside / 1 unable to determine
    within_tests = [t for t in tests if t.status == TestStatus.WITHIN_PROVIDED_RANGE]
    outside_tests = [t for t in tests if t.status == TestStatus.OUTSIDE_PROVIDED_RANGE]
    unable_tests = [t for t in tests if t.status == TestStatus.UNABLE_TO_DETERMINE]

    assert len(within_tests) == 3
    assert len(outside_tests) == 2
    assert len(unable_tests) == 1

    # Check Hemoglobin
    hemo = next(t for t in tests if t.name.lower() == "hemoglobin")
    assert hemo.value == "13.5"
    assert hemo.numeric_value == 13.5
    assert hemo.reference_low == 12.0
    assert hemo.reference_high == 16.0
    assert hemo.status == TestStatus.WITHIN_PROVIDED_RANGE
