"""
MedEase AI — OCR Service
Extracts text from images (PNG, JPG, JPEG) or scanned PDF pages using Pillow and pytesseract.
Includes graceful error handling and fallbacks.
"""

import io
from typing import Optional
from PIL import Image
import pytesseract
import fitz


def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Performs OCR on an image byte stream.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Convert RGBA / Palette to RGB for OCR accuracy
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"[OCR Warning] Tesseract image OCR failed or not installed: {e}")
        return ""


def extract_text_from_scanned_pdf(pdf_bytes: bytes) -> str:
    """
    Converts PDF pages to images and runs OCR on each page.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        extracted_pages = []
        
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            pix = page.get_pixmap(dpi=200)
            img_bytes = pix.tobytes("png")
            page_text = extract_text_from_image(img_bytes)
            if page_text:
                extracted_pages.append(page_text)
                
        doc.close()
        return "\n".join(extracted_pages).strip()
    except Exception as e:
        print(f"[OCR Warning] Scanned PDF OCR failed: {e}")
        return ""
