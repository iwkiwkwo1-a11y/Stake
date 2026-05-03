'use client';

import { Header } from '@/components/Header';
import { useMinesGame } from '@/hooks/useMinesGame';
import { useWallet } from '@/components/WalletProvider';
import { motion } from 'framer-motion';
import { Bomb, Gem, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function MinesPage() {
  const { balance } = useWallet();
  const {
    gameState,
    loading,
    betAmount,
    setBetAmount,
    mineCount,
    setMineCount,
    clientSeed,
    setClientSeed,
    startGame,
    revealTile,
    cashOut,
    resetGame
  } = useMinesGame();

  const isPlaying = gameState !== null && !gameState.isOver;

  const handleStart = () => {
    if (betAmount > balance) {
      alert("Bet amount exceeds balance");
      return;
    }
    startGame();
  };

  const handleMaxBet = () => setBetAmount(balance);
  const handleHalfBet = () => setBetAmount(Math.floor(balance / 2));

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-6">

        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-5">

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-400">Bet Amount (IDR)</label>
            <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-emerald-500 transition-colors">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={isPlaying || loading}
                className="w-full bg-transparent px-3 py-2 text-zinc-100 outline-none disabled:opacity-50"
              />
              <button
                onClick={handleHalfBet}
                disabled={isPlaying || loading}
                className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 border-l border-zinc-700"
              >
                1/2
              </button>
              <button
                onClick={handleMaxBet}
                disabled={isPlaying || loading}
                className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 border-l border-zinc-700"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-400">Mines</label>
            <select
              value={mineCount}
              onChange={(e) => setMineCount(Number(e.target.value))}
              disabled={isPlaying || loading}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 outline-none focus:border-emerald-500 disabled:opacity-50"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {!isPlaying ? (
            <button
              onClick={handleStart}
              disabled={loading || betAmount < 100 || betAmount > balance}
              className="mt-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-zinc-500 text-zinc-950 font-bold rounded-lg transition-colors text-lg"
            >
              Bet
            </button>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Multiplier</span>
                <span className="font-bold text-emerald-500 text-lg">{gameState.multiplier.toFixed(2)}x</span>
              </div>
              <button
                onClick={cashOut}
                disabled={loading || gameState.openedTiles.length === 0}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-zinc-500 text-zinc-950 font-bold rounded-lg transition-colors text-lg"
              >
                Cash Out
              </button>
            </div>
          )}

          {/* Provably Fair Inputs */}
          {!isPlaying && (
            <div className="mt-auto pt-4 border-t border-zinc-800 flex flex-col gap-2">
               <label className="text-xs font-semibold text-zinc-500">Client Seed (Provably Fair)</label>
               <input
                 type="text"
                 value={clientSeed}
                 onChange={(e) => setClientSeed(e.target.value)}
                 disabled={isPlaying || loading}
                 placeholder="Leave empty to auto-generate"
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500"
               />
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl p-8 relative overflow-hidden">

          {/* Active Game Hash Display */}
          {isPlaying && (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-zinc-950/50 backdrop-blur border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-400">
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 <span className="truncate max-w-[200px] md:max-w-md">Hash: {gameState.serverSeedHash}</span>
               </div>
            </div>
          )}

          {gameState?.isOver && (
            <div className="absolute z-10 bg-zinc-950/80 inset-0 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl max-w-md w-full"
                >
                  <h2 className={`text-3xl font-black mb-2 ${gameState.winAmount ? 'text-emerald-500' : 'text-red-500'}`}>
                    {gameState.winAmount ? `${gameState.multiplier.toFixed(2)}x Payout!` : 'Busted!'}
                  </h2>
                  <p className="text-zinc-400 mb-6">
                    {gameState.winAmount
                      ? `You won Rp${gameState.winAmount.toLocaleString('id-ID')}!`
                      : 'You hit a mine.'}
                  </p>

                  <div className="bg-zinc-950 p-4 rounded-lg text-left text-xs font-mono break-all mb-6 border border-zinc-800">
                    <div className="text-zinc-500 mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Server Seed (Un-hashed)
                    </div>
                    <div className="text-zinc-300">{gameState.serverSeed}</div>
                  </div>

                  <button
                    onClick={resetGame}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Play Again
                  </button>
                </motion.div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2 md:gap-3 w-full max-w-md aspect-square mt-8">
            {Array.from({ length: 25 }).map((_, index) => {
              const isOpened = gameState?.openedTiles.includes(index);
              const isGameOver = gameState?.isOver;
              const isBomb = gameState?.bombs?.includes(index);

              // Determine tile style
              let tileClass = "bg-zinc-800 hover:bg-zinc-700 cursor-pointer shadow-[0_4px_0_0_rgb(39,39,42)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgb(39,39,42)] active:translate-y-1 active:shadow-[0_0px_0_0_rgb(39,39,42)] transition-all rounded-lg md:rounded-xl flex items-center justify-center relative";

              if (isOpened) {
                tileClass = "bg-zinc-950 border border-zinc-800 shadow-inner rounded-lg md:rounded-xl flex items-center justify-center";
              } else if (isGameOver) {
                tileClass = "bg-zinc-900 border border-zinc-800 opacity-50 rounded-lg md:rounded-xl flex items-center justify-center";
              }

              // Only clickable if playing and not opened
              const isClickable = isPlaying && !isOpened;

              return (
                <button
                  key={index}
                  onClick={() => isClickable && revealTile(index)}
                  disabled={!isClickable}
                  className={tileClass}
                >
                  {isOpened && (
                     <motion.div
                       initial={{ scale: 0, rotate: -45 }}
                       animate={{ scale: 1, rotate: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 20 }}
                     >
                       <Gem className="w-6 h-6 md:w-10 md:h-10 text-emerald-400" />
                     </motion.div>
                  )}

                  {isGameOver && !isOpened && isBomb && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                    >
                      <Bomb className="w-6 h-6 md:w-10 md:h-10 text-red-500" />
                    </motion.div>
                  )}

                  {isGameOver && !isOpened && !isBomb && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.3 }}
                    >
                      <Gem className="w-6 h-6 md:w-10 md:h-10 text-emerald-400" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
