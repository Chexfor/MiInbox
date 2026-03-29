import { useState, useEffect, useCallback } from 'react';
import { messagingApi } from '../api/messaging.api';
import type { Message } from '../types';

export const useInfiniteMessages = (threadId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = useCallback(async (isInitial: boolean = false) => {
    if (!threadId) return;

    try {
      setIsLoading(true);
      const beforeId = !isInitial && messages.length > 0 ? messages[0].id : undefined;
      
      const response = await messagingApi.getMessages(threadId, {
        limit: 50,
        before_id: beforeId
      });

      const newMessages = response.data;
      
      if (isInitial) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      setHasMore(response.meta.has_more ?? false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [threadId, messages]);

  // Initial load
  useEffect(() => {
    if (threadId) {
      setMessages([]);
      setHasMore(true);
      fetchMessages(true);
    }
  }, [threadId, fetchMessages]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchMessages();
    }
  }, [isLoading, hasMore, fetchMessages]);

  const sendMessage = async (body: string, type: string = 'text') => {
    if (!threadId || !body.trim()) return;

    try {
      setIsSending(true);
      const response = await messagingApi.sendMessage(threadId, { body, type });
      // response.data is a single Message object
      setMessages(prev => [...prev, response.data]);
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
