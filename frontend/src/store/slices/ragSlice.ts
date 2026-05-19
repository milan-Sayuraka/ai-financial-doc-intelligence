import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { RAGDocument } from '../../types';

interface RAGState {
  results: RAGDocument[];
  totalDocuments: number;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: RAGState = {
  results: [],
  totalDocuments: 0,
  searchQuery: '',
  loading: false,
  error: null,
};

export const searchDocuments = createAsyncThunk(
  'rag/searchDocuments',
  async ({ query, nResults }: { query: string; nResults?: number }) => {
    const response = await apiService.searchRAG(query, nResults);
    return response;
  }
);

export const fetchRAGStats = createAsyncThunk(
  'rag/fetchStats',
  async () => {
    const response = await apiService.getRAGStats();
    return response;
  }
);

export const ragChat = createAsyncThunk(
  'rag/ragChat',
  async ({ message, useRag }: { message: string; useRag?: boolean }) => {
    const response = await apiService.ragChat(message, useRag);
    return response;
  }
);

const ragSlice = createSlice({
  name: 'rag',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearResults: (state) => {
      state.results = [];
      state.searchQuery = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(searchDocuments.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(searchDocuments.fulfilled, (state, action) => {
      state.loading = false;
      state.results = action.payload.results || [];
    });
    builder.addCase(searchDocuments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Search failed';
    });

    builder.addCase(fetchRAGStats.fulfilled, (state, action) => {
      state.totalDocuments = action.payload.total_documents || 0;
    });
  },
});

export const { setSearchQuery, clearResults, clearError } = ragSlice.actions;
export default ragSlice.reducer;