"""
MedEase AI — Reports API Routes
Endpoints for report upload, extraction, rule engine classification, AI explanation, translation, and doctor summary.
"""

import uuid
import datetime
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import Optional

from app.config import settings
from app.schemas.report import (
    ReportResponse,
    ReportSummary,
    TestResultItem,
    TestStatus,
    TranslateRequest,
    DoctorSummaryResponse,
    DoctorSummaryItem
)
from app.services.pdf_parser import extract_text_from_pdf
from app.services.ocr_service import extract_text_from_image, extract_text_from_scanned_pdf
from app.services.medical_extractor import extract_tests_from_text, extract_metadata
from app.services.ai_service import generate_explanation, get_patient_summary_text
from app.services.report_store import report_store

router = APIRouter(prefix="/reports", tags=["Reports"])


async def process_report_pipeline(
    raw_text: str,
    language: str = "en",
    report_id: Optional[str] = None,
    is_demo: bool = False
) -> ReportResponse:
    """
    Core pipeline: Text -> Metadata -> Medical Extractor -> Rule Engine -> AI Explanations -> ReportResponse
    """
    if not report_id:
        report_id = str(uuid.uuid4())[:8]

    # 1. Extract metadata (patient, date, type)
    meta = extract_metadata(raw_text)

    # 2. Extract tests & evaluate status deterministically via Rule Engine
    parsed_tests = extract_tests_from_text(raw_text)

    if not parsed_tests:
        raise HTTPException(
            status_code=422,
            detail="We couldn't extract enough readable test parameters from this report. Please upload a clearer image or PDF."
        )

    # 3. Generate plain language explanations & translations for each test
    test_results: list[TestResultItem] = []
    within_count = 0
    outside_count = 0
    unable_count = 0

    for pt in parsed_tests:
        if pt.status == TestStatus.WITHIN_PROVIDED_RANGE:
            within_count += 1
        elif pt.status == TestStatus.OUTSIDE_PROVIDED_RANGE:
            outside_count += 1
        else:
            unable_count += 1

        # Generate explanation complying strictly with rule engine status
        explanation = await generate_explanation(
            test_name=pt.name,
            value=pt.value,
            unit=pt.unit,
            reference_text=pt.reference_text,
            status=pt.status,
            language=language
        )

        test_results.append(TestResultItem(
            name=pt.name,
            value=pt.value,
            numeric_value=pt.numeric_value,
            unit=pt.unit,
            reference_low=pt.reference_low,
            reference_high=pt.reference_high,
            reference_text=pt.reference_text,
            status=pt.status,
            explanation=explanation
        ))

    total = len(test_results)
    summary_text = get_patient_summary_text(
        total=total,
        within=within_count,
        outside=outside_count,
        unable=unable_count,
        language=language
    )

    summary = ReportSummary(
        within_range=within_count,
        outside_range=outside_count,
        unable_to_determine=unable_count,
        total_tests=total,
        patient_summary_text=summary_text
    )

    report = ReportResponse(
        report_id=report_id,
        report_type=meta.get("report_type", "General Lab Report"),
        report_date=meta.get("report_date", datetime.date.today().strftime("%d/%m/%Y")),
        patient_name=meta.get("patient_name", "Demo User" if is_demo else "Patient"),
        language=language,
        summary=summary,
        tests=test_results,
        is_demo=is_demo or settings.DEMO_MODE,
        status="completed",
        created_at=datetime.datetime.now().isoformat()
    )

    report_store.save_report(report)
    return report


