import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ScoreEntry, Difficulty, BADGES } from '../types';
import { Trophy, RefreshCw, Filter, Trash2, Award, ArrowLeft, Shield } from 'lucide-react';
import { sound } from './SoundEngine';

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
}

export default function Leaderboard({ onBackToMenu, currentDifficulty, playerName }: LeaderboardProps) {
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
    if (window.confirm('Apakah Anda yakin ingin menghapus semua rekor transaksi?')) {
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
    switch (diff) {
      case 'standard':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full">Standard Block (10x10)</span>;
      case 'batch':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full">Aggregated Batch (15x15)</span>;
      case 'superchain':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full">Superchain Block (21x21)</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0052FF]/15 rounded-xl border border-[#0052FF]/30 flex items-center justify-center text-[#0052FF]">
            <Trophy size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-slate-100">
              BOARD VALIDATOR TERBAIK
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Transaksi Tercepat &amp; TPS Tertinggi di Base Chain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playMove();
              onBackToMenu();
            }}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-display font-semibold transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            Kembali ke Game
          </button>

          <button
            onClick={handleClear}
            className="p-2 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/20 text-rose-400 rounded-xl transition cursor-pointer"
            title="Reset Leaderboard"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-6 overflow-x-auto">
        <button
          onClick={() => { sound.playMove(); setFilter('all'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition cursor-pointer flex-shrink-0 ${filter === 'all' ? 'bg-[#0052FF] text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Semua Blok
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('standard'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition cursor-pointer flex-shrink-0 ${filter === 'standard' ? 'bg-[#0052FF] text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Standard (10x10)
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('batch'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition cursor-pointer flex-shrink-0 ${filter === 'batch' ? 'bg-[#0052FF] text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Batch (15x15)
        </button>
        <button
          onClick={() => { sound.playMove(); setFilter('superchain'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition cursor-pointer flex-shrink-0 ${filter === 'superchain' ? 'bg-[#0052FF] text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Superchain (21x21)
        </button>
      </div>

      {/* Achievement Badges Showcase */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 mb-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            <h2 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
              SISTEM PENCAPAIAN BADGE
            </h2>
          </div>
          {activePlayerName && (
            <span className="text-[10px] font-mono bg-[#0052FF]/10 text-blue-400 border border-[#0052FF]/20 px-2.5 py-0.5 rounded-md">
              Progres {activePlayerName}: {userUnlockedBadges.size} / {BADGES.length} Lencana
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BADGES.map(badge => {
            const isUnlocked = userUnlockedBadges.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 ${
                  isUnlocked
                    ? `${badge.color} shadow-lg shadow-blue-500/5 hover:scale-[1.03]`
                    : 'bg-slate-950/20 border-slate-900/60 opacity-40 hover:opacity-60'
                }`}
              >
                <span className={`text-2xl mb-1.5 filter ${isUnlocked ? '' : 'grayscale'}`}>
                  {badge.emoji}
                </span>
                <span className="text-[11px] font-semibold text-slate-200 leading-none">
                  {badge.name}
                </span>
                <span className="text-[9px] text-slate-400 leading-tight mt-1.5 max-w-[120px]">
                  {badge.description}
                </span>
                <span className="text-[8px] font-mono mt-2 uppercase tracking-wider">
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold">✓ Tercapai</span>
                  ) : (
                    <span className="text-slate-500">Terkunci</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {filteredScores.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Award size={48} className="mx-auto mb-3 opacity-25 text-[#0052FF]" />
            <p className="text-sm font-display font-medium">Belum ada transaksi tervalidasi</p>
            <p className="text-xs font-mono mt-1 text-slate-600">Selesaikan sebuah labirin untuk memasukkan nama Anda!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                  <th className="py-3.5 px-4 text-center w-12">No</th>
                  <th className="py-3.5 px-4">Nama Builder</th>
                  <th className="py-3.5 px-4">Blok / Tipe</th>
                  <th className="py-3.5 px-4 text-right">Durasi</th>
                  <th className="py-3.5 px-4 text-right">Throughput (TPS)</th>
                  <th className="py-3.5 px-4 text-right">Gas (Gwei)</th>
                  <th className="py-3.5 px-4 text-right hidden sm:table-cell">Nomor Blok</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((score, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <motion.tr
                      key={score.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`border-b border-slate-800/50 hover:bg-slate-900/30 transition-all ${
                        isTop3 ? 'bg-[#0052FF]/5' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center font-mono">
                        {idx === 0 ? (
                          <span className="text-yellow-400 font-bold">🥇</span>
                        ) : idx === 1 ? (
                          <span className="text-slate-300 font-bold">🥈</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-600 font-bold">🥉</span>
                        ) : (
                          <span className="text-slate-500 font-medium">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-100 hover:text-blue-300 transition duration-150 font-mono">
                            {score.name}
                          </span>
                          {score.badges && score.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {score.badges.map(badgeId => {
                                const b = BADGES.find(x => x.id === badgeId);
                                if (!b) return null;
                                return (
                                  <span
                                    key={badgeId}
                                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 border ${b.color}`}
                                    title={b.description}
                                  >
                                    <span>{b.emoji}</span>
                                    <span>{b.name}</span>
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
                      <td className="py-4 px-4 text-right font-mono text-slate-300 font-medium">
                        {score.time.toFixed(2)}s
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-blue-400 font-bold">
                        {score.tps.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-emerald-400">
                        {score.gasUsed}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-500 text-xs hidden sm:table-cell">
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

      <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-500 px-2">
        <span>*TPS dihitung berdasarkan kompleksitas sirkuit labirin dibagi dengan waktu proses.</span>
        <span>Base Chain Gas L2 optimal</span>
      </div>
    </div>
  );
}
