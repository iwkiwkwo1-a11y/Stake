'use client';

import { useState } from 'react';
import { startGameAction, revealTileAction, cashOutAction, GameStateResponse } from '@/actions/mines';
import { useWallet } from '@/components/WalletProvider';
import { generateSeed } from '@/utils/provably-fair';

export function useMinesGame() {
  const { refreshBalance, updateOptimisticBalance } = useWallet();

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);

  // Betting Inputs
  const [betAmount, setBetAmount] = useState<number>(100);
  const [mineCount, setMineCount] = useState<number>(3);
  const [clientSeed, setClientSeed] = useState<string>('');

  const startGame = async () => {
    setLoading(true);
    try {
      const seedToUse = clientSeed || generateSeed();
      if (!clientSeed) setClientSeed(seedToUse); // Ensure client seed is visible

      const res = await startGameAction(betAmount, mineCount, seedToUse);
      if (res.success && res.data) {
        setToken(res.data.token);
        setGameState(res.data);
        updateOptimisticBalance(-betAmount);
      } else {
        alert(res.error || 'Failed to start game');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while starting the game.');
    } finally {
      setLoading(false);
    }
  };

  const revealTile = async (index: number) => {
    if (!token || !gameState || gameState.isOver || gameState.openedTiles.includes(index) || loading) return;

    setLoading(true);
    try {
      const res = await revealTileAction(token, index);
      if (res.success && res.data) {
        setToken(res.data.token);
        setGameState(res.data);

        if (res.data.isOver) {
          // If won, update balance
          if (res.data.winAmount !== undefined) {
             await refreshBalance();
          }
        }
      } else {
        alert(res.error || 'Failed to reveal tile');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!token || !gameState || gameState.isOver || gameState.openedTiles.length === 0 || loading) return;

    setLoading(true);
    try {
      const res = await cashOutAction(token);
      if (res.success && res.data) {
        setToken(res.data.token);
        setGameState(res.data);
        await refreshBalance();
      } else {
        alert(res.error || 'Failed to cash out');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setToken(null);
    setGameState(null);
  };

  return {
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
    resetGame,
  };
}
