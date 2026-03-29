import { useEffect, useState } from 'react';
import echo from '../../core/realtime/echo.config';

type ConnectionState = 'connecting' | 'connected' | 'disconnected';

export const ConnectionBadge = () => {
  const [state, setState] = useState<ConnectionState>('connecting');

  useEffect(() => {
    const connector = echo.connector.pusher;

    const handleConnected = () => setState('connected');
    const handleDisconnected = () => setState('disconnected');
    const handleConnecting = () => setState('connecting');

    connector.connection.bind('connected', handleConnected);
    connector.connection.bind('disconnected', handleDisconnected);
    connector.connection.bind('connecting', handleConnecting);

    return () => {
      connector.connection.unbind('connected', handleConnected);
      connector.connection.unbind('disconnected', handleDisconnected);
      connector.connection.unbind('connecting', handleConnecting);
    };
  }, []);

  const config: Record<ConnectionState, { label: string; color: string; pulse: boolean }> = {
    connected:    { label: 'Socket Activo',    color: 'bg-emerald-500', pulse: true },
    connecting:   { label: 'Conectando...',    color: 'bg-amber-400',   pulse: true },
    disconnected: { label: 'Sin conexión',     color: 'bg-red-500',     pulse: false },
  };

  const { label, color, pulse } = config[state];

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
      </span>
      <span className="text-xs text-slate-400 font-medium tracking-wide">{label}</span>
    </div>
  );
};
