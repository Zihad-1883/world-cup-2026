'use client';

import { useState, useEffect } from 'react';
import { getMatches } from '@/lib/api';
import { MatchBasic } from '@/types';
import { Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LiveTicker() {
  const [liveMatches, setLiveMatches] = useState<MatchBasic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await getMatches();
        if (res.success) {
          // Filter for matches that have scores but are not locked (our definition of LIVE)
          // or matches starting very soon
          const now = new Date();
          const filtered = res.data.matches.filter(m => {
             const startTime = new Date(m.kickoffTime);
             const isToday = startTime.toDateString() === now.toDateString();
             // In our app, if it has scores and is not locked, it's live
             return (m.team1Score !== null && !m.isLocked) || (isToday && !m.isLocked);
          });
          setLiveMatches(filtered.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to fetch live matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && liveMatches.length === 0) return null;
  if (!loading && liveMatches.length === 0) return null;

  return (
    <div className="bg-green-600/10 border-y border-white/5 backdrop-blur-xl sticky top-20 z-40 overflow-hidden shadow-2xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {/* Label */}
          <div className="flex items-center space-x-2 bg-green-500 text-black px-4 py-2 font-black text-[10px] uppercase tracking-widest">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>Live Sync</span>
          </div>

          {/* Ticker Content */}
          <div className="flex-1 flex items-center overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex items-center divide-x divide-white/10">
              {liveMatches.map((match) => (
                <Link 
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="flex items-center space-x-6 px-8 py-2 hover:bg-white/5 transition-colors whitespace-nowrap group"
                >
                  <div className="flex items-center space-x-2">
                    <img src={match.team1FlagUrl || ''} className="w-5 h-3 object-cover rounded-sm border border-white/10" alt="" />
                    <span className="text-[10px] font-black text-white uppercase">{match.team1Code}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-black text-green-500 tabular-nums">
                      {match.team1Score ?? 0} : {match.team2Score ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-right">
                    <span className="text-[10px] font-black text-white uppercase">{match.team2Code}</span>
                    <img src={match.team2FlagUrl || ''} className="w-5 h-3 object-cover rounded-sm border border-white/10" alt="" />
                  </div>
                  
                  {match.team1Score !== null && !match.isLocked ? (
                    <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded animate-pulse uppercase">Live</span>
                  ) : (
                    <span className="text-[8px] font-black text-slate-500 uppercase">{new Date(match.kickoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 pl-4 border-l border-white/10">
             <button className="p-1 hover:text-green-500 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
             <button className="p-1 hover:text-green-500 transition-colors"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
