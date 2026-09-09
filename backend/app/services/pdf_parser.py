"""
MedEase AI — PDF Parser Service
Uses PyMuPDF (fitz) to extract text directly from digital PDF reports.
"""

import fitz  # PyMuPDF
from typing import Tuple


def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[str, int, bool]:
    """
    Extracts text from PDF binary data.
    Returns (extracted_text, page_count, is_scanned_likely).
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = []
        total_pages = len(doc)
        
        for page_idx in range(total_pages):
            page = doc[page_idx]
            text = page.get_text("text")
            if text:
                full_text.append(text)
                
        doc.close()
        combined_text = "\n".join(full_text).strip()
        
        # If combined text is empty or very short (< 30 characters), it is likely a scanned image PDF
        is_scanned = len(combined_text) < 30
        return combined_text, total_pages, is_scanned
    except Exception as e:
        # Fallback or error handling
        return "", 0, True
