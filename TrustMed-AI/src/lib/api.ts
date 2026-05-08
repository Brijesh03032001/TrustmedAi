// API service for TrustMed-AI Medical Chatbot
import { TrustMedQueryResponse, TrustMedHealthStatus, DiseaseDetail, Disease } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  // Legacy compatibility methods (for backward compatibility)
  chat: (question: string): Promise<TrustMedQueryResponse> => {
    return apiService.medicalQuery(question);
  },

  // TrustMed-AI Disease Search endpoints
  searchDiseases: (query?: string, limit: number = 50): Promise<any> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    params.append('limit', limit.toString());
    
    return makeRequest(`/diseases?${params}`);
  },

  // Get disease categories
  getDiseaseCategories: (): Promise<any> => {
    return makeRequest('/diseases/categories');
  },

  // Legacy search method (updated to use new endpoint)
  search: (question: string, limit: number = 5): Promise<any> => {
    return apiService.searchDiseases(question, limit);
  },

  // Legacy diseases methods (updated to use new endpoint)
  getDiseases: (): Promise<Disease[]> => {
    return apiService.searchDiseases().then(data => 
      data.diseases?.map((disease: any, index: number) => ({
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