import { MessageSquare } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/20 animate-bounce">
            <MessageSquare size={48} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Mi Inbox
        </h1>
        
        <p className="text-slate-400 text-lg">
          Arquitectura DDD + CQRS + Clean React inicializada correctamente.
        </p>

        <div className="grid grid-cols-2 gap-4 pt-8">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="text-indigo-400 font-bold">Backend</h3>
            <p className="text-xs text-slate-500">Laravel 11 + JWT</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="text-cyan-400 font-bold">Frontend</h3>
            <p className="text-xs text-slate-500">React + Tailwind v4</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
