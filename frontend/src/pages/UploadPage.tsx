import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  ArrowRight,
  Lock,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import type { SupportedLanguage } from '../types/report';
import { LanguageSelector } from '../components/LanguageSelector';
import { SafetyBanner } from '../components/SafetyBanner';

interface UploadPageProps {
  onUploadFile: (file: File, language: SupportedLanguage) => void;
  onStartDemo: () => void;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isLoading?: boolean;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  onUploadFile,
  onStartDemo,
  selectedLanguage,
  onLanguageChange,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg)$/i)) {
      setError('Please upload a valid PDF or image file (PNG, JPG, JPEG).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    onUploadFile(selectedFile, selectedLanguage);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <SafetyBanner />

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Upload Your Medical Report
        </h1>
        <p className="text-sm text-slate-600">
          Select a digital or scanned lab report to receive plain-language explanations.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Language Selection Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
          <div>
            <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
              Explanation Language
            </label>
            <p className="text-xs text-slate-500">Choose the language for explanations and summaries</p>
          </div>
          <LanguageSelector
            currentLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>

        {/* Drag & Drop Zone */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
              isDragging
                ? 'border-teal-600 bg-teal-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/70'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-semibold text-slate-800">
                Click to browse or drag and drop your report
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF, PNG, JPG or JPEG documents (up to 15MB)
              </p>
            </div>
          </div>
        ) : (
          /* Selected File Preview Card */
          <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                {selectedFile.type.includes('pdf') ? <FileText size={24} /> : <ImageIcon size={24} />}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Document'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="w-full py-4 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <FileCheck className="w-5 h-5" />
            <span>{isLoading ? 'Processing Report...' : 'Analyze Report'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Sample Shortcut */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">or try without uploading:</span>
            <button
              type="button"
              onClick={onStartDemo}
              disabled={isLoading}
              className="mt-1 block mx-auto text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
            >
              ✨ Run 1-Click Sample Lab Report (Demo)
            </button>
          </div>
        </div>

        {/* Privacy notice banner (Section 10) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
          <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Privacy notice:</strong> Your uploaded report is processed for this analysis. Avoid
            uploading sensitive personally identifiable information when using demo environments.
          </span>
        </div>
      </div>
    </div>
  );
};
