"""
MedEase AI — In-Memory & Local Report Storage
Manages report lifecycle for session queries and translation updates.
"""

from typing import Dict, Optional
from app.schemas.report import ReportResponse


class ReportStore:
    def __init__(self):
        self._reports: Dict[str, ReportResponse] = {}

    def save_report(self, report: ReportResponse) -> ReportResponse:
        self._reports[report.report_id] = report
        return report

    def get_report(self, report_id: str) -> Optional[ReportResponse]:
        return self._reports.get(report_id)

    def delete_report(self, report_id: str) -> bool:
        if report_id in self._reports:
            del self._reports[report_id]
            return True
        return False


report_store = ReportStore()
