import api from '@/core/api/axios.instance';
import type { Thread, Message, PaginatedResponse, StandardResponse } from '../types';

export const messagingApi = {
  /**
   * Fetch paginated threads for the current user.
   */
  getThreads: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const response = await api.get<PaginatedResponse<Thread>>('/messaging/threads', { params });
    return response.data;
  },

  /**
   * Fetch paginated messages for a specific thread (history).
   */
  getMessages: async (threadId: number, params: { limit?: number; before_id?: number } = {}) => {
    const response = await api.get<PaginatedResponse<Message>>(`/messaging/threads/${threadId}/messages`, { params });
    return response.data;
  },

  /**
   * Create a new conversation thread.
   */
  createThread: async (data: { participant_ids: number[]; subject?: string; body?: string }) => {
    const response = await api.post<StandardResponse<Thread>>('/messaging/threads', data);
    return response.data;
  },

  /**
   * Send a message to an existing thread.
   */
  sendMessage: async (threadId: number, data: { body: string; type?: string }) => {
    const response = await api.post<StandardResponse<Message>>(`/messaging/threads/${threadId}/messages`, data);
    return response.data;
  },
};
