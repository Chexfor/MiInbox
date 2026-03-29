import React, { useState, useEffect } from 'react';
import { Search, X, Users, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useUsers } from '@/features/users/hooks/useUsers';
import { messagingApi } from '@/features/messaging/api/messaging.api';
import type { User, Thread } from '@/features/messaging/types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (thread: Thread) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { users, isLoading, error, searchUsers, clearUsers } = useUsers();
  const [query, setQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger search on query change (debounced locally)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => searchUsers(query), 300);
      return () => clearTimeout(timer);
    }
  }, [query, isOpen, searchUsers]);

  // Clean on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedUsers([]);
      setSubject('');
      setInitialMessage('');
      clearUsers();
    }
  }, [isOpen, clearUsers]);

  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const isGroup = selectedUsers.length > 1;
      const resp = await messagingApi.createThread({
        participant_ids: selectedUsers.map(u => u.id),
        is_group: isGroup,
        subject: isGroup ? subject || 'Nuevo Grupo' : undefined,
        body: initialMessage || undefined,
      });

      onCreated(resp.data);
      onClose();
    } catch (err) {
      console.error(err);
      // Podríamos añadir setSubmitError(err.message) si se quiere mostrar en la UI
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isGroup = selectedUsers.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <MessageCircle size={20} className="text-indigo-500" />
            Nueva Conversación
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Group Options (If multiple users selected) */}
          <div className={`transition-all duration-300 overflow-hidden ${isGroup ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Nombre del Grupo</label>
            <input 
              type="text"
              placeholder="Ej. Proyecto Alpha" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Search participants */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Agregar Participantes</label>
            
            {/* Selected badges */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/30">
                    {u.name}
                    <button onClick={() => toggleUserSelection(u)} className="hover:text-red-400 ml-1"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-slate-700 transition-colors"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            
            {/* Results */}
            <div className="mt-2 border border-slate-800 rounded-xl bg-slate-950/50 max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-slate-500 text-xs flex justify-center"><Loader2 size={16} className="animate-spin" /></div>
              ) : error ? (
                <div className="p-4 flex items-center gap-2 text-red-400 text-xs"><AlertCircle size={14} /> {error}</div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center text-slate-600 text-xs">Sin resultados de búsqueda.</div>
              ) : (
                <ul className="divide-y divide-slate-800/50">
                  {users.map((user) => {
                    const isSelected = selectedUsers.some(u => u.id === user.id);
                    return (
                      <li 
                        key={user.id}
                        onClick={() => toggleUserSelection(user)}
                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-indigo-900/10' : ''}`}
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-200">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* First Message */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mensaje Inicial (Opcional)</label>
            <textarea
              placeholder="Escribe el primer mensaje de la conversación..."
              value={initialMessage}
              onChange={e => setInitialMessage(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm resize-none focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
            {isGroup ? 'Crear Grupo' : 'Iniciar Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};
