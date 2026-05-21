import { combinations } from 'mathjs';

/**
 * Calculates the exact multiplier for a given game state based on hypergeometric distribution.
 *
 * Formula based on Stake.com's implementation.
 *
 * Probability of picking exactly `openedSafes` safes out of `totalSafes`,
 * from a grid of `totalTiles` where we have selected `openedSafes` total tiles.
 *
 * Actually, it's simpler:
 * Number of ways to pick `openedSafes` from `totalSafes` (total safe tiles)
 * divided by
 * Number of ways to pick `openedSafes` from `totalTiles` (total tiles).
 *
 * House edge factor: typically around 1% (0.99 multiplier).
 * Stake uses 0.99 for original games.
 *
 * @param mines Number of mines (1-24)
 * @param openedSafes Number of safe tiles currently opened
 * @param houseEdge House edge percentage (e.g. 0.01 for 1%)
 * @param totalTiles Total tiles in grid (25)
 * @returns The calculated multiplier
 */
export function calculateMultiplier(
  mines: number,
  openedSafes: number,
  houseEdge: number = 0.01,
  totalTiles: number = 25
): number {
  if (openedSafes === 0) return 1;

  const totalSafes = totalTiles - mines;

  if (openedSafes > totalSafes) {
    throw new Error('Opened safes cannot exceed total safe tiles');
  }

  // Calculate combinations
  // Number of ways to pick exactly `openedSafes` safe tiles out of `totalSafes`
  // C(totalSafes, openedSafes)
  const waysToWin = Number(combinations(totalSafes, openedSafes));

  // Number of ways to pick any `openedSafes` tiles out of `totalTiles`
  // C(totalTiles, openedSafes)
  const totalCombinations = Number(combinations(totalTiles, openedSafes));

  // Probability of winning this exact sequence
  const probability = waysToWin / totalCombinations;

  // The true odds (if fair) would be 1 / probability.
  // We apply the house edge by multiplying the odds by (1 - houseEdge)
  let multiplier = (1 / probability) * (1 - houseEdge);

  // Round to 2 decimal places, or return exactly? Stake typically rounds to 2 decimal places for display,
  // but let's provide slightly more precision internally and let UI round.
  // Let's do 2 decimal places like standard Stake.
  multiplier = Math.floor(multiplier * 100) / 100;

  return multiplier;
}

/**
 * Helper to calculate the next multiplier if one more safe tile is opened.
 */
export function calculateNextMultiplier(
  mines: number,
  openedSafes: number,
  houseEdge: number = 0.01,
  totalTiles: number = 25
): number {
  if (openedSafes + 1 > totalTiles - mines) return 0;
  return calculateMultiplier(mines, openedSafes + 1, houseEdge, totalTiles);
}
