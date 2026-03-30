import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showSender?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isMe, 
  showSender = false 
}) => {
  return (
    <div className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
      {showSender && !isMe && message.sender && (
        <span className="text-[10px] text-slate-500 mb-1 ml-1 font-medium italic">
          {message.sender.name}
        </span>
      )}
      
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words
          ${isMe 
            ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/20' 
            : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'}
        `}
      >
        {message.body}
      </div>
      
      <span className="text-[10px] text-slate-600 mt-1 mx-1 tabular-nums">
        {format(new Date(message.created_at), 'HH:mm', { locale: es })}
      </span>
    </div>
  );
};
