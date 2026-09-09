import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  ChevronRight,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import type { ReportResponse, TestResultItem, SupportedLanguage } from '../types/report';
import { StatusBadge } from '../components/StatusBadge';
import { LanguageSelector } from '../components/LanguageSelector';
import { ResultDetailModal } from '../components/ResultDetailModal';

interface DashboardPageProps {
  report: ReportResponse;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isTranslating?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  report,
  onLanguageChange,
  isTranslating = false,
}) => {
  const [selectedTest, setSelectedTest] = useState<TestResultItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'within' | 'outside' | 'unable'>('all');
  const navigate = useNavigate();

  const filteredTests = report.tests.filter((t) => {
    if (statusFilter === 'within') return t.status === 'within_provided_range';
    if (statusFilter === 'outside') return t.status === 'outside_provided_range';
    if (statusFilter === 'unable') return t.status === 'unable_to_determine';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info Strip */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
              {report.report_type}
            </span>
            {report.is_demo && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                Demo Sample
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Medical Report Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              Report Date: <strong>{report.report_date || 'Current'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-slate-400" />
              Extracted Tests: <strong>{report.summary.total_tests}</strong>
            </span>
          </div>
        </div>

        {/* Action / Language Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <LanguageSelector
              currentLanguage={report.language as SupportedLanguage}
              onLanguageChange={onLanguageChange}
              disabled={isTranslating}
            />
          </div>

          <button
            onClick={() => navigate('/doctor-summary')}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Stethoscope size={16} />
            <span>Generate Doctor Summary</span>
          </button>
        </div>
      </div>

      {/* 3 Canonical Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Within Provided Range */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'within' ? 'all' : 'within')}
          className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'within'
              ? 'ring-2 ring-emerald-600 bg-emerald-50/80 border-emerald-300 shadow-md'
              : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 size={22} />
            </span>
            <span className="text-3xl font-black text-emerald-900">
              {report.summary.within_range}
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-sm font-bold text-slate-900">Within Provided Range</h2>
            <p className="text-xs text-slate-500 mt-1">
              Results falling within the laboratory’s printed reference ranges.
            </p>
          </div>
        </button>

        {/* Card 2: Outside Provided Range */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'outside' ? 'all' : 'outside')}
          className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'outside'
              ? 'ring-2 ring-rose-600 bg-rose-50/80 border-rose-300 shadow-md'
              : 'bg-white border-slate-200/80 hover:border-rose-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertCircle size={22} />
            </span>
            <span className="text-3xl font-black text-rose-900">
              {report.summary.outside_range}
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-sm font-bold text-slate-900">Outside Provided Range</h2>
            <p className="text-xs text-slate-500 mt-1">
              Results outside the printed bounds for clinician discussion.
            </p>
          </div>
        </button>

        {/* Card 3: Unable to Determine */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'unable' ? 'all' : 'unable')}
          className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'unable'
              ? 'ring-2 ring-amber-600 bg-amber-50/80 border-amber-300 shadow-md'
              : 'bg-white border-slate-200/80 hover:border-amber-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <HelpCircle size={22} />
            </span>
            <span className="text-3xl font-black text-amber-900">
              {report.summary.unable_to_determine}
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-sm font-bold text-slate-900">Unable to Determine</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sufficient printed reference information was not available.
            </p>
          </div>
        </button>
      </div>

      {/* Patient-Friendly Summary Box (Section 7a) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-white tracking-wide">
              Report Summary Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              {report.summary.patient_summary_text}
            </p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Test Results & Explanations</h2>
            <p className="text-xs text-slate-500">
              Click any row to view plain-language breakdown and doctor discussion guidance
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({report.summary.total_tests})
            </button>
            <button
              onClick={() => setStatusFilter('within')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'within'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Within ({report.summary.within_range})
            </button>
            <button
              onClick={() => setStatusFilter('outside')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'outside'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Outside ({report.summary.outside_range})
            </button>
            <button
              onClick={() => setStatusFilter('unable')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'unable'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Unable ({report.summary.unable_to_determine})
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Test Name</th>
                <th className="py-3.5 px-4">Reported Value</th>
                <th className="py-3.5 px-4">Unit</th>
                <th className="py-3.5 px-6">Reference Range</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTests.map((test, index) => (
                <tr
                  key={index}
                  onClick={() => setSelectedTest(test)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 font-bold text-slate-900">
                    {test.name}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-800">
                    {test.value}
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-mono">
                    {test.unit || '—'}
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-mono">
                    {test.reference_text || (test.reference_low !== null && test.reference_high !== null ? `${test.reference_low} - ${test.reference_high}` : 'Unavailable')}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={test.status} size="sm" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:translate-x-0.5 transition-transform">
                      <span>Details</span>
                      <ChevronRight size={14} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredTests.map((test, index) => (
            <div
              key={index}
              onClick={() => setSelectedTest(test)}
              className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-slate-900">{test.name}</h3>
                <StatusBadge status={test.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Reported Value:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {test.value} {test.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Reference Range:</span>
                  <span className="font-mono text-slate-700">
                    {test.reference_text || 'Unavailable'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-teal-700 font-semibold pt-1">
                <span>View plain explanation</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result Detail Modal */}
      <ResultDetailModal
        test={selectedTest}
        onClose={() => setSelectedTest(null)}
      />
    </div>
  );
};
