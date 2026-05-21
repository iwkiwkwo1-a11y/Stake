'use client';

import { useState, useRef, useEffect } from 'react';
import { playCrashAction, CrashResult } from '@/actions/crash';
import { useWallet } from '@/components/WalletProvider';
import { generateSeed } from '@/utils/provably-fair';

export function useCrashGame() {
  const { refreshBalance, updateOptimisticBalance } = useWallet();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrashResult | null>(null);

  // Game State: 'idle' | 'playing' | 'crashed'
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed'>('idle');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);

  // Betting Inputs
  const [betAmount, setBetAmount] = useState<number>(100);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.00);
  const [clientSeed, setClientSeed] = useState<string>('');

  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Easing function for realistic Crash curve (exponential)
  // Crash formula: multiplier = e^(r * t)
  // Let's approximate it for visual pleasure
  const animateCrash = (final: number, isWin: boolean) => {
    setGameState('playing');
    setCurrentMultiplier(1.00);
    startTimeRef.current = performance.now();

    // The higher the final multiplier, the longer it takes, but it curves up
    // We'll set a base speed
    const tick = (time: number) => {
      const elapsed = (time - startTimeRef.current!) / 1000; // in seconds

      // Typical crash speed formula: 1.0006 ^ (elapsed_ms / 66) -- roughly exponential
      // Let's use a simpler one: multiplier = Math.pow(Math.E, 0.06 * elapsed * elapsed) + something
      // Actually, Stake's visual formula is exactly: Math.pow(Math.E, 0.00006 * timeMs)
      const visualMultiplier = Math.pow(Math.E, 0.25 * elapsed);

      if (visualMultiplier >= final) {
        setCurrentMultiplier(final);
        setGameState('crashed');
        if (isWin) {
          refreshBalance(); // Update actual balance once visual is done
        }
        return;
      }

      setCurrentMultiplier(visualMultiplier);
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const playCrash = async () => {
    if (gameState === 'playing') return;

    setLoading(true);
    setResult(null);
    setGameState('idle');
    setCurrentMultiplier(1.00);

    try {
      const seedToUse = clientSeed || generateSeed();
      if (!clientSeed) setClientSeed(seedToUse);

      updateOptimisticBalance(-betAmount);

      const res = await playCrashAction(betAmount, targetMultiplier, seedToUse);

      if (res.success && res.data) {
        setResult(res.data);
        // Start visual animation of the multiplier going up
        animateCrash(res.data.finalMultiplier, res.data.isWin);
      } else {
        alert(res.error || 'Failed to play Crash');
        await refreshBalance();
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
      await refreshBalance();
    } finally {
      setLoading(false);
    }
  };

  return {
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
    playCrash,
  };
}
