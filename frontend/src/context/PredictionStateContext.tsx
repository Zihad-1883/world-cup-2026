'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { MatchBasic, TeamBasic, Round } from '@/types';
import { getMatches, getTeams, getMyPredictions, getMyLitePredictions } from '@/lib/api';
import { useAuth } from './AuthContext';
import { ALL_KNOCKOUT_SLOTS } from '@/lib/knockoutSlots';

interface PredictionStateContextType {
  matches: MatchBasic[];
  teams: TeamBasic[];
  picks: Record<string, string>;
  litePicks: Record<string, string[]>;
  slotTeams: Record<string, TeamBasic>;
  loading: boolean;
  setPick: (matchId: string, teamId: string) => void;
  setLitePicks: (picks: Record<string, string[]>) => void;
  randomizeAll: () => void;
  resetAll: () => void;
  refreshData: () => Promise<void>;
}

const PredictionStateContext = createContext<PredictionStateContextType | undefined>(undefined);

export function PredictionStateProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchBasic[]>([]);
  const [teams, setTeams] = useState<TeamBasic[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [litePicks, setLitePicksState] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  const clearState = useCallback(() => {
    setPicks({});
    setLitePicksState({});
  }, []);

  // Important: Clear all local state whenever the user changes (login or logout)
  // This prevents seeing the previous user's data while the new data is loading.
  useEffect(() => {
    clearState();
    
    // If a token is detected (login), also wipe guest storage to prevent it leaking into the account
    if (token) {
      localStorage.removeItem('wc2026_guest_lite_picks');
      localStorage.removeItem('wc2026_guest_picks');
      localStorage.removeItem('wc2026_prediction_mode');
    }
  }, [token, clearState]);

  const loadData = useCallback(async () => {
    setLoading(true);
    // Note: clearState() is no longer called here to prevent "vanishing" 
    // during a refresh (like after saving). It's only called when token changes.

    try {
      const [matchRes, teamsRes] = await Promise.all([getMatches(), getTeams()]);
      if (matchRes.success) setMatches(matchRes.data.matches);
      if (teamsRes.success) setTeams(teamsRes.data.teams);

      if (token) {
        const [predRes, liteRes] = await Promise.all([
          getMyPredictions(token),
          getMyLitePredictions(token)
        ]);

        if (predRes.success) {
          const p: Record<string, string> = {};
          predRes.data.predictions.forEach(x => {
            if (x.predictedSlot) p[x.matchId] = `slot:${x.predictedSlot}`;
            else if (x.predictedWinnerId) p[x.matchId] = x.predictedWinnerId;
          });
          setPicks(p);
        }

        if (liteRes.success) {
          const lp: Record<string, string[]> = {};
          liteRes.data.predictions.forEach((x: any) => {
            lp[x.groupName] = [];
            if (x.team1) lp[x.groupName].push(x.team1.id);
            if (x.team2) lp[x.groupName].push(x.team2.id);
            if (x.team3) lp[x.groupName].push(x.team3.id);
          });
          setLitePicksState(lp);
        }
      } else {
        const savedLite = localStorage.getItem('wc2026_guest_lite_picks');
        if (savedLite) setLitePicksState(JSON.parse(savedLite));
        const savedPro = localStorage.getItem('wc2026_guest_picks');
        if (savedPro) setPicks(JSON.parse(savedPro));
      }
    } catch (err) {
      console.error('Failed to load prediction data', err);
    } finally {
      setLoading(false);
    }
  }, [token, clearState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const matchNumberToId = useMemo(() => {
    const mapping: Record<number, string> = {};
    matches.forEach(m => {
      if (m.matchNumber) mapping[m.matchNumber] = m.id;
    });
    return mapping;
  }, [matches]);

  const resolveSlotToTeam = useCallback((source: any, currentMapping: Record<string, TeamBasic>): TeamBasic | null => {
    if (source.type === 'group_winner') return currentMapping[`group_winner:${source.group}`] || null;
    if (source.type === 'group_runner_up') return currentMapping[`group_runner_up:${source.group}`] || null;
    if (source.type === 'best_third') return currentMapping[`best_third:${source.groups.join('')}`] || null;
    if (source.type === 'match_winner') return currentMapping[`match_winner:${source.matchNumber}`] || null;
    return null;
  }, []);

  const slotTeams = useMemo(() => {
    const mapping: Record<string, TeamBasic> = {};
    
    // 1. Resolve Groups from Lite Picks (Primary source for bracket starts)
    Object.entries(litePicks).forEach(([groupName, teamIds]) => {
      const t1 = teams.find(t => t.id === teamIds[0]);
      const t2 = teams.find(t => t.id === teamIds[1]);
      if (t1) mapping[`group_winner:${groupName}`] = t1;
      if (t2) mapping[`group_runner_up:${groupName}`] = t2;
      
      const t3 = teams.find(t => t.id === teamIds[2]);
      if (t3) mapping[`best_third_candidate:${groupName}`] = t3;
    });

    // 2. Resolve Match Winners Recursively
    // We iterate enough times to cover all knockout rounds (R32 to Final = 5 levels)
    // We run it 6 times to ensure full propagation across recursive dependencies
    for (let i = 0; i < 6; i++) {
      ALL_KNOCKOUT_SLOTS.forEach(slot => {
        const matchId = matchNumberToId[slot.matchNumber];
        
        // Check if there's an actual winner from the backend (admin/real result)
        const match = matches.find(m => m.id === matchId);
        if (match?.actualWinnerId) {
          const actualTeam = teams.find(t => t.id === match.actualWinnerId);
          if (actualTeam) {
            mapping[`match_winner:${slot.matchNumber}`] = actualTeam;
            return;
          }
        }

        // Otherwise check user's prediction for this match
        const pick = matchId ? picks[matchId] : null;
        if (!pick) return;

        let winningTeam: TeamBasic | null = null;
        if (pick === 'slot:1') {
           winningTeam = resolveSlotToTeam(slot.slot1, mapping);
        } else if (pick === 'slot:2') {
           winningTeam = resolveSlotToTeam(slot.slot2, mapping);
        } else {
           winningTeam = teams.find(t => t.id === pick) || null;
        }

        if (winningTeam) {
          mapping[`match_winner:${slot.matchNumber}`] = winningTeam;
        }
      });
    }

    // 3. Resolve Best Thirds (Map the first 8 available candidates to the appropriate slots)
    const allThirdCandidates = ['A','B','C','D','E','F','G','H','I','J','K','L']
      .map(g => mapping[`best_third_candidate:${g}`])
      .filter(Boolean) as TeamBasic[];

    ALL_KNOCKOUT_SLOTS.forEach(slot => {
      [slot.slot1, slot.slot2].forEach(source => {
        if (source.type === 'best_third') {
          const key = `best_third:${source.groups.join('')}`;
          // Find first candidate that belongs to one of the groups allowed for this slot
          const winner = allThirdCandidates.find(t => source.groups.includes(t.groupName || ''));
          if (winner) {
            mapping[key] = winner;
          }
        }
      });
    });

    return mapping;
  }, [litePicks, picks, teams, matches, matchNumberToId, resolveSlotToTeam]);

  const setPick = useCallback((matchId: string, teamId: string) => {
    setPicks(prev => {
      const next = { ...prev, [matchId]: teamId };
      if (!token) localStorage.setItem('wc2026_guest_picks', JSON.stringify(next));
      return next;
    });
  }, [token]);

  const setLitePicks = useCallback((newLitePicks: Record<string, string[]>) => {
    setLitePicksState(newLitePicks);
    if (!token) localStorage.setItem('wc2026_guest_lite_picks', JSON.stringify(newLitePicks));
  }, [token]);

  const resetAll = useCallback(() => {
    setPicks({});
    setLitePicksState({});
    if (!token) {
      localStorage.removeItem('wc2026_guest_picks');
      localStorage.removeItem('wc2026_guest_lite_picks');
    }
  }, [token]);

  const randomizeAll = useCallback(() => {
    // 1. Randomize Group Stage (Lite Mode Data)
    const newLite: Record<string, string[]> = {};
    const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    groups.forEach(g => {
      const groupTeams = teams.filter(t => t.groupName === g);
      if (groupTeams.length >= 3) {
        const shuffled = [...groupTeams].sort(() => 0.5 - Math.random());
        newLite[g] = [shuffled[0].id, shuffled[1].id, shuffled[2].id];
      }
    });

    // 2. Randomize All Matches (Pro/Slot Picks)
    const newPicks: Record<string, string> = {};
    matches.forEach(m => {
      if (!m.isLocked) {
        // Randomly pick team 1 or team 2
        // In knockout, we use slots to ensure it works even before names resolve
        if (m.round === 'GROUP') {
          if (m.team1Id && m.team2Id) {
            newPicks[m.id] = Math.random() > 0.5 ? m.team1Id : m.team2Id;
          }
        } else {
          newPicks[m.id] = Math.random() > 0.5 ? 'slot:1' : 'slot:2';
        }
      }
    });

    setLitePicks(newLite);
    setPicks(newPicks);
    
    if (!token) {
      localStorage.setItem('wc2026_guest_lite_picks', JSON.stringify(newLite));
      localStorage.setItem('wc2026_guest_picks', JSON.stringify(newPicks));
    }
  }, [teams, matches, setLitePicks, token]);

  return (
    <PredictionStateContext.Provider value={{ 
      matches, teams, picks, litePicks, slotTeams, loading, 
      setPick, setLitePicks, randomizeAll, resetAll, refreshData: loadData 
    }}>
      {children}
    </PredictionStateContext.Provider>
  );
}

export function usePredictionState() {
  const context = useContext(PredictionStateContext);
  if (!context) throw new Error('usePredictionState must be used within PredictionStateProvider');
  return context;
}
