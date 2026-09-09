import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Cpu,
  Lock,
  Heart,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafetyBanner } from '../components/SafetyBanner';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <SafetyBanner />

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Heart className="w-4 h-4 text-teal-600" />
          <span>Our Vision & Safety Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          About MedEase AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          MedEase AI helps laypersons understand medical lab reports they don’t have the vocabulary for —
          without guesswork, alarmist claims, or automated diagnosing.
        </p>
      </div>

      {/* Core Philosophy Card */}
      <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-300">Product Philosophy</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            “MedEase AI doesn’t replace your doctor. It helps you understand your report before you meet one.”
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
            Diagnostic lab reports are written in dense clinical nomenclature designed for practitioners. When
            patients receive their results, confusion and anxiety often follow. MedEase AI bridges this gap with
            safe, deterministic educational insights.
          </p>
        </div>
      </div>

      {/* The Core Architectural Rule */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Cpu size={22} />
          </div>
          <div>
            <h2 className="text-base sm:lg font-bold text-slate-900">
              The Load-Bearing Architectural Rule
            </h2>
            <p className="text-xs text-slate-500">Why MedEase AI is fundamentally different</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <p className="font-bold text-slate-900">
            The LLM never decides medical status. A deterministic backend rule engine does.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-xs">
            <li>The report’s own printed reference range always wins over generic internet averages.</li>
            <li>If no reliable range is present, the status is strictly <strong>UNABLE_TO_DETERMINE</strong> — never guessed.</li>
            <li>The AI model’s only job is explaining what the test measures, restating status in plain language, translating, and structuring doctor discussion notes.</li>
          </ul>
        </div>
      </div>

      {/* What MedEase AI Does vs Does NOT Do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Does DO */}
        <div className="bg-white border border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-base">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <h3>What MedEase AI DOES</h3>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Extracts test names, numeric values, units, and printed reference ranges accurately.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Deterministically checks values against the report’s printed ranges.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Provides clear, neutral educational explanations in English, Tamil, and more.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Generates printable talking points to prepare for your doctor visit.</span>
            </li>
          </ul>
        </div>

        {/* Does NOT Do */}
        <div className="bg-white border border-rose-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-rose-800 font-bold text-base">
            <XCircle size={20} className="text-rose-600" />
            <h3>What MedEase AI NEVER Does</h3>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <span>Never diagnoses or predicts medical diseases or conditions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <span>Never recommends starting, altering, or stopping medications.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <span>Never declares that a patient is definitively "healthy" or "sick".</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <span>Never invents reference ranges or backfills unverified internet data.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Privacy Notice (Section 10) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 text-slate-900 font-bold">
          <Lock size={18} className="text-teal-600" />
          <h2 className="text-base">Privacy & Data Handling</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Your uploaded reports are processed in memory for the duration of your analysis session. We do not store
          or sell patient health information. When testing in public or demo environments, avoid uploading documents
          containing sensitive personal identifiers.
        </p>
      </div>

      {/* CTA bottom */}
      <div className="text-center pt-4">
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <span>Get Started — Analyze a Report</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