@router.post("/upload", response_model=ReportResponse)
async def upload_report(
    file: UploadFile = File(...),
    language: str = Form("en")
):
    """
    Upload a PDF or image medical report, extract text, evaluate via rule engine, and generate explanations.
    """
    # 1. Validation
    filename = file.filename or "report.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed formats: PDF, PNG, JPG, JPEG."
        )

    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds the limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    # 2. Text Extraction
    extracted_text = ""
    if ext == ".pdf":
        text, pages, is_scanned = extract_text_from_pdf(file_bytes)
        if is_scanned or len(text) < 30:
            # Fallback to OCR for scanned PDF
            text = extract_text_from_scanned_pdf(file_bytes)
        extracted_text = text
    else:
        # Image OCR
        extracted_text = extract_text_from_image(file_bytes)

    if not extracted_text or len(extracted_text.strip()) < 15:
        raise HTTPException(
            status_code=422,
            detail="We couldn't extract readable text from this document. Please ensure the document is clear and properly oriented."
        )

    # 3. Process Pipeline
    return await process_report_pipeline(raw_text=extracted_text, language=language)


@router.post("/sample", response_model=ReportResponse)
async def load_sample_report(language: str = "en"):
    """
    Instant trigger for the canonical Hackathon Sample Report (Section 9 & 11).
    Yields exactly: 3 Within / 2 Outside / 1 Unable to Determine.
    """
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
    return await process_report_pipeline(
        raw_text=sample_text,
        language=language,
        report_id="demo-sample-01",
        is_demo=True
    )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    """
    Retrieves an analyzed report by ID.
    """
    report = report_store.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report


@router.post("/{report_id}/analyze", response_model=ReportResponse)
async def reanalyze_report(report_id: str, language: str = "en"):
    """
    Re-runs analysis for a given report.
    """
    report = report_store.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    
    # Re-generate explanations for current language
    for item in report.tests:
        item.explanation = await generate_explanation(
            test_name=item.name,
            value=item.value,
            unit=item.unit,
            reference_text=item.reference_text,
            status=item.status,
            language=language
        )
    
    report.language = language
    report.summary.patient_summary_text = get_patient_summary_text(
        total=report.summary.total_tests,
        within=report.summary.within_range,
        outside=report.summary.outside_range,
        unable=report.summary.unable_to_determine,
        language=language
    )
    report_store.save_report(report)
    return report


@router.post("/{report_id}/translate", response_model=ReportResponse)
async def translate_report(report_id: str, req: TranslateRequest):
    """
    Translates the report explanations into target language.
    """
    report = report_store.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    target_lang = req.target_language.lower().strip()
    
    for item in report.tests:
        item.explanation = await generate_explanation(
            test_name=item.name,
            value=item.value,
            unit=item.unit,
            reference_text=item.reference_text,
            status=item.status,
            language=target_lang
        )

    report.language = target_lang
    report.summary.patient_summary_text = get_patient_summary_text(
        total=report.summary.total_tests,
        within=report.summary.within_range,
        outside=report.summary.outside_range,
        unable=report.summary.unable_to_determine,
        language=target_lang
    )
    report_store.save_report(report)
    return report


@router.get("/{report_id}/summary", response_model=DoctorSummaryResponse)
async def get_doctor_summary(report_id: str):
    """
    Generates the Doctor Discussion Summary (Section 7).
    Lists only outside-range results with value + range and neutral discussion points.
    """
    report = report_store.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    outside_items: list[DoctorSummaryItem] = []
    for item in report.tests:
        if item.status == TestStatus.OUTSIDE_PROVIDED_RANGE:
            outside_items.append(DoctorSummaryItem(
                test_name=item.name,
                reported_value=item.value,
                unit=item.unit,
                reference_range=item.reference_text or f"{item.reference_low} - {item.reference_high}",
                discussion_point=f"Reported value of {item.value} {item.unit} is outside the laboratory's printed reference range ({item.reference_text}). Discuss in clinical context."
            ))

    return DoctorSummaryResponse(
        report_id=report.report_id,
        report_type=report.report_type,
        report_date=report.report_date,
        outside_range_count=len(outside_items),
        items=outside_items,
        clinical_note="These parameters are highlighted solely because they are outside the printed reference ranges provided by the laboratory report. A result outside reference range does not establish a diagnosis.",
        disclaimer="Important: MedEase AI provides educational explanations of information contained in your report. A result outside a laboratory reference range does not by itself establish a diagnosis. Please consult a qualified healthcare professional for medical interpretation and advice."
    )
