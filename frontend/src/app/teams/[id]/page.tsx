'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getTeam } from '@/lib/api';
import { TeamFull, Player } from '@/types';
import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import PlayerCard from '@/components/teams/PlayerCard';
import CommentThread from '@/components/comments/CommentThread';
import { MapPin, Globe, Award, Users2, Search } from 'lucide-react';

export default function TeamDetailPage() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();
  const [data, setData] = useState<{ team: TeamFull; players: Player[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (token && id) {
      getTeam(id, token).then(res => {
        if (res.success) setData(res.data);
        setLoading(false);
      });
    }
  }, [id, token]);

  const filteredPlayers = data?.players.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.shirtName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-900 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!data) return null;

  const { team } = data;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0c10] flex flex-col pt-20 selection:bg-green-500 selection:text-black">
        <Navbar />

        {/* ─── Team Hero Banner ─── */}
        <div className="relative pt-16 pb-24 overflow-hidden border-b border-white/5">
           {/* Dynamic Background Flag Blur */}
           <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
              <img src={team.flagUrl || ''} alt="" className="w-full h-full object-cover blur-[120px] scale-150 rotate-[-12deg]" />
           </div>
           
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0c10]/40 to-[#0a0c10] z-0" />
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-end space-y-8 md:space-y-0 md:space-x-12">
                 {/* Flag Container */}
                 <div className="group relative">
                    <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="w-48 h-32 bg-slate-900 rounded-[32px] border-4 border-white/10 shadow-2xl overflow-hidden flex-shrink-0 relative z-10 transform rotate-[-3deg] group-hover:rotate-0 transition-transform duration-500">
                       {team.flagUrl && <img src={team.flagUrl} alt={team.name} className="w-full h-full object-cover" />}
                    </div>
                 </div>
                 
                 <div className="text-center md:text-left flex-1">
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                       <span className="bg-green-500 text-black px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          {team.confederation}
                       </span>
                       <span className="bg-white/5 text-white border border-white/10 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          GROUP {team.groupName}
                       </span>
                    </div>
                    <h1 className="nike-title text-6xl md:text-8xl text-white italic tracking-tighter leading-none mb-6">
                       {team.name}
                    </h1>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                       <div className="flex items-center group cursor-default">
                          <Globe className="h-4 w-4 mr-3 text-green-500 group-hover:scale-125 transition-transform" />
                          <span>FIFA CODE: {team.code}</span>
                       </div>
                       <div className="flex items-center group cursor-default">
                          <Users2 className="h-4 w-4 mr-3 text-green-500 group-hover:scale-125 transition-transform" />
                          <span>{data.players.length} SQUAD MEMBERS</span>
                       </div>
                       <div className="flex items-center group cursor-default">
                          <Award className="h-4 w-4 mr-3 text-green-500 group-hover:scale-125 transition-transform" />
                          <span>ELITE MEMBER</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ─── Squad Section ─── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 w-full">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
              <div className="flex items-center">
                 <h2 className="nike-title text-4xl text-white italic tracking-tighter">
                   Official <span className="text-green-500">Squad</span>
                 </h2>
                 <div className="ml-6 px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {filteredPlayers.length} Active
                 </div>
              </div>
              
              <div className="relative group min-w-[320px]">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-green-500 transition-colors" />
                 <input 
                    type="text"
                    placeholder="Search elite players..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white/5 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-green-500/50 transition-all w-full shadow-2xl placeholder:text-slate-700"
                 />
              </div>
           </div>

           {filteredPlayers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                 {filteredPlayers.map((player, i) => (
                    <div key={player.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                       <PlayerCard player={player} />
                    </div>
                 ))}
              </div>
           ) : (
              <div className="text-center py-32 glass-panel rounded-[60px] border border-dashed border-white/5">
                 <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Users2 className="h-10 w-10 text-slate-700" />
                 </div>
                 <h3 className="nike-title text-3xl text-slate-500 italic mb-3">No Players Found</h3>
                 <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Try searching with a different name or position.</p>
              </div>
           )}
        </main>

        {/* ─── Social Discussion ─── */}
        <section className="bg-white/[0.02] border-t border-white/5 overflow-hidden relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
              <div className="nike-title text-4xl text-white italic tracking-tighter mb-12 text-center">
                 Team <span className="text-green-500">Intelligence</span>
              </div>
              <div className="glass-panel rounded-[40px] border border-white/10 p-2 overflow-hidden shadow-2xl">
                 <div className="p-8 md:p-12 bg-[#0a0c10]/40 rounded-[38px] backdrop-blur-sm">
                    <CommentThread matchId={undefined} />
                 </div>
              </div>
           </div>
        </section>
      </div>
    </AuthGuard>

  );
}
