import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Cpu, ShieldCheck, Zap, Coins, Globe } from 'lucide-react';
import { sound } from './SoundEngine';

interface OnboardingProps {
  onStart: (playerName: string) => void;
}

export default function Onboarding({ onStart }: OnboardingProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Masukkan nama builder Anda untuk melanjutkan!');
      sound.playError();
      return;
    }
    sound.playPowerup();
    onStart(trimmed);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8">
      {/* Glowing Base Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative flex items-center justify-center mb-8"
      >
        <div className="absolute w-36 h-36 bg-[#0052FF]/30 rounded-full blur-2xl animate-pulse"></div>
        {/* Core Base Brand Circle */}
        <div className="w-28 h-28 bg-[#0052FF] rounded-full flex items-center justify-center border-4 border-white shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
            <div className="w-6 h-6 bg-[#0052FF] rounded-full"></div>
          </div>
        </div>
      </motion.div>

      {/* Headings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-[#0052FF] to-indigo-300 tracking-tight">
          B20 MAZE GAME
        </h1>
        <p className="text-xs font-mono text-[#0052FF] mt-2 tracking-widest uppercase font-bold">
          Build By Sividelia_okuni6
        </p>
        <p className="text-slate-400 mt-4 text-sm max-w-md mx-auto leading-relaxed">
          Uji kecepatan transaksi Anda di jaringan <strong className="text-blue-300">Base</strong>! Navigasikan paket transaksi melewati firewall dan kemacetan jaringan untuk dikonfirmasi dalam sebuah blok baru.
        </p>
      </motion.div>

      {/* Grid Features explaining the game items */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8"
      >
        {/* Card 1: Gas Pump */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-3 border border-emerald-500/20">
            <Coins size={20} />
          </div>
          <h3 className="text-sm font-display font-semibold text-slate-200">Kumpulkan Gas (Gwei)</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Ambil token gas untuk memotong biaya transaksi dan meningkatkan skor TPS.
          </p>
        </div>

        {/* Card 2: Validator Node */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-[#0052FF]/10 text-blue-400 rounded-lg flex items-center justify-center mb-3 border border-[#0052FF]/20">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-sm font-display font-semibold text-slate-200">Validator Booster</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Dapatkan validator token. Tekan <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-blue-300">SPACE</span> untuk menghancurkan 1 tembok penghalang!
          </p>
        </div>

        {/* Card 3: Optimism Bridge Portal */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center mb-3 border border-purple-500/20">
            <Zap size={20} />
          </div>
          <h3 className="text-sm font-display font-semibold text-slate-200">Superchain Portal</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Gunakan portal jembatan L1 ↔ L2 untuk melakukan teleportasi melintasi labirin.
          </p>
        </div>
      </motion.div>

      {/* Start Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm"
      >
        <div className="mb-4">
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Nama Builder Base Anda
          </label>
          <input
            type="text"
            maxLength={18}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Contoh: BasedDev, CoinbaseEnjoyer"
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 font-mono"
          />
          {error && (
            <p className="text-xs text-rose-400 mt-2 font-mono flex items-center gap-1">
              • {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#0052FF] hover:bg-[#0042cc] text-white font-display font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-[#0052FF]/20 group cursor-pointer"
        >
          Mulai Transaksi (Speedrun)
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center justify-between mt-6 text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-4">
          <div className="flex items-center gap-1">
            <Cpu size={10} />
            <span>EST CONFIRMATION: 2.0s</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={10} />
            <span>BASE FEES: &lt;$0.01</span>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
