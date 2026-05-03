'use server';

import { generateSeed, hashSeed, generateDiceRoll } from '@/utils/provably-fair';
import { getBalance, updateBalance } from '@/utils/wallet';

export interface DiceRollResult {
  roll: number;
  multiplier: number;
  winAmount: number;
  isWin: boolean;
  serverSeed: string;
  serverSeedHash: string;
}

export async function rollDiceAction(
  betAmount: number,
  target: number,
  condition: 'over' | 'under',
  clientSeed: string
): Promise<{ success: boolean; data?: DiceRollResult; error?: string }> {
  try {
    if (betAmount < 100) return { success: false, error: 'Minimum bet is Rp100.' };
    if (target < 0.01 || target > 99.99) return { success: false, error: 'Invalid target.' };

    const balance = await getBalance();
    if (balance < betAmount) return { success: false, error: 'Insufficient balance.' };

    // Calculate Multiplier. House Edge: 1% (Stake standard)
    const houseEdge = 0.01;
    let winChance = 0;

    if (condition === 'over') {
      winChance = 100 - target;
    } else {
      winChance = target; // under
    }

    if (winChance <= 0 || winChance >= 100) return { success: false, error: 'Invalid win chance.' };

    const multiplier = (100 / winChance) * (1 - houseEdge);
    // Round multiplier to 4 decimal places for precision
    const roundedMultiplier = Math.floor(multiplier * 10000) / 10000;

    // Deduct bet amount immediately
    await updateBalance(balance - betAmount);

    // Generate Provably Fair Roll
    const serverSeed = generateSeed();
    const serverSeedHash = hashSeed(serverSeed);
    const nonce = 1;

    const roll = generateDiceRoll(serverSeed, clientSeed, nonce);

    // Determine Win/Loss
    let isWin = false;
    if (condition === 'over' && roll > target) {
      isWin = true;
    } else if (condition === 'under' && roll < target) {
      isWin = true;
    }

    let winAmount = 0;
    if (isWin) {
      winAmount = betAmount * roundedMultiplier;
      const newBalance = await getBalance();
      await updateBalance(newBalance + winAmount);
    }

    return {
      success: true,
      data: {
        roll,
        multiplier: roundedMultiplier,
        winAmount,
        isWin,
        serverSeed,
        serverSeedHash,
      }
    };

  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to roll dice.' };
  }
}
