'use client';

import { Header } from '@/components/Header';
import { useDiceGame } from '@/hooks/useDiceGame';
import { useWallet } from '@/components/WalletProvider';
import { motion } from 'framer-motion';
import { Dices, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

// Shared function to copy to clipboard (can be factored out later)
const copyToClipboard = async (text: string, setCopiedState: (val: boolean) => void) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
};

export default function DicePage() {
  const { balance } = useWallet();
  const {
    result,
    loading,
    betAmount,
    setBetAmount,
    target,
    setTarget,
    condition,
    setCondition,
    clientSeed,
    setClientSeed,
    rollDice
  } = useDiceGame();

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [copiedClient, setCopiedClient] = useState(false);

  // Derived Values for UI
  const winChance = condition === 'over' ? 100 - target : target;
  const multiplier = (100 / winChance) * 0.99; // Using standard 1% edge for UI display

  const handleStart = () => {
    if (betAmount > balance) {
      alert("Bet amount exceeds balance");
      return;
    }
    rollDice();
  };

  const handleMaxBet = () => setBetAmount(balance);
  const handleHalfBet = () => setBetAmount(Math.floor(balance / 2));
  const toggleCondition = () => setCondition(prev => prev === 'over' ? 'under' : 'over');

  // Local Game Logs state
  const [recentPlays, setRecentPlays] = useState<any[]>([]);

  // Update logs when result changes
  useEffect(() => {
    if (result) {
      setRecentPlays(prev => [
        {
          id: Date.now(),
          bet: betAmount,
          multiplier: result.multiplier,
          payout: result.winAmount,
          isWin: result.isWin,
          roll: result.roll,
        },
        ...prev
      ].slice(0, 10)); // Keep last 10
    }
  }, [result, betAmount]);

  // Ensure target stays within bounds if condition changes manually
  useEffect(() => {
    if (target < 0.01) setTarget(0.01);
    if (target > 99.99) setTarget(99.99);
  }, [target, setTarget]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">

        <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-5 order-2 lg:order-1">

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-400">Bet Amount (IDR)</label>
            <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-emerald-500 transition-colors">
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

          <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col gap-2">
               <label className="text-sm font-semibold text-zinc-400">Profit on Win</label>
               <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 text-sm font-mono">
                 +Rp{Math.floor(betAmount * (multiplier - 1)).toLocaleString('id-ID')}
               </div>
             </div>
             <div className="flex flex-col gap-2">
               <label className="text-sm font-semibold text-zinc-400">Win Chance</label>
               <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 text-sm font-mono">
                 {winChance.toFixed(2)}%
               </div>
             </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || betAmount < 100 || betAmount > balance}
            className="mt-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-zinc-500 text-zinc-950 font-bold rounded-lg transition-colors text-lg"
          >
            Bet
          </button>

          {/* Provably Fair Inputs */}
          <div className="mt-auto pt-4 border-t border-zinc-800 flex flex-col gap-2">
             <label className="text-xs font-semibold text-zinc-500">Client Seed (Provably Fair)</label>
             <div className="flex bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden focus-within:border-emerald-500 transition-colors">
               <input
                 type="text"
                 value={clientSeed}
                 onChange={(e) => setClientSeed(e.target.value)}
                 disabled={loading}
                 placeholder="Leave empty to auto-generate"
                 className="w-full bg-transparent px-3 py-2 text-xs text-zinc-300 outline-none disabled:opacity-50"
               />
               {clientSeed && (
                 <button
                   onClick={() => copyToClipboard(clientSeed, setCopiedClient)}
                   className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-l border-zinc-700 transition-colors flex items-center justify-center"
                   title="Copy Client Seed"
                 >
                   {copiedClient ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                 </button>
               )}
             </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-8 relative overflow-hidden order-1 lg:order-2 min-h-[400px]">

          {/* Result Display */}
          <div className="flex flex-col items-center justify-center mb-12">
            <motion.div
              key={result?.serverSeedHash || 'empty'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-6xl md:text-8xl font-black tabular-nums ${
                result ? (result.isWin ? 'text-emerald-500' : 'text-red-500') : 'text-zinc-700'
              }`}
            >
              {result ? result.roll.toFixed(2) : '00.00'}
            </motion.div>

            {result && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-4 flex flex-col items-center gap-2"
              >
                <div className={`px-4 py-1 rounded-full text-sm font-bold ${result.isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                   {result.isWin ? `Won Rp${result.winAmount.toLocaleString('id-ID')}` : 'Busted!'}
                </div>

                {/* Provably Fair Result Details */}
                <div className="flex gap-2 mt-4 text-xs font-mono text-zinc-500">
                   <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                     <span>Seed:</span>
                     <span className="truncate w-24 text-zinc-400">{result.serverSeed}</span>
                     <button onClick={() => copyToClipboard(result.serverSeed, setCopiedSeed)} className="hover:text-zinc-300">
                        {copiedSeed ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                     </button>
                   </div>
                   <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                     <span>Hash:</span>
                     <span className="truncate w-24 text-zinc-400">{result.serverSeedHash}</span>
                     <button onClick={() => copyToClipboard(result.serverSeedHash, setCopiedHash)} className="hover:text-zinc-300">
                        {copiedHash ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                     </button>
                   </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Slider Controls */}
          <div className="w-full max-w-lg bg-zinc-950 p-6 rounded-xl border border-zinc-800">

             {/* Dynamic Slider Visualization */}
             <div className="relative h-3 bg-zinc-800 rounded-full mb-8">
                <div
                  className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 ${condition === 'over' ? 'right-0 bg-emerald-500' : 'left-0 bg-red-500'}`}
                  style={{
                    width: condition === 'over' ? `${100 - target}%` : `${target}%`,
                  }}
                />
                <input
                  type="range"
                  min="0.01"
                  max="99.99"
                  step="0.01"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  disabled={loading}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />

                {/* Handle UI */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-zinc-300 pointer-events-none transition-all duration-75"
                  style={{ left: `${target}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap font-mono font-bold">
                    {target.toFixed(2)}
                  </div>
                </div>

                {/* Roll Marker (Shows previous result) */}
                {result && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-zinc-950 z-10 ${result.isWin ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ left: `${result.roll}%` }}
                  />
                )}
             </div>

             <div className="grid grid-cols-3 gap-2 md:gap-4 items-center">
                <div className="flex flex-col gap-1">
                   <label className="text-xs text-zinc-500 font-semibold text-center">Multiplier</label>
                   <div className="bg-zinc-900 border border-zinc-800 text-center rounded-md py-2 font-mono text-zinc-300 text-sm">
                      {multiplier.toFixed(4)}x
                   </div>
                </div>

                <div className="flex flex-col gap-1 items-center justify-end h-full">
                   <button
                     onClick={toggleCondition}
                     disabled={loading}
                     className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md py-2 font-bold transition-colors"
                   >
                     <ArrowRightLeft className="w-4 h-4" />
                     {condition.toUpperCase()}
                   </button>
                </div>

                <div className="flex flex-col gap-1">
                   <label className="text-xs text-zinc-500 font-semibold text-center">Roll {condition}</label>
                   <div className="bg-zinc-900 border border-zinc-800 text-center rounded-md py-2 font-mono text-zinc-300 text-sm">
                      <input
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(Number(e.target.value))}
                        disabled={loading}
                        className="bg-transparent w-full text-center outline-none"
                      />
                   </div>
                </div>
             </div>
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
                  <th className="px-4 py-3 text-right">Roll</th>
                  <th className="px-4 py-3 text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {recentPlays.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No plays yet. Start rolling!</td>
                  </tr>
                ) : (
                  recentPlays.map((play) => (
                    <tr key={play.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-300">{new Date(play.id).toLocaleTimeString()}</td>
                      <td className="px-4 py-3 text-right">Rp{play.bet.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-300">{play.multiplier.toFixed(4)}x</td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-300">{play.roll.toFixed(2)}</td>
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
