'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Cpu, FileText, CheckCircle2, AlertCircle, Copy, ExternalLink, Loader2, LogOut, Terminal, Zap } from 'lucide-react';

export default function ForgePortal() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Neural Assistant & Learning State
  const [chatInput, setChatKey] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('forge_auth');
    if (auth !== 'true') {
      router.push('/');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResultUrl(null);
      setProgress([]);
    }
  };

  const generateInsights = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(['Initializing Neural Engine...', 'Uploading Data Stream...']);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/forge', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setProgress(prev => [...prev, 'Data Audit Complete.', 'Heuristics Applied.', 'Visual Assets Generated.', 'Dashboard Ready.']);
        setResultUrl(data.url);
      } else {
        setError(data.error || 'Processing Failed');
      }
    } catch (err) {
      setError('Connection to Surgical Forge lost.');
    } finally {
      setIsProcessing(false);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatKey('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, fileName: file?.name }),
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Neural Link Interrupted.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('forge_auth');
    router.push('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-12 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">
            Surgical Forge Portal 
            <span className="text-[#00f2ff] text-sm not-italic ml-4 bg-[#00f2ff]/10 px-3 py-1 rounded-full font-mono tracking-widest uppercase">
              [ Learning Mode Active ]
            </span>
          </h2>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] font-mono mt-1">SDR-9 ENGINE // STATUS: NOMINAL</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-5 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Terminate
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1">
        {/* Main Interface */}
        <div className="xl:col-span-8 space-y-8 flex flex-col">
          <div 
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`relative flex-1 min-h-[400px] border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center transition-all group overflow-hidden
              ${file ? 'border-[#00f2ff] bg-[#00f2ff]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5 cursor-pointer'}`}
          >
            {/* Background Aesthetic Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".csv,.txt"
            />
            
            <div className="relative z-10 flex flex-col items-center p-12">
              <div className={`mb-8 w-24 h-24 rounded-3xl flex items-center justify-center transition-all transform group-hover:scale-110
                ${file ? 'bg-[#00f2ff] text-black shadow-[0_0_50px_rgba(0,242,255,0.3)]' : 'bg-white/5 text-gray-600'}`}>
                {file ? <FileText className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
              </div>
              
              <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase">
                {file ? file.name : 'Inject Data Source'}
              </h3>
              <p className="text-gray-500 font-mono text-sm tracking-widest">
                [ CSV / TXT // MAX SIZE: 256MB ]
              </p>

              {file && !resultUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); generateInsights(); }}
                    disabled={isProcessing}
                    className="h-16 px-12 bg-white text-black hover:bg-[#00f2ff] font-black uppercase tracking-tighter rounded-2xl transition-all flex items-center gap-3 disabled:opacity-50 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Cpu className="w-6 h-6" />}
                    {isProcessing ? 'Forging Intelligence...' : 'Generate Insights'}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
              {resultUrl && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase italic">Forge Complete</h2>
                  <p className="text-gray-400 max-w-sm mb-10 text-sm">Engine has successfully vectorized the data ecosystem. High-fidelity dashboard ready.</p>
                  
                  <div className="flex gap-3 w-full max-w-sm">
                    <button 
                      onClick={() => window.open(resultUrl, '_blank')}
                      className="flex-1 h-14 bg-[#00f2ff] text-black font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Dashboard
                    </button>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(window.location.origin + resultUrl); }}
                      className="h-14 px-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={() => { setFile(null); setResultUrl(null); setProgress([]); }}
                    className="mt-10 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                  >
                    Reset Staging Area
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Neural Assistant Chatbox */}
          <div className="glass rounded-[40px] p-8 h-[350px] flex flex-col relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff]">
                  <Cpu className="w-3 h-3" />
                  Neural Assistant
                </div>
                <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">Direct Link: Established</span>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 mb-6 custom-scrollbar pr-4">
                {chatMessages.length === 0 && (
                  <p className="text-gray-700 italic text-sm">Ask me to analyze specific trends or suggest new visual perspectives...</p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#00f2ff]/10 text-white border border-[#00f2ff]/20' : 'bg-white/5 text-gray-300 border border-white/5'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-4 rounded-2xl flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
             </div>

             <div className="relative">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask the engine (e.g. 'Show me monthly growth')..."
                  className="w-full h-14 bg-black/40 border border-white/10 focus:border-[#00f2ff] rounded-2xl px-6 pr-16 outline-none transition-all text-sm font-light"
                />
                <button 
                  onClick={sendMessage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00f2ff] text-black rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Zap className="w-4 h-4 fill-current" />
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar Terminal */}
        <div className="xl:col-span-4 flex flex-col">
          <div className="flex-1 glass rounded-[40px] p-8 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff]">
              <Terminal className="w-3 h-3" />
              Intelligence Feed
            </div>

            <div className="flex-1 font-mono text-xs space-y-5 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {progress.length === 0 && !isProcessing && (
                  <div className="text-gray-800 italic">Waiting for data injection...</div>
                )}
                {progress.map((p, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 text-gray-500 group"
                  >
                    <span className="text-[#00f2ff]/30 font-bold">[{i.toString().padStart(2, '0')}]</span>
                    <span className="group-last:text-[#00f2ff] group-last:font-bold">{p}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isProcessing && (
                <div className="flex gap-4 text-[#00f2ff] animate-pulse font-bold">
                  <span>[..]</span>
                  <span>Executing Heuristic Node...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-sm flex items-start gap-4">
                <AlertCircle className="w-5 h-5 shrink-0 mt-1" />
                <div className="font-mono text-xs break-all">{error}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
