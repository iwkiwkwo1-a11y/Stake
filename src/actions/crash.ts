'use server';

import { generateSeed, hashSeed, generateCrashMultiplier } from '@/utils/provably-fair';
import { getBalance, updateBalance } from '@/utils/wallet';

export interface CrashResult {
  finalMultiplier: number;
  serverSeed: string;
  serverSeedHash: string;
  winAmount: number;
  isWin: boolean;
}

/**
 * Simulates a Crash game round for a single player.
 * Real Crash games are multiplayer and tick upward, but for this simulation,
 * we will instantly resolve the result based on an Auto Cashout target.
 */
export async function playCrashAction(
  betAmount: number,
  targetMultiplier: number,
  clientSeed: string
): Promise<{ success: boolean; data?: CrashResult; error?: string }> {
  try {
    if (betAmount < 100) return { success: false, error: 'Minimum bet is Rp100.' };
    if (targetMultiplier <= 1.00) return { success: false, error: 'Target multiplier must be greater than 1.00.' };

    const balance = await getBalance();
    if (balance < betAmount) return { success: false, error: 'Insufficient balance.' };

    await updateBalance(balance - betAmount);

    const serverSeed = generateSeed();
    const serverSeedHash = hashSeed(serverSeed);
    const nonce = 1;

    const crashPoint = generateCrashMultiplier(serverSeed, clientSeed, nonce);

    // If the crash point is strictly greater than or equal to the target, the player wins.
    const isWin = crashPoint >= targetMultiplier;

    let winAmount = 0;
    if (isWin) {
      winAmount = betAmount * targetMultiplier;
      const newBalance = await getBalance();
      await updateBalance(newBalance + winAmount);
    }

    return {
      success: true,
      data: {
        finalMultiplier: crashPoint,
        serverSeed,
        serverSeedHash,
        winAmount,
        isWin
      }
    };

  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to play Crash.' };
  }
}
