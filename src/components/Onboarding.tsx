import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Cpu, ShieldCheck, Zap, Coins, Globe, Key } from 'lucide-react';
import { sound } from './SoundEngine';
import { Language, translations } from '../lib/i18n';

interface OnboardingProps {
  onStart: (playerName: string) => void;
  lang: Language;
  theme?: 'light' | 'dark';
  specialTokens: number;
}

export default function Onboarding({ onStart, lang, theme = 'light', specialTokens }: OnboardingProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(translations[lang].onboarding.error_name);
      sound.playError();
      return;
    }
    sound.playPowerup();
    onStart(trimmed);
  };

  const t = translations[lang].onboarding;
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8">
      {/* Glowing Base Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative flex items-center justify-center mb-8"
      >
        <div className={`absolute w-36 h-36 rounded-full blur-2xl animate-pulse ${
          isDark ? 'bg-[#0052FF]/30' : 'bg-amber-300/30'
        }`}></div>
        {/* Core Base Brand Circle */}
        <div className="w-28 h-28 bg-[#0052FF] rounded-full flex items-center justify-center border-4 border-white shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner relative">
            <div className="w-6 h-6 bg-[#0052FF] rounded-full flex items-center justify-center relative">
            </div>
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
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-[#0052FF] to-amber-500 tracking-tight">
          {translations[lang].header.title}
        </h1>
        <p className="text-xs font-mono text-[#0052FF] mt-2 tracking-widest uppercase font-bold">
          {t.subtitle}
        </p>
        <p className={`mt-4 text-sm max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {t.description}
        </p>
      </motion.div>

      {/* Grid Features explaining the game items */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8"
      >
        {/* Card 1: Gas Pump */}
        <div className={`p-5 rounded-xl flex flex-col items-center text-center border transition-all duration-300 ${
          isDark 
            ? 'bg-slate-900/50 border-slate-800' 
            : 'bg-white border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md hover:shadow-amber-100/40'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${
            isDark 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-50 text-amber-500 border-amber-200'
          }`}>
            <Coins size={20} />
          </div>
          <h3 className={`text-sm font-display font-semibold ${isDark ? 'text-slate-200' : 'text-slate-850 font-bold text-amber-600'}`}>{t.gas_title}</h3>
          <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            {t.gas_desc}
          </p>
        </div>

        {/* Card 2: Validator Node */}
        <div className={`p-5 rounded-xl flex flex-col items-center text-center border transition-all duration-300 ${
          isDark 
            ? 'bg-slate-900/50 border-slate-800' 
            : 'bg-white border-slate-200 shadow-sm hover:border-[#0052FF] hover:shadow-md hover:shadow-blue-100/40'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${
            isDark 
              ? 'bg-[#0052FF]/10 text-blue-400 border-[#0052FF]/20' 
              : 'bg-blue-50 text-[#0052FF] border-blue-200'
          }`}>
            <ShieldCheck size={20} />
          </div>
          <h3 className={`text-sm font-display font-semibold ${isDark ? 'text-slate-200' : 'text-slate-850 font-bold text-[#0052FF]'}`}>{t.val_title}</h3>
          <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            {t.val_desc}
          </p>
        </div>

        {/* Card 3: Optimism Bridge Portal */}
        <div className={`p-5 rounded-xl flex flex-col items-center text-center border transition-all duration-300 ${
          isDark 
            ? 'bg-slate-900/50 border-slate-800' 
            : 'bg-white border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md hover:shadow-purple-100/40'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${
            isDark 
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
              : 'bg-purple-50 text-purple-650 border-purple-200'
          }`}>
            <Zap size={20} />
          </div>
          <h3 className={`text-sm font-display font-semibold ${isDark ? 'text-slate-200' : 'text-slate-850 font-bold text-purple-700'}`}>{t.portal_title}</h3>
          <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
            {t.portal_desc}
          </p>
        </div>

        {/* Card 4: Special Key Tokens (User's Inventory) */}
        <div className={`p-5 rounded-xl flex flex-col items-center text-center border transition-all duration-300 relative overflow-hidden ${
          isDark 
            ? 'bg-slate-900/50 border-amber-500/30' 
            : 'bg-white border-amber-200 shadow-sm hover:border-amber-400 hover:shadow-md hover:shadow-amber-100/40'
        }`}>
          <div className="absolute top-2 right-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md">
            {lang === 'id' ? 'DIPUNYA' : 'OWNED'}
          </div>

          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${
            isDark 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
          }`}>
            <Key size={20} className="animate-pulse text-amber-500" />
          </div>
          <h3 className={`text-sm font-display font-semibold ${isDark ? 'text-slate-200' : 'text-slate-850 font-bold text-amber-600'}`}>
            {lang === 'id' ? 'Kunci Khusus' : 'Special Keys'}
          </h3>
          <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'id' 
              ? `Anda mengumpulkan ${specialTokens} Kunci Khusus. Simpan kunci ini untuk membuka bantuan!`
              : `You have collected ${specialTokens} Special Keys. Spend them to unlock helper features inside the maze!`}
          </p>
        </div>
      </motion.div>

      {/* Start Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className={`w-full p-6 rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 ${
          isDark 
            ? 'bg-slate-900/50 border-slate-800' 
            : 'bg-white border-slate-200 border-t-4 border-t-amber-400 shadow-lg shadow-blue-500/5'
        }`}
      >
        <div className="mb-4">
          <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600 font-bold'}`}>
            {t.input_label}
          </label>
          <input
            type="text"
            maxLength={18}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder={t.input_placeholder}
            className={`w-full border focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 font-mono ${
              isDark 
                ? 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder-slate-600' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
          {error && (
            <p className="text-xs text-rose-500 mt-2 font-mono flex items-center gap-1 font-bold">
              • {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#0052FF] hover:bg-[#0042cc] text-white font-display font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-[#0052FF]/20 group cursor-pointer"
        >
          {t.start_btn}
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className={`flex items-center justify-between mt-6 text-[10px] font-mono border-t pt-4 ${
          isDark ? 'text-slate-500 border-slate-800/60' : 'text-slate-400 border-slate-200'
        }`}>
          <div className="flex items-center gap-1">
            <Cpu size={10} />
            <span>{t.est_confirmation}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={10} />
            <span>{t.base_fees}</span>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
