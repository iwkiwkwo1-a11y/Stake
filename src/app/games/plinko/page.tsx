'use client';

import { Header } from '@/components/Header';
import { usePlinkoGame } from '@/hooks/usePlinkoGame';
import { useWallet } from '@/components/WalletProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Pyramid, Copy, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const copyToClipboard = async (text: string, setCopiedState: (val: boolean) => void) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
};

const PLINKO_MULTIPLIERS: Record<string, Record<number, number[]>> = {
  low: {
    8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
  },
  medium: {
    8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
  },
  high: {
    8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  }
};

function getMultiplierColor(multiplier: number) {
  if (multiplier >= 10) return 'bg-red-500 text-white shadow-[0_3px_0_0_#991b1b]';
  if (multiplier >= 2) return 'bg-orange-500 text-white shadow-[0_3px_0_0_#c2410c]';
  if (multiplier >= 1) return 'bg-amber-500 text-black shadow-[0_3px_0_0_#b45309]';
  return 'bg-zinc-700 text-zinc-300 shadow-[0_3px_0_0_#3f3f46]';
}

export default function PlinkoPage() {
  const { balance, refreshBalance } = useWallet();
  const {
    result,
    loading,
    betAmount,
    setBetAmount,
    rows,
    setRows,
    risk,
    setRisk,
    clientSeed,
    setClientSeed,
    dropBall
  } = usePlinkoGame();

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [copiedClient, setCopiedClient] = useState(false);

  const [recentPlays, setRecentPlays] = useState<any[]>([]);
  const [activeBalls, setActiveBalls] = useState<any[]>([]);

  const handleStart = () => {
    if (betAmount > balance) {
      alert("Bet amount exceeds balance");
      return;
    }
    dropBall();
  };

  const handleMaxBet = () => setBetAmount(balance);
  const handleHalfBet = () => setBetAmount(Math.floor(balance / 2));

  // When a new result comes in, animate a ball falling
  useEffect(() => {
    if (result) {
      const ballId = Date.now();
      setActiveBalls(prev => [...prev, { id: ballId, ...result }]);
    }
  }, [result]);

  const onBallFinish = async (ball: any) => {
    setActiveBalls(prev => prev.filter(b => b.id !== ball.id));

    setRecentPlays(prev => [
      {
        id: ball.id,
        bet: betAmount,
        multiplier: ball.multiplier,
        payout: ball.winAmount,
      },
      ...prev
    ].slice(0, 10));

    // Refresh balance after the animation finishes
    await refreshBalance();
  };

  const currentMultipliers = PLINKO_MULTIPLIERS[risk][rows];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar Controls */}
          <div className="w-full lg:w-80 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-5 order-2 lg:order-1">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Bet Amount (IDR)</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-amber-500 transition-colors">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={loading}
                  className="w-full bg-transparent px-3 py-2 text-zinc-100 outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleHalfBet}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 border-l border-zinc-700"
                >
                  1/2
                </button>
                <button
                  onClick={handleMaxBet}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 border-l border-zinc-700"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Risk</label>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value as any)}
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 outline-none focus:border-amber-500 disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Rows</label>
              <select
                value={rows}
                onChange={(e) => setRows(Number(e.target.value) as any)}
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 outline-none focus:border-amber-500 disabled:opacity-50"
              >
                <option value="8">8</option>
                <option value="12">12</option>
                <option value="16">16</option>
              </select>
            </div>

            <button
              onClick={handleStart}
              disabled={loading || betAmount < 100 || betAmount > balance}
              className="mt-2 w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-900 disabled:text-zinc-500 text-zinc-950 font-bold rounded-lg transition-colors text-lg"
            >
              Drop
            </button>

            {/* Provably Fair Inputs */}
            <div className="mt-auto pt-4 border-t border-zinc-800 flex flex-col gap-2">
               <label className="text-xs font-semibold text-zinc-500">Client Seed</label>
               <div className="flex bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden focus-within:border-amber-500 transition-colors">
                 <input
                   type="text"
                   value={clientSeed}
                   onChange={(e) => setClientSeed(e.target.value)}
                   disabled={loading}
                   placeholder="Leave empty to auto"
                   className="w-full bg-transparent px-3 py-2 text-xs text-zinc-300 outline-none disabled:opacity-50"
                 />
                 {clientSeed && (
                   <button
                     onClick={() => copyToClipboard(clientSeed, setCopiedClient)}
                     className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-l border-zinc-700"
                   >
                     {copiedClient ? <Check className="w-3.5 h-3.5 text-amber-500" /> : <Copy className="w-3.5 h-3.5" />}
                   </button>
                 )}
               </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-8 relative overflow-hidden order-1 lg:order-2 min-h-[500px]">

             {/* Info top banner for the most recent ball */}
             {result && (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-400 z-10 shadow-lg">
                 <div className="flex items-center gap-2 overflow-hidden">
                   <span className="truncate max-w-[150px] md:max-w-md">S.Seed: {result.serverSeed}</span>
                 </div>
                 <button onClick={() => copyToClipboard(result.serverSeed, setCopiedSeed)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md">
                   {copiedSeed ? <Check className="w-3 h-3 text-amber-500" /> : <Copy className="w-3 h-3" />}
                 </button>
              </div>
             )}

             {/* Plinko Pyramid Visualization */}
             <div className="relative w-full max-w-lg aspect-square mt-8 flex flex-col items-center justify-end pb-8">

                {/* Draw Pegs */}
                <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
                  {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-4 md:gap-6">
                      {Array.from({ length: rowIndex + 1 }).map((_, colIndex) => (
                        <div key={colIndex} className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-zinc-700 shadow-sm" />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Draw Multiplier Bins */}
                <div className="flex w-full mt-4 justify-center gap-1">
                   {currentMultipliers.map((mult, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 min-w-[20px] md:min-w-[28px] h-8 md:h-10 rounded-sm flex items-center justify-center text-[10px] md:text-xs font-bold font-mono ${getMultiplierColor(mult)}`}
                      >
                        {mult}x
                      </div>
                   ))}
                </div>

                {/* Animated Falling Balls */}
                {activeBalls.map(ball => (
                   <PlinkoBall
                     key={ball.id}
                     ball={ball}
                     rows={rows}
                     onComplete={() => onBallFinish(ball)}
                   />
                ))}
             </div>
          </div>
        </div>

        {/* Local Recent Plays Log */}
        <section className="mt-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-lg font-bold text-zinc-100">Recent Plays</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400 min-w-[500px]">
              <thead className="bg-zinc-950/50 text-xs uppercase font-semibold text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3 text-right">Bet Amount</th>
                  <th className="px-4 py-3 text-right">Multiplier</th>
                  <th className="px-4 py-3 text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {recentPlays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-600">No plays yet. Drop a ball!</td>
                  </tr>
                ) : (
                  recentPlays.map((play) => (
                    <tr key={play.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-300">{new Date(play.id).toLocaleTimeString()}</td>
                      <td className="px-4 py-3 text-right">Rp{play.bet.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-300">{play.multiplier.toFixed(2)}x</td>
                      <td className={`px-4 py-3 text-right font-bold ${play.multiplier >= 1 ? 'text-amber-500' : 'text-zinc-500'}`}>
                        {play.multiplier >= 1 ? `+Rp${play.payout.toLocaleString('id-ID')}` : '-Rp' + play.bet.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

// Subcomponent to animate a single Plinko ball
function PlinkoBall({ ball, rows, onComplete }: { ball: any, rows: number, onComplete: () => void }) {
  // We calculate the X offset for each step of the path.
  // 0 = Left (-1), 1 = Right (+1)

  // Create keyframes based on path
  const ySteps = rows + 1; // 1 step for each row + 1 into bin
  const keyframesY = Array.from({ length: ySteps }).map((_, i) => `${(i / ySteps) * 100}%`);

  const keyframesX: string[] = ['0%'];
  let currentX = 0;

  ball.path.forEach((decision: number) => {
     currentX += decision === 1 ? 1 : -1;
     // The width of the container depends on the rows.
     // We approximate the movement width based on total rows to keep it inside the triangle.
     // Total width spans from -rows to +rows.
     const percentX = (currentX / rows) * 45; // 45% to keep it nicely inside bounds
     keyframesX.push(`${percentX}%`);
  });

  return (
    <motion.div
      className="absolute top-0 w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] z-20"
      initial={{ x: '0%', y: '0%' }}
      animate={{
        x: keyframesX,
        y: keyframesY,
      }}
      transition={{
        duration: rows * 0.2, // Time scales with rows
        ease: "linear",
        times: Array.from({ length: ySteps }).map((_, i) => i / (ySteps - 1))
      }}
      onAnimationComplete={onComplete}
      style={{
        originX: 0.5,
        originY: 0.5,
      }}
    />
  );
}
