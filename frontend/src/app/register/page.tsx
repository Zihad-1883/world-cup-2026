'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { register as apiRegister } from '@/lib/api';
import { Trophy, Mail, Lock, User, AlertCircle, ArrowRight, Link as LinkIcon } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiRegister({ username, email, password, avatarUrl });
      if (res.success) {
        login(res.data.user, res.data.token);
        
        // Check for guest picks to submit (Pro matches)
        const guestPicks = localStorage.getItem('wc2026_guest_picks');
        if (guestPicks) {
          const { submitPredictions } = await import('@/lib/api');
          const picks = JSON.parse(guestPicks);
          const predArray = Object.entries(picks).map(([matchId, predictedWinnerId]) => ({
            matchId,
            predictedWinnerId: predictedWinnerId as string
          }));
          await submitPredictions(res.data.token, predArray);
          localStorage.removeItem('wc2026_guest_picks');
        }

        // Check for Lite mode guest picks
        const guestLitePicks = localStorage.getItem('wc2026_guest_lite_picks');
        if (guestLitePicks) {
          const { submitLitePredictions } = await import('@/lib/api');
          const picks = JSON.parse(guestLitePicks);
          await submitLitePredictions(res.data.token, picks);
          localStorage.removeItem('wc2026_guest_lite_picks');
        }

        router.push('/predict');
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-green-500 selection:text-black">
      {/* Background flag blur - Cinematic */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2546&auto=format&fit=crop" 
          alt="" 
          className="w-full h-full object-cover blur-[100px] scale-150 rotate-[10deg]" 
        />
      </div>

      <Link href="/" className="flex items-center space-x-4 mb-12 group relative z-10">
        <div className="bg-green-500 p-3 rounded-2xl rotate-[-10deg] group-hover:rotate-0 transition-transform">
          <Trophy className="h-8 w-8 text-black" />
        </div>
        <span className="nike-title text-4xl tracking-tighter text-white italic">WC <span className="text-green-500">2026</span></span>
      </Link>

      <div className="w-full max-w-md glass-panel rounded-[40px] border border-white/5 p-10 shadow-2xl relative overflow-hidden group/card z-10">
        {/* Aesthetic decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover/card:bg-green-500/10 transition-colors" />
        
        <div className="relative z-10">
          <h2 className="nike-title text-3xl text-white italic tracking-tighter mb-2">Create <span className="text-green-500">Account</span></h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-10">Join the elite fan community.</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center text-red-500 text-[10px] font-black uppercase tracking-widest relative z-10">
            <AlertCircle className="h-4 w-4 mr-3" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Codename</label>
            <div className="relative group/input">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/input:text-green-500 transition-colors" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-green-500 transition-all font-bold text-sm tracking-tight placeholder:text-slate-700"
                placeholder="SOCCER_FAN_2026"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Email Intelligence</label>
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/input:text-green-500 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-green-500 transition-all font-bold text-sm tracking-tight placeholder:text-slate-700"
                placeholder="NAME@EXAMPLE.COM"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Security Key</label>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/input:text-green-500 transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-green-500 transition-all font-bold text-sm tracking-tight placeholder:text-slate-700"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Avatar Protocol (Optional)</label>
            <div className="relative group/input">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/input:text-green-500 transition-colors" />
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-green-500 transition-all font-bold text-sm tracking-tight placeholder:text-slate-700"
                placeholder="HTTPS://EXAMPLE.COM/PHOTO.JPG"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-green-500 disabled:opacity-50 font-black py-4 rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center space-x-3 uppercase tracking-[0.2em] text-[10px]"
          >
            {loading ? (
               <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>Initialize Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-white/5 text-center relative z-10">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Already Registered?{' '}
            <Link href="/login" className="text-green-500 hover:text-white transition-colors ml-2 underline underline-offset-4">
              Return to Base
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
