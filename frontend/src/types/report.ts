export type TestStatus = 'within_provided_range' | 'outside_provided_range' | 'unable_to_determine';

export interface ExplanationItem {
  test_explanation: string;
  simple_meaning: string;
  attention_reason: string;
  professional_discussion: string;
}

export interface TestResultItem {
  name: string;
  value: number | string;
  numeric_value?: number | null;
  unit: string;
  reference_low?: number | null;
  reference_high?: number | null;
  reference_text: string;
  status: TestStatus;
  explanation?: ExplanationItem;
}

export interface ReportSummary {
  within_range: number;
  outside_range: number;
  unable_to_determine: number;
  total_tests: number;
  patient_summary_text: string;
}

export interface ReportResponse {
  report_id: string;
  report_type: string;
  report_date: string;
  patient_name?: string;
  language: string;
  summary: ReportSummary;
  tests: TestResultItem[];
  is_demo: boolean;
  status: string;
  created_at: string;
}

export interface DoctorSummaryItem {
  test_name: string;
  reported_value: number | string;
  unit: string;
  reference_range: string;
  discussion_point: string;
}

export interface DoctorSummaryResponse {
  report_id: string;
  report_type: string;
  report_date: string;
  outside_range_count: number;
  items: DoctorSummaryItem[];
  clinical_note: string;
  disclaimer: string;
}

export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  isFullySupported: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', isFullySupported: true },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', isFullySupported: true },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', isFullySupported: false },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', isFullySupported: false },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', isFullySupported: false },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', isFullySupported: false },
];
