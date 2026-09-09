import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Copy,
  Check,
  Printer,
  ArrowLeft,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import type { DoctorSummaryResponse, ReportResponse } from '../types/report';

interface DoctorSummaryPageProps {
  report: ReportResponse;
  doctorSummary?: DoctorSummaryResponse | null;
}

export const DoctorSummaryPage: React.FC<DoctorSummaryPageProps> = ({
  report,
}) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const outsideItems = report.tests.filter((t) => t.status === 'outside_provided_range');

  const generatePlainTextSummary = () => {
    let text = `MEDEASE AI — DOCTOR DISCUSSION SUMMARY\n`;
    text += `Report Type: ${report.report_type}\n`;
    text += `Date: ${report.report_date || 'N/A'}\n`;
    text += `Total Tests: ${report.summary.total_tests} | Outside Range: ${outsideItems.length}\n\n`;
    text += `HIGHLIGHTED PARAMETERS FOR CLINICAL DISCUSSION:\n`;
    text += `================================================\n`;

    if (outsideItems.length === 0) {
      text += `All extracted tests were within the printed reference ranges provided in this report.\n`;
    } else {
      outsideItems.forEach((item, idx) => {
        text += `${idx + 1}. ${item.name}\n`;
        text += `   Reported Value: ${item.value} ${item.unit}\n`;
        text += `   Provided Range: ${item.reference_text || (item.reference_low && item.reference_high ? `${item.reference_low} - ${item.reference_high}` : 'N/A')}\n`;
        text += `   Discussion Point: Reported value is outside the printed reference range provided in the report.\n\n`;
      });
    }

    text += `\nDISCLAIMER:\n`;
    text += `MedEase AI provides educational explanations only. A result outside a laboratory reference range does not by itself establish a diagnosis. Consult a qualified healthcare professional.`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePlainTextSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 print:p-0">
      {/* Back button & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            {copied ? <Check size={16} className="text-teal-600" /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Summary Document */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <Stethoscope size={14} /> Clinical Preparation Note
            </div>
            <span className="text-xs text-slate-400 font-mono">MedEase AI v1.0</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prepare for Your Doctor Visit
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            A concise, non-prescriptive summary of highlighted test parameters to share with your healthcare provider.
          </p>
        </div>

        {/* Report Meta Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block">Report Type</span>
            <span className="font-bold text-slate-800">{report.report_type}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Report Date</span>
            <span className="font-bold text-slate-800">{report.report_date || 'Current'}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400 block">Outside Range Items</span>
            <span className="font-bold text-rose-700">{outsideItems.length} parameter(s)</span>
          </div>
        </div>

        {/* Explanatory Clinical Note */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs sm:text-sm text-teal-950 space-y-1">
          <p className="font-bold flex items-center gap-2">
            <ShieldCheck size={16} className="text-teal-700" />
            Purpose of this Summary
          </p>
          <p className="text-teal-900 text-xs leading-relaxed">
            The parameters below are listed solely because they fall outside the printed reference ranges provided
            in your laboratory report. This summary does not provide diagnoses or treatment recommendations; it is
            structured to facilitate an efficient discussion with your qualified physician.
          </p>
        </div>

        {/* Outside Range Results List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600" />
            Highlighted Parameters for Clinical Review
          </h2>

          {outsideItems.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-900 text-sm">
              ✓ All extracted test parameters fall within the reference ranges printed in this report.
            </div>
          ) : (
            <div className="space-y-3">
              {outsideItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {index + 1}. {item.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="font-bold text-rose-700">
                        Reported: {item.value} {item.unit}
                      </span>
                      <span className="text-slate-500">
                        (Ref: {item.reference_text || (item.reference_low && item.reference_high ? `${item.reference_low} - ${item.reference_high}` : 'Unavailable')})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Doctor Discussion Point:</strong> The reported value is outside the reference range
                    provided on the report ({item.reference_text}). Ask your doctor how this fits into your overall
                    clinical profile.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Consultation Prompts */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-slate-900">
            Suggested Questions for Your Doctor:
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 pl-2">
            <li>What could cause these specific values to be outside the printed reference range?</li>
            <li>Do these results require follow-up testing, monitoring, or additional investigations?</li>
            <li>Should any lifestyle, dietary, or medication factors be considered when interpreting these numbers?</li>
          </ul>
        </div>

        {/* Canonical Safety Disclaimer Footer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
          <strong>Mandatory Medical Notice:</strong> MedEase AI provides educational explanations of information
          contained in your report. A result outside a laboratory reference range does not by itself establish a
          diagnosis. Please consult a qualified healthcare professional for medical interpretation and advice.
        </div>
      </div>
    </div>
  );
};
