'use client';

import { useState, useEffect, useMemo } from 'react';
import { getTeams } from '@/lib/api';
import { TeamBasic } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { Trophy, Globe2, ChevronRight, Search } from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getTeams().then(res => {
      if (res.success) setTeams(res.data.teams);
      setLoading(false);
    });
  }, []);

  const groups = useMemo(() => {
    const grouped: Record<string, TeamBasic[]> = {};
    teams.forEach(t => {
      if (t.groupName) {
        if (!grouped[t.groupName]) grouped[t.groupName] = [];
        grouped[t.groupName].push(t);
      }
    });

    // Sort teams within groups by position
    Object.keys(grouped).forEach(g => {
      grouped[g].sort((a, b) => (a.groupPosition || 0) - (b.groupPosition || 0));
    });

    return grouped;
  }, [teams]);

  const filteredGroups = useMemo(() => {
    if (!search) return groups;
    const filtered: Record<string, TeamBasic[]> = {};
    Object.keys(groups).forEach(g => {
       const matchingTeams = groups[g].filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
       if (matchingTeams.length > 0) {
          filtered[g] = groups[g]; // Show entire group if any team matches
       }
    });
    return filtered;
  }, [groups, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col pt-20 selection:bg-green-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 glass-panel p-10 rounded-[40px] border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 bg-green-500/5 w-64 h-64 blur-[80px] rounded-full translate-x-20 -translate-y-20 group-hover:bg-green-500/10 transition-colors" />
           
           <div className="relative z-10">
              <h1 className="nike-title text-5xl text-white italic tracking-tighter mb-4">Qualified <span className="text-green-500">Teams</span></h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Browse the 48 nations competing for glory.</p>
           </div>
           
           <div className="relative z-10">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-green-500 transition-colors" />
              <input 
                 type="text"
                 placeholder="Search by country..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-green-500 transition-all w-full md:w-80 font-bold text-sm tracking-tight"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {Object.keys(filteredGroups).sort().map(groupName => (
              <div key={groupName} className="glass-panel rounded-[32px] border border-white/5 shadow-2xl overflow-hidden hover:border-green-500/30 transition-all group/panel relative">
                 <div className="absolute top-0 right-0 bg-green-500/5 w-24 h-24 blur-2xl rounded-full" />
                 
                 <div className="bg-white/5 px-8 py-5 flex justify-between items-center border-b border-white/5 relative z-10">
                    <h3 className="nike-title text-xl text-white italic tracking-tighter flex items-center">
                       <div className="bg-green-500 text-black w-8 h-8 rounded-xl flex items-center justify-center mr-3 font-black text-sm rotate-[-10deg] group-hover/panel:rotate-0 transition-transform">
                          {groupName}
                       </div>
                       Group {groupName}
                    </h3>
                    <Globe2 className="h-4 w-4 text-slate-700" />
                 </div>
                 
                 <div className="divide-y divide-white/5 relative z-10">
                    {filteredGroups[groupName].map(team => (
                       <Link 
                          key={team.id}
                          href={`/teams/${team.id}`}
                          className="flex items-center justify-between px-8 py-5 hover:bg-white/5 transition-all group/item"
                       >
                          <div className="flex items-center space-x-5">
                             <span className="text-[10px] font-black text-slate-600 font-mono group-hover/item:text-green-500">0{team.groupPosition}</span>
                             <img src={team.flagUrl || ''} alt="" className="w-8 h-5 object-cover rounded shadow-lg border border-white/10" />
                             <span className="text-white font-black uppercase tracking-tight text-xs group-hover/item:text-green-500 transition-colors">{team.name}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-700 group-hover/item:text-green-500 group-hover/item:translate-x-1 transition-all" />
                       </Link>
                    ))}
                 </div>
              </div>
           ))}
        </div>

        {Object.keys(filteredGroups).length === 0 && (
           <div className="text-center py-24 glass-panel rounded-[40px] border border-dashed border-white/10 mt-12">
              <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Trophy className="h-10 w-10 text-slate-700" />
              </div>
              <h3 className="nike-title text-2xl text-slate-400 italic mb-2">No teams found</h3>
              <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Try searching for another country.</p>
           </div>
        )}
      </main>
    </div>
  );
}
