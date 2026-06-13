// API service for TrustMed-AI Medical Chatbot
import { TrustMedQueryResponse, TrustMedHealthStatus, DiseaseDetail, Disease } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface DiseaseSearchResponse {
  diseases?: Array<{
    name: string;
    category?: string;
    description?: string;
  }>;
  total_diseases?: number;
  search_time_ms?: number;
  query?: string;
}

interface DiseaseCategoriesResponse {
  total_categories?: number;
  categories?: Array<{
    name: string;
    count: number;
    display_name: string;
  }>;
}

const makeRequest = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

const makeBinaryRequest = async (endpoint: string, options?: RequestInit): Promise<Blob> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
  }

  return await response.blob();
};

const makeFormRequest = async <T>(endpoint: string, formData: FormData): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

export const apiService = {
  // Health check - TrustMed-AI endpoint
  healthCheck: (): Promise<TrustMedHealthStatus> => {
    return makeRequest('/');
  },

  // Main medical query endpoint - TrustMed-AI RAG
  medicalQuery: (query: string): Promise<TrustMedQueryResponse> => {
    const payload = { query };
    
    return makeRequest('/medical/query', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  textToSpeech: (text: string): Promise<Blob> => {
    return makeBinaryRequest('/voice/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
  },

  speechToText: (audioBlob: Blob): Promise<{ transcript: string }> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    return makeFormRequest('/voice/speech-to-text', formData);
  },

  // Legacy compatibility methods (for backward compatibility)
  chat: (question: string): Promise<TrustMedQueryResponse> => {
    return apiService.medicalQuery(question);
  },

  // TrustMed-AI Disease Search endpoints
  searchDiseases: (query?: string, limit: number = 50): Promise<DiseaseSearchResponse> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    params.append('limit', limit.toString());
    
    return makeRequest(`/diseases?${params}`);
  },

  // Get disease categories
  getDiseaseCategories: (): Promise<DiseaseCategoriesResponse> => {
    return makeRequest('/diseases/categories');
  },

  // Legacy search method (updated to use new endpoint)
  search: (question: string, limit: number = 5): Promise<DiseaseSearchResponse> => {
    return apiService.searchDiseases(question, limit);
  },

  // Legacy diseases methods (updated to use new endpoint)
  getDiseases: (): Promise<Disease[]> => {
    return apiService.searchDiseases().then(data => 
      data.diseases?.map((disease, index: number) => ({
        id: index + 1,
        name: disease.name
      })) || []
    );
  },

  // Get specific disease details (legacy compatibility)
  getDiseaseDetail: (id: number): Promise<DiseaseDetail> => {
    // This would need to be implemented based on specific disease lookup
    return makeRequest(`/disease/${id}`);
  },
};
