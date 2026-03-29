import React from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteThreads } from '../hooks/useInfiniteThreads';
import { ThreadItem } from './ThreadItem';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import type { Thread } from '../types';

interface ThreadListProps {
  onSelectThread: (thread: Thread) => void;
  activeThreadId?: number;
  searchQuery: string;
}

export const ThreadList: React.FC<ThreadListProps> = ({ 
  onSelectThread, 
  activeThreadId, 
  searchQuery 
}) => {
  const { threads, isLoading, hasMore, fetchNextPage } = useInfiniteThreads(searchQuery);
  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchNextPage();
    }
  }, [inView, hasMore, isLoading, fetchNextPage]);

  if (threads.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-600 text-center space-y-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl opacity-50">
          <MessageSquarePlus size={32} />
        </div>
        <div>
          <p className="font-bold text-slate-500 uppercase tracking-tighter">Sin conversaciones</p>
          <p className="text-[10px] uppercase">Inicia un nuevo hilo para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar bg-slate-900/10">
      <div className="divide-y divide-slate-800/30">
        {threads.map((thread) => (
          <ThreadItem
            key={thread.id}
            thread={thread}
            isActive={thread.id === activeThreadId}
            onClick={onSelectThread}
          />
        ))}
        
        {/* Loading Spinner / Observer Trigger */}
        <div ref={ref} className="p-8 flex justify-center">
          {isLoading && <Loader2 size={24} className="animate-spin text-indigo-500" />}
        </div>
      </div>
    </div>
  );
};
