import type { ReportResponse, DoctorSummaryResponse } from '../types/report';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  async getHealth(): Promise<{ status: string; app_name: string; demo_mode: boolean }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to connect to backend server');
    return res.json();
  },

  async loadSampleReport(language: string = 'en'): Promise<ReportResponse> {
    const res = await fetch(`${API_BASE}/reports/sample?language=${encodeURIComponent(language)}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to load sample report' }));
      throw new Error(err.detail || 'Failed to load sample report');
    }
    return res.json();
  },

  async uploadReport(file: File, language: string = 'en'): Promise<ReportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    const res = await fetch(`${API_BASE}/reports/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to process uploaded report' }));
      throw new Error(err.detail || 'Failed to process uploaded report');
    }
    return res.json();
  },

  async getReport(reportId: string): Promise<ReportResponse> {
    const res = await fetch(`${API_BASE}/reports/${reportId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Report not found' }));
      throw new Error(err.detail || 'Report not found');
    }
    return res.json();
  },

  async translateReport(reportId: string, targetLanguage: string): Promise<ReportResponse> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_language: targetLanguage }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Translation failed' }));
      throw new Error(err.detail || 'Translation failed');
    }
    return res.json();
  },

  async getDoctorSummary(reportId: string): Promise<DoctorSummaryResponse> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/summary`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to load doctor summary' }));
      throw new Error(err.detail || 'Failed to load doctor summary');
    }
    return res.json();
  },
};
