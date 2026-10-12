'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/api';
import { EvaluationRun } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { 
  BarChart3, 
  Play, 
  CheckCircle2, 
  Clock, 
  Target, 
  ShieldAlert, 
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function EvaluationPage() {
  const { user, loading: authLoading } = useAuth();
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [runError, setRunError] = useState('');

  const fetchRuns = async () => {
    try {
      const data = await apiRequest<EvaluationRun[]>('/evaluation/summary');
      setRuns(data);
    } catch (err) {
      console.error('Failed to fetch evaluation runs', err);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
      return;
    }
    if (user) {
      fetchRuns().finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    setRunError('');
    try {
      await apiRequest<EvaluationRun>('/evaluation/runs', {
        method: 'POST',
        body: JSON.stringify({
          evaluation_name: `Benchmark Run #${runs.length + 1}`,
        }),
      });
      await fetchRuns();
    } catch (err: any) {
      setRunError(err.message || 'Benchmark run failed.');
    } finally {
      setIsRunning(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const latestRun = runs.length > 0 ? runs[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Evaluation Dashboard</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Empirical quality benchmarks for retrieval recall, citation validity, and abstention
          </p>
        </div>
        <Button
          onClick={handleRunEvaluation}
          isLoading={isRunning}
          id="run-benchmark-button"
          className="gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          Run Benchmark Suite
        </Button>
      </div>

      {runError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{runError}</span>
        </div>
      )}

      {/* Latest Run Highlights */}
      {latestRun ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Latest Benchmark Result
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{latestRun.evaluation_name}</h2>
                <p className="text-xs text-slate-500">
                  Executed {formatDate(latestRun.created_at)} &bull; {latestRun.sample_count} benchmark questions
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Benchmark Complete
              </span>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">Recall @ 3</span>
                  <Target className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {(latestRun.metrics.recall_at_3 * 100).toFixed(1)}%
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">Top-3 hit rate</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">Citation Validity</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {(latestRun.metrics.citation_validity_rate * 100).toFixed(1)}%
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">Verified against DB</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">Abstention Rate</span>
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {(latestRun.metrics.abstention_rate * 100).toFixed(1)}%
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">Refused unanswerable</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">Avg Latency</span>
                  <Zap className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {latestRun.metrics.avg_retrieval_latency_ms.toFixed(1)}ms
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">Hybrid search time</span>
              </div>
            </div>
          </div>

          {/* Historical Runs Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-base mb-4">Historical Runs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase font-semibold">
                    <th className="py-2.5 px-3">Run Name</th>
                    <th className="py-2.5 px-3">Recall@3</th>
                    <th className="py-2.5 px-3">Recall@5</th>
                    <th className="py-2.5 px-3">Citation Validity</th>
                    <th className="py-2.5 px-3">Abstention</th>
                    <th className="py-2.5 px-3">Retrieval Latency</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {runs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">{r.evaluation_name}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{(r.metrics.recall_at_3 * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{(r.metrics.recall_at_5 * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 font-medium text-emerald-700">{(r.metrics.citation_validity_rate * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 font-medium text-amber-700">{(r.metrics.abstention_rate * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 text-slate-600">{r.metrics.avg_retrieval_latency_ms.toFixed(1)}ms</td>
                      <td className="py-3 px-3 text-slate-400">{formatDate(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Evaluation Runs Recorded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Execute the automated benchmark suite to empirically evaluate DocuMind's retrieval recall, citation validity, and hallucination abstention rates.
          </p>
          <Button onClick={handleRunEvaluation} isLoading={isRunning}>
            Run First Benchmark Suite
          </Button>
        </div>
      )}
    </div>
  );
}
