import React, { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';
import type { Message, User } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUser, 
  isLoading, 
  hasMore, 
  onLoadMore 
}) => {
  const { ref, inView } = useInView();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // To keep scroll position when loading more (upwards)
  const prevScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      if (scrollContainerRef.current) {
        prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
      }
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  // Scroll to bottom on initial load or new messages (if already at bottom)
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      // If we just loaded more (upwards), adjust scroll to maintain position
      if (scrollContainerRef.current && prevScrollHeightRef.current > 0) {
        const newHeight = scrollContainerRef.current.scrollHeight;
        const diff = newHeight - prevScrollHeightRef.current;
        if (diff > 0) {
          scrollContainerRef.current.scrollTop = diff;
          prevScrollHeightRef.current = 0;
          return;
        }
      }
      
      // Otherwise, scroll to bottom (only on first load or when sending)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-2 no-scrollbar"
    >
      {/* Loading More Indicator at Top */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isLoading && hasMore && <Loader2 size={16} className="animate-spin text-indigo-500" />}
      </div>

      {messages.map((message, index) => {
        const isMe = message.sender.id === currentUser?.id;
        const showSender = index === 0 || messages[index - 1].sender.id !== message.sender.id;
        
        return (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isMe={isMe} 
            showSender={showSender} 
          />
        );
      })}
      
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};
