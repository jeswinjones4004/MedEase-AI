import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  FileSearch,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Languages
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProcessingStep {
  id: number;
  label: string;
  detail: string;
  icon: React.ReactNode;
}

const STAGES: ProcessingStep[] = [
  { id: 1, label: 'Reading document', detail: 'Parsing document stream and rendering pages', icon: <FileSearch className="w-4 h-4" /> },
  { id: 2, label: 'Extracting text', detail: 'Executing PyMuPDF and OCR text layers', icon: <Layers className="w-4 h-4" /> },
  { id: 3, label: 'Identifying parameters', detail: 'Locating biomarker names and laboratory sections', icon: <Layers className="w-4 h-4" /> },
  { id: 4, label: 'Extracting values & units', detail: 'Parsing numeric quantities, metrics, and symbols', icon: <Layers className="w-4 h-4" /> },
  { id: 5, label: 'Reading reference ranges', detail: 'Parsing printed lower and upper bound thresholds', icon: <Layers className="w-4 h-4" /> },
  { id: 6, label: 'Comparing values (Rule Engine)', detail: 'Executing deterministic classification — no LLM guessing', icon: <Cpu className="w-4 h-4" /> },
  { id: 7, label: 'Generating explanations', detail: 'Formulating neutral, plain-language descriptions', icon: <Sparkles className="w-4 h-4" /> },
  { id: 8, label: 'Translating', detail: 'Applying language formatting to explanations', icon: <Languages className="w-4 h-4" /> },
];

interface ProcessingPageProps {
  isComplete: boolean;
  onCompleteNavigation: () => void;
  error?: string | null;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({
  isComplete,
  onCompleteNavigation,
  error = null,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Step progression animation timer
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STAGES.length - 1) {
          setCompletedSteps((c) => (c.includes(prev) ? c : [...c, prev]));
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isComplete) {
      // Mark all steps complete
      setCompletedSteps(STAGES.map((_, i) => i));
      setCurrentStepIndex(STAGES.length);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0f766e', '#14b8a6', '#5eead4', '#38bdf8']
        });
      } catch (e) {
        // ignore
      }

      const timer = setTimeout(() => {
        onCompleteNavigation();
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [isComplete, onCompleteNavigation]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 shadow-md">
          {isComplete ? (
            <CheckCircle2 className="w-9 h-9 text-teal-600 animate-bounce" />
          ) : (
            <Loader2 className="w-9 h-9 text-teal-600 animate-spin" />
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {isComplete ? 'Analysis Complete!' : 'Analyzing Report...'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {isComplete
            ? 'Navigating to your report dashboard...'
            : 'Processing document pipeline through deterministic validation layers'}
        </p>
      </div>

      {error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-4">
          <p className="text-sm font-semibold text-rose-800">{error}</p>
          <button
            onClick={() => window.location.href = '/upload'}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : (
        /* Explicit Staged Checklist */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const isDone = completedSteps.includes(idx) || isComplete;
              const isCurrent = currentStepIndex === idx && !isComplete;

              return (
                <div
                  key={stage.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : isCurrent
                      ? 'bg-teal-50 border-teal-300 text-teal-950 shadow-sm scale-[1.01]'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={16} />
                      ) : isCurrent ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        stage.id
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold">{stage.label}</p>
                      <p className="text-[11px] opacity-75 hidden sm:block">{stage.detail}</p>
                    </div>
                  </div>

                  <div className="text-xs font-semibold shrink-0">
                    {isDone ? (
                      <span className="text-emerald-700">Done</span>
                    ) : isCurrent ? (
                      <span className="text-teal-700 animate-pulse">Running...</span>
                    ) : (
                      <span className="text-slate-400">Waiting</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              100% Deterministic Rule Engine
            </span>
            <span>Step {Math.min(currentStepIndex + 1, STAGES.length)} of {STAGES.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};
