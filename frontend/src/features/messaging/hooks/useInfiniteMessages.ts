import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingApi } from '../api/messaging.api';
import type { Message } from '../types';

export const useInfiniteMessages = (threadId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const currentRequestThreadId = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

  const fetchMessages = useCallback(async (isInitial: boolean) => {
    if (!threadId || isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      currentRequestThreadId.current = threadId;
      setIsLoading(true);
      
      let beforeId: number | undefined;
      if (!isInitial && messagesRef.current.length > 0) {
        beforeId = messagesRef.current[0].id;
      }

      const response = await messagingApi.getMessages(threadId, {
        limit: 50,
        before_id: beforeId
      });

      // If user changed thread mid-request or unmounted, discard
      if (currentRequestThreadId.current !== threadId) {
        return;
      }

      const newMessages = response.data;
      
      setMessages(prev => {
        const nextMessages = isInitial ? newMessages : [...newMessages, ...prev];
        messagesRef.current = nextMessages;
        return nextMessages;
      });
      setHasMore(response.meta.has_more ?? false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (currentRequestThreadId.current === threadId) {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }
  }, [threadId]);

  // Initial load
  useEffect(() => {
    if (threadId) {
      setMessages([]); // Clear messages immediately on thread change
      messagesRef.current = [];
      setHasMore(true);
      
      isFetchingRef.current = false; // allow a new fetch immediately
      fetchMessages(true);

      return () => {
        // Invalidate in-flight requests if unmounted
        if (currentRequestThreadId.current === threadId) {
          currentRequestThreadId.current = null;
        }
      };
    }
  }, [threadId, fetchMessages]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && !isFetchingRef.current) {
      fetchMessages(false);
    }
  }, [hasMore, isLoading, fetchMessages]);

  const sendMessage = async (body: string, type: string = 'text') => {
    if (!threadId || !body.trim()) return;

    try {
      setIsSending(true);
      const response = await messagingApi.sendMessage(threadId, { body, type });
      
      setMessages(prev => {
        const nextMessages = [...prev, response.data];
        messagesRef.current = nextMessages;
        return nextMessages;
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    hasMore,
    isSending,
    loadMore,
    sendMessage
  };
};
