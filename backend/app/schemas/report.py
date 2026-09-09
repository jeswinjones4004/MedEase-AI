from enum import Enum
from typing import Optional, List, Union
from pydantic import BaseModel, Field

class TestStatus(str, Enum):
    WITHIN_PROVIDED_RANGE = "within_provided_range"
    OUTSIDE_PROVIDED_RANGE = "outside_provided_range"
    UNABLE_TO_DETERMINE = "unable_to_determine"

class ExplanationItem(BaseModel):
    test_explanation: str = Field(..., description="What this test generally measures")
    simple_meaning: str = Field(..., description="Plain-language restatement of the status")
    attention_reason: str = Field(default="", description="Why this is/isn't highlighted (empty if within range)")
    professional_discussion: str = Field(default="", description="A neutral prompt to discuss with a clinician, or empty string")

class ParsedTest(BaseModel):
    name: str
    value: Union[float, int, str]
    numeric_value: Optional[float] = None
    unit: str = ""
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    reference_text: str = ""
    status: TestStatus = TestStatus.UNABLE_TO_DETERMINE

class TestResultItem(BaseModel):
    name: str
    value: Union[float, int, str]
    numeric_value: Optional[float] = None
    unit: str = ""
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    reference_text: str = ""
    status: TestStatus
    explanation: Optional[ExplanationItem] = None

class ReportSummary(BaseModel):
    within_range: int = 0
    outside_range: int = 0
    unable_to_determine: int = 0
    total_tests: int = 0
    patient_summary_text: str = ""

class ReportResponse(BaseModel):
    report_id: str
    report_type: str = "General Lab Report"
    report_date: str = ""
    patient_name: Optional[str] = "Patient"
    language: str = "en"
    summary: ReportSummary
    tests: List[TestResultItem]
    is_demo: bool = False
    status: str = "ready"
    created_at: str = ""

class TranslateRequest(BaseModel):
    target_language: str = Field(..., description="Language code e.g. 'ta', 'en', 'hi', 'te', 'ml', 'kn'")

class DoctorSummaryItem(BaseModel):
    test_name: str
    reported_value: Union[float, int, str]
    unit: str
    reference_range: str
    discussion_point: str

class DoctorSummaryResponse(BaseModel):
    report_id: str
    report_type: str
    report_date: str
    outside_range_count: int
    items: List[DoctorSummaryItem]
    clinical_note: str
    disclaimer: str
