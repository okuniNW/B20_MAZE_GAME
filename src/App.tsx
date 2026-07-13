import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Trophy,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Github,
  Wallet,
  Coins,
  ShieldCheck,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { Difficulty, ScoreEntry } from './types';
import Onboarding from './components/Onboarding';
import MazeBoard from './components/MazeBoard';
import Leaderboard from './components/Leaderboard';
import { sound } from './components/SoundEngine';

const NEWS_TICKER_ITEMS = [
  "⚡ BASE FEES: Rata-rata biaya transaksi di jaringan Base di bawah $0.001 per tx berkat upgrade EIP-4844!",
  "🔵 COINBASE SMART WALLET: Fitur passkey memudahkan jutaan builder onboarding tanpa seed phrase tradisional!",
  "🌐 SUPERCHAIN INTEROP: Interoperabilitas mulus antar jaringan L2 OP Stack dimulai di Base!",
  "🛠️ BASE IS FOR BUILDERS: Jesse Pollak mengumumkan Base Camp Hackathon terbaru untuk para developer Asia!",
  "📈 PROTOCOL GROW: Total Value Locked (TVL) di Base menembus rekor baru seiring bertambahnya aplikasi dApp!",
  "🚀 SPEED BOOSTER: Waktu blokir di Base stabil di 2.0 detik, memproses ribuan transaksi per detik!"
];

export default function App() {
  const [screen, setScreen] = useState<'home' | 'playing' | 'leaderboard'>('home');
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('base_maze_player_name') || '';
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [isMuted, setIsMuted] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Auto-rotate news ticker updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % NEWS_TICKER_ITEMS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMute(nextMuted);
    sound.playMove();
  };

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    localStorage.setItem('base_maze_player_name', name);
    setScreen('playing');
  };

  const handleGameCompleted = (score: ScoreEntry) => {
    sound.playWin();
    setScreen('leaderboard');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-[#0052FF]/30 selection:text-blue-200">
      
      {/* HEADER SECTION */}
      <header className="h-16 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Logo & Brand title */}
          <div 
            onClick={() => { sound.playMove(); setScreen('home'); }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Minimal Base blue/white circle logo */}
            <div className="relative w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center border-2 border-white shadow-md transition-transform duration-300 group-hover:rotate-12">
              <div className="w-4.5 h-4.5 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#0052FF] rounded-full"></div>
              </div>
            </div>

            <div>
              <span className="font-display font-black text-sm tracking-tight flex items-center gap-1.5">
                B20 <span className="text-[#0052FF]">MAZE GAME</span>
              </span>
              <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                Build By Sividelia_okuni6
              </span>
            </div>
          </div>

          {/* Elegant Dark Header Info Badges */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Base Mainnet</span>
            </div>

            {/* Quick utility controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playMove();
                  setScreen(screen === 'leaderboard' ? 'home' : 'leaderboard');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  screen === 'leaderboard'
                    ? 'bg-[#0052FF] hover:bg-[#0042cc] border border-[#0052FF] text-white shadow-lg shadow-[#0052FF]/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <Trophy size={14} />
                <span>Leaderboard</span>
              </button>

              <button
                onClick={handleToggleMute}
                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title={isMuted ? "Unmute sounds" : "Mute sounds"}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN SCREEN ROUTER WITH ANIMATIONS */}
      <main className="flex-grow flex flex-col justify-center py-6">
        <AnimatePresence mode="wait">
          
          {screen === 'home' && (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              {/* Onboarding Widget with nested builder start form */}
              <Onboarding onStart={handleStartGame} />

              {/* LEVEL CONFIGURATION CARDS (Difficulty selector) */}
              <div className="w-full max-w-2xl px-4 mt-2">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Layers size={12} className="text-[#0052FF]" />
                    PILIH STRUKTUR BLOK LABIRIN
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Level 1: Easy */}
                    <button
                      type="button"
                      onClick={() => { sound.playMove(); setDifficulty('standard'); }}
                      className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                        difficulty === 'standard'
                          ? 'bg-[#0052FF]/10 border-[#0052FF] shadow-lg shadow-[#0052FF]/5'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-slate-200">Standard Block</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">10 x 10</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Sempurna untuk uji pemanasan. Transaksi simpel, tanpa jembatan teleportasi.
                      </p>
                    </button>

                    {/* Level 2: Medium */}
                    <button
                      type="button"
                      onClick={() => { sound.playMove(); setDifficulty('batch'); }}
                      className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                        difficulty === 'batch'
                          ? 'bg-[#0052FF]/10 border-[#0052FF] shadow-lg shadow-[#0052FF]/5'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-slate-200">Aggregated Batch</span>
                        <span className="text-[10px] font-mono text-[#0052FF] font-bold">15 x 15</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Skala roll-up teragregasi. Memasukkan Bridge Portal L1 ↔ L2 untuk teleportasi.
                      </p>
                    </button>

                    {/* Level 3: Hard */}
                    <button
                      type="button"
                      onClick={() => { sound.playMove(); setDifficulty('superchain'); }}
                      className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                        difficulty === 'superchain'
                          ? 'bg-[#0052FF]/10 border-[#0052FF] shadow-lg shadow-[#0052FF]/5'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-slate-200">Superchain Block</span>
                        <span className="text-[10px] font-mono text-purple-400 font-bold">21 x 21</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Labirin padat Superchain. Direkomendasikan bagi builder pro dengan TPS tinggi!
                      </p>
                    </button>

                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'playing' && (
            <motion.div
              key="playing-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <MazeBoard
                playerName={playerName}
                difficulty={difficulty}
                onGameCompleted={handleGameCompleted}
                onBackToMenu={() => setScreen('home')}
              />
            </motion.div>
          )}

          {screen === 'leaderboard' && (
            <motion.div
              key="leaderboard-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Leaderboard 
                onBackToMenu={() => setScreen('home')} 
                currentDifficulty={difficulty}
                playerName={playerName}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER & LIVE BLOCK UPDATES TICKER */}
      <footer className="border-t border-slate-800 bg-[#020617] py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* News Ticker Panel */}
          <div className="w-full md:max-w-2xl bg-slate-900/30 border border-slate-800/80 rounded-xl px-3.5 py-2 overflow-hidden flex items-center gap-3">
            <span className="bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/20 text-[9px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 animate-pulse-ring">
              LIVE BROADCAST
            </span>
            
            <div className="relative flex-grow h-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tickerIndex}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs font-mono text-slate-400 absolute inset-x-0 truncate"
                >
                  {NEWS_TICKER_ITEMS[tickerIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Copyright details & contract address inside Elegant Dark Theme */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] shadow-[0_0_6px_#0052FF]"></span>
              <span>B20 MAZE GAME</span>
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>Build By Sividelia_okuni6</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contract: 0xBASE...0001</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
