"""
MedEase AI — Medical Extractor Service
Extracts structured lab test information from raw text:
- Test Name
- Reported Value
- Unit
- Reference Low / High bounds
- Reference Text
Handles various range formats: '12-16', '12 – 16', '12 to 16', '< 5', '> 10', '≤ 5', '≥ 10', 'Reference unavailable'.
Supports both horizontal tabular formats and sequential multi-line table streams from PDFs.
"""

import re
from typing import List, Optional, Tuple, Dict, Any
from app.schemas.report import ParsedTest, TestStatus
from app.services.rule_engine import evaluate_test_status


def clean_text_dashes(text: str) -> str:
    """Replaces all unicode dashes, minus signs, and replacement chars with standard hyphens."""
    if not text:
        return ""
    return (
        text.replace("–", "-")
        .replace("—", "-")
        .replace("−", "-")
        .replace("―", "-")
        .replace("\ufffd", "-")
    )


def parse_reference_range(range_str: str) -> Tuple[Optional[float], Optional[float], str]:
    """
    Parses a reference range string into (low_bound, high_bound, cleaned_text).
    Returns (None, None, cleaned_text) if the range is unavailable or cannot be parsed.
    """
    if not range_str:
        return None, None, "Reference unavailable"

    cleaned = clean_text_dashes(range_str.strip())
    
    # Check for keywords indicating unavailable range
    if any(neg in cleaned.lower() for neg in ["unavailable", "n/a", "not provided", "not available", "none", "unknown", "nil"]):
        return None, None, cleaned

    # 1. Inequality formats: <= X, < X, <=X, ≤ X, >= X, > X, ≥ X
    less_match = re.search(r'(?:<=|≤|<)\s*([0-9]+(?:\.[0-9]+)?)', cleaned)
    greater_match = re.search(r'(?:>=|≥|>)\s*([0-9]+(?:\.[0-9]+)?)', cleaned)

    if less_match and greater_match:
        try:
            high = float(less_match.group(1))
            low = float(greater_match.group(1))
            return low, high, cleaned
        except ValueError:
            pass
    elif less_match:
        try:
            high = float(less_match.group(1))
            return None, high, cleaned
        except ValueError:
            pass
    elif greater_match:
        try:
            low = float(greater_match.group(1))
            return low, None, cleaned
        except ValueError:
            pass

    # 2. Dual bound format: "12 - 16", "12 to 16", "12.0 - 16.5", "150000 - 450000"
    dual_match = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(?:-|to)\s*([0-9]+(?:\.[0-9]+)?)', cleaned, re.IGNORECASE)
    if dual_match:
        try:
            low = float(dual_match.group(1))
            high = float(dual_match.group(2))
            return low, high, cleaned
        except ValueError:
            pass

    # 3. Single numeric bound
    single_num = re.search(r'^([0-9]+(?:\.[0-9]+)?)$', cleaned)
    if single_num:
        try:
            val = float(single_num.group(1))
            return None, val, cleaned
        except ValueError:
            pass

    return None, None, cleaned


def extract_metadata(raw_text: str) -> Dict[str, str]:
    """
    Extracts metadata such as Patient Name, Date, Report Type from raw report text.
    """
    metadata = {
        "patient_name": "Patient",
        "report_date": "",
        "report_type": "General Laboratory Report"
    }

    # Extract patient name
    patient_match = re.search(r'(?:Patient(?:\s+Name)?|Name)\s*[:\-]\s*([A-Za-z0-9\s\.\_]+?)(?:\s{2,}|\n|\t|Date|$)', raw_text, re.IGNORECASE)
    if patient_match:
        p_name = patient_match.group(1).strip()
        if p_name and len(p_name) < 40:
            metadata["patient_name"] = p_name

    # Extract date
    date_match = re.search(r'(?:Date|Report\s+Date|Collection\s+Date)\s*[:\-]\s*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})', raw_text, re.IGNORECASE)
    if date_match:
        metadata["report_date"] = date_match.group(1).strip()

    # Detect report type
    if re.search(r'(?:Complete\s+Blood\s+Count|CBC|Hemogram)', raw_text, re.IGNORECASE):
        metadata["report_type"] = "Complete Blood Count (CBC)"
    elif re.search(r'(?:Lipid\s+Profile|Cholesterol)', raw_text, re.IGNORECASE):
        metadata["report_type"] = "Lipid Profile"
    elif re.search(r'(?:Liver\s+Function|LFT)', raw_text, re.IGNORECASE):
        metadata["report_type"] = "Liver Function Test (LFT)"
    elif re.search(r'(?:Kidney\s+Function|Renal|RFT|KFT)', raw_text, re.IGNORECASE):
        metadata["report_type"] = "Renal Function Test (RFT)"
    elif re.search(r'(?:Demo\s+Lab\s+Report|MedEase\s+AI\s+Demo)', raw_text, re.IGNORECASE):
        metadata["report_type"] = "MedEase AI Standard Lab Panel"

    return metadata


