'use client';

import { MatchBasic } from '@/types';
import MatchCard from './MatchCard';

interface GroupPanelProps {
  groupName: string;
  matches: MatchBasic[];
  picks: Record<string, string>;
  onPick: (matchId: string, teamId: string) => void;
}

export default function GroupPanel({ groupName, matches, picks, onPick }: GroupPanelProps) {
  const predictedCount = matches.filter(m => picks[m.id]).length;

  return (
    <div className="glass-panel rounded-[40px] overflow-hidden border border-white/5 relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full translate-x-20 -translate-y-20 group-hover:bg-green-500/10 transition-colors" />
      <div className="bg-white/5 px-8 py-5 flex justify-between items-center border-b border-white/5 relative z-10">
        <h3 className="nike-title text-2xl text-white italic tracking-tighter flex items-center">
          <div className="bg-green-500 text-black w-10 h-10 rounded-2xl flex items-center justify-center mr-4 font-black text-lg rotate-[-10deg] group-hover:rotate-0 transition-transform">
            {groupName}
          </div>
          Group {groupName}
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 px-4 py-1.5 rounded-full border border-white/5">
          {predictedCount}/{matches.length} Predicted
        </span>
      </div>
      <div className="p-4 space-y-4">
        {matches.map(match => (
          <MatchCard 
            key={match.id} 
            match={match} 
            prediction={picks[match.id]} 
            onPick={(teamId) => onPick(match.id, teamId)}
          />
        ))}
      </div>
    </div>
  );
}
