'use client';

import React from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  Layers,
  BarChart2
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Verifiable Source Citations &bull; Zero Hallucinations
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Transform Complex PDFs into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">
              Interactive Evidence
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            DocuMind indexes scientific papers, lecture notes, and technical reports with genuine page-level citations, multi-document semantic retrieval, and strict insufficient-evidence abstention.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              id="cta-start-researching"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
            >
              Start Researching
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/research"
              id="cta-explore-features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Search className="w-4 h-4 text-slate-500" />
              Explore Research Workspace
            </a>
          </div>

          {/* Interactive Workspace Preview Mockup */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/50">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:p-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-medium text-slate-500">DocuMind Research Session &mdash; Attention Is All You Need.pdf</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Ready &bull; 15 Chunks
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm">
                    <span className="font-semibold text-slate-900 block mb-1">User Question:</span>
                    "What makes the Transformer architecture distinct from recurrent networks in sequence transduction?"
                  </div>

                  <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 leading-relaxed">
                    <span className="font-semibold text-indigo-950 flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      DocuMind Evidence-Grounded Answer:
                    </span>
                    The Transformer dispenses entirely with recurrence and convolutions, relying solely on an attention mechanism to model dependencies between input and output representations without step-by-step sequential processing.{' '}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-medium cursor-pointer hover:bg-indigo-300">
                      [Source 1 &bull; Page 1]
                    </span>{' '}
                    This enables significantly more parallelization and faster training convergence across sequence tasks.{' '}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-medium cursor-pointer hover:bg-indigo-300">
                      [Source 2 &bull; Page 3]
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-white border border-slate-200 p-3.5 text-xs shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between font-semibold text-slate-800 pb-2 border-b border-slate-100">
                      <span>Source Evidence Inspector</span>
                      <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Page 1</span>
                    </div>
                    <div className="mt-3 p-2.5 rounded bg-amber-50/60 border border-amber-200/70 text-slate-700 font-mono text-[11px] leading-relaxed">
                      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks... We propose the Transformer, a model architecture eschewing recurrence..."
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Verified via PyMuPDF</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Built for Rigorous Research</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">Why DocuMind is Not Just Another LLM Wrapper</p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-5">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verifiable Page-Level Citations</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Every extracted sentence retains its exact original PDF page number. The backend strictly cross-checks citation markers before returning answers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Insufficient Evidence Abstention</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                If documents do not contain evidence for a question, DocuMind explicitly abstains rather than generating convincing fabrications.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-5">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real Benchmark Evaluation</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Includes an automated evaluation suite measuring Recall@k, citation validity rates, latency metrics, and abstention performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
