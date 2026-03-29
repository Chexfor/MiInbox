import api from '@/core/api/axios.instance';
import type { User, PaginatedResponse } from '@/features/messaging/types';

export const userApi = {
  /**
   * Search for all system users (excluding current auth user logic on backend)
   */
  searchUsers: async (params: { search?: string; limit?: number; page?: number } = {}) => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },
};
