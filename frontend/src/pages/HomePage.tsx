import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Languages,
  CheckCircle2,
  Stethoscope,
  Cpu
} from 'lucide-react';
import { SafetyBanner } from '../components/SafetyBanner';
import GradientText from '../components/GradientText';
import SpecularButton from '../components/SpecularButton';

interface HomePageProps {
  onStartDemo: () => void;
  isLoadingDemo?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartDemo, isLoadingDemo = false }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 py-6 md:py-12">
      {/* Safety Disclaimer Banner */}
      <div className="max-w-4xl mx-auto px-4">
        <SafetyBanner />
      </div>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs md:text-sm font-semibold shadow-sm">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Patient-First Medical AI • Privacy-Preserving</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Understand Your Medical Report.{' '}
          <GradientText
            colors={['#0f766e', '#06b6d4', '#0284c7', '#0d9488', '#0f766e']}
            animationSpeed={4}
            showBorder={false}
            className="inline font-extrabold"
          >
            In Simple Language.
          </GradientText>{' '}
          In Your Language.
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          MedEase AI translates complex diagnostic laboratory reports into plain, easy-to-understand explanations
          using your report’s exact reference ranges.
        </p>

        {/* Tagline Quote */}
        <div className="p-4 max-w-xl mx-auto rounded-2xl bg-white/80 border border-teal-100 shadow-sm text-sm sm:text-base font-medium text-teal-900 italic">
          “MedEase AI doesn’t replace your doctor. It helps you understand your report before you meet one.”
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <SpecularButton
            size="lg"
            radius={16}
            tint="#0f766e"
            tintOpacity={1}
            textColor="#ffffff"
            lineColor="#2dd4bf"
            baseColor="#0f766e"
            intensity={1.2}
            shineSize={14}
            shineFade={40}
            speed={0.4}
            followMouse={true}
            proximity={250}
            onClick={() => navigate('/upload')}
            className="w-full sm:w-auto shadow-lg shadow-teal-700/25 group"
          >
            <FileText className="w-5 h-5" />
            <span>Analyze My Report</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </SpecularButton>

          <button
            onClick={onStartDemo}
            disabled={isLoadingDemo}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-teal-600 font-semibold text-base rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>{isLoadingDemo ? 'Loading Demo...' : 'Try Sample Report (1-Click Demo)'}</span>
          </button>
        </div>
      </section>

      {/* Visual Pipeline Graphic: Report -> AI -> Plain Explanation */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">How It Works</h2>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">From Confusing Jargon to Clarity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xl">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900">1. Upload Report</h3>
              <p className="text-xs text-slate-600">
                Upload your digital or scanned lab report (PDF, PNG, JPG).
              </p>
              <div className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500 font-mono">
                Hemoglobin 13.5 g/dL (12-16)
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xl">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900">2. Deterministic Rule Engine</h3>
              <p className="text-xs text-slate-600">
                Values are classified against the report’s printed ranges. Never diagnosed.
              </p>
              <div className="w-full bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-100 text-[11px] font-semibold">
                ✓ Within Provided Range
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
                <Languages className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900">3. Plain Explanation</h3>
              <p className="text-xs text-slate-600">
                Clear descriptions in English or Tamil, plus doctor visit prep notes.
              </p>
              <div className="w-full bg-teal-50 text-teal-800 p-2.5 rounded-lg border border-teal-100 text-[11px] text-left">
                “This value falls within the standard reference range.”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Strict Deterministic Accuracy</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Medical classification is strictly governed by a deterministic rule engine using your laboratory’s
              printed reference range — never guessed or hallucinated by an AI model.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Multilingual Explanations</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Access seamless explanations in English and Tamil (தமிழ்), with built-in architecture supporting
              Hindi, Telugu, Malayalam, and Kannada.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Jargon, No Panic</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Understand what each biomarker measures in simple terms without alarmist wording or automated disease
              labeling.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Doctor Discussion Summary</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Generate a structured, non-prescriptive talking points summary to bring along to your next clinical
              consultation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
