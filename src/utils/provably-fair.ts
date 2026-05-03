import CryptoJS from 'crypto-js';

/**
 * Provably Fair Utility Module for Mines
 *
 * This module allows verifying that the game outcome was predetermined
 * and not altered during the game, by using HMAC-SHA256.
 */

export function generateSeed(): string {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}

export function hashSeed(seed: string): string {
  return CryptoJS.SHA256(seed).toString(CryptoJS.enc.Hex);
}

/**
 * Generates an array of bomb positions based on provably fair algorithm.
 *
 * @param serverSeed The server's secret seed.
 * @param clientSeed The client's seed.
 * @param nonce The game nonce (to ensure uniqueness if seeds are reused).
 * @param mineCount The number of mines to generate (1-24).
 * @param grid_size The total number of squares (default 25).
 * @returns Array of positions (0-24) containing mines.
 */
export function generateBombs(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  mineCount: number,
  gridSize: number = 25
): number[] {
  let currentRound = 0;
  const bombs: Set<number> = new Set();

  // We need to generate numbers until we have exactly `mineCount` unique bomb positions.
  while (bombs.size < mineCount) {
    // Combine parameters to create an HMAC payload.
    // We incorporate currentRound so we can generate more random data if needed.
    const message = `${clientSeed}:${nonce}:${currentRound}`;
    const hash = CryptoJS.HmacSHA256(message, serverSeed).toString(CryptoJS.enc.Hex);

    // We can extract multiple 4-byte (8 hex chars) chunks from the 64-char hex hash.
    // A SHA-256 hash is 32 bytes = 256 bits = 64 hex characters.
    for (let i = 0; i < hash.length / 8; i++) {
      const hexChunk = hash.substring(i * 8, (i + 1) * 8);
      const intVal = parseInt(hexChunk, 16);

      // We map the int value to our grid size.
      // To avoid modulo bias, one strict approach is to only use numbers below a maximum threshold,
      // but for simulation purposes, modulo is common.
      // A slightly less biased approach:
      const maxRange = Math.pow(2, 32); // 4 bytes max
      // Use the float representation to get a random float [0, 1)
      const randFloat = intVal / maxRange;

      const position = Math.floor(randFloat * gridSize);

      if (!bombs.has(position)) {
        bombs.add(position);
        if (bombs.size === mineCount) {
          break; // We have enough bombs
        }
      }
    }
    currentRound++;
  }

  return Array.from(bombs);
}

/**
 * Generates a Dice Roll (0.00 to 100.00) based on provably fair algorithm.
 *
 * @param serverSeed The server's secret seed.
 * @param clientSeed The client's seed.
 * @param nonce The game nonce.
 * @returns A float between 0.00 and 100.00, rounded to 2 decimal places.
 */
export function generateDiceRoll(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number {
  const message = `${clientSeed}:${nonce}:0`;
  const hash = CryptoJS.HmacSHA256(message, serverSeed).toString(CryptoJS.enc.Hex);

  // We take the first 4 bytes (8 hex chars)
  const hexChunk = hash.substring(0, 8);
  const intVal = parseInt(hexChunk, 16);

  // Map to 0 - 100.00
  const maxRange = Math.pow(2, 32);
  const randFloat = intVal / maxRange;

  const roll = randFloat * 100.01; // Slightly over 100 to allow reaching 100.00 flat

  // Cap at 100.00
  let finalRoll = Math.min(roll, 100.00);

  // Format to 2 decimal places
  finalRoll = Math.floor(finalRoll * 100) / 100;

  return finalRoll;
}
