import { useState, useCallback } from 'react';
import { userApi } from '../api/user.api';
import type { User } from '@/features/messaging/types';

interface UseUsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

export const useUsers = () => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    isLoading: false,
    error: null,
  });

  const searchUsers = useCallback(async (query: string = '') => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Small optimization: could add debounce here if triggered on every keystroke
      const data = await userApi.searchUsers({ search: query, limit: 15 });
      setState({
        users: data.data, // Access paginated data items
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || 'Error fetching users';
      setState((prev) => ({ ...prev, isLoading: false, error: msg }));
    }
  }, []);

  const clearUsers = useCallback(() => {
    setState({ users: [], isLoading: false, error: null });
  }, []);

  return {
    ...state,
    searchUsers,
    clearUsers,
  };
};
