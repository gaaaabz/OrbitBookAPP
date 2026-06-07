import { api } from './api';
import type { ChatRequest, ChatResponse } from './types';

export const aiService = {
  chat: (payload: ChatRequest): Promise<ChatResponse> =>
    api.post<ChatResponse>('/ai/chat', payload),
};
