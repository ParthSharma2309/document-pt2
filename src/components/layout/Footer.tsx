import React from 'react';
import { Sparkles, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900">DocuMind</span>
            <p className="text-xs text-slate-600">AI-Powered Document Research Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-600">
          <a href="/research" className="hover:text-slate-900 transition-colors">Research Workspace</a>
          <a href="/documents" className="hover:text-slate-900 transition-colors">Document Library</a>
          <a href="/evaluation" className="hover:text-slate-900 transition-colors">Evaluation Suite</a>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Evidence-Grounded AI &copy; 2026 DocuMind</span>
        </div>
      </div>
    </footer>
  );
};
