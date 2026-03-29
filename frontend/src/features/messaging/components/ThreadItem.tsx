import React from 'react';
import { Avatar } from '@/shared/ui/Avatar';
import type { Thread } from '../types';

interface ThreadItemProps {
  thread: Thread;
  isActive?: boolean;
  onClick?: (thread: Thread) => void;
}

export const ThreadItem: React.FC<ThreadItemProps> = ({ thread, isActive = false, onClick }) => {
  const otherParticipant = thread.participants[0] || { name: 'Participante' };

  return (
    <div
      onClick={() => onClick?.(thread)}
      className={`
        flex items-center gap-4 px-6 py-5 cursor-pointer transition-all duration-300 relative group
        ${isActive 
          ? 'bg-indigo-600/10 shadow-inner' 
          : 'bg-transparent hover:bg-slate-800/40'}
      `}
    >
      {/* Indicador de activo estilo vertical */}
      <div className={`
        absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 transition-all duration-500 rounded-r-full
        ${isActive ? 'h-10 bg-indigo-500 shadow-lg shadow-indigo-500/50' : 'group-hover:h-4 bg-slate-700'}
      `} />

      <Avatar name={otherParticipant.name} src={otherParticipant.avatar_url} size="md" />
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-sm truncate uppercase tracking-wider transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
          {thread.subject || otherParticipant.name}
        </h4>
        <p className="text-[10px] text-slate-600 truncate mt-0.5 font-medium group-hover:text-slate-500">
          Última actividad: {new Date(thread.last_message_at).toLocaleDateString()}
        </p>
      </div>

      {thread.unread_count > 0 && (
        <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
      )}
    </div>
  );
};
