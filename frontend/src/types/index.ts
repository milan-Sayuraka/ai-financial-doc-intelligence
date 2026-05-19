// Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'analyst' | 'manager';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  last_message: string;
  message_count: number;
  updated_at: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  tokens_used?: number;
}

// Document Types
export interface Document {
  id: string;
  filename: string;
  document_type: string;
  extracted_data: Record<string, any>;
  confidence_score: number;
  validation_status: 'pending' | 'validated' | 'rejected';
  created_at: string;
}

// RAG Types
export interface RAGDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  distance?: number;
  relevance?: number;
}

export interface RAGSearchRequest {
  query: string;
  n_results?: number;
  filter_metadata?: Record<string, any>;
}

export interface RAGChatRequest {
  message: string;
  use_rag?: boolean;
  n_docs?: number;
  conversation_id?: string;
}

// Agent Types
export interface LoanApplication {
  customer_id: string;
  customer_name: string;
  loan_type: string;
  loan_amount: number;
  monthly_income: number;
  credit_score: number;
  documents: Record<string, any>[];
  payment_history: Record<string, any>[];
}

export interface WorkflowResult {
  success: boolean;
  status: string;
  customer_name: string;
  final_summary: string;
  requires_human_review: boolean;
  workflow_steps: WorkflowStep[];
  details: Record<string, any>;
}

export interface WorkflowStep {
  step: string;
  status: string;
  summary: string;
}

// ML Types
export interface CreditRiskRequest {
  monthly_income: number;
  loan_amount: number;
  credit_score: number;
  age: number;
  employment_years: number;
  existing_loans: number;
  dependents: number;
}

export interface CreditRiskPrediction {
  risk_score: number;
  default_probability: number;
  risk_level: string;
  recommendation: string;
  factors: Record<string, any>;
}

export interface FraudDetectionRequest {
  amount: number;
  transaction_count: number;
  avg_transaction_amount: number;
  account_age_days: number;
  login_frequency: number;
  device_changes: number;
  transaction_type: string;
}

export interface FraudDetectionResult {
  fraud_probability: number;
  is_fraud: boolean;
  fraud_score: number;
  action_required: string;
  risk_factors: string[];
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}