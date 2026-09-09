"""
Generates the synthetic sample PDF report for MedEase AI (Section 9).
Matches the exact demo dataset:
3 within / 2 outside / 1 unable-to-determine
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_sample_pdf(output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F766E'),
        alignment=1
    )
    
    sub_style = ParagraphStyle(
        'SubStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        alignment=1
    )
    
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontSize=11,
        leading=16,
        textColor=colors.HexColor('#1E293B')
    )
    
    elements = []
    
    # Header
    elements.append(Paragraph("MEDEASE AI DEMO LAB REPORT", title_style))
    elements.append(Paragraph("Demonstration Diagnostic Medical Center — Reference Standards", sub_style))
    elements.append(Spacer(1, 15))
    
    # Patient info
    patient_data = [
        [Paragraph("<b>Patient Name:</b> Demo User", meta_style), Paragraph("<b>Date:</b> 05/09/2026", meta_style)],
        [Paragraph("<b>Age/Sex:</b> 34 / M", meta_style), Paragraph("<b>Sample ID:</b> DEMO-88421", meta_style)],
        [Paragraph("<b>Referring Clinician:</b> Dr. S. Raman, MD", meta_style), Paragraph("<b>Department:</b> Clinical Biochemistry", meta_style)]
    ]
    patient_table = Table(patient_data, colWidths=[260, 260])
    patient_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 20))
    
    # Table Header & Data
    # Exact demo dataset from specification:
    # Hemoglobin 13.5 (12–16 g/dL) -> WITHIN
    # WBC 7200 (4000–11000 /µL) -> WITHIN
    # Platelets 250000 (150000–450000 /µL) -> WITHIN
    # Example Test A 120 (80–100 units) -> OUTSIDE
    # Example Test B 3.8 (4–6 units) -> OUTSIDE
    # Example Test C 50 (Reference unavailable) -> UNABLE TO DETERMINE
    
    table_data = [
        ["TEST", "RESULT", "REFERENCE RANGE"],
        ["Hemoglobin", "13.5", "12–16 g/dL"],
        ["WBC", "7200", "4000–11000 /µL"],
        ["Platelets", "250000", "150000–450000 /µL"],
        ["Example Test A", "120", "80–100 units"],
        ["Example Test B", "3.8", "4–6 units"],
        ["Example Test C", "50", "Reference unavailable"]
    ]
    
    results_table = Table(table_data, colWidths=[200, 140, 180])
    results_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F766E')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('PADDING', (0, 1), (-1, -1), 8),
    ]))
    
    elements.append(results_table)
    elements.append(Spacer(1, 25))
    
    # Footer Notice
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Italic'],
        fontSize=8,
        leading=12,
        textColor=colors.HexColor('#94A3B8'),
        alignment=1
    )
    elements.append(Paragraph("This is a synthetic lab report generated exclusively for MedEase AI testing and demonstration.", footer_style))
    
    doc.build(elements)
    print(f"Generated sample report at: {output_path}")

if __name__ == "__main__":
    out = os.path.abspath(os.path.join(os.path.dirname(__file__), "demo_report.pdf"))
    generate_sample_pdf(out)
