import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { Document } from '../../types';

interface DocumentState {
  documents: Document[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  loading: false,
  uploading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (documentType?: string) => {
    const response = await apiService.getDocuments(documentType);
    return response.data || [];
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ file, documentType }: { file: File; documentType: string }) => {
    const response = await apiService.uploadDocument(file, documentType);
    return response.data;
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocuments: (state) => {
      state.documents = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDocuments.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDocuments.fulfilled, (state, action: PayloadAction<Document[]>) => {
      state.loading = false;
      state.documents = action.payload;
    });
    builder.addCase(fetchDocuments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch documents';
    });

    builder.addCase(uploadDocument.pending, (state) => {
      state.uploading = true;
    });
    builder.addCase(uploadDocument.fulfilled, (state, action) => {
      state.uploading = false;
      state.documents.unshift(action.payload);
    });
    builder.addCase(uploadDocument.rejected, (state, action) => {
      state.uploading = false;
      state.error = action.error.message || 'Failed to upload document';
    });
  },
});

export const { clearDocuments, clearError } = documentSlice.actions;
export default documentSlice.reducer;