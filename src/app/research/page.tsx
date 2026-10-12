'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/api';
import { DocumentItem, Conversation, AnswerResponse, CitationItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Send, 
  FileText, 
  Search, 
  Sparkles, 
  BookOpen, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronRight, 
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Layers,
  ChevronLeft
} from 'lucide-react';

export default function ResearchPage() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  
  // Right Drawer: Evidence Inspector
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
      return;
    }

    if (user) {
      Promise.all([
        apiRequest<DocumentItem[]>('/documents'),
        apiRequest<Conversation[]>('/conversations'),
      ]).then(([docs, convs]) => {
        const ready = docs.filter((d) => d.processing_status === 'ready');
        setDocuments(ready);
        // By default select all ready documents
        setSelectedDocIds(ready.map((d) => d.id));
        setConversations(convs);
      });
    }
  }, [user, authLoading]);

  const loadConversation = async (convId: string) => {
    try {
      const detail = await apiRequest<any>(`/conversations/${convId}`);
      setCurrentConversationId(detail.id);
      setMessages(detail.messages || []);
      // Open evidence drawer if citations exist
      const lastAssistantMsg = [...(detail.messages || [])].reverse().find((m: any) => m.role === 'assistant');
      if (lastAssistantMsg && lastAssistantMsg.citations && lastAssistantMsg.citations.length > 0) {
        setActiveCitation(lastAssistantMsg.citations[0]);
      }
    } catch (err) {
      console.error('Failed to load conversation', err);
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setActiveCitation(null);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userQuery = question.trim();
    setQuestion('');
    setErrorNotice('');
    setIsAsking(true);

    // Optimistically append user message
    const tempUserMsg = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: userQuery,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const resp = await apiRequest<AnswerResponse>('/answers', {
        method: 'POST',
        body: JSON.stringify({
          question: userQuery,
          conversation_id: currentConversationId || undefined,
          document_ids: selectedDocIds.length > 0 ? selectedDocIds : undefined,
          top_k: 5,
        }),
      });

      setCurrentConversationId(resp.conversation_id);

      const assistantMsg = {
        id: resp.message_id,
        role: 'assistant',
        content: resp.answer,
        citations: resp.citations,
        evidence_status: resp.evidence_status,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (resp.citations && resp.citations.length > 0) {
        setActiveCitation(resp.citations[0]);
        setIsEvidenceDrawerOpen(true);
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Error generating answer. Please try again.');
    } finally {
      setIsAsking(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const submitFeedback = async (messageId: string, feedbackType: string) => {
    try {
      await apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          message_id: messageId,
          feedback_type: feedbackType,
        }),
      });
      alert('Thank you! Feedback recorded.');
    } catch (err: any) {
      alert(`Error submitting feedback: ${err.message}`);
    }
  };

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* LEFT SIDEBAR: Document Scope & Conversations */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 hidden lg:flex">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Scope</span>
          <Button size="sm" variant="ghost" onClick={startNewConversation} className="text-xs">
            + New Session
          </Button>
        </div>

        {/* Document Selection List */}
        <div className="p-4 border-b border-slate-100 overflow-y-auto max-h-56">
          <p className="text-[11px] text-slate-500 mb-2 font-medium">Filter Retrieval Targets:</p>
          {documents.length === 0 ? (
            <p className="text-xs text-slate-400">No ready documents. Please upload one first.</p>
          ) : (
            <div className="space-y-1.5">
              {documents.map((doc) => {
                const isSelected = selectedDocIds.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    onClick={() => toggleDocSelection(doc.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-medium'
                        : 'border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{doc.filename}</span>
                    <span className="text-[10px] text-slate-400">{doc.page_count}p</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
            Previous Sessions
          </span>
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400">No prior sessions recorded.</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                    currentConversationId === conv.id
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* MIDDLE: Research Conversation & Q&A */}
      <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Ask Grounded Questions</h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                DocuMind evaluates answers strictly against your selected documents, providing verifiable page-level references and abstaining when evidence is missing.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-2 w-full text-left">
                <button
                  onClick={() => setQuestion('Explain the main argument and methodology of this document.')}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 text-xs text-slate-700 shadow-sm transition-all"
                >
                  &ldquo;Explain the main argument and methodology of this document.&rdquo;
                </button>
                <button
                  onClick={() => setQuestion('Which page defines the core architecture or parameters?')}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 text-xs text-slate-700 shadow-sm transition-all"
                >
                  &ldquo;Which page defines the core architecture or parameters?&rdquo;
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isUser ? 'You' : 'DocuMind Assistant'}
                    </span>
                    {!isUser && msg.evidence_status && (
                      <StatusBadge status={msg.evidence_status} />
                    )}
                  </div>

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Citations Pills */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                          Sources:
                        </span>
                        {msg.citations.map((cit: CitationItem, cIdx: number) => (
                          <button
                            key={cit.citation_id || cIdx}
                            onClick={() => {
                              setActiveCitation(cit);
                              setIsEvidenceDrawerOpen(true);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              activeCitation?.chunk_id === cit.chunk_id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-indigo-50/80 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                            }`}
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Page {cit.page_number}</span>
                            <span className="opacity-60 text-[10px]">&bull; {cit.document_filename}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Feedback Controls for Assistant Messages */}
                  {!isUser && msg.id && (
                    <div className="flex items-center gap-2 mt-2 px-1 text-xs text-slate-400">
                      <span>Was this grounded?</span>
                      <button
                        onClick={() => submitFeedback(msg.id, 'helpful')}
                        title="Helpful & supported"
                        className="p-1 hover:text-emerald-600 rounded transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => submitFeedback(msg.id, 'unsupported_citation')}
                        title="Unsupported citation"
                        className="p-1 hover:text-rose-600 rounded transition-colors"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          {errorNotice && (
            <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorNotice}
            </div>
          )}
          <form onSubmit={handleAskQuestion} className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Ask a question grounded in your selected documents..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
            />
            <Button
              type="submit"
              id="send-question-button"
              isLoading={isAsking}
              disabled={!question.trim()}
              className="px-5 rounded-xl gap-2"
            >
              <Send className="w-4 h-4" />
              Ask
            </Button>
          </form>
        </div>
      </main>

      {/* RIGHT DRAWER: PDF Evidence & Source Excerpt Viewer */}
      {isEvidenceDrawerOpen && (
        <aside className="w-96 border-l border-slate-200 bg-white flex flex-col shrink-0 shadow-lg">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Evidence Inspector</h3>
            </div>
            <button
              onClick={() => setIsEvidenceDrawerOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Hide
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeCitation ? (
              <>
                <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                    Referenced Source
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{activeCitation.document_filename}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-200/80 text-indigo-950">
                      Page {activeCitation.page_number}
                    </span>
                    <a
                      href={`http://localhost:8000/api/v1/documents/${activeCitation.document_id}/file#page=${activeCitation.page_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-medium ml-auto"
                    >
                      Open PDF Page <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Grounding Excerpt from PyMuPDF:
                  </h4>
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl font-mono text-xs text-slate-800 leading-relaxed shadow-inner">
                    &ldquo;{activeCitation.excerpt}&rdquo;
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chunk ID:</span>
                    <span className="font-mono text-[11px] truncate max-w-[180px]">{activeCitation.chunk_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Validation:</span>
                    <span className="text-emerald-600 font-semibold">Verified against DB</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs">Click a citation pill in any answer to inspect its original page excerpt.</p>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
