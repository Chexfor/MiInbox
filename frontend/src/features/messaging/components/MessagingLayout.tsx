import React, { useState, useEffect } from 'react';
import { ThreadList } from './ThreadList';
import { ChatArea } from './ChatArea';
import { NewChatModal } from './NewChatModal';
import { Search, Plus, Mail, MessageSquare, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Thread } from '../types';
import echo from '@/core/realtime/echo.config';
import { toast } from 'react-hot-toast';

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.warn("Audio play blocked", e);
  }
};

export const MessagingLayout: React.FC = () => {
  const { user } = useAuth();
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
    setIsMobileListOpen(false); // Hide list on mobile when thread is selected
  };

  const handleBackToList = () => {
    setIsMobileListOpen(true);
  };

  useEffect(() => {
    if (!user?.id) return;
    
    const channel = echo.private(`user.${user.id}`);
    
    channel.listen('MessageSent', (event: any) => {
      // Only notify if we are NOT currently looking at the thread
      if (selectedThread?.id !== event.thread_id && event.sender?.id !== user.id) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900 shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">Nuevo mensaje de {event.sender?.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{event.body.substring(0, 40)}{event.body.length > 40 ? '...' : ''}</p>
                </div>
              </div>
            </div>
          </div>
        ));
        playNotificationSound();
      }
    });

    return () => {
      echo.leave(`user.${user.id}`);
    };
  }, [user?.id, selectedThread?.id]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* 1. TOPBAR - Estricto Mockup */}
      <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center px-4 lg:px-8 shrink-0 shadow-xl z-30">
        
        {/* LOGO - Izquierda */}
        <div className="w-1/4 flex items-center gap-3">
          {!isMobileListOpen && (
            <button 
              onClick={handleBackToList}
              className="lg:hidden p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="hidden sm:flex p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <MessageSquare size={20} className="text-white" />
          </div>
          <span className="text-sm lg:text-xl font-black tracking-tight text-white italic truncate">
             Mi <span className="text-indigo-500 not-italic">Inbox</span>
          </span>
        </div>

        {/* BUSCAR - Centro */}
        <div className="flex-1 flex justify-center px-2">
          <div className="relative w-full max-w-md group">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 rounded-xl pl-4 pr-10 lg:pl-5 lg:pr-12 py-2 lg:py-2.5 text-xs lg:text-sm transition-all outline-none placeholder:text-slate-600"
            />
            <Search size={16} className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
        </div>

        {/* NUEVO MENSAJE - Derecha */}
        <div className="w-1/4 flex justify-end">
          <button 
            onClick={() => setIsNewChatOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold text-[10px] lg:text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
          >
            <span className="hidden sm:inline">Nuevo mensaje</span>
            <Plus size={16} className="sm:hidden" />
            <Mail size={16} className="hidden sm:inline group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* 2. BODY - Contenedor Principal con Márgenes y Separación 1/3 - 2/3 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-0 lg:p-10 flex gap-0 lg:gap-8 overflow-hidden relative">
        
        {/* PANEL IZQUIERDO (1/3) - Lista de conversaciones */}
        <section className={`
          ${isMobileListOpen ? 'flex' : 'hidden'} 
          lg:flex w-full lg:w-1/3 bg-slate-950 lg:bg-slate-900/50 border-r lg:border border-slate-900 lg:border-slate-800 lg:rounded-3xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm z-20
        `}>
          <div className="p-6 border-b border-slate-800 bg-slate-900/80">
            <h2 className="text-sm lg:text-lg font-bold text-slate-200 flex items-center gap-2 uppercase tracking-widest">
              <LayersIcon size={18} className="text-indigo-500" />
              Lista de conversaciones
            </h2>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ThreadList
              onSelectThread={handleSelectThread}
              activeThreadId={selectedThread?.id}
              searchQuery={searchQuery}
            />
          </div>
        </section>

        {/* PANEL DERECHO (2/3) - Área de lectura / redacción */}
        <section className={`
          ${!isMobileListOpen ? 'flex' : 'hidden'} 
          lg:flex flex-1 flex-col bg-slate-950 lg:bg-slate-900/50 lg:border border-slate-800 lg:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm relative z-10
        `}>
           <ChatArea thread={selectedThread} />
        </section>

      </main>

      <footer className="px-8 py-3 bg-slate-900/30 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-600 shrink-0">
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Sesión: <span className="text-slate-400">{user?.email}</span>
         </div>
         <div className="hidden sm:block font-mono">ESTRUCTURA MOCKUP V2.1</div>
      </footer>

      {/* MODAL */}
      <NewChatModal 
        isOpen={isNewChatOpen} 
        onClose={() => setIsNewChatOpen(false)} 
        onCreated={(thread) => {
          setSelectedThread(thread);
          setIsMobileListOpen(false);
          // Opcionalmente forzar a ThreadList a recargar.
        }} 
      />
    </div>
  );
};

const LayersIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 12 8-4-8-4-8 4 8 4Z" />
    <path d="m20 12-8 4-8-4" />
    <path d="m20 16-8 4-8-4" />
  </svg>
);
