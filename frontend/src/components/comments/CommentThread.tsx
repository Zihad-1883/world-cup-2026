'use client';

import { useState, useEffect, useCallback } from 'react';
import { getComments, deleteComment, postComment } from '@/lib/api';
import { CommentWithReactions, ReactionType } from '@/types';
import Avatar from '../ui/Avatar';
import CommentForm from './CommentForm';
import ReactionButton from './ReactionButton';
import { Trash2, MessageSquare, Clock, Reply, Pencil, X, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CommentThreadProps {
  matchId?: string;
}

export default function CommentThread({ matchId }: CommentThreadProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<CommentWithReactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      if (!token) { setLoading(false); return; }
      const res = await getComments(token, matchId);
      if (res.success) setComments(res.data.comments);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  }, [token, matchId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleCommentPosted = (newComment: CommentWithReactions) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const handleReactionUpdate = (commentId: string, newCounts: { LIKE: number; LOVE: number }, newUserReaction: ReactionType | null) => {
    setComments((prev) => prev.map(c =>
      c.id === commentId ? { ...c, reactionCounts: newCounts, userReaction: newUserReaction } : c
    ));
  };

  const handleDelete = async (commentId: string) => {
    if (!token || !window.confirm('Delete this comment?')) return;
    try {
      const res = await deleteComment(token, commentId);
      if (res.success) setComments((prev) => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!token || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await postComment(token, { content: replyText.trim(), matchId, parentId });
      if (res.success) {
        setComments((prev) => [res.data.comment, ...prev]);
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const startEdit = (comment: CommentWithReactions) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => { setEditingId(null); setEditText(''); };

  const handleEditSave = (commentId: string) => {
    // Optimistic UI update — wire to a PATCH API if available
    setComments((prev) => prev.map(c =>
      c.id === commentId ? { ...c, content: editText } : c
    ));
    cancelEdit();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Building the comment tree
  const buildTree = (allComments: CommentWithReactions[]) => {
    const map: Record<string, CommentWithReactions & { replies: CommentWithReactions[] }> = {};
    const roots: (CommentWithReactions & { replies: CommentWithReactions[] })[] = [];

    allComments.forEach(c => {
      map[c.id] = { ...c, replies: [] };
    });

    allComments.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  };

  const commentTree = buildTree(comments);

  const renderComment = (comment: CommentWithReactions & { replies?: CommentWithReactions[] }, isReply = false) => (
    <div key={comment.id} className={`group relative flex space-x-4 animate-in slide-in-from-left-2 duration-300 ${isReply ? 'ml-12 mt-4' : ''}`}>
      <Avatar url={comment.author.avatarUrl} username={comment.author.username} size={isReply ? "sm" : "md"} />

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-sm font-black text-white">{comment.author.username}</span>
            {comment.author.role === 'ADMIN' && (
              <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">Team Official</span>
            )}
            <span className="flex items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              <Clock className="h-2.5 w-2.5 mr-1" />
              {formatTime(comment.createdAt)}
            </span>
          </div>

          <div className="flex items-center space-x-1 lg:opacity-0 group-hover:opacity-100 transition-all">
            {user && !isReply && (
              <button
                onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyText(''); }}
                className="p-2 text-slate-500 hover:text-green-500 hover:bg-green-500/10 rounded-xl transition-all active:scale-90"
                title="Reply"
              >
                <Reply className="h-3.5 w-3.5" />
              </button>
            )}
            {user?.id === comment.userId && (
              <button
                onClick={() => startEdit(comment)}
                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all active:scale-90"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {(user?.id === comment.userId || user?.role === 'ADMIN') && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {editingId === comment.id ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-green-500/40 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-green-500 transition-all resize-none font-medium"
            />
            <div className="flex space-x-2">
              <button onClick={() => handleEditSave(comment.id)} className="flex items-center space-x-1.5 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-green-400">
                <Check className="h-3 w-3" /> <span>Save</span>
              </button>
              <button onClick={cancelEdit} className="flex items-center space-x-1.5 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                <X className="h-3 w-3" /> <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-slate-300 text-sm leading-relaxed shadow-sm hover:border-white/10 transition-colors">
            {comment.content}
          </div>
        )}

        <div className="flex items-center space-x-2 pt-1">
          <ReactionButton
            commentId={comment.id} type="LIKE"
            count={comment.reactionCounts.LIKE}
            isActive={comment.userReaction === 'LIKE'}
            token={token}
            onUpdate={(counts, ur) => handleReactionUpdate(comment.id, counts, ur)}
          />
          <ReactionButton
            commentId={comment.id} type="LOVE"
            count={comment.reactionCounts.LOVE}
            isActive={comment.userReaction === 'LOVE'}
            token={token}
            onUpdate={(counts, ur) => handleReactionUpdate(comment.id, counts, ur)}
          />
        </div>

        {replyingTo === comment.id && (
          <div className="mt-3 border-l-2 border-green-500/30 pl-4 space-y-2 animate-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">
              Replying to @{comment.author.username}
            </p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-green-500 transition-all resize-none"
            />
            <div className="flex space-x-2">
              <button onClick={() => handleReplySubmit(comment.id)} disabled={replyLoading || !replyText.trim()} className="bg-green-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                Post Reply
              </button>
              <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 pt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
          <MessageSquare className="h-5 w-5 mr-3 text-green-500" />
          Fan Discussion
        </h3>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
          {comments.length} Thoughts
        </span>
      </div>

      <CommentForm matchId={matchId} token={token} user={user} onCommentPosted={handleCommentPosted} />

      <div className="space-y-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Loading thoughts...</p>
          </div>
        ) : comments.length > 0 ? (
          commentTree.map(comment => renderComment(comment))
        ) : (
          <div className="py-20 text-center bg-white/[0.02] rounded-[40px] border border-dashed border-white/5">
            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-6 w-6 text-slate-600" />
            </div>
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">No comments yet</h4>
            <p className="text-slate-600 text-xs font-medium mt-1 italic">Be the first to share your expert analysis!</p>
          </div>
        )}
      </div>
    </div>
  );
}
