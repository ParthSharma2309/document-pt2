'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/api';
import { DocumentItem, Collection } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatBytes, formatDate } from '@/lib/utils';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Search, 
  FolderPlus, 
  Filter, 
  ExternalLink,
  AlertCircle,
  Plus
} from 'lucide-react';

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Upload modal & state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showAddCollection, setShowAddCollection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      let url = '/documents';
      const params = new URLSearchParams();
      if (selectedCollection) params.append('collection_id', selectedCollection);
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const docs = await apiRequest<DocumentItem[]>(url);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  const fetchCollections = async () => {
    try {
      const cols = await apiRequest<Collection[]>('/collections');
      setCollections(cols);
    } catch (err) {
      console.error('Failed to fetch collections', err);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
      return;
    }
    if (user) {
      Promise.all([fetchDocuments(), fetchCollections()]).finally(() => setLoading(false));
    }
  }, [user, authLoading, selectedCollection]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf') {
        setUploadError(`'${file.name}' is not a valid PDF.`);
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      if (selectedCollection) {
        formData.append('collection_id', selectedCollection);
      }

      try {
        await apiRequest<DocumentItem>('/documents', {
          method: 'POST',
          body: formData,
        });
        setUploadSuccess(`Successfully uploaded and indexed '${file.name}'!`);
      } catch (err: any) {
        setUploadError(err.message || `Failed to process '${file.name}'.`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchDocuments();
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete '${filename}'? This will remove all chunks and embeddings.`)) {
      return;
    }
    try {
      await apiRequest(`/documents/${docId}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      await apiRequest('/collections', {
        method: 'POST',
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });
      setNewCollectionName('');
      setShowAddCollection(false);
      fetchCollections();
    } catch (err: any) {
      alert(`Failed to create collection: ${err.message}`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Library</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage your research papers, notes, and collections
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="application/pdf"
            multiple
            className="hidden"
            id="pdf-upload-input"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload PDF Files
          </Button>
        </div>
      </div>

      {/* Upload Feedback */}
      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
      {uploadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <FileText className="w-4 h-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:max-w-md flex gap-2">
          <Input
            placeholder="Search documents by title or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs"
          />
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Collections ({documents.length})</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.document_count})
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddCollection(!showAddCollection)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Collection
          </Button>
        </div>
      </div>

      {showAddCollection && (
        <form onSubmit={handleCreateCollection} className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-3">
          <Input
            placeholder="Collection Name (e.g. Machine Learning Thesis)"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            className="max-w-xs text-xs"
          />
          <Button type="submit" size="sm">Save</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddCollection(false)}>Cancel</Button>
        </form>
      )}

      {/* Document Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No documents in this view</p>
            <p className="text-xs text-slate-500 mt-1">Upload a PDF to index pages and begin grounded research</p>
            <Button
              className="mt-4 gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload PDF
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-xs sm:max-w-md">
                        <span className="block truncate font-semibold">{doc.filename}</span>
                        {doc.error_message && (
                          <span className="text-xs text-rose-600 truncate block">{doc.error_message}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {doc.page_count ? `${doc.page_count} pages` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {formatBytes(doc.file_size)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.processing_status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/research?docId=${doc.id}`}
                          title="Open in Research Workspace"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <Search className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id, doc.filename)}
                          title="Delete document"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
