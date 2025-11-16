// API client for the backend server

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Type definitions
export interface Survey {
  id: string;
  title: string;
  description: string | null;
  is_active: number;
  is_visible: number;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  session_id: string;
  created_at: string;
}

export interface PlatformCount {
  platform_name: string;
  count: number;
}

export interface SurveyResults {
  total_responses: number;
  platform_counts: PlatformCount[];
}

export interface RecentResponse {
  id: string;
  created_at: string;
  platforms: string;
}

export interface SurveyStats {
  total_responses: number;
  platform_counts: PlatformCount[];
  recent_responses: RecentResponse[];
}

// API functions

export const api = {
  // Survey operations
  async getSurveys(): Promise<Survey[]> {
    const response = await fetch(`${API_BASE_URL}/surveys`);
    if (!response.ok) throw new Error('Failed to fetch surveys');
    return response.json();
  },

  async getAllSurveys(): Promise<Survey[]> {
    const response = await fetch(`${API_BASE_URL}/surveys/all`);
    if (!response.ok) throw new Error('Failed to fetch all surveys');
    return response.json();
  },

  async getSurvey(id: string): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`);
    if (!response.ok) throw new Error('Failed to fetch survey');
    return response.json();
  },

  async createSurvey(data: { title: string; description: string; is_active?: boolean; is_visible?: boolean }): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create survey');
    return response.json();
  },

  async updateSurvey(id: string, data: { title: string; description: string; is_active: boolean; is_visible: boolean }): Promise<Survey> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update survey');
    return response.json();
  },

  async deleteSurvey(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete survey');
  },

  // Response operations
  async submitResponse(survey_id: string, platforms: string[]): Promise<{ id: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ survey_id, platforms }),
    });
    if (!response.ok) throw new Error('Failed to submit response');
    return response.json();
  },

  async getSurveyResults(id: string): Promise<SurveyResults> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/results`);
    if (!response.ok) throw new Error('Failed to fetch results');
    return response.json();
  },

  async getSurveyStats(id: string): Promise<SurveyStats> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async deleteAllResponses(id: string): Promise<{ message: string; deleted_count: number }> {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}/responses`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete responses');
    return response.json();
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },
};
