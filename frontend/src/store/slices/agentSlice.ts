import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { WorkflowResult } from '../../types';

interface AgentState {
  agents: Array<{ name: string; role: string; status: string }>;
  workflowResult: WorkflowResult | null;
  processing: boolean;
  error: string | null;
}

const initialState: AgentState = {
  agents: [
    { name: 'LoanAgent', role: 'Loan Processing', status: 'active' },
    { name: 'RiskAgent', role: 'Risk Assessment', status: 'active' },
    { name: 'VerificationAgent', role: 'Document Verification', status: 'active' },
    { name: 'CollectionAgent', role: 'Collection & Repayment', status: 'active' },
  ],
  workflowResult: null,
  processing: false,
  error: null,
};

export const processLoan = createAsyncThunk(
  'agents/processLoan',
  async (application: any) => {
    const response = await apiService.processLoanApplication(application);
    return response;
  }
);

export const fetchAgentsStatus = createAsyncThunk(
  'agents/fetchStatus',
  async () => {
    const response = await apiService.getAgentsStatus();
    return response;
  }
);

const agentSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    clearWorkflowResult: (state) => {
      state.workflowResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(processLoan.pending, (state) => {
      state.processing = true;
    });
    builder.addCase(processLoan.fulfilled, (state, action: PayloadAction<WorkflowResult>) => {
      state.processing = false;
      state.workflowResult = action.payload;
    });
    builder.addCase(processLoan.rejected, (state, action) => {
      state.processing = false;
      state.error = action.error.message || 'Loan processing failed';
    });

    builder.addCase(fetchAgentsStatus.fulfilled, (state, action) => {
      if (action.payload.agents) {
        state.agents = action.payload.agents;
      }
    });
  },
});

export const { clearWorkflowResult, clearError } = agentSlice.actions;
export default agentSlice.reducer;