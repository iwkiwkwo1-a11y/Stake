'use client';

import { Header } from '@/components/Header';
import { useCrashGame } from '@/hooks/useCrashGame';
import { useWallet } from '@/components/WalletProvider';
import { motion } from 'framer-motion';
import { TrendingUp, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const copyToClipboard = async (text: string, setCopiedState: (val: boolean) => void) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
};

export default function CrashPage() {
  const { balance } = useWallet();
  const {
    gameState,
    currentMultiplier,
    result,
    loading,
    betAmount,
    setBetAmount,
    targetMultiplier,
    setTargetMultiplier,
    clientSeed,
    setClientSeed,
    playCrash
  } = useCrashGame();

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [copiedClient, setCopiedClient] = useState(false);

  const [recentPlays, setRecentPlays] = useState<any[]>([]);

  const handleStart = () => {
    if (betAmount > balance) {
      alert("Bet amount exceeds balance");
      return;
    }
    playCrash();
  };

  const handleMaxBet = () => setBetAmount(balance);
  const handleHalfBet = () => setBetAmount(Math.floor(balance / 2));

  useEffect(() => {
    if (gameState === 'crashed' && result) {
      setRecentPlays(prev => [
        {
          id: Date.now(),
          bet: betAmount,
          multiplier: result.finalMultiplier,
          payout: result.winAmount,
          isWin: result.isWin,
          target: targetMultiplier
        },
        ...prev
      ].slice(0, 10));
    }
  }, [gameState, result, betAmount, targetMultiplier]);

  // Visual text color based on state
  let multiplierColor = "text-zinc-100";
  if (gameState === 'crashed') {
    multiplierColor = result?.isWin ? "text-emerald-500" : "text-red-500";
  } else if (gameState === 'playing') {
     // If current visual has passed the target, turn it green!
     if (currentMultiplier >= targetMultiplier) {
       multiplierColor = "text-emerald-500";
     } else {
       multiplierColor = "text-amber-500";
     }
  }

  // Calculate simulated graph height (visual only)
  const graphHeight = Math.min(100, Math.max(10, (currentMultiplier / Math.max(2, targetMultiplier * 1.5)) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar Controls */}
          <div className="w-full lg:w-80 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-5 order-2 lg:order-1">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Bet Amount (IDR)</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-rose-500 transition-colors">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={loading || gameState === 'playing'}
                  className="w-full bg-transparent px-3 py-2 text-zinc-100 outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleHalfBet}
                  disabled={loading || gameState === 'playing'}
                  className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 border-l border-zinc-700"
                >
                  1/2
                </button>
                <button
                  onClick={handleMaxBet}
                  disabled={loading || gameState === 'playing'}
                  className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 border-l border-zinc-700"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Auto Cashout (Target)</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-rose-500 transition-colors">
                 <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={targetMultiplier}
                  onChange={(e) => setTargetMultiplier(Number(e.target.value))}
                  disabled={loading || gameState === 'playing'}
                  className="w-full bg-transparent px-3 py-2 text-zinc-100 outline-none disabled:opacity-50"
                 />
                 <div className="px-3 py-2 text-xs font-bold bg-zinc-800 text-zinc-400 border-l border-zinc-700 flex items-center justify-center">
                   x
                 </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className="flex justify-between text-sm text-zinc-400">
                 <span>Profit on Win</span>
                 <span className="font-mono text-zinc-300">Rp{Math.floor(betAmount * (targetMultiplier - 1)).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={loading || gameState === 'playing' || betAmount < 100 || betAmount > balance || targetMultiplier <= 1.00}
              className="mt-2 w-full py-3.5 bg-rose-500 hover:bg-rose-400 disabled:bg-rose-900 disabled:text-zinc-500 text-zinc-950 font-bold rounded-lg transition-colors text-lg"
            >
              {gameState === 'playing' ? 'Playing...' : 'Bet (Auto)'}
            </button>

            {/* Provably Fair Inputs */}
            <div className="mt-auto pt-4 border-t border-zinc-800 flex flex-col gap-2">
               <label className="text-xs font-semibold text-zinc-500">Client Seed (Provably Fair)</label>
               <div className="flex bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden focus-within:border-rose-500 transition-colors">
                 <input
                   type="text"
                   value={clientSeed}
                   onChange={(e) => setClientSeed(e.target.value)}
                   disabled={loading || gameState === 'playing'}
                   placeholder="Leave empty to auto"
                   className="w-full bg-transparent px-3 py-2 text-xs text-zinc-300 outline-none disabled:opacity-50"
                 />
                 {clientSeed && (
                   <button
                     onClick={() => copyToClipboard(clientSeed, setCopiedClient)}
                     className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-l border-zinc-700 transition-colors"
                   >
                     {copiedClient ? <Check className="w-3.5 h-3.5 text-rose-500" /> : <Copy className="w-3.5 h-3.5" />}
                   </button>
                 )}
               </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-8 relative overflow-hidden order-1 lg:order-2 min-h-[400px]">

             {/* Info top banner for the most recent game */}
             {result && gameState === 'crashed' && (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-400 z-10 shadow-lg">
                 <div className="flex items-center gap-2 overflow-hidden">
                   <span className="truncate max-w-[120px] md:max-w-md">Hash: {result.serverSeedHash}</span>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => copyToClipboard(result.serverSeedHash, setCopiedHash)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md" title="Copy Hash">
                     {copiedHash ? <Check className="w-3 h-3 text-rose-500" /> : <Copy className="w-3 h-3" />}
                   </button>
                   <button onClick={() => copyToClipboard(result.serverSeed, setCopiedSeed)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-amber-500" title="Copy Seed">
                     {copiedSeed ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                   </button>
                 </div>
              </div>
             )}

             {/* Graph Visualization */}
             <div className="absolute bottom-0 left-0 right-0 h-64 opacity-20 pointer-events-none">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path
                     d={`M0,100 Q50,${100 - graphHeight} 100,${100 - graphHeight}`}
                     fill="none"
                     stroke={gameState === 'crashed' ? (result?.isWin ? '#10b981' : '#ef4444') : '#f43f5e'}
                     strokeWidth="2"
                   />
                   <polygon
                     points={`0,100 0,100 50,${100 - graphHeight} 100,${100 - graphHeight} 100,100`}
                     fill={gameState === 'crashed' ? (result?.isWin ? 'url(#grad-green)' : 'url(#grad-red)') : 'url(#grad-rose)'}
                   />
                   <defs>
                     <linearGradient id="grad-rose" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
                       <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                     </linearGradient>
                     <linearGradient id="grad-green" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                       <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                     </linearGradient>
                     <linearGradient id="grad-red" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                       <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                     </linearGradient>
                   </defs>
                </svg>
             </div>

             <div className="flex flex-col items-center justify-center z-10">
                <div className={`text-7xl md:text-9xl font-black tabular-nums transition-colors duration-300 ${multiplierColor}`}>
                   {currentMultiplier.toFixed(2)}x
                </div>
                {gameState === 'crashed' && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-4 text-xl font-bold text-red-500"
                  >
                    Crashed!
                  </motion.div>
                )}
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
                  <th className="px-4 py-3 text-right">Target</th>
                  <th className="px-4 py-3 text-right">Crash Point</th>
                  <th className="px-4 py-3 text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {recentPlays.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No plays yet. Place a bet!</td>
                  </tr>
                ) : (
                  recentPlays.map((play) => (
                    <tr key={play.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-300">{new Date(play.id).toLocaleTimeString()}</td>
                      <td className="px-4 py-3 text-right">Rp{play.bet.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-right text-zinc-500">{play.target.toFixed(2)}x</td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-300">{play.multiplier.toFixed(2)}x</td>
                      <td className={`px-4 py-3 text-right font-bold ${play.isWin ? 'text-emerald-500' : 'text-zinc-500'}`}>
                        {play.isWin ? `+Rp${play.payout.toLocaleString('id-ID')}` : '-Rp' + play.bet.toLocaleString('id-ID')}
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
