'use client';

import Navbar from '@/components/layout/Navbar';
import CommentThread from '@/components/comments/CommentThread';
import { MessageSquare, Users, Globe } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col pt-20">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full -z-10" />
          
          <div className="inline-flex items-center space-x-2 bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <Globe className="h-3 w-3" />
            <span>Live Discussion</span>
          </div>
          
          <h1 className="nike-title text-5xl md:text-7xl italic tracking-tighter mb-4">
            FAN <span className="text-green-500">COMMUNITY</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            Join the global conversation. Debate predictions, share insights, and connect with millions of football fans worldwide as we approach the 2026 World Cup.
          </p>

          <div className="flex items-center justify-center space-x-8 mt-10">
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white italic">24/7</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Active Chat</span>
             </div>
             <div className="h-8 w-px bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white italic">1M+</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Expected Fans</span>
             </div>
             <div className="h-8 w-px bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white italic">∞</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Predictions</span>
             </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-slate-900/50 border border-white/5 rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 bg-green-500/5 w-96 h-96 blur-[120px] rounded-full group-hover:bg-green-500/10 transition-colors" />
           <CommentThread />
        </div>
      </main>

      {/* Footer-lite */}
      <footer className="py-12 border-t border-white/5 bg-black/50">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Football belongs to the fans. Be respectful in discussions.</p>
         </div>
      </footer>
    </div>
  );
}
