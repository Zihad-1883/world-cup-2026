'use client';

import { MatchBasic, TeamBasic } from '@/types';
import { Lock, Check, X, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ALL_KNOCKOUT_SLOTS, getSlotLabel } from '@/lib/knockoutSlots';

interface MatchCardProps {
  match: MatchBasic;
  prediction?: string; // teamId or 'slot:1' / 'slot:2'
  onPick?: (teamId: string) => void;
  slotTeams?: Record<string, TeamBasic>;
  picks?: Record<string, string>;
}

const POINTS_MAP: Record<string, number> = {
  'GROUP': 1,
  'R32': 2,
  'R16': 3,
  'QF': 4,
  'SF': 6,
  'FINAL': 10
};

export default function MatchCard({ match, prediction, onPick, slotTeams, picks }: MatchCardProps) {
  const resolveSlotTeam = (source: any): { label: string; team: TeamBasic | null } => {
    if (source.type === 'group_winner' || source.type === 'group_runner_up') {
      const key = `${source.type}:${source.group}`;
      if (slotTeams && slotTeams[key]) {
        return { label: slotTeams[key].name, team: slotTeams[key] };
      }
      return { label: getSlotLabel(source), team: null };
    }

    if (source.type === 'best_third') {
      const key = `best_third:${source.groups.join('')}`;
      if (slotTeams && slotTeams[key]) {
        return { label: slotTeams[key].name, team: slotTeams[key] };
      }
      return { label: getSlotLabel(source), team: null };
    }

    if (source.type === 'match_winner') {
      const key = `match_winner:${source.matchNumber}`;
      if (slotTeams && slotTeams[key]) {
        return { label: slotTeams[key].name, team: slotTeams[key] };
      }
      return { label: getSlotLabel(source), team: null };
    }

    return { label: 'TBD', team: null };
  };

  const getBracketLabels = () => {
    if (match.round === 'GROUP') return { team1: match.team1Name, team2: match.team2Name, t1obj: null, t2obj: null };
    if (match.team1Name && match.team2Name) return { team1: match.team1Name, team2: match.team2Name, t1obj: null, t2obj: null };

    const slot = ALL_KNOCKOUT_SLOTS.find(s => s.matchNumber === match.matchNumber);
    if (slot) {
      const s1 = resolveSlotTeam(slot.slot1);
      const s2 = resolveSlotTeam(slot.slot2);

      return {
        team1: match.team1Name || s1.label,
        team2: match.team2Name || s2.label,
        t1obj: s1.team,
        t2obj: s2.team
      };
    }

    return { 
      team1: match.team1Name || 'TBD', 
      team2: match.team2Name || 'TBD',
      t1obj: null,
      t2obj: null
    };
  };

  const { team1: team1Label, team2: team2Label, t1obj, t2obj } = getBracketLabels();

  const getResolvedPredId = () => {
    if (!prediction) return null;
    if (prediction === 'slot:1') return match.team1Id || t1obj?.id || null;
    if (prediction === 'slot:2') return match.team2Id || t2obj?.id || null;
    return prediction;
  };

  const resolvedPredId = getResolvedPredId();
  const isCorrect = match.isLocked && match.actualWinnerId !== null && resolvedPredId === match.actualWinnerId;
  const isWrong = match.isLocked && match.actualWinnerId !== null && resolvedPredId !== null && resolvedPredId !== match.actualWinnerId;
  const isPending = match.isLocked && match.actualWinnerId === null;

  const pointsEarned = isCorrect ? (POINTS_MAP[match.round] || 1) : 0;

  const getBorderClass = () => {
    if (!match.isLocked) return prediction ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-slate-700/50';
    if (isCorrect) return 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.25)] ring-1 ring-green-500/20';
    if (isWrong) return 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] ring-1 ring-red-500/20';
    return 'border-slate-500 opacity-80';
  };

  const getTeamClass = (isSlot1: boolean) => {
    const teamId = isSlot1 ? match.team1Id : match.team2Id;
    const slotId = isSlot1 ? 'slot:1' : 'slot:2';
    const isPicked = (teamId && prediction === teamId) || prediction === slotId;

    if (match.isLocked) {
      if (isPicked) return 'bg-white/5 opacity-60 cursor-not-allowed border-white/10';
      return 'opacity-30 cursor-not-allowed border-transparent';
    }

    if (!teamId && match.round === 'GROUP') return 'bg-white/5 opacity-50 cursor-default border-transparent';
    
    if (isPicked) return 'bg-green-500/10 border border-green-500 text-green-500 shadow-lg shadow-green-500/10 cursor-pointer';
    return 'bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer';
  };

  const handlePick = (isSlot1: boolean) => {
    if (match.isLocked || !onPick) return;
    const teamId = isSlot1 ? match.team1Id : match.team2Id;
    if (teamId) {
      onPick(teamId);
    } else if (match.round !== 'GROUP') {
      onPick(isSlot1 ? 'slot:1' : 'slot:2');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Link 
      href={`/matches/${match.id}`}
      className={`block rounded-[32px] border transition-all duration-300 ${getBorderClass()} glass-panel p-6 hover:bg-white/[0.05] group/card cursor-pointer relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full -translate-y-16 translate-x-16 group-hover/card:bg-green-500/10 transition-colors" />

      <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase tracking-[0.2em]">
        <span className="text-slate-500">{formatDate(match.kickoffTime)}</span>
        <div className="flex items-center space-x-2">
          {isCorrect && (
            <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[8px] font-black animate-in zoom-in duration-300">
              +{pointsEarned} PTS
            </span>
          )}
          {match.isLocked ? (
            <span className="flex items-center text-amber-500/80">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </span>
          ) : (
            <span className="flex items-center text-slate-600">
               MATCH #{match.matchNumber}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Team 1 */}
        <div
          onClick={(e) => {
            e.preventDefault();
            handlePick(true);
          }}
          className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${getTeamClass(true)}`}
        >
          <div className="flex items-center space-x-4">
            {match.team1FlagUrl || t1obj?.flagUrl ? (
              <img src={match.team1FlagUrl || t1obj?.flagUrl || ''} alt={team1Label} className="w-10 h-6 object-cover rounded shadow-lg border border-white/10" />
            ) : (
              <div className="w-10 h-6 bg-slate-700/50 rounded flex items-center justify-center text-[10px] text-slate-500 font-bold border border-white/5">
                ?
              </div>
            )}
            <div className="flex flex-col">
              <span className={`font-black text-xs uppercase tracking-wider ${(!match.team1Id && !t1obj) ? 'text-slate-400 italic' : 'text-white'}`}>
                {team1Label}
              </span>
              {match.isLocked && match.actualWinnerId === (match.team1Id || (t1obj?.id)) && (
                 <span className="text-[8px] font-black text-green-500 uppercase tracking-widest mt-0.5">Winner</span>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {match.team1Score !== null && (
              <span className="text-xl font-black mr-4 text-white">{match.team1Score}</span>
            )}
            {match.isLocked && prediction === (match.team1Id || 'slot:1') && (
              <div className={`p-1 rounded-full ${isCorrect ? 'bg-green-500' : isWrong ? 'bg-red-500' : 'bg-slate-700'}`}>
                {isCorrect ? <Check className="h-3 w-3 text-white" /> : <X className="h-3 w-3 text-white" />}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center -my-2 relative z-10">
           <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-tighter group-hover/card:border-green-500/50 transition-colors">VS</div>
        </div>

        {/* Team 2 */}
        <div
          onClick={(e) => {
            e.preventDefault();
            handlePick(false);
          }}
          className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${getTeamClass(false)}`}
        >
          <div className="flex items-center space-x-4">
            {match.team2FlagUrl || t2obj?.flagUrl ? (
              <img src={match.team2FlagUrl || t2obj?.flagUrl || ''} alt={team2Label} className="w-10 h-6 object-cover rounded shadow-lg border border-white/10" />
            ) : (
              <div className="w-10 h-6 bg-slate-700/50 rounded flex items-center justify-center text-[10px] text-slate-500 font-bold border border-white/5">
                ?
              </div>
            )}
            <div className="flex flex-col">
              <span className={`font-black text-xs uppercase tracking-wider ${(!match.team2Id && !t2obj) ? 'text-slate-400 italic' : 'text-white'}`}>
                {team2Label}
              </span>
              {match.isLocked && match.actualWinnerId === (match.team2Id || (t2obj?.id)) && (
                 <span className="text-[8px] font-black text-green-500 uppercase tracking-widest mt-0.5">Winner</span>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {match.team2Score !== null && (
              <span className="text-xl font-black mr-4 text-white">{match.team2Score}</span>
            )}
            {match.isLocked && prediction === (match.team2Id || 'slot:2') && (
              <div className={`p-1 rounded-full ${isCorrect ? 'bg-green-500' : isWrong ? 'bg-red-500' : 'bg-slate-700'}`}>
                {isCorrect ? <Check className="h-3 w-3 text-white" /> : <X className="h-3 w-3 text-white" />}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-center lg:opacity-0 group-hover/card:opacity-100 transition-opacity">
         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500 flex items-center">
            View Analysis & Discussion
            <ChevronRight className="h-3 w-3 ml-1" />
         </span>
      </div>
    </Link>
  );
}
