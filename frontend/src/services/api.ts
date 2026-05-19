import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.api.post('/auth/login', { username, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  // Chat endpoints
  async sendMessage(message: string, conversationId?: string) {
    const response = await this.api.post('/chat/send', {
      message,
      conversation_id: conversationId,
    });
    return response.data;
  }

  async getConversations() {
    const response = await this.api.get('/chat/conversations');
    return response.data;
  }

  async getMessages(conversationId: string) {
    const response = await this.api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  }

  async getQuickInfo(topic: string) {
    const response = await this.api.get(`/chat/quick-info/${topic}`);
    return response.data;
  }

  // Document endpoints
  async uploadDocument(file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    const response = await this.api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getDocuments(documentType?: string) {
    const params = documentType ? { document_type: documentType } : {};
    const response = await this.api.get('/documents', { params });
    return response.data;
  }

  // RAG endpoints
  async searchRAG(query: string, nResults: number = 5) {
    const response = await this.api.post('/rag/search', {
      query,
      n_results: nResults,
    });
    return response.data;
  }

  async ragChat(message: string, useRag: boolean = true) {
    const response = await this.api.post('/rag-chat/send', {
      message,
      use_rag: useRag,
    });
    return response.data;
  }

  async getRAGStats() {
    const response = await this.api.get('/rag/stats');
    return response.data;
  }

  // Agent endpoints
  async processLoanApplication(application: any) {
    const response = await this.api.post('/agents/process-loan', application);
    return response.data;
  }

  async getAgentsStatus() {
    const response = await this.api.get('/agents/agents/status');
    return response.data;
  }

  // ML endpoints
  async predictCreditRisk(data: any) {
    const response = await this.api.post('/ml/credit-risk', data);
    return response.data;
  }

  async detectFraud(data: any) {
    const response = await this.api.post('/ml/fraud-detection', data);
    return response.data;
  }

  async predictRepayment(data: any) {
    const response = await this.api.post('/ml/repayment-prediction', data);
    return response.data;
  }

  async getMLModelsStatus() {
    const response = await this.api.get('/ml/models/status');
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;