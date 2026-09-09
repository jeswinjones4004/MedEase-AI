"""
Tests for MedEase AI Deterministic Rule Engine (Section 12)
"""

import pytest
from app.schemas.report import TestStatus
from app.services.rule_engine import evaluate_test_status


def test_rule_engine_canonical_within():
    # 13.5 vs 12–16 → within
    status, num = evaluate_test_status(13.5, reference_low=12.0, reference_high=16.0)
    assert status == TestStatus.WITHIN_PROVIDED_RANGE
    assert num == 13.5


def test_rule_engine_canonical_outside_high():
    # 20 vs 12–16 → outside
    status, num = evaluate_test_status(20, reference_low=12.0, reference_high=16.0)
    assert status == TestStatus.OUTSIDE_PROVIDED_RANGE
    assert num == 20.0


def test_rule_engine_canonical_outside_low():
    # 10 vs 12–16 → outside
    status, num = evaluate_test_status(10, reference_low=12.0, reference_high=16.0)
    assert status == TestStatus.OUTSIDE_PROVIDED_RANGE
    assert num == 10.0


def test_rule_engine_canonical_unable_to_determine():
    # unknown range → unable_to_determine
    status, num = evaluate_test_status(50, reference_low=None, reference_high=None, reference_text="Reference unavailable")
    assert status == TestStatus.UNABLE_TO_DETERMINE
    assert num == 50.0


def test_rule_engine_single_sided_greater():
    # > 10 format
    status_pass, _ = evaluate_test_status(15, reference_low=10.0, reference_high=None)
    assert status_pass == TestStatus.WITHIN_PROVIDED_RANGE

    status_fail, _ = evaluate_test_status(8, reference_low=10.0, reference_high=None)
    assert status_fail == TestStatus.OUTSIDE_PROVIDED_RANGE


def test_rule_engine_single_sided_less():
    # < 5 format
    status_pass, _ = evaluate_test_status(3.2, reference_low=None, reference_high=5.0)
    assert status_pass == TestStatus.WITHIN_PROVIDED_RANGE

    status_fail, _ = evaluate_test_status(7.5, reference_low=None, reference_high=5.0)
    assert status_fail == TestStatus.OUTSIDE_PROVIDED_RANGE


def test_rule_engine_unparseable_value():
    status, num = evaluate_test_status("Negative", reference_low=12.0, reference_high=16.0)
    assert status == TestStatus.UNABLE_TO_DETERMINE
    assert num is None
