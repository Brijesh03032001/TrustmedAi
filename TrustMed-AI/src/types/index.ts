// Types for TrustMed-AI Medical Chatbot

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: MedicalLink[];
  confidence?: number;
  intent?: string;
  responseTime?: number;
  sourcesCount?: number;
  sessionId?: string;
}

// TrustMed-AI API Response Types
export interface TrustMedQueryResponse {
  query: string;
  answer: string;
  links: MedicalLink[];
  query_intent: string;
  confidence_score: number;
  response_time_ms: number;
  sources_count: number;
  timestamp: string;
}

export interface MedicalLink {
  title: string;
  url: string;
  source_type: 'medicine' | 'symptoms' | 'diseases' | 'general';
  relevance_score: number;
}

export interface TrustMedHealthStatus {
  status: string;
  timestamp: string;
  version: string;
  ai_provider: string;
  chroma_collections: string[];
  active_sessions: number;
}

export interface SessionDetails {
  session_id: string;
  created_at: string;
  last_activity: string;
  query_count: number;
  queries: Array<{
    query: string;
    timestamp: string;
    intent: string;
  }>;
}

// Legacy compatibility types
export interface ChatResponse {
  answer: string;
  sources: string[];
  confidence: number;
  links?: MedicalLink[];
  query_intent?: string;
  response_time_ms?: number;
  sources_count?: number;
  session_id?: string;
}

export interface SearchResult {
  disease: string;
  source: string;
  distance: number;
}

export interface Disease {
  id: number;
  name: string;
}

export interface DiseaseDetail {
  id: number;
  disease_name: string;
  source_url: string;
  overview: string;
  symptoms: string;
  causes: string;
  risk_factors: string;
  complications: string;
  created_at: string;
}

export interface ApiError {
  detail: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
}