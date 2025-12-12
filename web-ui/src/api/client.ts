// API Client for NicheFinder Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: 'Unknown error',
          message: response.statusText,
        }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async health(): Promise<{ status: string }> {
    return this.request('/health');
  }

  // Opportunities
  async getOpportunities(params?: {
    min_score?: number;
    max_results?: number;
  }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.min_score) query.set('min_score', params.min_score.toString());
    if (params?.max_results) query.set('max_results', params.max_results.toString());

    const endpoint = `/api/opportunities${query.toString() ? `?${query}` : ''}`;
    const response = await this.request(endpoint);
    return response.opportunities || [];
  }

  // System status
  async getSystemStatus(): Promise<any> {
    return this.request('/api/system/status');
  }

  async getSystemStats(): Promise<any> {
    return this.request('/api/system/stats');
  }

  // Workflows
  async getWorkflows(): Promise<any[]> {
    return this.request('/api/workflows');
  }

  async getWorkflow(id: string): Promise<any> {
    return this.request(`/api/workflows/${id}`);
  }

  async executeWorkflow(id: string): Promise<any> {
    return this.request(`/api/workflows/${id}/execute`, {
      method: 'POST',
    });
  }

  // Executions
  async getExecutions(): Promise<any[]> {
    return this.request('/api/executions');
  }

  async getExecution(id: string): Promise<any> {
    return this.request(`/api/executions/${id}`);
  }

  async getExecutionLogs(id: string): Promise<any[]> {
    return this.request(`/api/executions/${id}/logs`);
  }

  async getExecutionStatus(id: string): Promise<any> {
    return this.request(`/api/executions/${id}/status`);
  }

  // Artifacts
  async getArtifacts(): Promise<any[]> {
    return this.request('/api/artifacts');
  }

  async getArtifact(id: string): Promise<any> {
    return this.request(`/api/artifacts/${id}`);
  }

  async getArtifactPreview(id: string): Promise<any> {
    return this.request(`/api/artifacts/${id}/preview`);
  }

  async getArtifactMetadata(id: string): Promise<any> {
    return this.request(`/api/artifacts/${id}/metadata`);
  }

  // Connectors
  async getConnectors(): Promise<any[]> {
    return this.request('/api/connectors');
  }

  async getConnector(id: string): Promise<any> {
    return this.request(`/api/connectors/${id}`);
  }

  // Data Pipeline
  async getTransformationPreview(source: string): Promise<any> {
    return this.request(`/api/transform/preview?source=${source}`);
  }

  async getSchemas(): Promise<any[]> {
    return this.request('/api/schemas');
  }

  async getSchema(name: string): Promise<any> {
    return this.request(`/api/schemas/${name}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

