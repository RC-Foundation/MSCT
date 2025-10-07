import { Download, Upload, Printer, Sparkles } from 'lucide-react';

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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Metis Settlements Compliance Tracker (2025)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track deadlines, requirements, and obligations under the Metis Settlements Act and associated legislation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={onExport}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            onClick={onShare}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 6l-4-4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 2v13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Share
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition"
            onClick={onImport}
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
            onClick={onPrint}
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
            onClick={onThemeToggle}
            title="Toggle theme"
          >
            <Sparkles className="w-4 h-4" />
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </div>
  );
};
