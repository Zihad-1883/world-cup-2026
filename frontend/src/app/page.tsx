import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Trophy, Users, TrendingUp, ChevronRight, Play, Star, Calendar } from 'lucide-react';
import CommentThread from '@/components/comments/CommentThread';

export default function Home() {
   return (
      <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col selection:bg-green-500 selection:text-black">
         <Navbar />

         <main className="flex-1">
            {/* HERO SECTION - NIKE STYLE */}
            <section className="relative min-h-[95vh] flex items-center overflow-hidden border-b border-white/5">
               {/* Background Image with Skewed Overlay */}
               <div className="absolute inset-0 z-0">
                  <img
                     src="/hero.png"
                     className="w-full h-full object-cover object-[70%_20%]"
                     alt="2026 World Cup Hero"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10] via-[#0a0c10]/60 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent z-10" />
                  {/* Diagonal Sharp Accents */}
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-green-500/10 skew-x-[-20deg] translate-x-32 hidden lg:block" />
               </div>

               <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
                  <div className="max-w-3xl">
                     <div className="inline-flex items-center space-x-2 bg-green-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 skew-sharp">
                        <Star className="h-3 w-3 fill-current" />
                        <span>The Future of Football</span>
                     </div>

                     <h1 className="nike-title text-5xl md:text-8xl lg:text-[9rem] mb-6 glow-text tracking-tighter">
                        WHO WILL<br />
                        <span className="text-green-500">BE 2026?</span>
                     </h1>

                     <div className="flex flex-col space-y-4 mb-12">
                        <p className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-white/40">
                           2018 WAS <span className="text-white">FRANCE.</span>
                        </p>
                        <p className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-white/40">
                           2022 WAS <span className="text-white">ARGENTINA.</span>
                        </p>
                        <div className="h-1 w-24 bg-green-500 rounded-full mt-2" />
                     </div>

                     <div className="flex flex-wrap gap-6">
                        <Link href="/predict" className="group flex items-center space-x-4 bg-white text-black px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all hover:bg-green-500 hover:scale-105 active:scale-95">
                           <span>Predict Now</span>
                           <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link href="/bracket" className="flex items-center space-x-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm backdrop-blur-xl transition-all active:scale-95">
                           <Play className="h-5 w-5 text-green-500" />
                           <span>Tournament Flow</span>
                        </Link>
                     </div>
                  </div>
               </div>
            </section>

            {/* NATIONS MARQUEE - REPLACING STATS STRIP */}
            <section className="bg-slate-900 border-y border-white/5 py-8 relative overflow-hidden">
               <div className="flex items-center space-x-12 animate-marquee whitespace-nowrap">
                  {/* First set of flags */}
                  <div className="flex space-x-12 items-center">
                     {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 grayscale hover:grayscale-0 transition-all duration-500 group cursor-default">
                           <div className="w-12 h-8 bg-slate-800 rounded shadow-lg overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
                              <img
                                 src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${['US', 'MX', 'CA', 'AR', 'BR', 'FR', 'GB', 'DE', 'ES', 'IT', 'NL', 'PT', 'BE', 'HR', 'UY', 'CO', 'MA', 'SN', 'JP', 'KR', 'SA', 'AU', 'EC', 'GH', 'PE', 'CH', 'PL', 'DK', 'RS', 'TN', 'CM', 'CR', 'IR', 'QA', 'PL', 'CZ', 'NG', 'EG', 'DZ', 'TR', 'UA', 'SE', 'NO', 'CL', 'PY', 'BO', 'VE', 'IS'][i % 48]}.svg`}
                                 className="w-full h-full object-cover"
                                 alt="Flag"
                              />
                           </div>
                           <span className="nike-title text-lg text-white/20 group-hover:text-green-500 transition-colors">
                              {['USA', 'MEX', 'CAN', 'ARG', 'BRA', 'FRA', 'ENG', 'GER', 'ESP', 'ITA', 'NED', 'POR', 'BEL', 'CRO', 'URU', 'COL', 'MAR', 'SEN', 'JPN', 'KOR', 'KSA', 'AUS', 'ECU', 'GHA', 'PER', 'SUI', 'POL', 'DEN', 'SRB', 'TUN', 'CMR', 'CRC', 'IRN', 'QAT', 'POL', 'CZE', 'NGA', 'EGY', 'ALG', 'TUR', 'UKR', 'SWE', 'NOR', 'CHI', 'PAR', 'BOL', 'VEN', 'ISL'][i % 48]}
                           </span>
                        </div>
                     ))}
                  </div>
                  {/* Duplicate set for seamless looping */}
                  <div className="flex space-x-12 items-center">
                     {Array.from({ length: 48 }).map((_, i) => (
                        <div key={`dup-${i}`} className="flex items-center space-x-4 grayscale hover:grayscale-0 transition-all duration-500 group cursor-default">
                           <div className="w-12 h-8 bg-slate-800 rounded shadow-lg overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
                              <img
                                 src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${['US', 'MX', 'CA', 'AR', 'BR', 'FR', 'GB', 'DE', 'ES', 'IT', 'NL', 'PT', 'BE', 'HR', 'UY', 'CO', 'MA', 'SN', 'JP', 'KR', 'SA', 'AU', 'EC', 'GH', 'PE', 'CH', 'PL', 'DK', 'RS', 'TN', 'CM', 'CR', 'IR', 'QA', 'PL', 'CZ', 'NG', 'EG', 'DZ', 'TR', 'UA', 'SE', 'NO', 'CL', 'PY', 'BO', 'VE', 'IS'][i % 48]}.svg`}
                                 className="w-full h-full object-cover"
                                 alt="Flag"
                              />
                           </div>
                           <span className="nike-title text-lg text-white/20 group-hover:text-green-500 transition-colors">
                              {['USA', 'MEX', 'CAN', 'ARG', 'BRA', 'FRA', 'ENG', 'GER', 'ESP', 'ITA', 'NED', 'POR', 'BEL', 'CRO', 'URU', 'COL', 'MAR', 'SEN', 'JPN', 'KOR', 'KSA', 'AUS', 'ECU', 'GHA', 'PER', 'SUI', 'POL', 'DEN', 'SRB', 'TUN', 'CMR', 'CRC', 'IRN', 'QAT', 'POL', 'CZE', 'NGA', 'EGY', 'ALG', 'TUR', 'UKR', 'SWE', 'NOR', 'CHI', 'PAR', 'BOL', 'VEN', 'ISL'][i % 48]}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* FEATURES - 3 COLUMN IMPACT */}
            <section className="py-32 relative">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Card 1: Predict & Win */}
                     <div className="group relative overflow-hidden rounded-[40px] border border-white/5 bg-slate-900 transition-all hover:border-green-500/50">
                        <div className="aspect-[16/10] overflow-hidden">
                           <img src="/predict_win.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Predict and Win" />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        </div>
                        <div className="relative p-8 -mt-20">
                           <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-green-500/20">
                              <Trophy className="h-6 w-6 text-black" />
                           </div>
                           <h3 className="nike-title text-3xl mb-3 italic">Predict & Win</h3>
                           <p className="text-slate-400 font-medium leading-relaxed mb-6 text-sm">
                              Master the tournament. Predict match scores and dominate the global rankings.
                           </p>
                           <Link href="/predict" className="group/btn inline-flex items-center space-x-2 bg-white text-black px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-green-500">
                              <span>Start Predicting</span>
                              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                           </Link>
                        </div>
                     </div>

                     {/* Card 2: Social Battle */}
                     <div className="group relative overflow-hidden rounded-[40px] border border-white/5 bg-slate-900 transition-all hover:border-green-500/50">
                        <div className="aspect-[16/10] overflow-hidden">
                           <img src="https://plus.unsplash.com/premium_photo-1708286396204-962f52ed545c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Social Prediction" />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        </div>
                        <div className="relative p-8 -mt-20">
                           <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-white/10">
                              <Users className="h-6 w-6 text-black" />
                           </div>
                           <h3 className="nike-title text-3xl mb-3 italic">Social Battle</h3>
                           <p className="text-slate-400 font-medium leading-relaxed mb-6 text-sm">
                              The game is better with friends. Share your bracket and challenge the community.
                           </p>
                           <Link href="/predict" className="group/btn inline-flex items-center space-x-2 bg-white text-black px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-green-500">
                              <span>Join Community</span>
                              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                           </Link>
                        </div>
                     </div>

                     {/* Card 3: Points & Leaderboard */}
                     <div className="group relative overflow-hidden rounded-[40px] border border-white/5 bg-slate-900 transition-all hover:border-green-500/50">
                        <div className="aspect-[16/10] overflow-hidden">
                           <img src="https://plus.unsplash.com/premium_photo-1739057382312-64056c5f093d?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Points and Leaderboard" />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        </div>
                        <div className="relative p-8 -mt-20">
                           <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-green-500/20">
                              <TrendingUp className="h-6 w-6 text-black" />
                           </div>
                           <h3 className="nike-title text-3xl mb-3 italic">Points & <span className="text-green-500">Ranks</span></h3>
                           <p className="text-slate-400 font-medium leading-relaxed mb-6 text-sm">
                              Earn points for every correct prediction. Climb the global leaderboard to the top.
                           </p>
                           <Link href="/stats" className="group/btn inline-flex items-center space-x-2 bg-white text-black px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-green-500">
                              <span>View Rankings</span>
                              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Global Fan Chat Section */}
            <section className="bg-slate-900/40 border-t border-white/5 pt-32 pb-48">
               <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                     <h2 className="nike-title text-6xl mb-4 italic">Global Fan Chat</h2>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Join the conversation with millions of fans worldwide</p>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-[40px] p-8 shadow-2xl overflow-hidden relative">
                     <div className="absolute top-0 right-0 bg-green-500/10 w-64 h-64 blur-3xl rounded-full" />
                     <CommentThread />
                  </div>
               </div>
            </section>
         </main>

         {/* Footer */}
         <footer className="bg-black py-16 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
               <div className="flex items-center justify-center space-x-3 mb-8">
                  <Trophy className="h-8 w-8 text-green-500" />
                  <span className="nike-title text-3xl">WC 2026 Predictions</span>
               </div>
               <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">&copy; 2026 World Cup Fans. Not affiliated with FIFA.</p>
            </div>
         </footer>
      </div>
   );
}
