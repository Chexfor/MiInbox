import React, { useState, useRef, type KeyboardEvent } from 'react';
import { Send, Image as ImageIcon, Paperclip } from 'lucide-react';

interface MessageComposerProps {
  onSend: (body: string) => Promise<any>;
  isLoading?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ 
  onSend, 
  isLoading = false 
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    try {
      await onSend(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 4. ESCRIBIR RESPUESTA... (Input Box) */}
      <div className="relative group">
        <textarea
          ref={textareaRef}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribir respuesta..."
          className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/5 rounded-2xl p-6 text-sm text-slate-100 placeholder-slate-600 transition-all resize-none shadow-inner min-h-[120px]"
        />
        
        {/* Floating Icons for feel */}
        <div className="absolute top-4 right-4 flex gap-2">
           <button className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-colors">
              <ImageIcon size={16} />
           </button>
           <button className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-colors">
              <Paperclip size={16} />
           </button>
        </div>
      </div>

      {/* 5. ENVIAR (Abajo a la izquierda - Estricto Mockup) */}
      <button
        onClick={handleSendMessage}
        disabled={!message.trim() || isLoading}
        className={`
          self-start flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
          ${!message.trim() || isLoading 
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 hover:-translate-y-1 active:scale-95'}
        `}
      >
        <span>Enviar</span>
        <Send size={16} className={isLoading ? 'animate-pulse' : ''} />
      </button>
    </div>
  );
};
