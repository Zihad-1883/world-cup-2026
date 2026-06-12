'use client';

import Link from 'next/link';
import { Trophy, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-green-500 selection:text-black">
      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-500/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center space-x-4 mb-16 group relative z-10">
        <div className="bg-green-500 p-3 rounded-2xl rotate-[-10deg] group-hover:rotate-0 transition-transform duration-300">
          <Trophy className="h-7 w-7 text-black" />
        </div>
        <span className="nike-title text-3xl tracking-tighter text-white italic">
          WC <span className="text-green-500">2026</span>
        </span>
      </Link>

      {/* Main content */}
      <div className="relative z-10 max-w-3xl w-full text-center">
        {/* Image + 404 hero */}
        <div className="relative mb-12 group">
          {/* 404 giant text behind */}
          <div
            className="nike-title text-[160px] sm:text-[220px] text-white/[0.04] select-none absolute inset-0 flex items-center justify-center leading-none pointer-events-none"
            aria-hidden="true"
          >
            404
          </div>

          {/* Image */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-500/20 rounded-[40px] blur-3xl scale-90 group-hover:scale-100 transition-transform duration-700" />
            <img
              src="/404-image.jpg"
              alt="404 - Page Not Found"
              className="relative z-10 w-72 h-72 sm:w-96 sm:h-96 object-cover rounded-[40px] border border-white/10 shadow-2xl mx-auto group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>
        </div>

        {/* Text */}
        <div className="glass-panel rounded-[40px] border border-white/5 p-10 sm:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 blur-[80px] rounded-full -mr-16 -mt-16" />

          <div className="relative z-10">
            <span className="inline-block bg-green-500 text-black text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-xl mb-6 rotate-[-2deg]">
              Error 404
            </span>

            <h1 className="nike-title text-5xl sm:text-7xl text-white italic tracking-tighter mb-4">
              Page <span className="text-green-500">Not Found</span>
            </h1>

            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-12 max-w-md mx-auto leading-relaxed">
              The match you&apos;re looking for has been relocated, cancelled, or never existed. Return to the main stadium.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="flex items-center space-x-3 bg-white text-black hover:bg-green-500 font-black uppercase tracking-[0.2em] text-[10px] px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95 w-full sm:w-auto justify-center"
              >
                <Home className="h-4 w-4" />
                <span>Return to Stadium</span>
              </Link>
              <Link
                href="/predict"
                className="flex items-center space-x-3 bg-white/5 text-white hover:bg-white/10 border border-white/10 font-black uppercase tracking-[0.2em] text-[10px] px-8 py-4 rounded-2xl transition-all active:scale-95 w-full sm:w-auto justify-center"
              >
                <Search className="h-4 w-4" />
                <span>Make Predictions</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-slate-700 text-[9px] font-black uppercase tracking-[0.5em] relative z-10">
        &copy; 2026 FIFA World Cup Prediction Intelligence
      </p>
    </div>
  );
}
