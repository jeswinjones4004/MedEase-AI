import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Sparkles, Upload, Info } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import type { SupportedLanguage } from '../types/report';

interface NavbarProps {
  currentLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  isDemo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage = 'en',
  onLanguageChange,
  isDemo = true,
}) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">MedEase</span>
              <span className="font-extrabold text-lg text-teal-600 tracking-tight">AI</span>
              {isDemo && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  <Sparkles size={11} /> Demo Active
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 leading-none hidden sm:block">Plain-language medical report explainer</p>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/upload"
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/upload'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Upload size={15} />
              <span>Upload</span>
            </Link>
            <Link
              to="/about"
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/about'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Info size={15} />
              <span>About & Safety</span>
            </Link>
          </nav>

          {/* Language Selector */}
          {onLanguageChange && (
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />
          )}
        </div>
      </div>
    </header>
  );
};
