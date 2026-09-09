import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DoctorSummaryPage } from './pages/DoctorSummaryPage';
import { AboutPage } from './pages/AboutPage';
import ClickSpark from './components/ClickSpark';
import { api } from './services/api';
import type { ReportResponse, DoctorSummaryResponse, SupportedLanguage } from './types/report';

export function AppContent() {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [doctorSummary, setDoctorSummary] = useState<DoctorSummaryResponse | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessingComplete, setIsProcessingComplete] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const navigate = useNavigate();

  // 1-Click Try Sample Report (Demo)
  const handleStartDemo = async () => {
    try {
      setProcessingError(null);
      setIsProcessingComplete(false);
      setIsProcessing(true);
      navigate('/processing');

      const data = await api.loadSampleReport(currentLanguage);
      setReport(data);

      // Fetch doctor summary in background
      try {
        const docSum = await api.getDoctorSummary(data.report_id);
        setDoctorSummary(docSum);
      } catch (e) {
        // non-blocking
      }

      setIsProcessingComplete(true);
    } catch (err: any) {
      setProcessingError(err.message || 'Failed to analyze demo report');
    }
  };

  // Upload File handler
  const handleUploadFile = async (file: File, language: SupportedLanguage) => {
    try {
      setProcessingError(null);
      setIsProcessingComplete(false);
      setIsProcessing(true);
      setCurrentLanguage(language);
      navigate('/processing');

      const data = await api.uploadReport(file, language);
      setReport(data);

      try {
        const docSum = await api.getDoctorSummary(data.report_id);
        setDoctorSummary(docSum);
      } catch (e) {
        // non-blocking
      }

      setIsProcessingComplete(true);
    } catch (err: any) {
      setProcessingError(err.message || 'Failed to process document');
    }
  };

  // Language Change handler (translates active report if loaded)
  const handleLanguageChange = async (newLang: SupportedLanguage) => {
    setCurrentLanguage(newLang);
    if (!report) return;

    try {
      setIsTranslating(true);
      const updated = await api.translateReport(report.report_id, newLang);
      setReport(updated);
    } catch (e) {
      console.error('Translation failed:', e);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <ClickSpark sparkColor="#0f766e" sparkSize={10} sparkRadius={18} sparkCount={8} duration={400}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          isDemo={report?.is_demo ?? true}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onStartDemo={handleStartDemo}
                  isLoadingDemo={isProcessing && !isProcessingComplete}
                />
              }
            />
            <Route
              path="/upload"
              element={
                <UploadPage
                  onUploadFile={handleUploadFile}
                  onStartDemo={handleStartDemo}
                  selectedLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                  isLoading={isProcessing && !isProcessingComplete}
                />
              }
            />
            <Route
              path="/processing"
              element={
                <ProcessingPage
                  isComplete={isProcessingComplete}
                  onCompleteNavigation={() => {
                    setIsProcessing(false);
                    navigate('/dashboard');
                  }}
                  error={processingError}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                report ? (
                  <DashboardPage
                    report={report}
                    onLanguageChange={handleLanguageChange}
                    isTranslating={isTranslating}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/doctor-summary"
              element={
                report ? (
                  <DoctorSummaryPage
                    report={report}
                    doctorSummary={doctorSummary}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </ClickSpark>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
