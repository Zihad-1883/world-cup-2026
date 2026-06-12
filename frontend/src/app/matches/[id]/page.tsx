'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getMatch } from '@/lib/api';
import { MatchFull } from '@/types';
import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import CommentThread from '@/components/comments/CommentThread';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Calendar,
  Lock,
  ChevronLeft,
  Trophy,
  Hash,
  Users2,
} from 'lucide-react';

const ROUND_LABELS: Record<string, string> = {
  GROUP: 'Group Stage',
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter-Finals',
  SF: 'Semi-Finals',
  FINAL: 'The Final',
};

export default function MatchDetailPage() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();
  const [match, setMatch] = useState<MatchFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && id) {
      getMatch(id, token).then((res) => {
        if (res.success) setMatch(res.data.match);
        setLoading(false);
      });
    }
  }, [id, token]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-900 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!match) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-900 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400">Match not found.</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const kickoff = new Date(match.kickoffTime);
  const isPlayed = match.isLocked && match.team1Score !== null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0c10] flex flex-col pt-20 selection:bg-green-500 selection:text-black">
        <Navbar />

        {/* ─── Hero Banner - ELITE DESIGN ─── */}
        <div className="bg-[#0a0c10] border-b border-white/5 pt-10 pb-20 relative overflow-hidden group">
          {/* Background flag blur - IMPROVED */}
          <div className="absolute inset-0 opacity-[0.1] pointer-events-none flex">
            {match.team1?.flagUrl && (
              <div className="w-1/2 h-full relative overflow-hidden">
                <img src={match.team1.flagUrl} alt="" className="w-full h-full object-cover blur-[100px] scale-150 rotate-[-10deg]" />
              </div>
            )}
            {match.team2?.flagUrl && (
              <div className="w-1/2 h-full relative overflow-hidden">
                <img src={match.team2.flagUrl} alt="" className="w-full h-full object-cover blur-[100px] scale-150 rotate-[10deg]" />
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0c10]/50 to-[#0a0c10] z-0" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Back link */}
            <Link
              href="/predict"
              className="inline-flex items-center text-slate-500 hover:text-green-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12 transition-all hover:-translate-x-2"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Return to Control Center
            </Link>

            {/* Round / status badges */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <span className="bg-green-500 text-black px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest rotate-[-3deg]">
                {ROUND_LABELS[match.round] || match.round}
              </span>
              {match.groupName && (
                <span className="bg-white/5 text-white border border-white/10 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  Group {match.groupName}
                </span>
              )}
              {match.isLocked ? (
                <span className="bg-white/5 text-amber-500 border border-white/10 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center">
                  <Lock className="h-3 w-3 mr-2" /> Locked
                </span>
              ) : (
                <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center animate-pulse">
                  <Clock className="h-3 w-3 mr-2" /> LIVE SELECTION
                </span>
              )}
            </div>

            {/* Teams vs Score */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-0">
              {/* Team 1 */}
              <div className="flex flex-col items-center flex-1 text-center group/t1">
                {match.team1?.flagUrl ? (
                  <img
                    src={match.team1.flagUrl}
                    alt={match.team1Name}
                    className={`w-24 h-16 object-cover rounded-2xl shadow-2xl border-4 mb-6 transition-transform group-hover/t1:scale-110 ${
                      isPlayed && match.actualWinnerId === match.team1Id
                        ? 'border-green-500 shadow-green-500/40'
                        : 'border-white/5'
                    }`}
                  />
                ) : (
                  <div className="w-36 h-24 bg-white/5 rounded-3xl border-4 border-white/10 mb-6" />
                )}
                {match.team1Id ? (
                   <Link href={`/teams/${match.team1Id}`} className="hover:text-green-500 transition-colors">
                     <h2 className="nike-title text-4xl md:text-5xl text-white italic tracking-tighter leading-none">
                       {match.team1Name || 'TBD'}
                     </h2>
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
                       {match.team1Code}
                     </p>
                   </Link>
                ) : (
                  <div>
                    <h2 className="nike-title text-4xl md:text-5xl text-slate-700 italic tracking-tighter leading-none">
                      TBD
                    </h2>
                  </div>
                )}
                {isPlayed && match.actualWinnerId === match.team1Id && (
                  <div className="mt-5 flex items-center bg-green-500 text-black px-4 py-1.5 rounded-full rotate-[-5deg]">
                    <Trophy className="h-3 w-3 mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Master Winner</span>
                  </div>
                )}
              </div>

              {/* Score / VS */}
              <div className="flex flex-col items-center px-12 min-w-[200px]">
                {isPlayed ? (
                  <div className="text-center">
                    <div className="nike-title text-7xl md:text-9xl text-white italic tracking-tighter leading-none">
                      {match.team1Score}<span className="text-green-500 mx-2">:</span>{match.team2Score}
                    </div>
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mt-6 bg-white/5 py-2 px-4 rounded-full">Final Result</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="nike-title text-6xl text-white/10 italic tracking-tighter">VS</div>
                    <div className="mt-6 flex flex-col items-center space-y-2">
                       <div className="flex items-center text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-4 py-1.5 rounded-full">
                         <Calendar className="h-3 w-3 mr-2" />
                         {kickoff.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                       </div>
                       <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                         <Clock className="h-3 w-3 mr-2" />
                         {kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Team 2 */}
              <div className="flex flex-col items-center flex-1 text-center group/t2">
                {match.team2?.flagUrl ? (
                  <img
                    src={match.team2.flagUrl}
                    alt={match.team2Name}
                    className={`w-24 h-16 object-cover rounded-2xl shadow-2xl border-4 mb-6 transition-transform group-hover/t2:scale-110 ${
                      isPlayed && match.actualWinnerId === match.team2Id
                        ? 'border-green-500 shadow-green-500/40'
                        : 'border-white/5'
                    }`}
                  />
                ) : (
                  <div className="w-36 h-24 bg-white/5 rounded-3xl border-4 border-white/10 mb-6" />
                )}
                {match.team2Id ? (
                  <Link href={`/teams/${match.team2Id}`} className="hover:text-green-500 transition-colors">
                    <h2 className="nike-title text-4xl md:text-5xl text-white italic tracking-tighter leading-none">
                      {match.team2Name || 'TBD'}
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
                      {match.team2Code}
                    </p>
                  </Link>
                ) : (
                  <div>
                    <h2 className="nike-title text-4xl md:text-5xl text-slate-700 italic tracking-tighter leading-none">
                      TBD
                    </h2>
                  </div>
                )}
                {isPlayed && match.actualWinnerId === match.team2Id && (
                  <div className="mt-5 flex items-center bg-green-500 text-black px-4 py-1.5 rounded-full rotate-[5deg]">
                    <Trophy className="h-3 w-3 mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Master Winner</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Match Info Row ─── */}
        <div className="bg-white/[0.02] border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap items-center justify-center gap-12">
            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest group cursor-default">
              <MapPin className="h-4 w-4 mr-3 text-green-500 group-hover:scale-125 transition-transform" />
              <span>{match.venue ? `${match.venue}, ` : ''}{match.city || '—'}</span>
            </div>
            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest group cursor-default">
              <Calendar className="h-4 w-4 mr-3 text-green-500 group-hover:scale-125 transition-transform" />
              <span>{kickoff.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest group cursor-default">
              <Hash className="h-4 w-4 mr-3 text-green-500 group-hover:scale-125 transition-transform" />
              <span>MATCH SEQUENCE #{match.matchNumber}</span>
            </div>
          </div>
        </div>

        {/* ─── Team Links Row ─── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {[
              { team: match.team1, id: match.team1Id },
              { team: match.team2, id: match.team2Id },
            ].map(({ team, id: tid }) =>
              tid ? (
                <Link
                  key={tid}
                  href={`/teams/${tid}`}
                  className="group glass-panel rounded-[40px] border border-white/5 hover:border-green-500/50 p-8 flex items-center space-x-6 transition-all shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12" />
                  {team?.flagUrl ? (
                    <img src={team.flagUrl} alt={team.name} className="w-20 h-12 object-cover rounded-xl shadow-2xl border border-white/10 group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-20 h-12 bg-white/5 rounded-xl" />
                  )}
                  <div className="flex-1">
                    <p className="nike-title text-2xl text-white italic tracking-tighter group-hover:text-green-500 transition-colors">
                      {team?.name || 'National Team'}
                    </p>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] flex items-center mt-2">
                       SQUAD ANALYSIS <ChevronLeft className="h-3 w-3 ml-2 rotate-180" />
                    </p>
                  </div>
                </Link>
              ) : null
            )}
          </div>

          {/* ─── Fan Discussion ─── */}
          <div className="nike-title text-4xl text-white italic tracking-tighter mb-8 flex items-center">
             Fan <span className="text-green-500 ml-3">Intelligence</span>
             <div className="h-px bg-white/5 flex-1 ml-8" />
          </div>
          <div className="glass-panel rounded-[40px] border border-white/10 p-2 overflow-hidden shadow-2xl">
            <div className="p-8 md:p-12 bg-white/[0.02] rounded-[38px]">
              <CommentThread matchId={id} />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
