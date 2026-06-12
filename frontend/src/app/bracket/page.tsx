'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { MatchBasic, Round } from '@/types';
import Navbar from '@/components/layout/Navbar';
import { Trophy, ChevronRight, Hash, MapPin, Clock, Download, Share2, ChevronLeft, Lock as LockIcon } from 'lucide-react';
import { usePredictionState } from '@/context/PredictionStateContext';
import { ALL_KNOCKOUT_SLOTS, getSlotLabel } from '@/lib/knockoutSlots';
import { toPng } from 'html-to-image';

const ROUNDS: Round[] = ['R32', 'R16', 'QF', 'SF', 'FINAL'];
const LABELS: Record<string, string> = {
  'R32': 'Round of 32',
  'R16': 'Round of 16',
  'QF': 'Quarter-Finals',
  'SF': 'Semi-Finals',
  'FINAL': 'The Final'
};

export default function BracketPage() {
  const { matches: allMatches, loading: stateLoading, slotTeams, picks } = usePredictionState();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const bracketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stateLoading) {
      setLoading(false);
    }
  }, [stateLoading]);

  const handleExport = async () => {
    if (!bracketRef.current) return;
    
    setExporting(true);
    try {
      const dataUrl = await toPng(bracketRef.current, {
        backgroundColor: '#0f172a',
        quality: 1,
        pixelRatio: 2,
        style: {
          padding: '60px',
        }
      });
      
      const link = document.createElement('a');
      link.download = `my-worldcup-2026-bracket.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export bracket', err);
    } finally {
      setExporting(false);
    }
  };

  const getTBDLabel = (matchNumber: number, slotIdx: 1 | 2) => {
    const slot = ALL_KNOCKOUT_SLOTS.find(s => s.matchNumber === matchNumber);
    if (!slot) return 'TBD';
    return getSlotLabel(slotIdx === 1 ? slot.slot1 : slot.slot2);
  };

  const getResolvedTeam = (matchNumber: number, slotIdx: 1 | 2) => {
    const slot = ALL_KNOCKOUT_SLOTS.find(s => s.matchNumber === matchNumber);
    if (!slot) return null;
    
    const source = slotIdx === 1 ? slot.slot1 : slot.slot2;
    let key = '';
    if (source.type === 'group_winner') key = `group_winner:${source.group}`;
    else if (source.type === 'group_runner_up') key = `group_runner_up:${source.group}`;
    else if (source.type === 'match_winner') key = `match_winner:${source.matchNumber}`;
    else if (source.type === 'best_third') key = `best_third:${source.groups.join('')}`;
    
    return slotTeams[key] || null;
  };

  const bracketData = useMemo(() => {
    const data: Record<string, MatchBasic[]> = {};
    ROUNDS.forEach(r => {
      data[r] = allMatches.filter(m => m.round === r).sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
    });
    return data;
  }, [allMatches]);

  if (loading || stateLoading) {
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
    <div className="min-h-screen bg-[#0a0c10] flex flex-col pt-20 selection:bg-green-500 selection:text-black uppercase">
      <Navbar />

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 overflow-visible">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 glass-panel p-10 rounded-[40px] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-green-500/5 w-96 h-96 blur-[100px] rounded-full translate-x-20 -translate-y-20 group-hover:bg-green-500/10 transition-all duration-700" />
          
          <div className="relative z-10">
            <h1 className="nike-title text-6xl text-white italic tracking-tighter mb-4 flex items-center">
              Tournament <span className="text-green-500 ml-4 italic">Bracket</span>
              <div className="ml-6 bg-green-500 p-3 rounded-2xl rotate-[-10deg] shadow-2xl shadow-green-500/20">
                <Trophy className="h-6 w-6 text-black" />
              </div>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Visualize the path to glory.</p>
          </div>
          
          <button
            onClick={handleExport}
            disabled={exporting}
            className="group/export relative z-10 inline-flex items-center space-x-4 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:scale-[1.05] hover:bg-green-500 active:scale-95 disabled:opacity-50"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-slate-900"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{exporting ? 'Generating...' : 'Save as Image'}</span>
          </button>
        </div>

        <div className="overflow-x-auto pb-24 no-scrollbar min-h-[800px] -mx-4 px-4 sm:mx-0 sm:px-0">
          <div ref={bracketRef} className="flex space-x-24 w-max p-8" style={{ minWidth: '1000px' }}>
            {ROUNDS.map((round, roundIdx) => (
              <div key={round} className="flex-shrink-0 w-80 flex flex-col">
                 <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md pb-6 z-10 border-b border-slate-800 mb-8">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] flex items-center">
                       <div className="h-4 w-1 bg-green-500 mr-3 rounded-full" />
                       {LABELS[round]}
                    </h3>
                 </div>

                 <div className="flex-1 flex flex-col justify-around">
                    {bracketData[round].map((match, matchIdx) => {
                       const userTeam1 = getResolvedTeam(match.matchNumber!, 1);
                       const userTeam2 = getResolvedTeam(match.matchNumber!, 2);
                       const userPick = picks[match.id];
                       
                       // Connector Logic: For every pair of matches, they "fork" together
                       const isTopMatch = matchIdx % 2 === 0;
                       
                       return (
                          <div key={match.id} className="relative py-6">
                             {/* Connector (Right Side) */}
                             {round !== 'FINAL' && (
                                <div className="absolute top-1/2 -right-24 flex items-center">
                                   {/* Line out of match */}
                                   <div className="w-12 h-px bg-slate-700" />
                                   {/* Vertical bridge */}
                                   <div className={`absolute left-12 w-px bg-slate-700 ${
                                     isTopMatch 
                                       ? 'h-[100%] top-1/2' // Downwards
                                       : 'h-[100%] bottom-1/2' // Upwards
                                   }`} />
                                   {/* Line into next round */}
                                   {isTopMatch && (
                                      <div className="absolute left-12 top-[100%] w-12 h-px bg-slate-700 flex items-center justify-end">
                                         <div className="w-1.5 h-1.5 rounded-full bg-slate-600 -mr-1" />
                                         <ChevronRight className="h-3 w-3 text-slate-700 -mr-2.5" />
                                      </div>
                                   )}
                                </div>
                             )}

                             {/* Match Card */}
                             <div className={`glass-panel rounded-[28px] border transition-all duration-500 ${match.isLocked ? 'border-white/5 opacity-80' : 'border-white/10'} p-6 shadow-2xl hover:border-green-500/40 hover:shadow-green-500/5 group overflow-hidden relative`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/[0.03] blur-2xl rounded-full" />
                                
                                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase mb-5 tracking-[0.2em] relative z-10">
                                   <span className="flex items-center">
                                      <Hash className="h-3 w-3 mr-2 text-green-500" />
                                      Match {match.matchNumber}
                                   </span>
                                   {match.isLocked ? (
                                      <LockIcon className="h-3 w-3 text-white/40" />
                                   ) : (
                                      <span className="text-green-500/80">LIVE</span>
                                   )}
                                </div>

                                <div className="space-y-4 relative z-10">
                                   {/* Team 1 */}
                                   <div className="flex items-center justify-between cursor-default">
                                      <div className="flex items-center space-x-4">
                                         <div className="relative">
                                           {(match.team1FlagUrl || userTeam1?.flagUrl) ? (
                                             <img src={match.team1FlagUrl || userTeam1?.flagUrl || ''} className="w-9 h-6 object-cover rounded shadow-xl border border-white/10" />
                                           ) : (
                                             <div className="w-9 h-6 bg-white/5 rounded flex items-center justify-center border border-white/5">
                                                <span className="text-[10px] text-slate-500">?</span>
                                             </div>
                                           )}
                                         </div>
                                         <span className={`text-sm font-black uppercase tracking-tight transition-colors ${
                                           (match.actualWinnerId === (match.team1Id || userTeam1?.id)) 
                                             ? 'text-green-500' 
                                             : (userPick === (match.team1Id || userTeam1?.id || 'slot:1')) 
                                               ? 'text-white' 
                                               : 'text-slate-500'
                                         }`}>
                                            {match.team1Name || userTeam1?.name || getTBDLabel(match.matchNumber!, 1)}
                                         </span>
                                      </div>
                                      <span className="font-mono text-white text-sm font-black bg-white/5 px-3 py-1 rounded-lg min-w-[28px] text-center">{match.team1Score ?? '-'}</span>
                                   </div>

                                   {/* Divider */}
                                   <div className="h-px bg-white/5 w-full" />

                                   {/* Team 2 */}
                                   <div className="flex items-center justify-between cursor-default">
                                      <div className="flex items-center space-x-4">
                                         <div className="relative">
                                           {(match.team2FlagUrl || userTeam2?.flagUrl) ? (
                                             <img src={match.team2FlagUrl || userTeam2?.flagUrl || ''} className="w-9 h-6 object-cover rounded shadow-xl border border-white/10" />
                                           ) : (
                                             <div className="w-9 h-6 bg-white/5 rounded flex items-center justify-center border border-white/5">
                                                <span className="text-[10px] text-slate-500">?</span>
                                             </div>
                                           )}
                                         </div>
                                         <span className={`text-sm font-black uppercase tracking-tight transition-colors ${
                                           (match.actualWinnerId === (match.team2Id || userTeam2?.id)) 
                                             ? 'text-green-500' 
                                             : (userPick === (match.team2Id || userTeam2?.id || 'slot:2')) 
                                               ? 'text-white' 
                                               : 'text-slate-500'
                                         }`}>
                                            {match.team2Name || userTeam2?.name || getTBDLabel(match.matchNumber!, 2)}
                                         </span>
                                      </div>
                                      <span className="font-mono text-white text-sm font-black bg-white/5 px-3 py-1 rounded-lg min-w-[28px] text-center">{match.team2Score ?? '-'}</span>
                                   </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                   <div className="flex items-center text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                                      <MapPin className="h-3 w-3 mr-2 text-green-500/40" />
                                      {match.city}
                                   </div>
                                   <div className="flex items-center text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                                      <Clock className="h-3 w-3 mr-2 text-green-500/40" />
                                      {match.kickoffTime ? new Date(match.kickoffTime).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '-'}
                                   </div>
                                </div>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
