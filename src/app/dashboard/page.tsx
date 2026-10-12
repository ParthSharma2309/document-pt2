'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/api';
import { DocumentItem, Conversation } from '@/types';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatBytes } from '@/lib/utils';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Upload, 
  Search, 
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
      return;
    }

    if (user) {
      Promise.all([
        apiRequest<DocumentItem[]>('/documents'),
        apiRequest<Conversation[]>('/conversations')
      ])
        .then(([docs, convs]) => {
          setDocuments(docs);
          setConversations(convs);
        })
        .catch((err) => console.error('Failed to load dashboard data', err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const readyDocs = documents.filter((d) => d.processing_status === 'ready').length;
  const processingDocs = documents.filter((d) => d.processing_status === 'processing' || d.processing_status === 'uploaded').length;
  const failedDocs = documents.filter((d) => d.processing_status === 'failed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research Dashboard</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Overview of indexed documents and active research sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/documents">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4 text-slate-500" />
              Upload PDF
            </Button>
          </a>
          <a href="/research">
            <Button size="sm" className="gap-2">
              <Search className="w-4 h-4" />
              Start Researching
            </Button>
          </a>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Documents</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{documents.length}</p>
          <span className="text-xs text-slate-500 mt-1 block">Uploaded to your library</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Indexed & Ready</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{readyDocs}</p>
          <span className="text-xs text-slate-500 mt-1 block">Indexed with page coordinates</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress / Failed</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {processingDocs} <span className="text-sm font-medium text-slate-500">/ {failedDocs} failed</span>
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Processing queue</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Research Sessions</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{conversations.length}</p>
          <span className="text-xs text-slate-500 mt-1 block">Active conversation threads</span>
        </div>
      </div>

      {/* Grid: Recent Documents and Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Documents */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-base">Recent Documents</h2>
            </div>
            <a href="/documents" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View all &rarr;
            </a>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {documents.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">No documents uploaded yet.</p>
                <a href="/documents" className="mt-2 inline-block">
                  <Button size="sm" variant="outline">Upload your first PDF</Button>
                </a>
              </div>
            ) : (
              documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.filename}</p>
                    <p className="text-xs text-slate-500">
                      {formatBytes(doc.file_size)} &bull; {doc.page_count ? `${doc.page_count} pages` : 'Calculating'} &bull; {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={doc.processing_status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-base">Recent Research Sessions</h2>
            </div>
            <a href="/research" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              New session &rarr;
            </a>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">No research sessions yet.</p>
                <a href="/research" className="mt-2 inline-block">
                  <Button size="sm">Start a session</Button>
                </a>
              </div>
            ) : (
              conversations.slice(0, 5).map((conv) => (
                <a
                  key={conv.id}
                  href={`/research?conversationId=${conv.id}`}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors group"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {conv.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {conv.message_count} messages &bull; Last active {formatDate(conv.updated_at)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
