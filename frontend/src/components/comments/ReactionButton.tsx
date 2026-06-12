'use client';

import { useState } from 'react';
import { Heart, ThumbsUp } from 'lucide-react';
import { reactToComment } from '@/lib/api';
import { ReactionType } from '@/types';

interface ReactionButtonProps {
  commentId: string;
  type: ReactionType;
  count: number;
  isActive: boolean;
  token: string | null;
  onUpdate: (newCounts: { LIKE: number; LOVE: number }, newUserReaction: ReactionType | null) => void;
}

export default function ReactionButton({ 
  commentId, 
  type, 
  count, 
  isActive, 
  token,
  onUpdate 
}: ReactionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!token || loading) return;

    setLoading(true);
    try {
      const res = await reactToComment(token, commentId, type);
      if (res.success) {
        onUpdate(res.data.counts, res.data.reaction?.type || null);
      }
    } catch (err) {
      console.error('Failed to react:', err);
    } finally {
      setLoading(false);
    }
  };

  const Icon = type === 'LIKE' ? ThumbsUp : Heart;
  const activeClass = type === 'LIKE' 
    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
    : 'bg-red-500/10 text-red-500 border-red-500/20';
  
  const inactiveClass = 'bg-slate-900/50 text-slate-500 border-slate-700/50 hover:bg-slate-800 hover:text-slate-300';

  return (
    <button
      onClick={handleClick}
      disabled={!token || loading}
      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
        isActive ? activeClass : inactiveClass
      }`}
    >
      <Icon className={`h-3 w-3 ${isActive ? 'fill-current' : ''} ${loading ? 'animate-pulse' : ''}`} />
      <span>{count}</span>
    </button>
  );
}
