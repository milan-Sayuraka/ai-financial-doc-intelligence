import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { ChatMessage, ChatConversation, ChatResponse } from '../../types';

interface ChatState {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
  messages: [],
  loading: false,
  sending: false,
  error: null,
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, conversationId }: { message: string; conversationId?: string }) => {
    const response = await apiService.sendMessage(message, conversationId);
    return response;
  }
);

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async () => {
    const response = await apiService.getConversations();
    return response;
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string) => {
    const response = await apiService.getMessages(conversationId);
    return { conversationId, messages: response.data };
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessage.pending, (state) => {
      state.sending = true;
    });
    builder.addCase(sendMessage.fulfilled, (state, action: PayloadAction<ChatResponse>) => {
      state.sending = false;
      if (action.payload.conversation_id) {
        state.currentConversationId = action.payload.conversation_id;
      }
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.sending = false;
      state.error = action.error.message || 'Failed to send message';
    });

    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.conversations = action.payload.data || [];
    });

    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages = action.payload.messages || [];
    });
  },
});

export const { setCurrentConversation, addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;