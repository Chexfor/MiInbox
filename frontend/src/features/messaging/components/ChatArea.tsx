import React, { useState, useEffect } from 'react';
import { useInfiniteMessages } from '../hooks/useInfiniteMessages';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2, FileText, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import type { Thread } from '../types';

interface ChatAreaProps {
  thread: Thread | null;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ thread }) => {
  const { user: currentUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date());
  
  const { 
    messages, 
    isLoading, 
    hasMore, 
    isSending, 
    loadMore, 
    sendMessage 
  } = useInfiniteMessages(thread?.id || null);

  useEffect(() => {
    if (thread) {
      if (thread.is_group) {
        setSubject(thread.subject || 'Grupo sin asunto');
      } else {
        const otherParticipant = thread.participants?.find(p => p.id !== currentUser?.id);
        setSubject(otherParticipant?.name || 'Usuario B');
      }
      setDate(new Date(thread.last_message_at || new Date()));
    }
  }, [thread, currentUser]);

  if (!thread) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 italic bg-slate-900/20">
        <div className="w-16 h-16 rounded-full border border-slate-800 flex items-center justify-center mb-6 animate-pulse">
           <FileText size={32} className="opacity-20" />
        </div>
        <p className="text-lg font-bold text-slate-400 mb-2">Área de lectura / redacción</p>
        <p className="text-sm max-w-xs text-slate-600">
           Selecciona una conversación de la lista para ver los detalles del mensaje.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/10 relative overflow-hidden">
      
      {/* 1. ASUNTO DEL MENSAJE */}
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-4 mb-4 lg:hidden">
           <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={20} />
           </button>
           <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Chat Area</span>
        </div>
        
        <div className="relative group">
          <label className="absolute -top-2 left-4 px-2 bg-slate-900 text-[10px] font-bold text-indigo-500 uppercase z-10">
            Asunto del mensaje
          </label>
          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 font-bold text-lg shadow-inner group-focus-within:border-indigo-500/50 transition-all">
            {subject}
          </div>
        </div>
      </div>

      {/* 2. FECHA Y HORA (Editable) */}
      <div className="px-8 py-2 shrink-0 flex items-center justify-center gap-2">
         <div className="h-px bg-slate-800 flex-1" />
         <div className="relative group">
            <input 
              type="datetime-local"
              value={format(date, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setDate(new Date(e.target.value))}
              className="bg-slate-800/50 hover:bg-slate-800 border border-slate-800 rounded-full px-4 py-1.5 text-[10px] font-bold text-indigo-400/80 transition-all outline-none cursor-pointer"
            />
         </div>
         <div className="h-px bg-slate-800 flex-1" />
      </div>

      {/* 3. CUERPO DEL MENSAJE (Historial) */}
      <div className="flex-1 overflow-hidden relative group">
        {/* Leyenda eliminada por ser muy explícita */}
        
        <div className="h-full pt-4">
          <MessageList 
            messages={messages}
            currentUser={currentUser}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
        
        {isSending && (
          <div className="absolute bottom-4 right-8 flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-[10px] text-slate-400 backdrop-blur-sm shadow-xl z-20">
             <Loader2 size={12} className="animate-spin text-indigo-500" />
             Enviando respuesta...
          </div>
        )}
      </div>

      {/* 4. ESCRIBIR RESPUESTA & 5. ENVIAR (Abajo a la izquierda) */}
      <div className="p-8 pb-10 border-t border-slate-800 shrink-0 bg-slate-900/30">
        <div className="relative mb-6">
           <label className="absolute -top-2 left-4 px-2 bg-slate-900 text-[10px] font-bold text-emerald-500 uppercase z-10">
              Escribir respuesta...
           </label>
           <MessageComposer 
             onSend={(body) => sendMessage(body)} 
             isLoading={isSending} 
           />
        </div>
      </div>
    </div>
  );
};
