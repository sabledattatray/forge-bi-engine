'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey === 'SURGICAL-2026') {
      localStorage.setItem('forge_auth', 'true');
      router.push('/forge');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-transparent">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass rounded-[32px] p-10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent" />
        
        <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00f2ff]/10 text-[#00f2ff]">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase italic italic">Surgical Forge Lab</h1>
        <p className="text-gray-500 text-sm mb-10 tracking-widest uppercase font-mono">Experimental Data Staging Area</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4 mb-2 block">
              Authorization Key
            </label>
            <div className="relative">
              <input 
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full h-14 bg-black/50 border ${error ? 'border-red-500' : 'border-white/10 focus:border-[#00f2ff]'} rounded-2xl px-6 outline-none transition-all font-mono placeholder:text-gray-800`}
              />
              <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full h-14 bg-white text-black hover:bg-[#00f2ff] rounded-2xl font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 group"
          >
            <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
            Establish Connection
          </button>
        </form>

        <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          [ Access Key: SURGICAL-2026 ]
        </p>
      </motion.div>
    </div>
  );
}
