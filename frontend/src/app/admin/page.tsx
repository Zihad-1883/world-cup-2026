'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMatches, updateMatchResult, lockMatch, syncLiveMatches } from '@/lib/api';
import { MatchBasic, Round } from '@/types';
import AdminGuard from '@/components/auth/AdminGuard';
import Navbar from '@/components/layout/Navbar';
import { 
  ShieldAlert, 
  RefreshCcw, 
  Lock, 
  Unlock, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';

export default function AdminPage() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editMatch, setEditMatch] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, { t1: number, t2: number }>>({});
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (token) {
      loadMatches();
    }
  }, [token]);

  const loadMatches = async () => {
    const res = await getMatches();
    if (res.success) {
      setMatches(res.data.matches);
      const initialScores: Record<string, { t1: number, t2: number }> = {};
      res.data.matches.forEach(m => {
        initialScores[m.id] = { 
          t1: m.team1Score ?? 0, 
          t2: m.team2Score ?? 0 
        };
      });
      setScores(initialScores);
    }
    setLoading(false);
  };

  const handleSync = async () => {
    if (!token) return;
    setSyncing(true);
    setStatus(null);
    try {
      const res = await syncLiveMatches(token);
      if (res.success) {
        setStatus({ type: 'success', message: res.data.message });
        await loadMatches();
      } else {
        setStatus({ type: 'error', message: res.error });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateResult = async (match: MatchBasic) => {
    if (!token) return;
    const matchScores = scores[match.id];
    let actualWinnerId: string | null = null;
    
    if (matchScores.t1 > matchScores.t2) actualWinnerId = match.team1Id;
    else if (matchScores.t2 > matchScores.t1) actualWinnerId = match.team2Id;

    try {
      const res = await updateMatchResult(token, match.id, {
        team1Score: matchScores.t1,
        team2Score: matchScores.t2,
        actualWinnerId
      });

      if (res.success) {
        setStatus({ type: 'success', message: 'Match result updated and predictions scored!' });
        setEditMatch(null);
        await loadMatches();
      } else {
        setStatus({ type: 'error', message: res.error });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to update' });
    }
  };

  const handleToggleLock = async (id: string, currentLock: boolean) => {
    if (!token) return;
    try {
      const res = await lockMatch(token, id, !currentLock);
      if (res.success) {
        setStatus({ type: 'success', message: `Match ${!currentLock ? 'locked' : 'unlocked'}` });
        await loadMatches();
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Toggle lock failed' });
    }
  };

  if (loading) return null;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center">
                <ShieldAlert className="h-8 w-8 text-amber-500 mr-3" />
                Admin <span className="text-amber-500 ml-2">Console</span>
              </h1>
              <p className="text-slate-400 mt-2 font-medium">Manage tournament data and sync match scores.</p>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center space-x-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-amber-900/20 active:scale-95 uppercase tracking-widest text-sm"
            >
              {syncing ? (
                <RefreshCcw className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCcw className="h-5 w-5" />
              )}
              <span>Sync Live Data</span>
            </button>
          </div>

          {status && (
            <div className={`mb-8 p-6 rounded-2xl flex items-center animate-in slide-in-from-top-4 ${
              status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="h-6 w-6 mr-4" /> : <AlertCircle className="h-6 w-6 mr-4" />}
              <span className="font-bold">{status.message}</span>
            </div>
          )}

          <div className="bg-slate-800 rounded-[40px] border border-slate-700 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-6">Match</th>
                    <th className="px-8 py-6">Round</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Result</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {matches.map(match => (
                    <tr key={match.id} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <div className="flex items-center space-x-2 text-white font-bold mb-1">
                              <span>{match.team1Name}</span>
                              <span className="text-slate-600 text-[10px]">VS</span>
                              <span>{match.team2Name}</span>
                           </div>
                           <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(match.kickoffTime).toLocaleDateString()}
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-slate-900 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-700">
                           {match.round}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {match.isLocked ? (
                          <div className="flex items-center text-amber-500 text-xs font-bold uppercase">
                             <Lock className="h-3 w-3 mr-1.5" /> Locked
                          </div>
                        ) : (
                          <div className="flex items-center text-green-500 text-xs font-bold uppercase">
                             <Clock className="h-3 w-3 mr-1.5" /> Upcoming
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {editMatch === match.id ? (
                           <div className="flex items-center space-x-2">
                              <input 
                                type="number" 
                                value={scores[match.id].t1}
                                onChange={(e) => setScores({...scores, [match.id]: {...scores[match.id], t1: parseInt(e.target.value)}})}
                                className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold text-center"
                              />
                              <span className="text-slate-500">-</span>
                              <input 
                                type="number" 
                                value={scores[match.id].t2}
                                onChange={(e) => setScores({...scores, [match.id]: {...scores[match.id], t2: parseInt(e.target.value)}})}
                                className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold text-center"
                              />
                           </div>
                        ) : (
                          <div className="font-mono text-lg font-black text-white">
                            {match.team1Score ?? '-'} : {match.team2Score ?? '-'}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end space-x-2">
                           {editMatch === match.id ? (
                             <>
                               <button 
                                 onClick={() => setEditMatch(null)}
                                 className="px-4 py-2 bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-slate-600 transition-colors uppercase"
                               >
                                 Cancel
                               </button>
                               <button 
                                 onClick={() => handleUpdateResult(match)}
                                 className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 transition-colors uppercase"
                               >
                                 Save
                               </button>
                             </>
                           ) : (
                             <>
                               <button 
                                 onClick={() => handleToggleLock(match.id, match.isLocked)}
                                 className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                                 title={match.isLocked ? "Unlock Match" : "Lock Match"}
                               >
                                 {match.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                               </button>
                               <button 
                                 onClick={() => setEditMatch(match.id)}
                                 className="p-2 text-slate-500 hover:text-green-500 hover:bg-slate-700 rounded-lg transition-all"
                                 title="Edit Score"
                               >
                                 <Edit3 className="h-4 w-4" />
                               </button>
                             </>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
