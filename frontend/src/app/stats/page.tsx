'use client';

import { useState, useEffect } from 'react';
import { getStats } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Trophy, TrendingUp, Users, Target, Globe2 } from 'lucide-react';

export default function StatsPage() {
  const [data, setData] = useState<{ 
    topPickedWinner: any; 
    popularPicks: any[]; 
    totalPredictors: number 
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(res => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
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
    <div className="min-h-screen bg-[#0a0c10] flex flex-col pt-20 selection:bg-green-500 selection:text-black">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1">
        {/* Header */}
        <div className="mb-12 glass-panel p-10 rounded-[40px] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-green-500/5 w-64 h-64 blur-[80px] rounded-full translate-x-32 -translate-y-32" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="nike-title text-5xl text-white italic tracking-tighter mb-2">Global <span className="text-green-500">Rankings</span></h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Who does the world believe in?</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="nike-title text-4xl text-white italic">{data?.totalPredictors.toLocaleString() || '0'}</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center justify-end">
                <Users className="h-3 w-3 mr-2 text-green-500" /> Total Predictors
              </p>
            </div>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="glass-panel rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="nike-title text-2xl text-white italic tracking-tighter flex items-center">
              <Trophy className="h-6 w-6 mr-3 text-green-500" />
              Predicted Champions
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data?.popularPicks?.length || 0} Nations</span>
          </div>

          <div>
            {data?.popularPicks && data.popularPicks.length > 0 ? (
              data.popularPicks.map((pick, i) => (
                <div
                  key={pick.team.id}
                  className={`flex items-center px-8 py-5 border-b border-white/5 hover:bg-white/[0.04] transition-all group/row ${i === 0 ? 'bg-green-500/5' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-14 flex-shrink-0">
                    {i === 0 ? (
                      <span className="nike-title text-2xl text-green-500 italic">#1</span>
                    ) : i === 1 ? (
                      <span className="nike-title text-2xl text-slate-300 italic">#2</span>
                    ) : i === 2 ? (
                      <span className="nike-title text-2xl text-amber-600 italic">#3</span>
                    ) : (
                      <span className="font-black text-slate-600 text-sm">#{i + 1}</span>
                    )}
                  </div>

                  {/* Flag */}
                  <div className="w-14 flex-shrink-0">
                    <img
                      src={pick.team.flagUrl}
                      alt={pick.team.name}
                      className="w-10 h-7 object-cover rounded-lg shadow-lg border border-white/10 group-hover/row:scale-110 transition-transform"
                    />
                  </div>

                  {/* Country Name */}
                  <div className="flex-1 min-w-0">
                    <p className="nike-title text-xl text-white italic tracking-tighter group-hover/row:text-green-500 transition-colors truncate">
                      {pick.team.name}
                    </p>
                    {pick.team.code && (
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{pick.team.code}</p>
                    )}
                  </div>

                  {/* Prediction count */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-black text-lg">{pick.pickCount.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Predicted</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center">
                <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-10 w-10 text-slate-700" />
                </div>
                <h3 className="nike-title text-2xl text-slate-500 italic mb-2">No Data Yet</h3>
                <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Be the first to make a prediction.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
