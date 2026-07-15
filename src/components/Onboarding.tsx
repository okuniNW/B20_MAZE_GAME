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

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-12">
      {/* Decorative Stamp Seal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative flex items-center justify-center mb-8"
      >
        {/* Core Cora Desk-Card Brand Badge */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center border border-deep-navy/15 bg-cloud-white/80 backdrop-blur-md shadow-sm relative z-10 animate-pulse-ring">
          <div className="w-18 h-18 rounded-full border border-dashed border-warm-red/40 flex items-center justify-center relative">
            <span className="font-serif italic font-light text-2xl text-deep-navy">T</span>
            <span className="font-serif italic font-light text-sm text-warm-red relative -top-1">S</span>
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
        <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-deep-navy">
          {translations[lang].header.title}
        </h1>
        <p className="text-xs font-mono text-warm-red mt-3 tracking-widest uppercase font-bold">
          {t.subtitle}
        </p>
        <p className="mt-4 text-sm max-w-md mx-auto leading-relaxed text-deep-navy/70 font-sans">
          {t.description}
        </p>
      </motion.div>

      {/* Grid Features explaining the game items */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8 font-sans"
      >
        {/* Card 1: Gas Pump */}
        <div className="p-5 rounded-xl flex flex-col items-center text-center transition-all duration-300 cora-desk-card hover:cora-desk-card-active group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-cloud-white border border-deep-navy/10 text-warm-red">
            <Coins size={18} />
          </div>
          <h3 className="text-xs font-bold tracking-wider uppercase text-deep-navy">{t.gas_title}</h3>
          <p className="text-[11px] mt-1.5 leading-relaxed text-deep-navy/70">
            {t.gas_desc}
          </p>
        </div>

        {/* Card 2: Validator Node */}
        <div className="p-5 rounded-xl flex flex-col items-center text-center transition-all duration-300 cora-desk-card hover:cora-desk-card-active group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-cloud-white border border-deep-navy/10 text-cerulean-sky">
            <ShieldCheck size={18} />
          </div>
          <h3 className="text-xs font-bold tracking-wider uppercase text-deep-navy">{t.val_title}</h3>
          <p className="text-[11px] mt-1.5 leading-relaxed text-deep-navy/70">
            {t.val_desc}
          </p>
        </div>

        {/* Card 3: Optimism Bridge Portal */}
        <div className="p-5 rounded-xl flex flex-col items-center text-center transition-all duration-300 cora-desk-card hover:cora-desk-card-active group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-cloud-white border border-deep-navy/10 text-deep-navy">
            <Zap size={18} />
          </div>
          <h3 className="text-xs font-bold tracking-wider uppercase text-deep-navy">{t.portal_title}</h3>
          <p className="text-[11px] mt-1.5 leading-relaxed text-deep-navy/70">
            {t.portal_desc}
          </p>
        </div>

        {/* Card 4: Special Key Tokens (User's Inventory) */}
        <div className="p-5 rounded-xl flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 cora-desk-card hover:cora-desk-card-active">
          <div className="absolute top-2 right-2 border border-warm-red/20 text-warm-red text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-white">
            {lang === 'id' ? 'DIPUNYA' : 'OWNED'}
          </div>

          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-cloud-white border border-deep-navy/10 text-warm-red">
            <Key size={18} className="animate-pulse" />
          </div>
          <h3 className="text-xs font-bold tracking-wider uppercase text-deep-navy">
            {lang === 'id' ? 'Kunci Khusus' : 'Special Keys'}
          </h3>
          <p className="text-[11px] mt-1.5 leading-relaxed text-deep-navy/70">
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
        className="w-full p-6 rounded-2xl border-t-2 border-t-warm-red cora-desk-card font-sans"
      >
        <div className="mb-4">
          <label className="block text-xs font-mono uppercase tracking-widest mb-2 text-deep-navy/60 font-bold">
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
            className="w-full border border-deep-navy/15 focus:border-cerulean-sky rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 font-mono bg-white/60 text-deep-navy placeholder-deep-navy/40"
          />
          {error && (
            <p className="text-xs text-warm-red mt-2 font-mono flex items-center gap-1 font-bold">
              • {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full font-sans font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 group cursor-pointer cora-btn-primary shadow-sm"
        >
          {t.start_btn}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-white/90" />
        </button>

        <div className="flex items-center justify-between mt-6 text-[10px] font-mono border-t border-deep-navy/10 pt-4 text-deep-navy/50">
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
