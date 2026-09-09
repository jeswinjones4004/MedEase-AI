import React from 'react';
import { X, HelpCircle, AlertTriangle, Stethoscope, BookOpen } from 'lucide-react';
import type { TestResultItem } from '../types/report';
import { StatusBadge } from './StatusBadge';

interface ResultDetailModalProps {
  test: TestResultItem | null;
  onClose: () => void;
}

export const ResultDetailModal: React.FC<ResultDetailModalProps> = ({ test, onClose }) => {
  if (!test) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Test Parameter Details</span>
            <h2 id="modal-title" className="text-xl font-bold text-slate-900">
              {test.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Reported Value</span>
              <span className="text-lg font-extrabold text-slate-900">
                {test.value} <span className="text-xs font-normal text-slate-600">{test.unit}</span>
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Provided Reference</span>
              <span className="text-sm font-semibold text-slate-800">
                {test.reference_text || (test.reference_low !== null && test.reference_high !== null ? `${test.reference_low} - ${test.reference_high} ${test.unit}` : 'Unavailable')}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 font-medium block mb-1">Status</span>
              <StatusBadge status={test.status} size="sm" />
            </div>
          </div>

          {/* Section 1: What does this test measure? */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              What does this test measure?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed pl-6">
              {test.explanation?.test_explanation || `${test.name} measures a biological indicator reported in your test sample.`}
            </p>
          </div>

          {/* Section 2: In simple words */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              In simple words
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed pl-6">
              {test.explanation?.simple_meaning ||
                (test.status === 'within_provided_range'
                  ? 'This reported value falls within the reference range provided in the report.'
                  : test.status === 'outside_provided_range'
                  ? 'The reported value is outside the reference range provided in the report.'
                  : 'The report does not provide enough reference information for MedEase AI to classify this value.')}
            </p>
          </div>

          {/* Section 3: Why is this highlighted? */}
          {test.status !== 'within_provided_range' && (
            <div className="space-y-1.5 p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/60">
              <h3 className="text-sm font-semibold text-rose-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Why is this highlighted?
              </h3>
              <p className="text-sm text-rose-900 leading-relaxed">
                {test.explanation?.attention_reason ||
                  'The reported value is outside the reference range provided in the laboratory report.'}
              </p>
            </div>
          )}

          {/* Section 4: What should I do? */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/60">
            <h3 className="text-sm font-semibold text-teal-950 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-700" />
              What should I do?
            </h3>
            <p className="text-sm text-teal-900 leading-relaxed">
              {test.explanation?.professional_discussion ||
                'Consider discussing this result with a qualified healthcare professional, especially if you have symptoms or concerns.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
