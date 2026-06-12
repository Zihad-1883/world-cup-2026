'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMyAccuracy, updateProfile, updateAvatar, getMyPredictions } from '@/lib/api';
import { AccuracyStats, Round, PredictionWithMatch } from '@/types';
import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import Avatar from '@/components/ui/Avatar';
import { 
  User, 
  Mail, 
  Camera, 
  Settings, 
  BarChart3, 
  ShieldCheck, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  ListChecks,
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ROUNDS: Round[] = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'FINAL'];

export default function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const [stats, setStats] = useState<AccuracyStats | null>(null);
  const [predictions, setPredictions] = useState<PredictionWithMatch[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [expandedRounds, setExpandedRounds] = useState<Record<string, boolean>>({ GROUP: true });
  const [rank, setRank] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  
  // Form state
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      // Get real rank and total points
      import('@/lib/api').then(({ getMe }) => {
        getMe(token).then((res: any) => {
          if (res.success) {
            setRank(res.data.rank);
            setTotalPoints(res.data.totalPoints);
          }
        });
      });

      getMyAccuracy(token).then(res => {
        if (res.success) setStats(res.data);
      });
      setPredictionsLoading(true);
      getMyPredictions(token).then(res => {
        if (res.success) setPredictions(res.data.predictions);
        setPredictionsLoading(false);
      });
    }
  }, [token]);

  const toggleRound = (round: string) =>
    setExpandedRounds(prev => ({ ...prev, [round]: !prev[round] }));

  const predsByRound: Record<string, PredictionWithMatch[]> = {};
  predictions.forEach(p => {
    const r = p.match.round;
    if (!predsByRound[r]) predsByRound[r] = [];
    predsByRound[r].push(p);
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setStatus(null);

    try {
      // Update core profile
      const profRes = await updateProfile(token, { username, email });
      if (!profRes.success) {
        setStatus({ type: 'error', message: profRes.error });
        setLoading(false);
        return;
      }

      // Update avatar if changed
      if (avatarUrl !== user?.avatarUrl) {
        const avRes = await updateAvatar(token, avatarUrl);
        if (!avRes.success) {
          setStatus({ type: 'error', message: avRes.error });
          setLoading(false);
          return;
        }
        setUser(avRes.data.user);
      } else {
        setUser(profRes.data.user);
      }

      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left Column: Stats & Summary */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                 
                 <div className="flex flex-col items-center text-center">
                    <div className="relative group cursor-pointer mb-6">
                      <Avatar url={user?.avatarUrl || null} username={user?.username || ''} size="xl" />
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white h-8 w-8" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-black text-white">{user?.username}</h2>
                    <p className="text-slate-500 font-medium lowercase">@{user?.username}</p>
                    <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/30 rounded-full text-xs font-bold uppercase tracking-widest">
                       <ShieldCheck className="h-3 w-3 mr-1.5" />
                       {user?.role}
                    </div>
                 </div>

                  <div className="mt-10 grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                      <p className="text-2xl font-black text-white">{totalPoints ?? (stats?.pointsTotal || 0)}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Points</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                      <p className="text-2xl font-black text-green-500">#{rank || '?'}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">World Rank</p>
                    </div>
                  </div>
              </div>

              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
                <h3 className="text-white font-black uppercase tracking-tight flex items-center mb-6">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                  Accuracy Breakdown
                </h3>
                
                <div className="space-y-6">
                  {ROUNDS.map(round => {
                    const rStats = stats?.byRound?.[round] || { total: 0, correct: 0 };
                    const percent = rStats.total > 0 ? Math.round((rStats.correct / rStats.total) * 100) : 0;
                    
                    return (
                      <div key={round} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{round}</span>
                          <span className="text-xs font-black text-white">{rStats.correct}/{rStats.total}</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-1000 select-none"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700 flex justify-between items-center">
                   <div className="text-center">
                     <p className="text-xl font-black text-white">{stats?.accuracyPercent || 0}%</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Accuracy</p>
                   </div>
                    <div className="text-center">
                     <p className="text-xl font-black text-white">{stats?.total || 0}</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Picks</p>
                   </div>
                    <div className="text-center">
                     <p className="text-xl font-black text-white">{stats?.pending || 0}</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pending</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: Settings */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-800 rounded-3xl p-10 border border-slate-700 shadow-xl">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center mb-10">
                  <Settings className="h-6 w-6 mr-3 text-green-500" />
                  Profile Settings
                </h3>

                {status && (
                  <div className={`mb-8 p-4 rounded-xl flex items-center animate-in fade-in slide-in-from-top-4 ${
                    status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
                  }`}>
                    {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 mr-3" /> : <AlertCircle className="h-5 w-5 mr-3" />}
                    <span className="font-bold text-sm">{status.message}</span>
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                       <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                         <input 
                           type="text"
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors font-medium shadow-inner"
                           placeholder="Your username"
                         />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                       <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                         <input 
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors font-medium shadow-inner"
                           placeholder="name@example.com"
                         />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Avatar Image URL</label>
                     <div className="relative">
                       <Camera className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                       <input 
                         type="url"
                         value={avatarUrl}
                         onChange={(e) => setAvatarUrl(e.target.value)}
                         className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors font-medium shadow-inner"
                         placeholder="https://images.unsplash.com/photo-123..."
                       />
                     </div>
                     <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2 ml-1">Leave empty to use automatic letter avatar</p>
                  </div>

                  <div className="pt-6 border-t border-slate-700 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-green-900/20 active:scale-95 flex items-center"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                      ) : (
                        <Save className="h-5 w-5 mr-3" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl overflow-hidden relative">
                 <div className="flex items-center text-slate-400">
                   <AlertCircle className="h-5 w-5 mr-2" />
                   <p className="text-sm">Account created on {new Date(user?.createdAt || '').toLocaleDateString()}</p>
                 </div>
              </div>
            </div>
          </div>
        </main>

        {/* ─── My Predictions Section ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-700 flex items-center">
              <ListChecks className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">My Predictions</h3>
              <span className="ml-auto text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded-full">
                {predictions.length} total
              </span>
            </div>

            {predictionsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
              </div>
            ) : predictions.length === 0 ? (
              <div className="py-20 text-center">
                <ListChecks className="h-14 w-14 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No predictions saved yet</p>
                <p className="text-slate-600 text-sm mt-1">Head to the predict page to make your picks!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {ROUNDS.map(round => {
                  const rPreds = predsByRound[round];
                  if (!rPreds || rPreds.length === 0) return null;
                  const isOpen = expandedRounds[round];
                  const correct = rPreds.filter(p => p.isCorrect === true).length;
                  const wrong = rPreds.filter(p => p.isCorrect === false).length;
                  const pts = rPreds.reduce((s, p) => s + (p.pointsEarned || 0), 0);

                  return (
                    <div key={round}>
                      <button
                        onClick={() => toggleRound(round)}
                        className="w-full px-8 py-5 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-black text-white uppercase tracking-widest">
                            {round === 'GROUP' ? 'Group Stage' : round === 'R32' ? 'Round of 32' : round === 'R16' ? 'Round of 16' : round === 'QF' ? 'Quarter-Finals' : round === 'SF' ? 'Semi-Finals' : 'The Final'}
                          </span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{rPreds.length} picks</span>
                          {pts > 0 && <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black px-2 py-0.5 rounded-full">{pts} pts</span>}
                          {correct > 0 && <span className="flex items-center text-[10px] font-black text-green-500"><Check className="h-3 w-3 mr-0.5" />{correct}</span>}
                          {wrong > 0 && <span className="flex items-center text-[10px] font-black text-red-500"><X className="h-3 w-3 mr-0.5" />{wrong}</span>}
                        </div>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-700/30 bg-slate-900/20">
                          {rPreds.map(pred => {
                            const pickedTeam =
                              pred.predictedWinnerId === pred.match.team1Id
                                ? { name: pred.match.team1Name, flag: pred.match.team1FlagUrl, code: pred.match.team1Code }
                                : { name: pred.match.team2Name, flag: pred.match.team2FlagUrl, code: pred.match.team2Code };

                            return (
                              <div key={pred.id} className="px-8 py-4 flex items-center gap-6">
                                {/* Teams */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                                    {pred.match.team1Name} vs {pred.match.team2Name}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    {pickedTeam.flag && (
                                      <img src={pickedTeam.flag} alt="" className="w-6 h-4 object-cover rounded shadow-sm" />
                                    )}
                                    <span className="text-sm font-bold text-white">{pickedTeam.name}</span>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase">{pickedTeam.code}</span>
                                  </div>
                                </div>

                                {/* Score if played */}
                                {pred.match.team1Score !== null && (
                                  <div className="text-center shrink-0">
                                    <span className="font-mono font-black text-white text-sm">
                                      {pred.match.team1Score}–{pred.match.team2Score}
                                    </span>
                                    <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Result</p>
                                  </div>
                                )}

                                {/* Outcome badge */}
                                <div className="shrink-0">
                                  {pred.isCorrect === null ? (
                                    <span className="flex items-center bg-slate-700/50 text-slate-400 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                      <Clock className="h-3 w-3 mr-1.5" />Pending
                                    </span>
                                  ) : pred.isCorrect ? (
                                    <span className="flex items-center bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                      <Check className="h-3 w-3 mr-1.5" />+{pred.pointsEarned}pts
                                    </span>
                                  ) : (
                                    <span className="flex items-center bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                      <X className="h-3 w-3 mr-1.5" />Wrong
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
