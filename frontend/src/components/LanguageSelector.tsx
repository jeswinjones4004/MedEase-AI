import React from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../types/report';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: SupportedLanguage) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  disabled = false,
}) => {
  return (
    <div className="relative inline-flex items-center">
      <div className="absolute left-3 pointer-events-none text-slate-400">
        <Globe size={16} />
      </div>
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
        disabled={disabled}
        aria-label="Select report language"
        className="appearance-none pl-9 pr-8 py-1.5 text-xs md:text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel} ({lang.label}) {!lang.isFullySupported ? '• Beta' : ''}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 pointer-events-none text-slate-400">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};
