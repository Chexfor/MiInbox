import React from 'react';
import { Avatar } from '@/shared/ui/Avatar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Thread } from '../types';

interface ThreadItemProps {
  thread: Thread;
  isActive?: boolean;
  onClick?: (thread: Thread) => void;
}

export const ThreadItem: React.FC<ThreadItemProps> = ({ thread, isActive = false, onClick }) => {
  const { user } = useAuth();
  const otherParticipants = thread.participants?.filter(p => p.id !== user?.id) || [];
  const displayUser = otherParticipants[0] || thread.participants[0] || { name: 'Desconocido' };

  const title = thread.is_group ? (thread.subject || 'Grupo sin nombre') : displayUser.name;
  // Si es grupo mostramos un ícono o avatar genérico de grupo.
  const avatarName = thread.is_group ? 'Grupo' : displayUser.name;
  const avatarUrl = thread.is_group ? undefined : displayUser.avatar_url;

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

      {/* To-Do: Usar multiavatars si es de grupo */}
      <Avatar name={avatarName} src={avatarUrl} size="md" />
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-sm truncate uppercase tracking-wider transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
          {title}
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
