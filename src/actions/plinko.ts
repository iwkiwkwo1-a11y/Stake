'use server';

import { generateSeed, hashSeed, generatePlinkoPath } from '@/utils/provably-fair';
import { getBalance, updateBalance } from '@/utils/wallet';

export interface PlinkoResult {
  path: number[];
  multiplier: number;
  winAmount: number;
  serverSeed: string;
  serverSeedHash: string;
  finalIndex: number;
}

// Plinko Multipliers based on Risk and Rows (Simplified Stake approximation)
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

export async function dropPlinkoBallAction(
  betAmount: number,
  rows: 8 | 12 | 16,
  risk: 'low' | 'medium' | 'high',
  clientSeed: string
): Promise<{ success: boolean; data?: PlinkoResult; error?: string }> {
  try {
    if (betAmount < 100) return { success: false, error: 'Minimum bet is Rp100.' };
    if (![8, 12, 16].includes(rows)) return { success: false, error: 'Invalid rows.' };
    if (!['low', 'medium', 'high'].includes(risk)) return { success: false, error: 'Invalid risk.' };

    const balance = await getBalance();
    if (balance < betAmount) return { success: false, error: 'Insufficient balance.' };

    await updateBalance(balance - betAmount);

    const serverSeed = generateSeed();
    const serverSeedHash = hashSeed(serverSeed);
    const nonce = 1;

    const path = generatePlinkoPath(serverSeed, clientSeed, nonce, rows);

    // Calculate final bin index (number of 'right' decisions)
    const finalIndex = path.reduce((acc, val) => acc + val, 0);

    const multiplier = PLINKO_MULTIPLIERS[risk][rows][finalIndex];
    const winAmount = betAmount * multiplier;

    if (winAmount > 0) {
       const newBalance = await getBalance();
       await updateBalance(newBalance + winAmount);
    }

    return {
      success: true,
      data: {
        path,
        multiplier,
        winAmount,
        serverSeed,
        serverSeedHash,
        finalIndex
      }
    };

  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to drop Plinko ball.' };
  }
}
