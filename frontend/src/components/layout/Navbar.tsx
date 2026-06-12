'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import { Trophy, LogIn, UserPlus, LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react';
import LiveTicker from './LiveTicker';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
    { href: '/predict', label: 'Predict' },
    { href: '/bracket', label: 'Bracket' },
    { href: '/stats', label: 'Stats' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#0a0c10]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="bg-green-500 p-2 rounded-xl rotate-[-10deg] group-hover:rotate-0 transition-transform">
                  <Trophy className="h-6 w-6 text-black" />
                </div>
                <span className="nike-title text-2xl tracking-tighter text-white hidden sm:block italic">
                  WC <span className="text-green-500">2026</span>
                </span>
              </Link>
              
              <div className="hidden lg:ml-12 lg:flex lg:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${
                      isActive(link.href) 
                        ? 'text-green-500' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <div className="absolute -bottom-7 left-0 right-0 h-1 bg-green-500 rounded-full glow-text" />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-6">
                {user ? (
                  <div className="flex items-center space-x-6">
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
                        title="Admin Dashboard"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                      </Link>
                    )}
                    
                    <Link href="/profile" className="flex items-center space-x-4 group">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-green-400 transition-colors">
                          {user.username}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          {user.role} Profile
                        </p>
                      </div>
                      <div className="ring-2 ring-transparent group-hover:ring-green-500 rounded-xl transition-all p-0.5">
                        <Avatar url={user.avatarUrl} username={user.username} size="sm" />
                      </div>
                    </Link>

                    <button
                      onClick={() => logout()}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all border border-transparent hover:border-red-500/10"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-200 hover:text-white transition-all bg-white/5 rounded-xl border border-white/5"
                    >
                      <LogIn className="h-4 w-4" />
                      <span className="hidden sm:inline">Login</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center space-x-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-green-500 rounded-xl transition-all shadow-xl shadow-white/5 active:scale-95"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Join Elite</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-20 bg-[#0a0c10] z-[99] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    isActive(link.href)
                      ? 'bg-green-500 text-black'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-6 border-t border-white/5 space-y-4">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar url={user.avatarUrl} username={user.username} size="sm" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-green-500">{user.username}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{user.role}</p>
                        </div>
                      </div>
                      <Settings className="h-4 w-4 text-slate-500" />
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 p-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center space-x-3 p-4 bg-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout Account</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 py-4 bg-white/5 text-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 py-4 bg-green-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Join</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <LiveTicker />
    </>
  );
}
