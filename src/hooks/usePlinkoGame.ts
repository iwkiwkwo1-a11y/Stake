'use client';

import { useState } from 'react';
import { dropPlinkoBallAction, PlinkoResult } from '@/actions/plinko';
import { useWallet } from '@/components/WalletProvider';
import { generateSeed } from '@/utils/provably-fair';

export function usePlinkoGame() {
  const { refreshBalance, updateOptimisticBalance } = useWallet();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlinkoResult | null>(null);

  // Betting Inputs
  const [betAmount, setBetAmount] = useState<number>(100);
  const [rows, setRows] = useState<8 | 12 | 16>(16);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [clientSeed, setClientSeed] = useState<string>('');

  const dropBall = async () => {
    setLoading(true);
    setResult(null);
    try {
      const seedToUse = clientSeed || generateSeed();
      if (!clientSeed) setClientSeed(seedToUse);

      updateOptimisticBalance(-betAmount);

      const res = await dropPlinkoBallAction(betAmount, rows, risk, seedToUse);

      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.winAmount > 0) {
          // Delay balance refresh to match physical drop time if desired,
          // but for simplicity we fetch right away. The UI won't show it immediately
          // if we handle local optimistic states well, but here we just refresh.
          // In a real physics game, you'd trigger this *after* the ball animation finishes.
          // We will let the UI trigger the refresh when the animation is done.
        }
      } else {
        alert(res.error || 'Failed to drop ball');
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
    dropBall,
  };
}
