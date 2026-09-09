import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SafetyBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      role="alert"
      className={`bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 md:p-4 text-amber-900 text-xs md:text-sm flex items-start gap-3 shadow-sm ${className}`}
    >
      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-950 block sm:inline mr-1">Medical Disclaimer:</span>
        MedEase AI provides informational explanations only. It does not diagnose medical conditions,
        prescribe treatment, or replace professional medical advice.
      </div>
    </div>
  );
};
