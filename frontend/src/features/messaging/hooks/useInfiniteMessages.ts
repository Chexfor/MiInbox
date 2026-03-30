import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingApi } from '../api/messaging.api';
import type { Message } from '../types';
import echo from '@/core/realtime/echo.config';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useInfiniteMessages = (threadId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

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

  useEffect(() => {
    if (!threadId || !user?.id) return;

    const channel = echo.private(`user.${user.id}`);
    
    const messageHandler = (event: any) => {
      // Si el backend envía el Resource completo, 'event' tiene la misma estructura que Message
      if (event.thread_id === threadId) {
        setMessages(prev => {
          if (prev.some(m => m.id === event.id)) return prev;
          
          const nextMessages = [...prev, event as Message];
          messagesRef.current = nextMessages;
          return nextMessages;
        });
      }
    };

    channel.listen('MessageSent', messageHandler);

    return () => {
      // Evitamos leave() porque el MessagingLayout también lo utiliza.
    };
  }, [threadId, user?.id]);

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
        // En Laravel los Resources a veces devuelven un doble `data` envelope cuando se usan dentro de response()->json(). 
        // Desencapsulamos asegurando de tener el Message object.
        const newMessage = ('data' in response.data) ? (response.data as any).data : response.data;
        
        // Evitar duplicados por si el socket llegó primero
        if (prev.some(m => m.id === newMessage.id)) return prev;

        const nextMessages = [...prev, newMessage];
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
    sendMessage,
    setMessages
  };
};
