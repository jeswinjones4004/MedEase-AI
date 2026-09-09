import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/70 backdrop-blur-md py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Canonical Safety Disclaimer Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs md:text-sm text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 mb-1">Safety & Educational Disclaimer</p>
              <p>
                Important: MedEase AI provides educational explanations of information contained in your report.
                A result outside a laboratory reference range does not by itself establish a diagnosis. Please
                consult a qualified healthcare professional for medical interpretation and advice.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Brand footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">MedEase AI</span>
            <span>—</span>
            <span>Educational Report Understanding Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-teal-700 transition-colors">
              About & Safety Philosophy
            </Link>
            <Link to="/upload" className="hover:text-teal-700 transition-colors">
              Analyze Report
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
