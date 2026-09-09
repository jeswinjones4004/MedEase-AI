"""
MedEase AI — Deterministic Rule Engine
CRITICAL ARCHITECTURAL DIRECTIVE:
The LLM never decides medical status. This deterministic backend rule engine does.
The printed reference range in the report is the sole ground truth.
If no reliable reference range is available, status MUST be UNABLE_TO_DETERMINE.
"""

from typing import Optional, Union, Tuple
from app.schemas.report import TestStatus


def evaluate_test_status(
    value: Union[float, int, str, None],
    reference_low: Optional[float] = None,
    reference_high: Optional[float] = None,
    reference_text: str = ""
) -> Tuple[TestStatus, Optional[float]]:
    """
    Deterministically evaluates whether a test value is within or outside the provided reference range.
    Returns (TestStatus, parsed_numeric_value).
    """
    # 1. Parse numeric value if possible
    num_val: Optional[float] = None
    if isinstance(value, (int, float)):
        num_val = float(value)
    elif isinstance(value, str):
        cleaned = value.strip().replace(",", "")
        # Handle prefix symbols if present in value like <0.1 or >50
        try:
            num_val = float(cleaned)
        except ValueError:
            # Check for leading symbols
            for sym in ["<", ">", "<=", ">=", "≤", "≥"]:
                if cleaned.startswith(sym):
                    try:
                        num_val = float(cleaned[len(sym):].strip())
                        break
                    except ValueError:
                        pass

    # If numeric value cannot be parsed, we cannot evaluate deterministically
    if num_val is None:
        return TestStatus.UNABLE_TO_DETERMINE, None

    # 2. Case A: Both Low and High bounds are present (e.g. 12 - 16)
    if reference_low is not None and reference_high is not None:
        if reference_low <= num_val <= reference_high:
            return TestStatus.WITHIN_PROVIDED_RANGE, num_val
        else:
            return TestStatus.OUTSIDE_PROVIDED_RANGE, num_val

    # 3. Case B: Only Low bound is present (e.g. > 10 or >= 10)
    if reference_low is not None and reference_high is None:
        # If reference is ">= X" or "> X"
        if num_val >= reference_low:
            return TestStatus.WITHIN_PROVIDED_RANGE, num_val
        else:
            return TestStatus.OUTSIDE_PROVIDED_RANGE, num_val

    # 4. Case C: Only High bound is present (e.g. < 5 or <= 5)
    if reference_high is not None and reference_low is None:
        # If reference is "<= X" or "< X"
        if num_val <= reference_high:
            return TestStatus.WITHIN_PROVIDED_RANGE, num_val
        else:
            return TestStatus.OUTSIDE_PROVIDED_RANGE, num_val

    # 5. Case D: Reference text indicates unavailable or empty
    # Never guess, never use internet tables
    return TestStatus.UNABLE_TO_DETERMINE, num_val
