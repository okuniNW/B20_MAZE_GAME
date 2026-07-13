import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ScoreEntry, Difficulty, BADGES } from '../types';
import { Trophy, RefreshCw, Filter, Trash2, Award, ArrowLeft, Shield } from 'lucide-react';
import { sound } from './SoundEngine';
import { Language, translations } from '../lib/i18n';

// Seed some famous Based/Ethereum profiles to make the scoreboard instantly feel competitive and premium!
const SEED_SCORES: ScoreEntry[] = [
  {
    id: 'seed-1',
    name: 'jesse_pollak 🔵',
    difficulty: 'superchain',
    time: 14.8,
    tps: 844.6,
    gasUsed: 12,
    blockHeight: 18442001,
    date: '2026-07-13',
    badges: ['superchain-overlord', 'speedster', 'no-hints']
  },
  {
    id: 'seed-2',
    name: 'brian_armstrong 🛡️',
    difficulty: 'superchain',
    time: 18.2,
    tps: 686.8,
    gasUsed: 14,
    blockHeight: 18441995,
    date: '2026-07-13',
    badges: ['superchain-overlord', 'wall-breaker']
  },
  {
    id: 'seed-3',
    name: 'vitalik.eth 🦄',
    difficulty: 'batch',
    time: 8.5,
    tps: 1176.5,
    gasUsed: 8,
    blockHeight: 18441989,
    date: '2026-07-13',
    badges: ['batch-master', 'speedster', 'gas-optimizer']
  },
  {
    id: 'seed-4',
    name: 'base_whale 🐳',
    difficulty: 'standard',
    time: 4.2,
    tps: 2380.9,
    gasUsed: 5,
    blockHeight: 18441952,
    date: '2026-07-13',
    badges: ['explorer', 'speed-demon', 'speedster', 'gas-optimizer']
  },
  {
    id: 'seed-5',
    name: 'optimist_builder',
    difficulty: 'standard',
    time: 5.8,
    tps: 1724.1,
    gasUsed: 6,
    blockHeight: 18441940,
    date: '2026-07-13',
    badges: ['explorer', 'no-hints']
  }
];

interface LeaderboardProps {
  onBackToMenu: () => void;
  currentDifficulty?: Difficulty;
  playerName?: string;
  lang: Language;
  theme?: 'light' | 'dark';
}

