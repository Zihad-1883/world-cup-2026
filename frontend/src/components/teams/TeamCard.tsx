'use client';

import { TeamBasic } from '@/types';
import Link from 'next/link';
import { ChevronRight, Globe2 } from 'lucide-react';

interface TeamCardProps {
  team: TeamBasic;
  showGroup?: boolean;
}

export default function TeamCard({ team, showGroup = true }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="group flex items-center justify-between bg-slate-800 hover:bg-slate-700/60 border border-slate-700 hover:border-green-500/40 rounded-2xl px-5 py-4 transition-all shadow-md hover:shadow-green-500/5"
    >
      <div className="flex items-center space-x-4">
        {showGroup && team.groupPosition && (
          <span className="text-xs font-black text-slate-600 font-mono w-4 text-center">
            {team.groupPosition}
          </span>
        )}
        {team.flagUrl ? (
          <img
            src={team.flagUrl}
            alt={team.name}
            className="w-10 h-7 object-cover rounded-lg shadow-sm border border-white/10"
          />
        ) : (
          <div className="w-10 h-7 bg-slate-700 rounded-lg flex items-center justify-center">
            <Globe2 className="h-4 w-4 text-slate-600" />
          </div>
        )}
        <div>
          <p className="text-white font-bold group-hover:text-green-500 transition-colors leading-none">
            {team.name}
          </p>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-0.5">
            {team.code}{team.confederation ? ` • ${team.confederation}` : ''}
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-green-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
    </Link>
  );
}
