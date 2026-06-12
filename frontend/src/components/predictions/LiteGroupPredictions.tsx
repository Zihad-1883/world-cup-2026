'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePredictionMode } from '@/context/PredictionModeContext';
import { usePredictionState } from '@/context/PredictionStateContext';
import { submitLitePredictions } from '@/lib/api';
import { Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface LiteGroupPredictionsProps {
  onSaveSuccess?: () => void;
}

export default function LiteGroupPredictions({ onSaveSuccess }: LiteGroupPredictionsProps) {
  const { user, token } = useAuth();
  const { mode } = usePredictionMode();
  const { teams, litePicks, setLitePicks, refreshData } = usePredictionState();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const groupsArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const teamsByGroup = groupsArr.reduce((acc, g) => {
    acc[g] = teams.filter(t => t.groupName === g).sort((a, b) => (a.groupPosition || 0) - (b.groupPosition || 0));
    return acc;
  }, {} as Record<string, any[]>);

  const handleTeamToggle = (groupName: string, teamId: string) => {
    const current = litePicks[groupName] || [];
    const totalThirds = Object.values(litePicks).filter(arr => arr.length === 3).length;
    let next: string[];

    if (current.includes(teamId)) {
      next = current.filter(id => id !== teamId);
    } else if (current.length < 2) {
      next = [...current, teamId];
    } else if (current.length === 2 && totalThirds < 8) {
      next = [...current, teamId];
    } else {
      if (current.includes(teamId)) {
        next = current.filter(id => id !== teamId);
      } else {
        return;
      }
    }

    setLitePicks({ ...litePicks, [groupName]: next });
  };

  const handleSave = async () => {
    if (!token) {
      toast.success('Picks saved locally as a guest!', {
        icon: <span>💾</span>
      });
      if (onSaveSuccess) {
        setTimeout(onSaveSuccess, 1000);
      }
      return;
    }

    setSaving(true);
    const res = await submitLitePredictions(token, litePicks);
    if (res.success) {
      toast.success('Lite mode predictions saved successfully!');
      await refreshData();
      if (onSaveSuccess) {
        setTimeout(onSaveSuccess, 1500);
      }
    } else {
      toast.error(res.error || 'Failed to save lite picks');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Instructions */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md shadow-xl flex items-center justify-between">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Trophy className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight mb-1">🎯 Lite Mode: Quick Picks</h3>
            <p className="text-slate-400 text-sm font-medium">
              Pick the <span className="text-blue-400">Top 2</span> for each group, plus your <span className="text-green-500 font-bold">top 8 best 3rd-place</span> qualifiers.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl px-6 py-3 flex flex-col items-center justify-center min-w-[120px]">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Best 3rds</span>
           <div className="flex items-baseline space-x-1">
             <span className={`text-2xl font-black ${Object.values(litePicks).filter(a => a.length === 3).length === 8 ? 'text-green-500' : 'text-white'}`}>
                {Object.values(litePicks).filter(a => a.length === 3).length}
             </span>
             <span className="text-slate-600 font-black text-sm">/ 8</span>
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groupsArr.map((groupName, idx) => (
          <motion.div 
            key={groupName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-slate-600 group"
          >
            <div className="bg-slate-900/50 px-5 py-3 border-b border-slate-700/50 flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500">
              <span>Group {groupName}</span>
              <span className={litePicks[groupName]?.length === 3 ? 'text-green-500' : 'text-amber-500'}>
                {litePicks[groupName]?.length || 0}/3 Picks
              </span>
            </div>

            <div className="p-2 space-y-1">
              {teamsByGroup[groupName]?.map(team => {
                const currentGrpPicks = litePicks[groupName] || [];
                const selectIdx = currentGrpPicks.indexOf(team.id);
                const isSelected = selectIdx !== -1;
                
                let badgeText = '';
                let badgeClass = '';
                if (selectIdx === 0) {
                  badgeText = 'WIN';
                  badgeClass = 'bg-slate-900 text-white';
                } else if (selectIdx === 1) {
                  badgeText = '2ND';
                  badgeClass = 'bg-slate-900/40 text-blue-200 border border-blue-400/20';
                } else if (selectIdx === 2) {
                  badgeText = '3RD';
                  badgeClass = 'bg-slate-900 text-green-400 font-bold border border-green-500/20';
                }

                return (
                   <button
                    key={team.id}
                    onClick={() => handleTeamToggle(groupName, team.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${
                      isSelected 
                        ? 'bg-green-500 text-slate-900 border-green-400 shadow-lg shadow-green-500/20' 
                        : 'bg-transparent text-slate-300 hover:bg-slate-700/50 border-transparent'
                    } border`}
                  >
                    <div className="flex items-center space-x-4">
                       <img src={team.flagUrl || ''} className="w-8 h-5 object-cover rounded-sm shadow-black/20 shadow-md" />
                       <span className="font-bold tracking-tight">{team.name}</span>
                    </div>
                    {isSelected && (
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeClass}`}>
                        {badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl ring-1 ring-black/20">
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-slate-700 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-slate-900"></div>
            ) : (
              'Save Predictions'
            )}
          </button>
          
          {!token && (
            <p className="mt-3 text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
              Guest picks saved locally. <span className="text-blue-400">Sign up to sync.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
