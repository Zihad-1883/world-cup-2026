'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { getTeams, getMatches } from '@/lib/api';
import { TeamBasic, MatchBasic } from '@/types';
import { Calendar, Users2, LayoutGrid, ChevronRight, MapPin, Search, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import MatchCard from '@/components/predictions/MatchCard';

export default function ExplorePage() {
  const [teams, setTeams] = useState<TeamBasic[]>([]);
  const [matches, setMatches] = useState<MatchBasic[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'groups' | 'schedule' | 'stats'>('groups');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    import('@/lib/api').then(({ getTeams, getMatches, getStats }) => {
      Promise.all([getTeams(), getMatches(), getStats()]).then(([teamsRes, matchesRes, statsRes]) => {
        if (teamsRes.success) setTeams(teamsRes.data.teams);
        if (matchesRes.success) setMatches(matchesRes.data.matches);
        if (statsRes.success) setStats(statsRes.data);
        setLoading(false);
      });
    });
  }, []);

  const groups = Array.from(new Set(teams.map((t) => t.groupName))).sort();

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col pt-20 selection:bg-green-500 selection:text-black">
      <Navbar />

      {/* Hero Header */}
      <section className="relative py-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#22c55e15,transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <h1 className="nike-title text-6xl md:text-8xl italic tracking-tighter leading-none mb-6">
             Explore the <span className="text-green-500">World</span>
           </h1>
           <p className="max-w-2xl mx-auto text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
             Discover all 48 nations, 12 groups, and the complete path to glory in North America 2026.
           </p>
        </div>
      </section>

      {/* Control Bar */}
      <div className="sticky top-20 z-40 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-20 py-4 md:py-0 gap-4">
               {/* Tabs */}
               <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setActiveTab('groups')}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'groups' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-slate-400 hover:text-white'}`}
                  >
                    <LayoutGrid className="h-3 w-3" />
                    <span>Groups & Teams</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('schedule')}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>Full Schedule</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('stats')}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-slate-400 hover:text-white'}`}
                  >
                    <BarChart3 className="h-3 w-3" />
                    <span>Global Intelligence</span>
                  </button>
               </div>

               {/* Search */}
               <div className="relative group w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search nations or matches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-green-500/50 transition-all placeholder:text-slate-700"
                  />
               </div>
            </div>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
         {loading ? (
            <div className="flex items-center justify-center py-40">
               <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
            </div>
         ) : activeTab === 'groups' ? (
            <div className="space-y-20">
               {groups.map((group) => (
                  <div key={group} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                     <div className="flex items-center mb-8">
                        <h2 className="nike-title text-4xl italic tracking-tighter mr-6">
                          Group <span className="text-green-500">{group}</span>
                        </h2>
                        <div className="h-px bg-white/5 flex-1" />
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teams.filter(t => t.groupName === group).map(team => (
                           <Link 
                             key={team.id}
                             href={`/teams/${team.id}`}
                             className="group glass-panel rounded-[32px] border border-white/5 hover:border-green-500/30 p-6 flex items-center space-x-6 transition-all duration-300 relative overflow-hidden"
                           >
                             <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                             
                             <div className="w-16 h-10 bg-slate-900 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 group-hover:scale-110 transition-transform">
                                <img src={team.flagUrl || ''} alt="" className="w-full h-full object-cover" />
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                <p className="text-white font-black text-sm uppercase tracking-tight truncate group-hover:text-green-500 transition-colors">{team.name}</p>
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">{team.code}</p>
                             </div>
                             
                             <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-green-500 transition-colors" />
                           </Link>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         ) : activeTab === 'schedule' ? (
            <div className="space-y-12">
               {/* Simplified Schedule View */}
               {Array.from(new Set(matches.map(m => m.round))).map(round => (
                  <div key={round} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                     <div className="sticky top-[145px] z-30 bg-[#0a0c10]/95 backdrop-blur-md py-4 mb-8 border-b border-white/5">
                        <h3 className="nike-title text-2xl text-green-500 italic uppercase tracking-tighter">{round}</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matches.filter(m => m.round === round).map(match => (
                           <MatchCard key={match.id} match={match} />
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="space-y-16 animate-in fade-in duration-700">
               <div className="text-center">
                  <h2 className="nike-title text-4xl italic tracking-tighter mb-4">Community <span className="text-green-500">Pick intelligence</span></h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global prediction trends from {stats?.totalPredictors || 0} expert fans</p>
               </div>

               {stats?.topPickedWinner ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                     {/* Top Pick Feature */}
                     <div className="lg:col-span-1 glass-panel rounded-[40px] border border-white/10 p-10 bg-gradient-to-br from-green-500/10 to-transparent relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <h3 className="text-xs font-black text-green-500 uppercase tracking-[0.3em] mb-10">Consensus Winner</h3>
                        
                        <div className="space-y-8 flex flex-col items-center">
                           <div className="w-40 h-24 bg-slate-900 rounded-2xl border-4 border-white/10 overflow-hidden shadow-2xl rotate-[-4deg]">
                              <img src={stats.topPickedWinner.flagUrl || ''} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="text-center">
                              <h4 className="nike-title text-5xl text-white italic tracking-tighter">{stats.topPickedWinner.name}</h4>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">{stats.topPickedWinner.confederation}</p>
                           </div>
                        </div>
                     </div>

                     {/* Trending List */}
                     <div className="lg:col-span-2 glass-panel rounded-[40px] border border-white/10 p-10">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Tournament Trend List</h3>
                        <div className="space-y-6">
                           {stats.popularPicks.slice(0, 5).map((pick: any, i: number) => (
                              <div key={pick.team.id} className="flex items-center group">
                                 <span className="w-8 nike-title text-2xl text-slate-800 italic mr-6">{i + 1}</span>
                                 <img src={pick.team.flagUrl || ''} alt="" className="w-10 h-6 object-cover rounded-md border border-white/10 mr-4" />
                                 <div className="flex-1">
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{pick.team.name}</p>
                                    <div className="h-1.5 bg-white/5 rounded-full mt-2 w-full max-w-xs overflow-hidden">
                                       <div className="h-full bg-green-500 rounded-full" style={{ width: `${pick.percentOfUsers}%` }} />
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-black text-green-500 italic">{pick.percentOfUsers}%</p>
                                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Confidence Score</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                     <p className="text-slate-500 font-black uppercase tracking-widest text-xs italic">Waiting for more community intelligence to process results...</p>
                  </div>
               )}
            </div>
         )}
      </main>

      {/* Footer Info */}
      <section className="bg-white/[0.02] border-t border-white/5 py-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
               <div className="glass-panel p-8 rounded-[40px] border border-white/5">
                  <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-green-500/20 mx-auto md:mx-0">
                     <Users2 className="h-6 w-6 text-black" />
                  </div>
                  <h4 className="nike-title text-2xl italic tracking-tighter text-white mb-2">48 Nations</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-loose">The biggest World Cup in history, spanning 3 countries and 16 host cities.</p>
               </div>
               
               <div className="glass-panel p-8 rounded-[40px] border border-white/5">
                  <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-green-500/20 mx-auto md:mx-0">
                     <Calendar className="h-6 w-6 text-black" />
                  </div>
                  <h4 className="nike-title text-2xl italic tracking-tighter text-white mb-2">104 Matches</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-loose">39 days of elite competition from the opening kick in Mexico City to the Final in NJ/NY.</p>
               </div>

               <div className="glass-panel p-8 rounded-[40px] border border-white/5">
                  <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-green-500/20 mx-auto md:mx-0">
                     <MapPin className="h-6 w-6 text-black" />
                  </div>
                  <h4 className="nike-title text-2xl italic tracking-tighter text-white mb-2">16 Cities</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-loose">Iconic venues across USA, Canada, and Mexico hosting the world's greatest stage.</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
