'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submitPredictions } from '@/lib/api';
import { Round } from '@/types';
import GroupPanel from '@/components/predictions/GroupPanel';
import MatchCard from '@/components/predictions/MatchCard';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { Save, AlertCircle, CheckCircle2, ChevronRight, Info, Lock as LockIcon, TriangleAlert, Sparkles, RotateCcw } from 'lucide-react';

import { usePredictionMode } from '@/context/PredictionModeContext';
import { usePredictionState } from '@/context/PredictionStateContext';
import LiteGroupPredictions from '@/components/predictions/LiteGroupPredictions';

const ROUNDS: Round[] = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'FINAL'];
const ROUND_LABELS: Record<Round, string> = {
  'GROUP': 'Group Stage',
  'R32': 'Round of 32',
  'R16': 'Round of 16',
  'QF': 'Quarter-Finals',
  'SF': 'Semi-Finals',
  'FINAL': 'The Final'
};

export default function PredictPage() {
  const { user, token } = useAuth();
  const { mode, setMode } = usePredictionMode();
  const { matches, teams, picks, setPick, slotTeams, loading, refreshData, randomizeAll, resetAll } = usePredictionState();
  
  const [activeRound, setActiveRound] = useState<Round>('GROUP');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isKnockoutResolved = matches.some(m => m.round !== 'GROUP' && (m.team1Id || m.team2Id)) || Object.keys(slotTeams).length > 0;

  // Derived logic...
  const handleRandomize = () => {
    if (confirm('This will fill all matches with random winners based on your current mode. Continue?')) {
      randomizeAll();
      setSaveStatus({ type: 'success', message: 'Generated random picks!' });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear ALL your predictions? This cannot be undone.')) {
      resetAll();
      setSaveStatus({ type: 'success', message: 'All predictions cleared.' });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };


  // Handle Save
  const handleSaveClick = () => {
    if (!token) {
      setSaveStatus({ type: 'success', message: 'Guest picks saved locally!' });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }
    
    if (activeRound === 'GROUP') {
      executeSave();
    } else {
      setShowConfirmModal(true);
    }
  };

  const executeSave = async () => {
    setShowConfirmModal(false);
    setSaveLoading(true);
    setSaveStatus(null);
    try {
      const predArray = Object.entries(picks).map(([matchId, val]) => {
        if (val.startsWith('slot:')) {
          return { matchId, predictedSlot: parseInt(val.split(':')[1]) };
        }
        return { matchId, predictedWinnerId: val };
      });

      const res = await submitPredictions(token!, predArray);
      if (res.success) {
        setSaveStatus({ type: 'success', message: `Successfully saved ${res.data.saved} predictions!` });
        await refreshData();
        if (activeRound === 'GROUP') {
           setTimeout(() => {
             setActiveRound('R32');
             window.scrollTo({ top: 0, behavior: 'smooth' });
           }, 1500);
        }
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setSaveStatus({ type: 'error', message: res.error });
      }
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Failed to connect to server' });
    } finally {
      setSaveLoading(false);
    }
  };

  // Derived data
  const filteredMatches = useMemo(() => {
    return matches.filter(m => m.round === activeRound);
  }, [matches, activeRound]);

  const groupsArr = useMemo(() => {
    if (activeRound !== 'GROUP') return {};
    const grouped: Record<string, any[]> = {};
    filteredMatches.forEach(m => {
      if (m.groupName) {
        if (!grouped[m.groupName]) grouped[m.groupName] = [];
        grouped[m.groupName].push(m);
      }
    });
    return grouped;
  }, [filteredMatches, activeRound]);

  const roundStats = useMemo(() => {
    const stats: Record<string, { total: number; predicted: number }> = {};
    ROUNDS.forEach(r => {
      const roundMatches = matches.filter(m => m.round === r);
      stats[r] = {
        total: roundMatches.length,
        predicted: roundMatches.filter(m => picks[m.id]).length
      };
    });
    return stats;
  }, [matches, picks]);

  const totalPredicted = Object.keys(picks).length;
  const totalPlayable = matches.filter(m => m.team1Id && m.team2Id).length || 104;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col pt-20">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col pb-20 pt-20">
      <Navbar />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
          <div className="relative bg-slate-800 border border-slate-700 w-full max-w-md rounded-[32px] p-8 shadow-2xl shadow-black animate-in fade-in zoom-in duration-300">
             <div className="bg-amber-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-amber-500/20">
                <TriangleAlert className="h-8 w-8 text-amber-500" />
             </div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Confirm Predictions</h3>
             <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
               You are about to save your picks for <span className="text-white font-bold">{ROUND_LABELS[activeRound]}</span>. 
               These predictions <span className="text-amber-500 font-bold underline">cannot be changed</span> once saved to your profile.
             </p>
             <div className="flex flex-col space-y-3">
                <button 
                  onClick={executeSave}
                  className="w-full bg-green-500 hover:bg-green-400 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-green-500/20 transition-all active:scale-95"
                >
                  Confirm & Save
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
                >
                  Cancel
                </button>
             </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Mode & Stats Row - PREMIUM REDESIGN */}
        <div className="mb-12 glass-panel p-8 rounded-[40px] flex flex-col xl:flex-row xl:items-center justify-between gap-8 ring-1 ring-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 bg-green-500/5 w-64 h-64 blur-3xl rounded-full translate-x-20 -translate-y-20 group-hover:bg-green-500/10 transition-colors" />
           
           <div className="flex items-center space-x-6 relative z-10">
              <div className="bg-green-500 p-4 rounded-3xl shadow-xl shadow-green-500/20 rotate-[-5deg] group-hover:rotate-0 transition-transform">
                 <Trophy className="h-8 w-8 text-black" />
              </div>
              <div>
                 <h1 className="nike-title text-4xl text-white italic tracking-tighter mb-1">Predictions</h1>
                 <div className="flex items-center space-x-3">
                    <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                       {totalPredicted}/{totalPlayable} Picks Made
                    </span>
                 </div>
              </div>
           </div>

           <div className="flex flex-wrap items-center gap-4 relative z-10">
              <button 
                onClick={handleRandomize}
                className="flex items-center space-x-3 bg-white text-black px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-green-500 hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
              >
                <Sparkles className="h-4 w-4" />
                <span>Surprise Me</span>
              </button>

              <button 
                onClick={handleReset}
                className="flex items-center space-x-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <RotateCcw className="h-4 w-4 text-green-500" />
                <span>Reset All</span>
              </button>

              <div className="h-10 w-px bg-white/5 mx-2 hidden sm:block"></div>

              {user ? (
                <div className="flex items-center bg-white/5 p-1.5 rounded-[22px] border border-white/10 shadow-inner">
                    <button 
                      onClick={() => setMode('LITE')}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          mode === 'LITE' 
                          ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      🎯 Lite
                    </button>
                    <button 
                      onClick={() => setMode('PRO')}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          mode === 'PRO' 
                          ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      🚀 Pro
                    </button>
                </div>
              ) : (
                <Link href="/login" className="bg-green-500/10 text-green-500 border border-green-500/20 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all">
                  Sign in to Sync
                </Link>
              )}
           </div>
        </div>

        {/* Round Tabs - MODERN NAVY */}
        <div className="flex overflow-x-auto pb-4 mb-16 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex space-x-3 bg-white/5 p-2 rounded-[28px] border border-white/5 w-max">
            {ROUNDS.map((round) => (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={`px-7 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center ${
                  activeRound === round 
                    ? 'bg-white text-black shadow-2xl scale-105' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {ROUND_LABELS[round]}
              </button>
            ))}
          </div>
        </div>

        {/* Save Status Overlay */}
        {saveStatus && (
           <div className={`mb-8 p-4 rounded-2xl text-center text-sm font-black uppercase tracking-widest flex items-center justify-center space-x-3 animate-in fade-in slide-in-from-top-4 ${
             saveStatus.type === 'success' ? 'bg-green-500/10 text-green-500 ring-1 ring-green-500/20' : 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'
           }`}>
             {saveStatus.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
             <span>{saveStatus.message}</span>
           </div>
        )}

        <div className="animate-in fade-in duration-700">
          {activeRound === 'GROUP' ? (
             mode === 'LITE' ? (
                <LiteGroupPredictions onSaveSuccess={() => setActiveRound('R32')} />
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Object.keys(groupsArr).sort().map(groupName => (
                    <GroupPanel 
                      key={groupName} 
                      groupName={groupName} 
                      matches={groupsArr[groupName]} 
                      picks={picks}
                      onPick={setPick}
                    />
                  ))}
                  <div className="col-span-full flex justify-center mt-12 mb-20">
                     <button
                        onClick={handleSaveClick}
                        disabled={saveLoading}
                        className="bg-green-500 hover:bg-green-400 text-slate-900 px-12 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-green-500/30 transition-all disabled:opacity-50 active:scale-95 flex items-center space-x-4"
                     >
                        {saveLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-slate-900"></div>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            <span>Save All Group Matches</span>
                          </>
                        )}
                     </button>
                  </div>
                </div>
             )
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="mb-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-blue-400 font-bold mb-1 uppercase tracking-widest text-xs">Bracket Prediction Mode</h4>
                  <p className="text-slate-400 text-sm font-medium">
                    {Object.keys(slotTeams).length === 0 && activeRound === 'R32' 
                      ? "Group stage winners will appear here once you make your picks in Lite mode. You can still browse the matchups below."
                      : "Select which team will advance to the next stage."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredMatches.length > 0 ? (
                  <>
                    {filteredMatches.map(match => (
                      <MatchCard 
                        key={match.id} 
                        match={match} 
                        prediction={picks[match.id]} 
                        onPick={(teamId) => setPick(match.id, teamId)}
                        slotTeams={slotTeams}
                        picks={picks}
                      />
                    ))}
                    <div className="col-span-full flex justify-center mt-12 mb-20">
                      <button
                        onClick={handleSaveClick}
                        disabled={saveLoading}
                        className="bg-green-500 hover:bg-green-400 text-slate-900 px-12 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-green-500/30 transition-all disabled:opacity-50 active:scale-95 flex items-center space-x-4"
                      >
                         {saveLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-slate-900"></div>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            <span>Save {ROUND_LABELS[activeRound]} Picks</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="col-span-full py-32 text-center bg-slate-800/20 rounded-[48px] border-2 border-dashed border-slate-800/80 shadow-inner">
                    <div className="bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                       <Trophy className="h-10 w-10 text-slate-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-500 uppercase tracking-tight mb-2">Bracket TBD</h3>
                    <p className="text-slate-600 font-medium max-w-sm mx-auto">Matches for this round will be set once teams qualify.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

