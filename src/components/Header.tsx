import { Download, Upload, Printer, Sparkles, Zap, MoonStar } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onExport: () => void;
  onImport: () => void;
  onPrint: () => void;
  onShare?: () => void;
}

export const Header = ({ theme, onThemeToggle, onExport, onImport, onPrint, onShare }: HeaderProps) => {
  return (
codex/redesign-website-experience-and-visuals-ua4kes

main
main
    <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12 mb-10 glass-panel">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-60 w-60 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs tracking-[0.35em] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Live Compliance Intelligence</span>
          </div>

          <h1 className="mt-6 text-4xl lg:text-5xl font-semibold leading-tight text-slate-50 drop-shadow-[0_8px_25px_rgba(16,185,129,0.35)]">
            Métis Settlements Compliance Command Center
codex/redesign-website-experience-and-visuals-ua4kes
          </h1>

          <p className="mt-5 text-lg text-slate-200/80 max-w-2xl">
            Navigate legislation, deadlines, and accountability with a cinematic interface built for decisive action.
            Instantly filter obligations, chart upcoming pressure points, and keep every stakeholder aligned.

          </h1>

          <p className="mt-5 text-lg text-slate-200/80 max-w-2xl">
            Navigate legislation, deadlines, and accountability with a cinematic interface built for decisive action.
            Instantly filter obligations, chart upcoming pressure points, and keep every stakeholder aligned.

    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Metis Settlements Compliance Tracker (2025)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track deadlines, requirements, and obligations under the Metis Settlements Act and associated legislation
main
main
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200/80">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60">
              <Zap className="h-4 w-4 text-amber-300" />
              Adaptive filtering engine
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60">
              <MoonStar className="h-4 w-4 text-sky-300" />
              Dual theme persistence
            </span>
          </div>
        </div>

        <div className="lg:w-64 flex flex-col gap-3">
          <button
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold shadow-lg shadow-emerald-600/30 transition"
            onClick={onExport}
          >
            <Download className="w-4 h-4" /> Export intelligence
codex/redesign-website-experience-and-visuals-ua4kes
          </button>
          <button
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 text-slate-100 transition"

          </button>
          <button
main
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 text-slate-100 transition"

            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            onClick={onShare}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 6l-4-4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 2v13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Share
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition"
main
main
            onClick={onImport}
          >
            <Upload className="w-4 h-4" /> Import data stream
          </button>
          <button
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 border border-white/10 text-slate-100 transition"
            onClick={onPrint}
          >
            <Printer className="w-4 h-4" /> Tactical print view
          </button>
          <button
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-white/10 text-slate-100 transition"
            onClick={onThemeToggle}
            title="Toggle theme"
          >
            <Sparkles className="w-4 h-4" /> Activate {theme === 'dark' ? 'light' : 'dark'} flux
          </button>
        </div>
      </div>
    </div>
  );
};
