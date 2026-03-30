import { useEffect } from 'react';
import { AuthProvider, useAuth } from './features/auth/hooks/useAuth.tsx';
import { ConnectionBadge } from './shared/ui/ConnectionBadge';
import { MessageSquare, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { MessagingLayout } from './features/messaging/components/MessagingLayout';

// ─── Login Form ───────────────────────────────────────────────────────────────

const LoginForm = () => {
  const { signIn, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await signIn({ email, password });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/30 mb-5">
            <MessageSquare size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Mi Inbox
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Inicia sesión para continuar</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
              <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-300">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-slate-400 mb-2 font-medium">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-2 font-medium">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Verificando...</>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>

        {/* Socket Status */}
        <div className="flex justify-center mt-6">
          <ConnectionBadge />
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  return <MessagingLayout />;
};

// ─── Root ─────────────────────────────────────────────────────────────────────

const AppContent = () => {
  const { token, user, fetchProfile } = useAuth();

  useEffect(() => {
    if (token && !user) fetchProfile();
  }, [token, user, fetchProfile]);

  return token && user ? <Dashboard /> : <LoginForm />;
};

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppContent />
    </AuthProvider>
  );
}
