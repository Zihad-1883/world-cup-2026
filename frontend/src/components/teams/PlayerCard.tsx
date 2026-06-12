'use client';

import { Player } from '@/types';
import { User, Shield, Zap, Goal, Ruler, Building2, Calendar } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const getPositionColor = (pos: string) => {
    switch (pos) {
      case 'GK': return 'bg-yellow-500';
      case 'DF': return 'bg-blue-500';
      case 'MF': return 'bg-green-500';
      case 'FW': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getPositionIcon = (pos: string) => {
    switch (pos) {
      case 'GK': return <Shield className="h-3 w-3" />;
      case 'DF': return <Shield className="h-3 w-3" />;
      case 'MF': return <Zap className="h-3 w-3" />;
      case 'FW': return <Goal className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="group glass-panel rounded-[32px] border border-white/5 hover:border-green-500/30 overflow-hidden transition-all duration-500 relative">
      <div className="relative aspect-[4/5] bg-[#0a0c10] flex items-center justify-center overflow-hidden">
        {player.photoUrl ? (
          <img 
            src={player.photoUrl} 
            alt={player.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#0a0c10]">
            <div className={`w-32 h-32 rounded-full ${getPositionColor(player.position)} flex items-center justify-center text-5xl font-black text-white shadow-[0_0_50px_rgba(34,197,94,0.15)] relative z-10 border-8 border-[#0a0c10] group-hover:scale-110 transition-transform duration-500`}>
              <span className="relative z-10 drop-shadow-2xl">{player.shirtName?.[0] || player.name[0]}</span>
              <div className="absolute inset-0 rounded-full bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute bottom-12 text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] group-hover:text-green-500/50 transition-colors">Elite Player</div>
          </div>
        )}
        
        {/* Number badge */}
        <div className="absolute top-6 left-6 bg-[#0a0c10]/80 backdrop-blur-xl text-white w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-xl border border-white/10 group-hover:bg-green-500 group-hover:text-black transition-colors duration-300">
          {player.jerseyNumber || '-'}
        </div>

        {/* Position badge */}
        <div className={`absolute bottom-0 right-0 ${getPositionColor(player.position)} px-5 py-2 text-[10px] font-black text-white uppercase tracking-widest flex items-center space-x-2 rounded-tl-[24px]`}>
          {getPositionIcon(player.position)}
          <span>{player.position}</span>
        </div>
      </div>

      <div className="p-6 relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-3xl rounded-full -translate-y-12 translate-x-12" />
        
        <h4 className="nike-title text-2xl text-white italic tracking-tighter truncate mb-2" title={player.name}>{player.name}</h4>
        
        <div className="flex items-center space-x-4 mb-6">
           <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <Building2 className="h-3 w-3 mr-2 text-green-500" />
              {player.club || 'Elite Squad'}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-widest">
            <Calendar className="h-3 w-3 mr-2 text-slate-700" />
            YOB: {player.dateOfBirth ? new Date(player.dateOfBirth).getFullYear() : '2000+'}
          </div>
          <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-widest">
            <Ruler className="h-3 w-3 mr-2 text-slate-700" />
            {player.heightCm ? `${player.heightCm}CM` : '185CM+'}
          </div>
        </div>
      </div>
    </div>

  );
}
