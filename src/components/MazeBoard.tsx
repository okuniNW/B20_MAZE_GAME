import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Difficulty,
  Cell,
  PlayerPosition,
  GameStats,
  ScoreEntry,
  BADGES
} from '../types';
import {
  sound
} from './SoundEngine';
import {
  Zap,
  RotateCcw,
  ShieldCheck,
  Coins,
  Cpu,
  Tv,
  ArrowBigUp,
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  Eye,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  delay: number;
}

interface MazeBoardProps {
  playerName: string;
  difficulty: Difficulty;
  onGameCompleted: (score: ScoreEntry) => void;
  onBackToMenu: () => void;
  lang: Language;
  theme?: 'light' | 'dark';
}

export default function MazeBoard({
  playerName,
  difficulty,
  onGameCompleted,
  onBackToMenu,
  lang,
  theme = 'dark'
}: MazeBoardProps) {
  // Determine grid size based on difficulty
  const getGridConfig = (diff: Difficulty) => {
    switch (diff) {
      case 'standard':
        return { cols: 10, rows: 10, gasCount: 4, valCount: 2, hasPortal: false };
      case 'batch':
        return { cols: 15, rows: 15, gasCount: 7, valCount: 3, hasPortal: true };
      case 'superchain':
        return { cols: 21, rows: 21, gasCount: 12, valCount: 4, hasPortal: true };
    }
  };

  const config = getGridConfig(difficulty);
  const cols = config.cols;
  const rows = config.rows;

  // Game States
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [player, setPlayer] = useState<PlayerPosition>({ x: 0, y: 0 });
  const [stats, setStats] = useState<GameStats>({
    timeElapsed: 0,
    gasCost: 0.0095, // Gwei
    transactionsMade: 0,
    validatorTokens: 0,
    isNoclipped: false
  });
  const [isReady, setIsReady] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [blockHeight, setBlockHeight] = useState(18442000);
  const [autoSolving, setAutoSolving] = useState(false);

  // Achievements States
  const [hasUsedBypass, setHasUsedBypass] = useState(false);
  const [hasEnabledHints, setHasEnabledHints] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Solved Path State
  const [shortestPath, setShortestPath] = useState<[number, number][]>([]);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const blockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize block heights like a real blockchain
  useEffect(() => {
    blockTimerRef.current = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 2000); // Base block time is 2 seconds!
    return () => {
      if (blockTimerRef.current) clearInterval(blockTimerRef.current);
    };
  }, []);

  // Generate the maze
  const generateMaze = () => {
    sound.playReset();
    setAutoSolving(false);
    setShowHint(false);
    setHasWon(false);
    setHasUsedBypass(false);
    setHasEnabledHints(false);
    setEarnedBadges([]);
    setParticles([]);
    setPlayer({ x: 0, y: 0 });
    setStats({
      timeElapsed: 0,
      gasCost: 0.0095,
      transactionsMade: 0,
      validatorTokens: 0,
      isNoclipped: false
    });

    // 1. Create grid outline
    const initialGrid: Cell[][] = [];
    for (let y = 0; y < rows; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < cols; x++) {
        row.push({
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        });
      }
      initialGrid.push(row);
    }

    // 2. DFS Maze Generation Algorithm with backtracking
    const stack: Cell[] = [];
    let current = initialGrid[0][0];
    current.visited = true;

    const getUnvisitedNeighbors = (cell: Cell, g: Cell[][]) => {
      const { x, y } = cell;
      const neighbors: Cell[] = [];

      if (y > 0 && !g[y - 1][x].visited) neighbors.push(g[y - 1][x]);
      if (x < cols - 1 && !g[y][x + 1].visited) neighbors.push(g[y][x + 1]);
      if (y < rows - 1 && !g[y + 1][x].visited) neighbors.push(g[y + 1][x]);
      if (x > 0 && !g[y][x - 1].visited) neighbors.push(g[y][x - 1]);

      return neighbors;
    };

    const removeWalls = (a: Cell, b: Cell) => {
      const xDiff = a.x - b.x;
      const yDiff = a.y - b.y;

      if (xDiff === 1) {
        a.walls.left = false;
        b.walls.right = false;
      } else if (xDiff === -1) {
        a.walls.right = false;
        b.walls.left = false;
      }

      if (yDiff === 1) {
        a.walls.top = false;
        b.walls.bottom = false;
      } else if (yDiff === -1) {
        a.walls.bottom = false;
        b.walls.top = false;
      }
    };

    let unvisitedCount = cols * rows - 1;
    while (unvisitedCount > 0) {
      const neighbors = getUnvisitedNeighbors(current, initialGrid);
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push(current);
        removeWalls(current, next);
        next.visited = true;
        current = next;
        unvisitedCount--;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      } else {
        break;
      }
    }

    // 3. Inject Collectibles
    // Gas Nodes (Gwei savers)
    let gasPlaced = 0;
    while (gasPlaced < config.gasCount) {
      const rx = Math.floor(Math.random() * cols);
      const ry = Math.floor(Math.random() * rows);
      // Don't place on start, exit, or existing items
      if (
        (rx === 0 && ry === 0) ||
        (rx === cols - 1 && ry === rows - 1) ||
        initialGrid[ry][rx].isGasNode ||
        initialGrid[ry][rx].isValidatorNode
      ) {
        continue;
      }
      initialGrid[ry][rx].isGasNode = true;
      gasPlaced++;
    }

    // Validator Nodes (power-ups)
    let valPlaced = 0;
    while (valPlaced < config.valCount) {
      const rx = Math.floor(Math.random() * cols);
      const ry = Math.floor(Math.random() * rows);
      if (
        (rx === 0 && ry === 0) ||
        (rx === cols - 1 && ry === rows - 1) ||
        initialGrid[ry][rx].isGasNode ||
        initialGrid[ry][rx].isValidatorNode
      ) {
        continue;
      }
      initialGrid[ry][rx].isValidatorNode = true;
      valPlaced++;
    }

    // Portals (Bridges L1 <-> L2)
    if (config.hasPortal) {
      // Create a pair of portals
      let portalA: { x: number; y: number } | null = null;
      let portalB: { x: number; y: number } | null = null;

      while (!portalA) {
        const rx = Math.floor(Math.random() * (cols / 2));
        const ry = Math.floor(Math.random() * (rows / 2));
        if ((rx !== 0 || ry !== 0) && !initialGrid[ry][rx].isGasNode && !initialGrid[ry][rx].isValidatorNode) {
          portalA = { x: rx, y: ry };
        }
      }

      while (!portalB) {
        const rx = Math.floor(cols / 2 + Math.random() * (cols / 2));
        const ry = Math.floor(rows / 2 + Math.random() * (rows / 2));
        if ((rx !== cols - 1 || ry !== rows - 1) && !initialGrid[ry][rx].isGasNode && !initialGrid[ry][rx].isValidatorNode) {
          portalB = { x: rx, y: ry };
        }
      }

      initialGrid[portalA.y][portalA.x].isPortal = true;
      initialGrid[portalA.y][portalA.x].portalTarget = portalB;

      initialGrid[portalB.y][portalB.x].isPortal = true;
      initialGrid[portalB.y][portalB.x].portalTarget = portalA;
    }

    setGrid(initialGrid);
    setIsReady(true);

    // Solve the maze path for hints
    calculateShortestPath(initialGrid);
  };

  // Find shortest path from current player position to exit using BFS
  const calculateShortestPath = (g: Cell[][], startX = 0, startY = 0) => {
    if (g.length === 0) return;
    const queue: { x: number; y: number; path: [number, number][] }[] = [
      { x: startX, y: startY, path: [[startX, startY]] }
    ];
    const visitedSet = new Set<string>();
    visitedSet.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const { x, y, path } = queue.shift()!;

      if (x === cols - 1 && y === rows - 1) {
        setShortestPath(path);
        return;
      }

      const cell = g[y][x];

      // Standard transitions
      const directions = [
        { dx: 0, dy: -1, wall: cell.walls.top },    // up
        { dx: 1, dy: 0, wall: cell.walls.right },   // right
        { dx: 0, dy: 1, wall: cell.walls.bottom },  // down
        { dx: -1, dy: 0, wall: cell.walls.left }    // left
      ];

      for (const { dx, dy, wall } of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !wall) {
          const key = `${nx},${ny}`;
          if (!visitedSet.has(key)) {
            visitedSet.add(key);
            queue.push({ x: nx, y: ny, path: [...path, [nx, ny]] });
          }
        }
      }

      // Portal transition
      if (cell.isPortal && cell.portalTarget) {
        const { x: px, y: py } = cell.portalTarget;
        const key = `${px},${py}`;
        if (!visitedSet.has(key)) {
          visitedSet.add(key);
          queue.push({ x: px, y: py, path: [...path, [px, py]] });
        }
      }
    }
  };

  // Run the Maze Gen on startup and on difficulty shift
  useEffect(() => {
    generateMaze();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty]);

  // Track if hints are enabled during this maze run
  useEffect(() => {
    if (showHint) {
      setHasEnabledHints(true);
    }
  }, [showHint]);

  // Start continuous game timer once player starts moving
  useEffect(() => {
    if (stats.transactionsMade > 0 && !hasWon && !autoSolving) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 0.05
        }));
      }, 50);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stats.transactionsMade, hasWon, autoSolving]);

  // Handle Movement Core Logic
  const movePlayer = (dx: number, dy: number) => {
    if (hasWon || autoSolving || grid.length === 0) return;

    const currentCell = grid[player.y][player.x];
    let canMove = false;

    // Check Wall barriers unless "No-Clipped Wall Break" validator token is active
    if (stats.isNoclipped) {
      // Break walls in this direction!
      const targetX = player.x + dx;
      const targetY = player.y + dy;
      if (targetX >= 0 && targetX < cols && targetY >= 0 && targetY < rows) {
        canMove = true;
        // Break the walls physically on the grid so it stays open!
        const targetCell = grid[targetY][targetX];
        const newGrid = [...grid];
        if (dx === 1) {
          currentCell.walls.right = false;
          targetCell.walls.left = false;
        } else if (dx === -1) {
          currentCell.walls.left = false;
          targetCell.walls.right = false;
        } else if (dy === 1) {
          currentCell.walls.bottom = false;
          targetCell.walls.top = false;
        } else if (dy === -1) {
          currentCell.walls.top = false;
          targetCell.walls.bottom = false;
        }
        setGrid(newGrid);
        sound.playPowerup();
        setHasUsedBypass(true);
        // Consume noclip state
        setStats(prev => ({ ...prev, isNoclipped: false }));
      }
    } else {
      if (dy === -1 && !currentCell.walls.top) canMove = true;
      if (dx === 1 && !currentCell.walls.right) canMove = true;
      if (dy === 1 && !currentCell.walls.bottom) canMove = true;
      if (dx === -1 && !currentCell.walls.left) canMove = true;
    }

    if (canMove) {
      const nextX = player.x + dx;
      const nextY = player.y + dy;

      sound.playMove();

      // Check Collectibles
      let collectedGas = 0;
      let collectedVal = 0;
      const updatedGrid = [...grid];
      const nextCell = updatedGrid[nextY][nextX];

      if (nextCell.isGasNode) {
        nextCell.isGasNode = false;
        collectedGas = 1;
        sound.playCoin();
      }

      if (nextCell.isValidatorNode) {
        nextCell.isValidatorNode = false;
        collectedVal = 1;
        sound.playPowerup();
      }

      // Check Portal Teleportation
      let finalX = nextX;
      let finalY = nextY;
      if (nextCell.isPortal && nextCell.portalTarget) {
        finalX = nextCell.portalTarget.x;
        finalY = nextCell.portalTarget.y;
        sound.playWin(); // Teleport sound
      }

      setPlayer({ x: finalX, y: finalY });
      setStats(prev => {
        const nextGasCost = Math.max(0.0005, prev.gasCost - (collectedGas * 0.0015));
        return {
          ...prev,
          transactionsMade: prev.transactionsMade + 1,
          validatorTokens: prev.validatorTokens + collectedVal,
          gasCost: nextGasCost
        };
      });

      // Check Win Condition
      if (finalX === cols - 1 && finalY === rows - 1) {
        triggerWin();
      } else {
        // Recalculate hint route from new position
        calculateShortestPath(updatedGrid, finalX, finalY);
      }
    } else {
      sound.playError();
    }
  };

  const triggerWin = () => {
    sound.playWin();
    setHasWon(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Generate celebratory particles using motion/react
    const colors = ['#0052FF', '#38BDF8', '#34D399', '#FBBF24', '#F43F5E', '#A855F7'];
    const newParticles: Particle[] = Array.from({ length: 70 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 300;
      return {
        id: i,
        x: 0,
        y: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        angle: angle,
        speed: speed,
        delay: Math.random() * 0.2,
      };
    });
    setParticles(newParticles);

    // Calculate Game Score
    const timeToComplete = Math.max(0.5, stats.timeElapsed);
    // Base formula for L2 TPS: Grid area size multiplied by scaling index, divided by completion speed
    const baseComplexity = cols * rows;
    const computedTPS = (baseComplexity * 120) / timeToComplete;

    // Convert Gas cost to realistic dynamic Gwei mapping
    const finalGasGwei = Math.max(1, Math.round(stats.gasCost * 1000));

    // Calculate earned badges
    const currentEarnedBadges: string[] = [];
    if (timeToComplete < 15) currentEarnedBadges.push('speedster');
    if (timeToComplete < 6) currentEarnedBadges.push('speed-demon');
    if (difficulty === 'standard') currentEarnedBadges.push('explorer');
    if (difficulty === 'batch') currentEarnedBadges.push('batch-master');
    if (difficulty === 'superchain') currentEarnedBadges.push('superchain-overlord');
    if (finalGasGwei <= 10) currentEarnedBadges.push('gas-optimizer');
    if (hasUsedBypass) currentEarnedBadges.push('wall-breaker');
    if (!hasEnabledHints) currentEarnedBadges.push('no-hints');

    setEarnedBadges(currentEarnedBadges);

    // Wait slightly to show successful animation, then complete
    setTimeout(() => {
      const result: ScoreEntry = {
        id: 'user-' + Date.now(),
        name: playerName,
        difficulty,
        time: Number(timeToComplete.toFixed(2)),
        tps: Number(computedTPS.toFixed(1)),
        gasUsed: finalGasGwei,
        blockHeight: blockHeight,
        date: new Date().toISOString().split('T')[0],
        badges: currentEarnedBadges
      };

      // Retrieve current leaderboard scores
      const savedScores = localStorage.getItem('base_maze_scores');
      let currentScores: ScoreEntry[] = [];
      if (savedScores) {
        try {
          currentScores = JSON.parse(savedScores);
        } catch (e) {
          currentScores = [];
        }
      }
      // Add current score and save
      const updatedScores = [...currentScores, result].sort((a, b) => a.time - b.time);
      localStorage.setItem('base_maze_scores', JSON.stringify(updatedScores));

      onGameCompleted(result);
    }, 1500);
  };

  // Keyboard Event Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasWon || autoSolving) return;

      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'];
      if (keys.includes(e.code) || keys.includes(e.key)) {
        e.preventDefault(); // Prevent page scrolling
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 'KeyS':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'KeyD':
          movePlayer(1, 0);
          break;
        case 'Space':
          activateValidatorPower();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [player, grid, stats, hasWon, autoSolving]);

  // Activate Validator firewall powerup
  const activateValidatorPower = () => {
    if (stats.validatorTokens > 0 && !stats.isNoclipped && !hasWon && !autoSolving) {
      sound.playPowerup();
      setStats(prev => ({
        ...prev,
        validatorTokens: prev.validatorTokens - 1,
        isNoclipped: true
      }));
    } else {
      sound.playError();
    }
  };

  // Auto solve animation (shows visual transaction routing in real-time)
  const runAutoSolve = async () => {
    if (autoSolving || hasWon || shortestPath.length === 0) return;
    setAutoSolving(true);
    sound.playPowerup();

    let pathIndex = 0;
    const interval = setInterval(() => {
      if (pathIndex < shortestPath.length) {
        const [x, y] = shortestPath[pathIndex];
        setPlayer({ x, y });
        sound.playMove();

        // Simulate collecting
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          if (newGrid[y][x].isGasNode) {
            newGrid[y][x].isGasNode = false;
            sound.playCoin();
          }
          if (newGrid[y][x].isValidatorNode) {
            newGrid[y][x].isValidatorNode = false;
            sound.playPowerup();
          }
          return newGrid;
        });

        pathIndex++;
      } else {
        clearInterval(interval);
        triggerWin();
      }
    }, 120);
  };

  // Helper styles for cell walls
  const getCellClassName = (cell: Cell) => {
    const isDark = theme === 'dark';
    let classes = "relative aspect-square transition-all duration-150 ";

    if (isDark) {
      classes += "border-slate-800/20 ";
      if (cell.walls.top) classes += "border-t-2 border-t-[#0052FF]/60 ";
      else classes += "border-t border-t-slate-900/30 ";

      if (cell.walls.right) classes += "border-r-2 border-r-[#0052FF]/60 ";
      else classes += "border-r border-r-slate-900/30 ";

      if (cell.walls.bottom) classes += "border-b-2 border-b-[#0052FF]/60 ";
      else classes += "border-b border-b-slate-900/30 ";

      if (cell.walls.left) classes += "border-l-2 border-l-[#0052FF]/60 ";
      else classes += "border-l border-l-slate-900/30 ";
    } else {
      classes += "border-slate-200/50 ";
      // Use crisp solid Base Blue walls for maximum structural clarity, and golden hints for paths
      if (cell.walls.top) classes += "border-t-[3px] border-t-[#0052FF] ";
      else classes += "border-t border-t-amber-100/20 ";

      if (cell.walls.right) classes += "border-r-[3px] border-r-[#0052FF] ";
      else classes += "border-r border-r-amber-100/20 ";

      if (cell.walls.bottom) classes += "border-b-[3px] border-b-[#0052FF] ";
      else classes += "border-b border-b-amber-100/20 ";

      if (cell.walls.left) classes += "border-l-[3px] border-l-[#0052FF] ";
      else classes += "border-l border-l-amber-100/20 ";
    }

    return classes;
  };

  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto px-4 py-4">
      {/* LEFT COLUMN: Main Game Maze */}
      <div className="lg:col-span-8 flex flex-col items-center">
        {/* Top bar */}
        <div className={`w-full border rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-sm transition-all duration-300 ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{translations[lang].mazeboard.node_connected}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isDark 
                ? 'bg-[#0052FF]/10 text-blue-400 border-[#0052FF]/20' 
                : 'bg-blue-50 text-[#0052FF] border-blue-200 font-bold'
            }`}>
              {difficulty.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { sound.playMove(); setShowHint(!showHint); }}
              className={`p-2 rounded-xl border text-xs font-display font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                showHint
                  ? isDark 
                    ? 'bg-[#0052FF]/20 border-[#0052FF] text-blue-300'
                    : 'bg-[#0052FF]/15 border-[#0052FF] text-[#0052FF]'
                  : isDark
                    ? 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title={translations[lang].mazeboard.hint_tooltip}
            >
              <Eye size={14} />
              <span className="hidden sm:inline">{translations[lang].mazeboard.hint_btn}</span>
            </button>

            <button
              onClick={runAutoSolve}
              disabled={autoSolving || hasWon}
              className={`p-2 border rounded-xl text-xs font-display font-semibold flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer ${
                isDark
                  ? 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-purple-500 hover:text-purple-300'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-purple-500 hover:text-purple-600'
              }`}
              title={translations[lang].mazeboard.autosolve_tooltip}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">{translations[lang].mazeboard.autosolve_btn}</span>
            </button>

            <button
              onClick={generateMaze}
              className={`p-2 border rounded-xl text-xs transition cursor-pointer ${
                isDark
                  ? 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm'
              }`}
              title={translations[lang].mazeboard.regen_tooltip}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* The Actual Maze Grid */}
        <div className={`relative w-full max-w-xl aspect-square rounded-2xl p-2 md:p-3 overflow-hidden shadow-2xl transition-all duration-300 border ${
          isDark 
            ? 'bg-slate-950/80 border-[#0052FF]/30 shadow-[#0052FF]/5' 
            : 'bg-white border-[#0052FF]/40 shadow-xl shadow-blue-500/10'
        }`}>
          {grid.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center font-mono text-slate-500">
              {translations[lang].mazeboard.generating_grid}
            </div>
          ) : (
            <div
              className="grid w-full h-full gap-0 select-none relative"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
              }}
            >
              {grid.map((row, y) =>
                row.map((cell, x) => {
                  const isStart = x === 0 && y === 0;
                  const isExit = x === cols - 1 && y === rows - 1;
                  const isPlayer = player.x === x && player.y === y;

                  // Is this cell on the optimized hint path?
                  const isOnHint = showHint && shortestPath.some(([px, py]) => px === x && py === y);

                  return (
                    <div
                      key={`${x}-${y}`}
                      id={`cell-${x}-${y}`}
                      className={getCellClassName(cell)}
                    >
                      {/* Background fill if starting / exit / hint path */}
                      {isStart && (
                        <div className={`absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold z-0 ${
                          isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-[#0052FF]/10 text-[#0052FF]'
                        }`}>
                          {translations[lang].mazeboard.wallet_label}
                        </div>
                      )}
                      {isExit && (
                        <div className={`absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold z-0 ${
                          isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {translations[lang].mazeboard.block_label}
                        </div>
                      )}

                      {/* Gas-Optimized Route Hint Line - beautifully stylized! */}
                      {isOnHint && !isPlayer && !isStart && !isExit && (
                        <div className={`absolute inset-2 rounded-full animate-pulse z-0 border ${
                          isDark 
                            ? 'bg-blue-500/15 border-blue-500/10' 
                            : 'bg-amber-400/25 border-amber-400/40 shadow-sm shadow-amber-400/10'
                        }`}></div>
                      )}

                      {/* Render Portal Bridge */}
                      {cell.isPortal && (
                        <div className="absolute inset-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center animate-spin z-0">
                          <Zap size={10} className="text-purple-400" />
                        </div>
                      )}

                      {/* Render Gas Collectible */}
                      {cell.isGasNode && (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 2.5 }}
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          <Coins className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                        </motion.div>
                      )}

                      {/* Render Validator Power-up Collectible */}
                      {cell.isValidatorNode && (
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 1.8 }}
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                        </motion.div>
                      )}

                      {/* Render Player Token with Glowing Base Circle Logo */}
                      {isPlayer && (
                        <motion.div
                          layoutId="player-token"
                          className="absolute inset-1 bg-[#0052FF] rounded-full border border-white flex items-center justify-center shadow-lg shadow-[#0052FF]/50 z-20"
                        >
                          {/* Inner white circle */}
                          <div className="w-[60%] h-[60%] bg-white rounded-full flex items-center justify-center">
                            {/* Inner blue dot */}
                            <div className="w-[45%] h-[45%] bg-[#0052FF] rounded-full animate-pulse"></div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Scanner Overlay during Auto-solve */}
          {autoSolving && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#0052FF] to-transparent animate-scanner opacity-80 pointer-events-none"></div>
          )}

          {/* Success Overlay message */}
          <AnimatePresence>
            {hasWon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center z-30 transition-colors duration-300 ${
                  isDark ? 'bg-[#020617]/95' : 'bg-white/95 border-2 border-amber-200 rounded-2xl shadow-2xl'
                }`}
              >
                {/* Celebration Particle Explosion */}
                {particles.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-40 flex items-center justify-center">
                    {particles.map((p) => {
                      const targetX = Math.cos(p.angle) * p.speed;
                      const targetY = Math.sin(p.angle) * p.speed;
                      return (
                        <motion.div
                          key={p.id}
                          initial={{ x: 0, y: 0, opacity: 1, scale: 0.8 }}
                          animate={{
                            x: targetX,
                            y: [0, targetY - 60, targetY + 200], // parabolic gravity path
                            opacity: [1, 1, 0],
                            scale: [0.8, 1.4, 0.2],
                            rotate: [0, Math.random() * 360 + 180],
                          }}
                          transition={{
                            duration: 1.8 + Math.random() * 1.2,
                            ease: "easeOut",
                            delay: p.delay,
                          }}
                          style={{
                            position: 'absolute',
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            borderRadius: Math.random() > 0.4 ? '50%' : '15%',
                            boxShadow: `0 0 10px ${p.color}`,
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4 shadow-lg ${
                  isDark 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : 'bg-emerald-50 border-emerald-500 text-emerald-600'
                }`}>
                  <CheckCircle size={36} className="animate-bounce" />
                </div>
                <h2 className={`text-2xl font-display font-extrabold ${isDark ? 'text-white' : 'text-[#0052FF]'}`}>
                  {translations[lang].mazeboard.confirmed_title}
                </h2>
                <p className={`text-xs font-mono mt-1 uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {translations[lang].mazeboard.confirmed_subtitle}
                </p>

                <div className={`mt-4 flex gap-6 p-4 rounded-xl text-center font-mono border shadow-inner ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">{translations[lang].mazeboard.time_short}</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{stats.timeElapsed.toFixed(2)}s</span>
                  </div>
                  <div className={`border-r ${isDark ? 'border-slate-800' : 'border-slate-350'}`}></div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">{translations[lang].mazeboard.throughput_short}</span>
                    <span className="text-sm font-bold text-blue-500">
                      {((cols * rows * 120) / Math.max(0.5, stats.timeElapsed)).toLocaleString(undefined, { maximumFractionDigits: 1 })} TPS
                    </span>
                  </div>
                  <div className={`border-r ${isDark ? 'border-slate-800' : 'border-slate-350'}`}></div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Gas Gwei</span>
                    <span className="text-sm font-bold text-emerald-500">
                      {Math.max(1, Math.round(stats.gasCost * 1000))}
                    </span>
                  </div>
                </div>

                {/* Earned Badges Showcase */}
                {earnedBadges.length > 0 && (
                  <div className="mt-5 text-center px-4 max-w-sm">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">{translations[lang].mazeboard.earned_badges}</span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {earnedBadges.map(badgeId => {
                        const b = BADGES.find(x => x.id === badgeId);
                        if (!b) return null;
                        const bLocal = translations[lang].badges[badgeId] || b;
                        const styleClasses = isDark ? b.color : b.color.replace('bg-rose-500/10', 'bg-rose-50 border-rose-200').replace('text-rose-400', 'text-rose-600 font-bold').replace('bg-teal-500/10', 'bg-teal-50 border-teal-200').replace('text-teal-400', 'text-teal-600 font-bold').replace('bg-[#0052FF]/10', 'bg-blue-50 border-blue-200').replace('text-blue-400', 'text-[#0052FF] font-bold').replace('bg-purple-500/10', 'bg-purple-50 border-purple-200').replace('text-purple-400', 'text-purple-600 font-bold').replace('bg-emerald-500/10', 'bg-emerald-50 border-emerald-200').replace('text-emerald-400', 'text-emerald-600 font-bold').replace('bg-orange-500/10', 'bg-orange-50 border-orange-200').replace('text-orange-400', 'text-orange-600 font-bold').replace('bg-cyan-500/10', 'bg-cyan-50 border-cyan-200').replace('text-cyan-400', 'text-cyan-600 font-bold');
                        
                        return (
                          <motion.div
                            key={badgeId}
                            initial={{ scale: 0, rotate: -15 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className={`text-xs font-mono px-2 py-1 rounded-lg flex items-center gap-1.5 border ${styleClasses} shadow-lg`}
                            title={bLocal.description}
                          >
                            <span className="text-sm">{b.emoji}</span>
                            <span className="font-semibold text-[10px]">{bLocal.name}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Keyboards Hints for PC Users */}
        <p className={`hidden md:block text-[10px] font-mono mt-4 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {translations[lang].mazeboard.keyboard_hints}
        </p>

        {/* Mobile touch D-pad */}
        <div className="block lg:hidden mt-6 w-full max-w-[180px]">
          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <button
              onClick={() => movePlayer(0, -1)}
              className={`aspect-square border hover:bg-[#0052FF]/20 active:bg-[#0052FF] active:text-white rounded-xl flex items-center justify-center cursor-pointer touch-manipulation shadow-md transition-colors ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
              }`}
            >
              <ArrowBigUp size={24} />
            </button>
            <div></div>

            <button
              onClick={() => movePlayer(-1, 0)}
              className={`aspect-square border hover:bg-[#0052FF]/20 active:bg-[#0052FF] active:text-white rounded-xl flex items-center justify-center cursor-pointer touch-manipulation shadow-md transition-colors ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
              }`}
            >
              <ArrowBigLeft size={24} />
            </button>
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 bg-[#0052FF] rounded-full"></div>
            </div>
            <button
              onClick={() => movePlayer(1, 0)}
              className={`aspect-square border hover:bg-[#0052FF]/20 active:bg-[#0052FF] active:text-white rounded-xl flex items-center justify-center cursor-pointer touch-manipulation shadow-md transition-colors ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
              }`}
            >
              <ArrowBigRight size={24} />
            </button>

            <div></div>
            <button
              onClick={() => movePlayer(0, 1)}
              className={`aspect-square border hover:bg-[#0052FF]/20 active:bg-[#0052FF] active:text-white rounded-xl flex items-center justify-center cursor-pointer touch-manipulation shadow-md transition-colors ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
              }`}
            >
              <ArrowBigDown size={24} />
            </button>
            <div></div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Statistics Dashboard & Info */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Profile Card */}
        <div className={`p-5 rounded-2xl shadow-md backdrop-blur-sm border transition-all duration-300 ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-md shadow-blue-500/5'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-display font-bold ${
              isDark ? 'bg-[#0052FF]/10 border-[#0052FF]/20 text-blue-400' : 'bg-blue-100 border-blue-200 text-[#0052FF]'
            }`}>
              {playerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-sm font-display font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{playerName}</h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{translations[lang].mazeboard.profile_title}</p>
            </div>
          </div>

          <div className={`mt-4 border-t pt-4 flex flex-col gap-2 ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">{translations[lang].mazeboard.block_num_label}</span>
              <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>#{blockHeight}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">{translations[lang].mazeboard.stability_label}</span>
              <span className="text-emerald-500 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                {translations[lang].mazeboard.stability_val}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Telemetry Stats */}
        <div className={`p-5 rounded-2xl shadow-md backdrop-blur-sm border transition-all duration-300 ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-md shadow-blue-500/5'
        }`}>
          <h3 className={`text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-1.5 ${
            isDark ? 'text-slate-400' : 'text-slate-700 font-bold'
          }`}>
            <Cpu size={12} className="text-[#0052FF]" />
            {translations[lang].mazeboard.telemetry_title}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Live Timer */}
            <div className={`p-3 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-inner'
            }`}>
              <span className="block text-[10px] font-mono text-slate-500 uppercase">{translations[lang].mazeboard.time_elapsed_label}</span>
              <span className={`text-lg font-mono font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.timeElapsed.toFixed(2)}s</span>
            </div>

            {/* Simulated Live Gas */}
            <div className={`p-3 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-50 border-amber-200 shadow-inner'
            }`}>
              {/* Highlight Gwei in Yellow border/accent for beautiful light theme decoration! */}
              <span className="block text-[10px] font-mono text-amber-600/80 uppercase font-bold">{translations[lang].mazeboard.gas_fee_label}</span>
              <span className={`text-lg font-mono font-bold tracking-tight text-emerald-600`}>
                {Math.max(1, Math.round(stats.gasCost * 1000))} Gwei
              </span>
            </div>

            {/* Total Moves */}
            <div className={`p-3 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-inner'
            }`}>
              <span className="block text-[10px] font-mono text-slate-500 uppercase">{translations[lang].mazeboard.data_processed_label}</span>
              <span className={`text-sm font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{stats.transactionsMade} hops</span>
            </div>

            {/* TPS estimation */}
            <div className={`p-3 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-inner'
            }`}>
              <span className="block text-[10px] font-mono text-slate-500 uppercase">{translations[lang].mazeboard.tps_est_label}</span>
              <span className="text-sm font-mono font-extrabold text-blue-500">
                {stats.transactionsMade === 0
                  ? '0.0'
                  : ((cols * rows * 120) / Math.max(0.5, stats.timeElapsed)).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
            </div>
          </div>
        </div>

        {/* Powerups & Validator Token */}
        <div className={`p-5 rounded-2xl shadow-md backdrop-blur-sm border transition-all duration-300 ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-md shadow-blue-500/5'
        }`}>
          <h3 className={`text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-1.5 ${
            isDark ? 'text-slate-400' : 'text-slate-700 font-bold'
          }`}>
            <ShieldCheck size={12} className="text-[#0052FF]" />
            {translations[lang].mazeboard.bypass_title}
          </h3>

          <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {translations[lang].mazeboard.bypass_desc}
          </p>

          <div className={`flex items-center justify-between p-3 rounded-xl border transition-colors duration-300 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-50/70 border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isDark 
                  ? 'bg-[#0052FF]/10 text-[#0052FF] border-[#0052FF]/20' 
                  : 'bg-amber-100 text-amber-600 border-amber-300 shadow-inner'
              }`}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <span className="block text-[10px] font-mono text-slate-500 uppercase">{translations[lang].mazeboard.bypass_available}</span>
                <span className={`text-sm font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{stats.validatorTokens} Tokens</span>
              </div>
            </div>

            <button
              onClick={activateValidatorPower}
              disabled={stats.validatorTokens === 0 || stats.isNoclipped || hasWon || autoSolving}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition cursor-pointer flex items-center gap-1 ${
                stats.isNoclipped
                  ? 'bg-amber-500 text-white animate-pulse shadow-md'
                  : 'bg-[#0052FF] hover:bg-[#0042cc] disabled:opacity-40 text-white shadow-sm'
              }`}
            >
              {stats.isNoclipped ? translations[lang].mazeboard.bypass_active : translations[lang].mazeboard.bypass_use}
            </button>
          </div>
        </div>

        {/* Tech Corner Info */}
        <div className={`p-4 rounded-xl text-xs flex gap-2.5 items-start leading-relaxed border transition-all duration-300 ${
          isDark 
            ? 'bg-slate-900/25 border-slate-800/50 text-slate-400' 
            : 'bg-blue-50/80 border-blue-100 text-slate-600 shadow-sm'
        }`}>
          <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong className={`font-display ${isDark ? 'text-slate-300' : 'text-slate-800 font-bold'}`}>{translations[lang].mazeboard.why_base_title}</strong> {translations[lang].mazeboard.why_base_desc}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => { sound.playMove(); onBackToMenu(); }}
          className={`w-full font-display font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer border ${
            isDark 
              ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300' 
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 shadow-sm'
          }`}
        >
          {translations[lang].mazeboard.back_to_menu}
        </button>
      </div>
    </div>
  );
}
