'use client';

import { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { postComment } from '@/lib/api';
import Avatar from '../ui/Avatar';
import { UserPublic } from '@/types';

interface CommentFormProps {
  matchId?: string;
  token: string | null;
  user: UserPublic | null;
  onCommentPosted: (comment: any) => void;
}

export default function CommentForm({ matchId, token, user, onCommentPosted }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !content.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await postComment(token, { content: content.trim(), matchId });
      if (res.success) {
        setContent('');
        onCommentPosted(res.data.comment);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          Please <a href="/login" className="text-green-500 hover:underline">login</a> to join the discussion
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start space-x-4">
        <Avatar url={user.avatarUrl} username={user.username} size="md" className="ring-2 ring-slate-800 ring-offset-2 ring-offset-slate-900" />
        <div className="flex-1 space-y-2">
          <div className="relative group">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={500}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-green-500 transition-all resize-none shadow-inner group-hover:bg-slate-800"
              rows={3}
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-black text-slate-600 uppercase tracking-widest pointer-events-none">
              {content.length}/500
            </div>
          </div>

          <div className="flex items-center justify-between">
            {error && (
              <div className="flex items-center text-red-500 text-[10px] font-bold uppercase tracking-widest">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </div>
            )}
            <div /> {/* Spacer */}
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-green-900/20 flex items-center space-x-2 active:scale-95"
            >
              {loading ? (
                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Post</span>
                  <Send className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
