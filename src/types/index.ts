export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Collection {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
  document_count: number;
}

export interface DocumentItem {
  id: string;
  owner_id: string;
  collection_id?: string | null;
  filename: string;
  mime_type: string;
  file_size: number;
  page_count?: number | null;
  processing_status: 'uploaded' | 'processing' | 'ready' | 'failed';
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchResultChunk {
  chunk_id: string;
  document_id: string;
  document_filename: string;
  page_number: number;
  chunk_text: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResultChunk[];
  total_found: number;
}

export interface CitationItem {
  citation_id: string;
  document_id: string;
  document_filename: string;
  page_number: number;
  excerpt: string;
  chunk_id: string;
}

export interface AnswerResponse {
  answer: string;
  citations: CitationItem[];
  evidence_status: 'sufficient' | 'insufficient' | 'no_evidence' | 'error';
  conversation_id: string;
  message_id: string;
  retrieval_latency_ms: number;
  generation_latency_ms: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: CitationItem[];
  created_at: string;
}

export interface Conversation {
  id: string;
  owner_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  messages?: Message[];
}

export interface EvaluationRun {
  id: string;
  evaluation_name: string;
  configuration: Record<string, any>;
  metrics: {
    recall_at_3: number;
    recall_at_5: number;
    citation_validity_rate: number;
    abstention_rate: number;
    avg_retrieval_latency_ms: number;
    avg_end_to_end_latency_ms: number;
    total_samples: number;
    processed_documents_count: number;
  };
  sample_count: number;
  created_at: string;
}