export default function Leaderboard({ onBackToMenu, currentDifficulty, playerName, lang, theme = 'dark' }: LeaderboardProps) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');

  const userUnlockedBadges = new Set<string>();
  const activePlayerName = playerName || localStorage.getItem('base_maze_player_name') || '';

  if (activePlayerName) {
    scores.forEach(s => {
      if (s.name && s.name.trim() === activePlayerName.trim() && s.badges) {
        s.badges.forEach(bId => userUnlockedBadges.add(bId));
      }
    });
  }

  useEffect(() => {
    const localScores = localStorage.getItem('base_maze_scores');
    if (localScores) {
      try {
        setScores(JSON.parse(localScores));
      } catch (e) {
        setScores(SEED_SCORES);
      }
    } else {
      localStorage.setItem('base_maze_scores', JSON.stringify(SEED_SCORES));
      setScores(SEED_SCORES);
    }
  }, []);

  const handleClear = () => {
    if (window.confirm(translations[lang].leaderboard_screen.reset_confirm)) {
      localStorage.removeItem('base_maze_scores');
      setScores([]);
      sound.playReset();
    }
  };

  const filteredScores = scores
    .filter(score => filter === 'all' || score.difficulty === filter)
    .sort((a, b) => {
      // Shorter time = better rank (higher TPS)
      return a.time - b.time;
    });

  const getDifficultyBadge = (diff: Difficulty) => {
    const isDark = theme === 'dark';
    switch (diff) {
      case 'standard':
        return (
          <span className={`border text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors duration-300 ${
            isDark 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
          }`}>
            {translations[lang].difficulty.easy_title} (10x10)
          </span>
        );
      case 'batch':
        return (
          <span className={`border text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors duration-300 ${
            isDark 
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
              : 'bg-blue-50 text-[#0052FF] border-blue-200 font-bold'
          }`}>
            {translations[lang].difficulty.medium_title} (15x15)
          </span>
        );
      case 'superchain':
        return (
          <span className={`border text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors duration-300 ${
            isDark 
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
              : 'bg-purple-50 text-purple-700 border-purple-200 font-bold'
          }`}>
            {translations[lang].difficulty.hard_title} (21x21)
          </span>
        );
    }
  };

  const getBadgeColorClass = (colorStr: string, isDark: boolean) => {
    if (isDark) return colorStr;
    let classes = colorStr;
    classes = classes.replace('bg-rose-500/10', 'bg-rose-50 border-rose-200');
    classes = classes.replace('text-rose-400', 'text-rose-600 font-bold');
    classes = classes.replace('border-rose-500/20', 'border-rose-100');
    
    classes = classes.replace('bg-teal-500/10', 'bg-teal-50 border-teal-200');
    classes = classes.replace('text-teal-400', 'text-teal-600 font-bold');
    classes = classes.replace('border-teal-500/20', 'border-teal-100');

    classes = classes.replace('bg-[#0052FF]/10', 'bg-blue-50 border-blue-200');
    classes = classes.replace('text-blue-400', 'text-[#0052FF] font-bold');
    classes = classes.replace('border-[#0052FF]/20', 'border-blue-100');

    classes = classes.replace('bg-purple-500/10', 'bg-purple-50 border-purple-200');
    classes = classes.replace('text-purple-400', 'text-purple-600 font-bold');
    classes = classes.replace('border-purple-500/20', 'border-purple-100');

    classes = classes.replace('bg-emerald-500/10', 'bg-emerald-50 border-emerald-200');
    classes = classes.replace('text-emerald-400', 'text-emerald-600 font-bold');
    classes = classes.replace('border-emerald-500/20', 'border-emerald-100');

    classes = classes.replace('bg-orange-500/10', 'bg-orange-50 border-orange-200');
    classes = classes.replace('text-orange-400', 'text-orange-600 font-bold');
    classes = classes.replace('border-orange-500/20', 'border-orange-100');

    classes = classes.replace('bg-cyan-500/10', 'bg-cyan-50 border-cyan-200');
    classes = classes.replace('text-cyan-400', 'text-cyan-600 font-bold');
    classes = classes.replace('border-cyan-500/20', 'border-cyan-100');

    classes = classes.replace('bg-slate-500/10', 'bg-slate-100 border-slate-200');
    classes = classes.replace('text-slate-400', 'text-slate-600 font-bold');
    classes = classes.replace('border-slate-500/20', 'border-slate-100');

    return classes;
  };

  const t = translations[lang].leaderboard_screen;
  const isDark = theme === 'dark';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors duration-300 ${
            isDark 
              ? 'bg-[#0052FF]/15 border-[#0052FF]/30 text-[#0052FF]' 
              : 'bg-amber-100 border-amber-300 text-amber-600 shadow-sm shadow-amber-400/20'
          }`}>
            <Trophy size={20} className={isDark ? "" : "animate-bounce"} />
          </div>
          <div>
            <h1 className={`text-2xl font-display font-extrabold transition-colors duration-300 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {t.title}
            </h1>
            <p className={`text-xs font-mono transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playMove();
              onBackToMenu();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-display font-semibold transition cursor-pointer border ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm'
            }`}
          >
            <ArrowLeft size={14} />
            {t.back_to_game}
          </button>

          <button
            onClick={handleClear}
            className={`p-2 rounded-xl transition cursor-pointer border ${
              isDark
                ? 'bg-rose-950/20 border-rose-900/30 hover:bg-rose-900/20 text-rose-400'
                : 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-600 shadow-sm'
            }`}
            title="Reset Leaderboard"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border mb-6 overflow-x-auto transition-colors duration-300 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200 shadow-inner'
      }`}>
        <button
          onClick={() => { sound.playMove(); setFilter('all'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition cursor-pointer flex-shrink-0 ${
            filter === 'all' 
              ? 'bg-[#0052FF] text-white shadow-md' 
              : isDark 
                ? 'text-slate-400 hover:text-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.all_blocks}
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('standard'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition cursor-pointer flex-shrink-0 ${
            filter === 'standard' 
              ? 'bg-[#0052FF] text-white shadow-md' 
              : isDark 
                ? 'text-slate-400 hover:text-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {translations[lang].difficulty.easy_title} (10x10)
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('batch'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition cursor-pointer flex-shrink-0 ${
            filter === 'batch' 
              ? 'bg-[#0052FF] text-white shadow-md' 
              : isDark 
                ? 'text-slate-400 hover:text-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {translations[lang].difficulty.medium_title} (15x15)
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('superchain'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition cursor-pointer flex-shrink-0 ${
            filter === 'superchain' 
              ? 'bg-[#0052FF] text-white shadow-md' 
              : isDark 
                ? 'text-slate-400 hover:text-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {translations[lang].difficulty.hard_title} (21x21)
        </button>
      </div>

      {/* Achievement Badges Showcase */}
      <div className={`border rounded-2xl p-5 mb-6 backdrop-blur-sm transition-colors duration-300 relative overflow-hidden ${
        isDark 
          ? 'bg-slate-900/40 border-slate-800/80' 
          : 'bg-white border-slate-200 shadow-md shadow-blue-500/5'
      }`}>
        {/* Aesthetic Yellow Accent Stripe on Top for Light Mode */}
        {!isDark && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-[#0052FF] to-amber-300" />}
        
        <div className={`flex items-center justify-between mb-4 pb-3 border-b ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2">
            <Shield size={16} className={isDark ? "text-blue-400" : "text-[#0052FF]"} />
            <h2 className={`text-xs font-mono font-bold uppercase tracking-widest ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {t.badge_system}
            </h2>
          </div>
          {activePlayerName && (
            <span className={`text-[10px] font-mono border px-2.5 py-0.5 rounded-md ${
              isDark 
                ? 'bg-[#0052FF]/10 text-blue-400 border-[#0052FF]/20' 
                : 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
            }`}>
              {t.progress_text.replace('{name}', activePlayerName).replace('{unlocked}', String(userUnlockedBadges.size)).replace('{total}', String(BADGES.length))}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BADGES.map(badge => {
            const isUnlocked = userUnlockedBadges.has(badge.id);
            const localizedBadge = translations[lang].badges[badge.id] || badge;
            const cardColorClasses = isUnlocked 
              ? getBadgeColorClass(badge.color, isDark) 
              : isDark 
                ? 'bg-slate-950/20 border-slate-900/60 opacity-40 hover:opacity-60' 
                : 'bg-slate-50 border-slate-200 opacity-40 hover:opacity-60 text-slate-400';

            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 ${cardColorClasses} ${
                  isUnlocked ? 'hover:scale-[1.03] shadow-md' : ''
                }`}
              >
                <span className={`text-2xl mb-1.5 filter ${isUnlocked ? '' : 'grayscale'}`}>
                  {badge.emoji}
                </span>
                <span className={`text-[11px] font-semibold leading-none ${
                  isUnlocked 
                    ? isDark ? 'text-slate-200' : 'text-slate-800' 
                    : 'text-slate-400'
                }`}>
                  {localizedBadge.name}
                </span>
                <span className={`text-[9px] leading-tight mt-1.5 max-w-[120px] ${
                  isUnlocked 
                    ? isDark ? 'text-slate-400' : 'text-slate-600' 
                    : 'text-slate-400'
                }`}>
                  {localizedBadge.description}
                </span>
                <span className="text-[8px] font-mono mt-2 uppercase tracking-wider">
                  {isUnlocked ? (
                    <span className="text-emerald-500 font-bold">✓ {t.unlocked_status}</span>
                  ) : (
                    <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>{t.locked_status}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/50 border-slate-800' 
          : 'bg-white border-slate-200 shadow-blue-500/5'
      }`}>
        {filteredScores.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Award size={48} className={`mx-auto mb-3 opacity-25 ${isDark ? 'text-[#0052FF]' : 'text-amber-500'}`} />
            <p className="text-sm font-display font-medium">{t.no_scores}</p>
            <p className="text-xs font-mono mt-1 text-slate-600">{t.no_scores_desc}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[10px] font-mono tracking-wider uppercase transition-colors duration-300 ${
                  isDark 
                    ? 'border-slate-800 bg-slate-950 text-slate-400' 
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  <th className="py-3.5 px-4 text-center w-12">{t.th_rank}</th>
                  <th className="py-3.5 px-4">{t.th_name}</th>
                  <th className="py-3.5 px-4">{t.th_type}</th>
                  <th className="py-3.5 px-4 text-right">{t.th_duration}</th>
                  <th className="py-3.5 px-4 text-right">{t.th_throughput}</th>
                  <th className="py-3.5 px-4 text-right">{t.th_gas}</th>
                  <th className="py-3.5 px-4 text-right hidden sm:table-cell">{t.th_block_number}</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((score, idx) => {
                  const isTop3 = idx < 3;
                  let bgRowClass = '';
                  if (isTop3) {
                    if (isDark) {
                      bgRowClass = 'bg-[#0052FF]/5';
                    } else {
                      bgRowClass = 'bg-[#0052FF]/5 border-l-4 border-l-[#0052FF]';
                    }
                  } else {
                    bgRowClass = isDark ? 'hover:bg-slate-900/30' : 'hover:bg-slate-50/50';
                  }

                  return (
                    <motion.tr
                      key={score.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`border-b transition-all ${
                        isDark ? 'border-slate-800/50' : 'border-slate-100'
                      } ${bgRowClass}`}
                    >
                      <td className="py-4 px-4 text-center font-mono">
                        {idx === 0 ? (
                          <span className="text-yellow-500 font-bold drop-shadow-sm text-base">🥇</span>
                        ) : idx === 1 ? (
                          <span className="text-slate-400 font-bold text-base">🥈</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-600 font-bold text-base">🥉</span>
                        ) : (
                          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`font-semibold font-mono ${
                            isDark ? 'text-slate-100 hover:text-blue-300' : 'text-slate-900 hover:text-[#0052FF]'
                          } transition duration-150`}>
                            {score.name}
                          </span>
                          {score.badges && score.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {score.badges.map(badgeId => {
                                const b = BADGES.find(x => x.id === badgeId);
                                if (!b) return null;
                                const bLocal = translations[lang].badges[badgeId] || b;
                                const styleClasses = getBadgeColorClass(b.color, isDark);
                                return (
                                  <span
                                    key={badgeId}
                                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 border ${styleClasses}`}
                                    title={bLocal.description}
                                  >
                                    <span>{b.emoji}</span>
                                    <span>{bLocal.name}</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getDifficultyBadge(score.difficulty)}
                      </td>
                      <td className={`py-4 px-4 text-right font-mono font-semibold ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {score.time.toFixed(2)}s
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-[#0052FF] font-extrabold">
                        {score.tps.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className={`py-4 px-4 text-right font-mono font-bold ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        {score.gasUsed}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-400 text-xs hidden sm:table-cell">
                        #{score.blockHeight}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`mt-4 flex items-center justify-between text-[10px] font-mono px-2 ${
        isDark ? 'text-slate-500' : 'text-slate-400'
      }`}>
        <span>{t.tps_footer}</span>
        <span>{t.gas_footer}</span>
      </div>
    </div>
  );
}
