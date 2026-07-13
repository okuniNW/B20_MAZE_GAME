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
  ExternalLink,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { Difficulty, ScoreEntry } from './types';
import Onboarding from './components/Onboarding';
import MazeBoard from './components/MazeBoard';
import Leaderboard from './components/Leaderboard';
import { sound } from './components/SoundEngine';
import { Language, translations } from './lib/i18n';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'playing' | 'leaderboard'>('home');
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('base_maze_lang') as Language) || 'en';
  });
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('base_maze_player_name') || '';
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [isMuted, setIsMuted] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('base_maze_theme') as 'light' | 'dark') || 'light';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [gameMode, setGameMode] = useState<'classic' | 'campaign'>('campaign');
  const [campaignLevel, setCampaignLevel] = useState<number>(1);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    return Number(localStorage.getItem('base_maze_unlocked_level') || '1');
  });

  // Auto-rotate news ticker updates
  useEffect(() => {
    const tickers = translations[lang].news_ticker;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [lang]);

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

  const handleLevelCompleted = (nextLvl: number) => {
    sound.playPowerup();
    setCampaignLevel(nextLvl);
    const currentUnlocked = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
    setUnlockedLevel(currentUnlocked);
  };

  const handleBackToMenu = () => {
    const currentUnlocked = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
    setUnlockedLevel(currentUnlocked);
    setScreen('home');
  };

  const handleGameCompleted = (score: ScoreEntry) => {
    sound.playWin();
    setScreen('leaderboard');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-[#0052FF]/30 ${
      isDark ? 'bg-[#020617] text-slate-100 selection:text-blue-200' : 'bg-slate-50 text-slate-900 selection:text-blue-800'
    }`}>
      
      {/* HEADER SECTION */}
      <header className={`h-16 border-b sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        isDark ? 'border-slate-800 bg-[#020617]/80 text-slate-100' : 'border-slate-200 bg-white/80 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* DESKTOP HEADER (hidden on mobile, visible on md+) */}
          <div className="hidden md:flex items-center justify-between w-full h-full">
            
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
                  {translations[lang].header.title}
                </span>
                <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                  {translations[lang].header.subtitle}
                </span>
              </div>
            </div>

            {/* Elegant Dark Header Info Badges & controls */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {translations[lang].header.base_mainnet}
                </span>
              </div>

              {/* Quick utility controls */}
              <div className="flex items-center gap-2">
                {/* Language Selector */}
                <div className={`flex items-center border rounded-lg p-0.5 gap-0.5 mr-1 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  {(['en', 'id', 'zh', 'fr'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        sound.playMove();
                        setLang(l);
                        localStorage.setItem('base_maze_lang', l);
                      }}
                      className={`px-1.5 py-1 rounded text-[9px] font-mono uppercase font-black transition-all cursor-pointer ${
                        lang === l
                          ? 'bg-[#0052FF] text-white shadow-sm'
                          : isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                      title={l === 'en' ? 'English' : l === 'id' ? 'Bahasa Indonesia' : l === 'zh' ? '中文' : 'Français'}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Leaderboard */}
                <button
                  onClick={() => {
                    sound.playMove();
                    setScreen(screen === 'leaderboard' ? 'home' : 'leaderboard');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    screen === 'leaderboard'
                      ? 'bg-[#0052FF] hover:bg-[#0042cc] border border-[#0052FF] text-white shadow-lg shadow-[#0052FF]/20'
                      : isDark
                        ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  <Trophy size={14} />
                  <span>{translations[lang].header.leaderboard}</span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    sound.playPowerup();
                    const nextTheme = theme === 'dark' ? 'light' : 'dark';
                    setTheme(nextTheme);
                    localStorage.setItem('base_maze_theme', nextTheme);
                  }}
                  className={`p-1.5 border rounded-lg transition cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`}
                  title={isDark ? translations[lang].header.theme_light : translations[lang].header.theme_dark}
                >
                  {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
                </button>

                {/* Mute Button */}
                <button
                  onClick={handleToggleMute}
                  className={`p-1.5 border rounded-lg transition cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`}
                  title={isMuted ? translations[lang].header.unmute : translations[lang].header.mute}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE HEADER (visible on mobile, hidden on md+) */}
          <div className="flex md:hidden w-full items-center justify-between">
            {/* Logo */}
            <div 
              onClick={() => { sound.playMove(); setScreen('home'); }}
              className="flex items-center cursor-pointer group"
            >
              <div className="relative w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center border-2 border-white shadow-md transition-transform duration-300 group-hover:rotate-12">
                <div className="w-4.5 h-4.5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#0052FF] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Name/Title */}
            <div 
              className="flex flex-col items-center justify-center flex-grow mx-2 text-center select-none"
            >
              <span className={`font-display font-black text-xs tracking-tight leading-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {translations[lang].header.title}
              </span>
              <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                {translations[lang].header.subtitle}
              </span>
            </div>

            {/* Dropdown Menu on Right */}
            <div className="relative">
              <button
                onClick={() => { sound.playMove(); setIsMenuOpen(!isMenuOpen); }}
                className={`p-2 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
                }`}
                aria-label="Toggle menu"
              >
                <Menu size={16} />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-2 w-60 rounded-2xl border p-4 shadow-xl z-50 flex flex-col gap-3 ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-slate-200' 
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      {/* Language selection header */}
                      <div>
                        <span className="block text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                          {lang === 'id' ? 'Bahasa / Language' : 'Language / Bahasa'}
                        </span>
                        <div className={`flex items-center w-full border rounded-xl p-0.5 gap-0.5 ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                        }`}>
                          {(['en', 'id', 'zh', 'fr'] as Language[]).map((l) => (
                            <button
                              key={l}
                              onClick={() => {
                                sound.playMove();
                                setLang(l);
                                localStorage.setItem('base_maze_lang', l);
                                setIsMenuOpen(false);
                              }}
                              className={`flex-1 py-1 rounded text-[10px] font-mono uppercase font-black transition-all cursor-pointer ${
                                lang === l
                                  ? 'bg-[#0052FF] text-white shadow-sm'
                                  : isDark
                                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                              }`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={`h-px ${isDark ? 'bg-slate-800/60' : 'bg-slate-200/80'}`} />

                      {/* Leaderboard button */}
                      <button
                        onClick={() => {
                          sound.playMove();
                          setScreen(screen === 'leaderboard' ? 'home' : 'leaderboard');
                          setIsMenuOpen(false);
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-display font-semibold flex items-center justify-between border transition cursor-pointer ${
                          screen === 'leaderboard'
                            ? 'bg-[#0052FF] border-[#0052FF] text-white shadow-md'
                            : isDark
                              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Trophy size={14} />
                          {translations[lang].header.leaderboard}
                        </span>
                        <ChevronDown size={14} className="opacity-40 -rotate-90" />
                      </button>

                      {/* Sound Toggle */}
                      <button
                        onClick={() => {
                          handleToggleMute();
                          setIsMenuOpen(false);
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-display font-semibold flex items-center gap-2 transition cursor-pointer border ${
                          isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300'
                        }`}
                      >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        <span>
                          {isMuted ? translations[lang].header.unmute : translations[lang].header.mute}
                        </span>
                      </button>

                      {/* Light/Dark mode toggle */}
                      <button
                        onClick={() => {
                          sound.playPowerup();
                          const nextTheme = theme === 'dark' ? 'light' : 'dark';
                          setTheme(nextTheme);
                          localStorage.setItem('base_maze_theme', nextTheme);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-display font-semibold flex items-center gap-2 transition cursor-pointer border ${
                          isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300'
                        }`}
                      >
                        {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
                        <span>
                          {isDark ? translations[lang].header.theme_light : translations[lang].header.theme_dark}
                        </span>
                      </button>

                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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
              <Onboarding onStart={handleStartGame} lang={lang} theme={theme} />

              {/* LEVEL CONFIGURATION CARDS (Difficulty selector) */}
              <div className="w-full max-w-2xl px-4 mt-2">
                <div className={`p-6 rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-900/50 border-slate-800' 
                    : 'bg-white border-slate-200 border-t-4 border-t-amber-400 shadow-lg shadow-blue-500/5'
                }`}>
                  <h3 className={`text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-600 font-bold'
                  }`}>
                    <Layers size={12} className="text-[#0052FF]" />
                    {translations[lang].difficulty.choose_structure}
                  </h3>

                  {/* MODE TABS */}
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-4 border border-slate-200/50 dark:border-slate-800/50">
                    <button
                      type="button"
                      onClick={() => { sound.playMove(); setGameMode('campaign'); }}
                      className={`flex-1 py-2 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
                        gameMode === 'campaign'
                          ? 'bg-[#0052FF] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      🏆 {translations[lang].difficulty.campaign_tab}
                    </button>
                    <button
                      type="button"
                      onClick={() => { sound.playMove(); setGameMode('classic'); }}
                      className={`flex-1 py-2 text-xs font-display font-bold rounded-lg transition-all cursor-pointer ${
                        gameMode === 'classic'
                          ? 'bg-[#0052FF] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      ⚡ {translations[lang].difficulty.classic_tab}
                    </button>
                  </div>

                  {gameMode === 'campaign' ? (
                    <div>
                      {/* Campaign summary */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-mono font-bold uppercase tracking-wide flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {translations[lang].difficulty.campaign_progress}: <span className="text-[#0052FF]">{unlockedLevel} / 50</span>
                        </span>
                        <span className="text-[11px] font-mono text-[#0052FF] font-bold">
                          {Math.round((unlockedLevel / 50) * 100)}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden mb-3 border border-slate-200/20">
                        <div
                          className="h-full bg-gradient-to-r from-[#0052FF] to-sky-400 rounded-full transition-all duration-500"
                          style={{ width: `${(unlockedLevel / 50) * 100}%` }}
                        ></div>
                      </div>

                      <p className={`text-[11px] mb-4 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        {translations[lang].difficulty.campaign_desc}
                      </p>

                      {/* 1 - 50 Level Grid */}
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-52 overflow-y-auto pr-1">
                        {Array.from({ length: 50 }).map((_, i) => {
                          const lvl = i + 1;
                          const isUnlocked = lvl <= unlockedLevel;
                          const isSelected = lvl === campaignLevel;
                          return (
                            <button
                              key={lvl}
                              type="button"
                              disabled={!isUnlocked}
                              onClick={() => {
                                sound.playMove();
                                setCampaignLevel(lvl);
                              }}
                              className={`relative py-2 rounded-lg text-center text-xs font-mono font-extrabold border transition-all flex flex-col items-center justify-center cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0052FF] border-[#0052FF] text-white shadow-md shadow-blue-500/20 scale-105 z-10'
                                  : isUnlocked
                                    ? isDark
                                      ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-[#0052FF]'
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#0052FF] hover:bg-blue-50/20 shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-400/30 dark:text-slate-600/30 cursor-not-allowed'
                              }`}
                            >
                              {isUnlocked ? (
                                <span>{lvl}</span>
                              ) : (
                                <span className="text-[10px]">🔒</span>
                              )}
                              {isUnlocked && lvl < unlockedLevel && (
                                <span className="absolute bottom-0.5 right-1 text-[7px] text-emerald-500 font-bold">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
                      
                      {/* Level 1: Easy */}
                      <button
                        type="button"
                        onClick={() => { sound.playMove(); setDifficulty('standard'); }}
                        className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                          difficulty === 'standard'
                            ? isDark
                              ? 'bg-[#0052FF]/10 border-[#0052FF] shadow-lg shadow-[#0052FF]/5'
                              : 'bg-blue-50 border-2 border-[#0052FF] shadow-md shadow-blue-500/5'
                            : isDark
                              ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-display font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{translations[lang].difficulty.easy_title}</span>
                          <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>10 x 10</span>
                        </div>
                        <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          {translations[lang].difficulty.easy_desc}
                        </p>
                      </button>

                      {/* Level 2: Medium */}
                      <button
                        type="button"
                        onClick={() => { sound.playMove(); setDifficulty('batch'); }}
                        className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                          difficulty === 'batch'
                            ? isDark
                              ? 'bg-[#0052FF]/10 border-[#0052FF] shadow-lg shadow-[#0052FF]/5'
                              : 'bg-blue-50 border-2 border-[#0052FF] shadow-md shadow-blue-500/5'
                            : isDark
                              ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-display font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{translations[lang].difficulty.medium_title}</span>
                          <span className="text-[10px] font-mono text-[#0052FF] font-bold">15 x 15</span>
                        </div>
                        <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          {translations[lang].difficulty.medium_desc}
                        </p>
                      </button>

                      {/* Level 3: Hard */}
                      <button
                        type="button"
                        onClick={() => { sound.playMove(); setDifficulty('superchain'); }}
                        className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                          difficulty === 'superchain'
                            ? isDark
                              ? 'bg-[#0052FF]/10 border-[#0052FF] shadow-lg shadow-[#0052FF]/5'
                              : 'bg-blue-50 border-2 border-[#0052FF] shadow-md shadow-blue-500/5'
                            : isDark
                              ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-display font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{translations[lang].difficulty.hard_title}</span>
                          <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>21 x 21</span>
                        </div>
                        <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          {translations[lang].difficulty.hard_desc}
                        </p>
                      </button>

                    </div>
                  )}
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
                isCampaign={gameMode === 'campaign'}
                campaignLevel={campaignLevel}
                onLevelCompleted={handleLevelCompleted}
                onGameCompleted={handleGameCompleted}
                onBackToMenu={handleBackToMenu}
                lang={lang}
                theme={theme}
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
                lang={lang}
                theme={theme}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER & LIVE BLOCK UPDATES TICKER */}
      <footer className={`border-t py-4 mt-auto transition-colors duration-300 ${
        isDark ? 'border-slate-800 bg-[#020617]' : 'border-slate-200 bg-slate-100 text-slate-800'
      }`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* News Ticker Panel */}
          <div className={`w-full md:max-w-2xl border rounded-xl px-3.5 py-2 overflow-hidden flex items-center gap-3 ${
            isDark ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
          }`}>
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
                  className={`text-xs font-mono absolute inset-x-0 truncate ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {translations[lang].news_ticker[tickerIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Copyright details & contract address inside Elegant Theme */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] shadow-[0_0_6px_#0052FF]"></span>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>B20 MAZE GAME</span>
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className={isDark ? 'text-slate-500' : 'text-slate-600'}>Build By Sividelia_okuni6</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className={`hover:text-[#0052FF] cursor-pointer transition-colors ${
              isDark ? 'text-slate-500 hover:text-white' : 'text-slate-600'
            }`}>Contract: 0xBASE...0001</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
