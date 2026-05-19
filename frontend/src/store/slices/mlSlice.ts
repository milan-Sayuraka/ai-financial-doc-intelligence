import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { CreditRiskPrediction, FraudDetectionResult } from '../../types';

interface MLState {
  creditRiskResult: CreditRiskPrediction | null;
  fraudDetectionResult: FraudDetectionResult | null;
  repaymentResult: any | null;
  modelsStatus: any[];
  loading: boolean;
  error: string | null;
}

const initialState: MLState = {
  creditRiskResult: null,
  fraudDetectionResult: null,
  repaymentResult: null,
  modelsStatus: [],
  loading: false,
  error: null,
};

export const predictCreditRisk = createAsyncThunk(
  'ml/predictCreditRisk',
  async (data: any) => {
    const response = await apiService.predictCreditRisk(data);
    return response.prediction || response;
  }
);

export const detectFraud = createAsyncThunk(
  'ml/detectFraud',
  async (data: any) => {
    const response = await apiService.detectFraud(data);
    return response.prediction || response;
  }
);

export const predictRepayment = createAsyncThunk(
  'ml/predictRepayment',
  async (data: any) => {
    const response = await apiService.predictRepayment(data);
    return response.prediction || response;
  }
);

export const fetchMLStatus = createAsyncThunk(
  'ml/fetchStatus',
  async () => {
    const response = await apiService.getMLModelsStatus();
    return response;
  }
);

const mlSlice = createSlice({
  name: 'ml',
  initialState,
  reducers: {
    clearCreditRiskResult: (state) => {
      state.creditRiskResult = null;
    },
    clearFraudResult: (state) => {
      state.fraudDetectionResult = null;
    },
    clearAllResults: (state) => {
      state.creditRiskResult = null;
      state.fraudDetectionResult = null;
      state.repaymentResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Credit Risk
    builder.addCase(predictCreditRisk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(predictCreditRisk.fulfilled, (state, action) => {
      state.loading = false;
      state.creditRiskResult = action.payload;
    });
    builder.addCase(predictCreditRisk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Credit risk prediction failed';
    });

    // Fraud Detection
    builder.addCase(detectFraud.fulfilled, (state, action) => {
      state.fraudDetectionResult = action.payload;
    });
    builder.addCase(detectFraud.rejected, (state, action) => {
      state.error = action.error.message || 'Fraud detection failed';
    });

    // Repayment
    builder.addCase(predictRepayment.fulfilled, (state, action) => {
      state.repaymentResult = action.payload;
    });

    // Status
    builder.addCase(fetchMLStatus.fulfilled, (state, action) => {
      state.modelsStatus = action.payload.models || [];
    });
  },
});

export const { 
  clearCreditRiskResult, 
  clearFraudResult, 
  clearAllResults, 
  clearError 
} = mlSlice.actions;

export default mlSlice.reducer;