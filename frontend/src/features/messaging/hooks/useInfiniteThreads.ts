import { useState, useEffect, useCallback } from 'react';
import { messagingApi } from '../api/messaging.api';
import type { Thread } from '../types';

export const useInfiniteThreads = (searchQuery: string = '') => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchThreads = useCallback(async (pageNum: number, search: string, isInitial: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await messagingApi.getThreads({
        page: pageNum,
        search: search || undefined,
        limit: 20
      });

      const newThreads = response.data;
      
      setThreads(prev => isInitial ? newThreads : [...prev, ...newThreads]);
      setHasMore(response.meta.current_page! < response.meta.last_page!);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset when search changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchThreads(1, searchQuery, true);
  }, [searchQuery, fetchThreads]);

  const fetchNextPage = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchThreads(nextPage, searchQuery);
    }
  }, [isLoading, hasMore, page, searchQuery, fetchThreads]);

  return {
    threads,
    isLoading,
    hasMore,
    fetchNextPage
  };
};