def parse_unit_from_str(text: str) -> str:
    """Extracts common medical units from text."""
    common_units = [
        "g/dL", "/µL", "/uL", "/L", "mg/dL", "units", "%", "mmol/L", "U/L", "IU/L",
        "cells/mcL", "cells/cu.mm", "cells/mm3", "x10^3/uL", "ng/mL", "pg", "fl", "fL", "mcg/dL"
    ]
    cleaned = clean_text_dashes(text)
    for u in common_units:
        if re.search(r'(?:\b|\s|/)' + re.escape(u) + r'(?:\b|\s|$)', cleaned, re.IGNORECASE):
            return u
    return ""


def extract_tests_from_text(raw_text: str) -> List[ParsedTest]:
    """
    Parses lines of medical report text into a list of structured ParsedTest objects.
    Robustly handles both horizontal single-line tabular rows and vertical multi-line sequential rows.
    """
    cleaned_full_text = clean_text_dashes(raw_text)
    raw_lines = [l.strip() for l in cleaned_full_text.splitlines() if l.strip()]
    tests: List[ParsedTest] = []

    # Filter non-data header / footer lines
    ignore_exact = {"test", "result", "reference range", "units", "flag", "status", "range", "parameters", "investigation"}
    filtered_lines = []
    for l in raw_lines:
        lower_l = l.lower()
        if lower_l in ignore_exact:
            continue
        if any(lower_l.startswith(k) for k in [
            "medease ai demo", "patient", "date:", "age/sex", "sample id",
            "referring clinician", "department:", "this is a synthetic", "page "
        ]):
            continue
        filtered_lines.append(l)

    # Strategy 1: Horizontal single-line extraction (e.g. "Hemoglobin   13.5   12-16 g/dL")
    for line in filtered_lines:
        col_match = re.match(
            r'^([A-Za-z0-9\s\(\)\-\/\.\+\%]+?)\s{2,}[:\-]?\s*([0-9]+(?:\.[0-9]+)?|[<>]?\s*[0-9]+(?:\.[0-9]+)?)\s+(.*)$',
            line
        )
        if not col_match:
            col_match = re.match(
                r'^([A-Za-z0-9\s\(\)\-\/\.\+\%]+?)\s*[:|\t]\s*([0-9]+(?:\.[0-9]+)?|[<>]?\s*[0-9]+(?:\.[0-9]+)?)\s*(.*)$',
                line
            )

        if col_match:
            test_name = col_match.group(1).strip()
            val_str = col_match.group(2).strip()
            rest = col_match.group(3).strip()

            if len(test_name) < 2 or test_name.lower() in ignore_exact:
                continue

            unit = parse_unit_from_str(rest)
            ref_low, ref_high, clean_ref_text = parse_reference_range(rest)
            status, num_val = evaluate_test_status(val_str, ref_low, ref_high, clean_ref_text)

            tests.append(ParsedTest(
                name=test_name,
                value=val_str,
                numeric_value=num_val,
                unit=unit,
                reference_low=ref_low,
                reference_high=ref_high,
                reference_text=clean_ref_text,
                status=status
            ))

    if tests:
        return tests

    # Strategy 2: Sequential vertical layout (e.g. Line 0: TestName, Line 1: Value, Line 2: Reference Range)
    i = 0
    while i < len(filtered_lines):
        line = filtered_lines[i]
        
        # Check if next line is a numeric value
        if i + 1 < len(filtered_lines):
            next_line = filtered_lines[i+1].strip()
            # Is next line a number / result value?
            is_val = bool(re.match(r'^[<>=≤≥]?\s*[0-9]+(?:\.[0-9]+)?$', next_line))
            
            if is_val:
                test_name = line
                val_str = next_line
                ref_text = ""
                
                # Check if third line is reference range
                if i + 2 < len(filtered_lines):
                    third_line = filtered_lines[i+2].strip()
                    # If third line is not another test name with subsequent number, it's reference range
                    ref_text = third_line
                    i += 3
                else:
                    i += 2

                unit = parse_unit_from_str(ref_text)
                ref_low, ref_high, clean_ref_text = parse_reference_range(ref_text)
                status, num_val = evaluate_test_status(val_str, ref_low, ref_high, clean_ref_text)

                tests.append(ParsedTest(
                    name=test_name,
                    value=val_str,
                    numeric_value=num_val,
                    unit=unit,
                    reference_low=ref_low,
                    reference_high=ref_high,
                    reference_text=clean_ref_text,
                    status=status
                ))
                continue
        i += 1

    return tests
