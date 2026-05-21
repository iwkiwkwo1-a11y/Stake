'use client';

import { useState } from 'react';
import { rollDiceAction, DiceRollResult } from '@/actions/dice';
import { useWallet } from '@/components/WalletProvider';
import { generateSeed } from '@/utils/provably-fair';

export function useDiceGame() {
  const { refreshBalance, updateOptimisticBalance } = useWallet();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiceRollResult | null>(null);

  // Betting Inputs
  const [betAmount, setBetAmount] = useState<number>(100);
  const [target, setTarget] = useState<number>(50.50);
  const [condition, setCondition] = useState<'over' | 'under'>('over');
  const [clientSeed, setClientSeed] = useState<string>('');

  const rollDice = async () => {
    setLoading(true);
    setResult(null);
    try {
      const seedToUse = clientSeed || generateSeed();
      if (!clientSeed) setClientSeed(seedToUse); // Ensure client seed is visible

      updateOptimisticBalance(-betAmount);

      const res = await rollDiceAction(betAmount, target, condition, seedToUse);

      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.isWin) {
          await refreshBalance();
        }
      } else {
        alert(res.error || 'Failed to roll dice');
        await refreshBalance(); // rollback optimistic on failure
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while rolling the dice.');
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
    target,
    setTarget,
    condition,
    setCondition,
    clientSeed,
    setClientSeed,
    rollDice,
  };
}
