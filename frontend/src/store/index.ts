import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import documentReducer from './slices/documentSlice';
import ragReducer from './slices/ragSlice';
import agentReducer from './slices/agentSlice';
import mlReducer from './slices/mlSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    documents: documentReducer,
    rag: ragReducer,
    agents: agentReducer,
    ml: mlReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;