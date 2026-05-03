'use server';

import { EncryptJWT, jwtDecrypt } from 'jose';
import { generateSeed, hashSeed, generateBombs } from '@/utils/provably-fair';
import { getBalance, updateBalance } from '@/utils/wallet';
import { calculateMultiplier } from '@/utils/multiplier';

// Key must be exactly 32 bytes (256 bits) for A256GCM
const JWT_SECRET = new TextEncoder().encode(
  (process.env.JWT_SECRET || 'supersecret123_fallback_do_not_use_in_prod').padEnd(32, '0').slice(0, 32)
);

export interface GameStatePayload {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  betAmount: number;
  mineCount: number;
  bombs: number[];
  openedTiles: number[];
  isOver: boolean;
  multiplier: number;
}

export interface GameStateResponse {
  token: string;
  openedTiles: number[];
  isOver: boolean;
  multiplier: number;
  serverSeedHash: string;
  // Included only when game is over
  serverSeed?: string;
  bombs?: number[];
  winAmount?: number;
}

// Ensure payload has all properties
function isValidPayload(payload: any): payload is GameStatePayload {
  return (
    typeof payload.serverSeed === 'string' &&
    typeof payload.clientSeed === 'string' &&
    typeof payload.nonce === 'number' &&
    typeof payload.betAmount === 'number' &&
    typeof payload.mineCount === 'number' &&
    Array.isArray(payload.bombs) &&
    Array.isArray(payload.openedTiles) &&
    typeof payload.isOver === 'boolean' &&
    typeof payload.multiplier === 'number'
  );
}

export async function startGameAction(betAmount: number, mineCount: number, clientSeed: string): Promise<{ success: boolean; data?: GameStateResponse; error?: string }> {
  try {
    if (betAmount < 100) return { success: false, error: 'Minimum bet is Rp100.' };
    if (mineCount < 1 || mineCount > 24) return { success: false, error: 'Mines must be between 1 and 24.' };

    const balance = await getBalance();
    if (balance < betAmount) return { success: false, error: 'Insufficient balance.' };

    // Deduct balance
    await updateBalance(balance - betAmount);

    const serverSeed = generateSeed();
    const serverSeedHash = hashSeed(serverSeed);
    const nonce = 1; // Simplified: 1 nonce per game instance for now

    const bombs = generateBombs(serverSeed, clientSeed, nonce, mineCount, 25);

    const payload: GameStatePayload = {
      serverSeed,
      clientSeed,
      nonce,
      betAmount,
      mineCount,
      bombs,
      openedTiles: [],
      isOver: false,
      multiplier: 1.0, // starts at 1.0
    };

    const token = await new EncryptJWT({ ...payload })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .encrypt(JWT_SECRET);

    return {
      success: true,
      data: {
        token,
        openedTiles: [],
        isOver: false,
        multiplier: 1.0,
        serverSeedHash,
      }
    };

  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to start game.' };
  }
}

export async function revealTileAction(token: string, tileIndex: number): Promise<{ success: boolean; data?: GameStateResponse; error?: string }> {
  try {
    const { payload } = await jwtDecrypt(token, JWT_SECRET);

    if (!isValidPayload(payload)) {
      return { success: false, error: 'Invalid game token.' };
    }

    if (payload.isOver) {
      return { success: false, error: 'Game is already over.' };
    }

    if (payload.openedTiles.includes(tileIndex)) {
      return { success: false, error: 'Tile already opened.' };
    }

    const newOpenedTiles = [...payload.openedTiles, tileIndex];
    const isBomb = payload.bombs.includes(tileIndex);

    let isOver = false;
    let newMultiplier = payload.multiplier;

    if (isBomb) {
      isOver = true;
      newMultiplier = 0; // Lost
    } else {
      // Calculate new multiplier
      newMultiplier = calculateMultiplier(payload.mineCount, newOpenedTiles.length);

      // Check if player won automatically (all safe tiles opened)
      if (newOpenedTiles.length === 25 - payload.mineCount) {
        isOver = true;
        const balance = await getBalance();
        const winAmount = payload.betAmount * newMultiplier;
        await updateBalance(balance + winAmount);
      }
    }

    const updatedPayload: GameStatePayload = {
      ...payload,
      openedTiles: newOpenedTiles,
      isOver,
      multiplier: newMultiplier,
    };

    const newToken = await new EncryptJWT({ ...updatedPayload })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .encrypt(JWT_SECRET);

    const response: GameStateResponse = {
      token: newToken,
      openedTiles: newOpenedTiles,
      isOver,
      multiplier: newMultiplier,
      serverSeedHash: hashSeed(payload.serverSeed),
    };

    if (isOver) {
      response.serverSeed = payload.serverSeed;
      response.bombs = payload.bombs;

      if (!isBomb) {
        response.winAmount = payload.betAmount * newMultiplier;
      }
    }

    return { success: true, data: response };

  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to reveal tile.' };
  }
}

export async function cashOutAction(token: string): Promise<{ success: boolean; data?: GameStateResponse; error?: string }> {
  try {
    const { payload } = await jwtDecrypt(token, JWT_SECRET);

    if (!isValidPayload(payload)) {
      return { success: false, error: 'Invalid game token.' };
    }

    if (payload.isOver) {
      return { success: false, error: 'Game is already over.' };
    }

    if (payload.openedTiles.length === 0) {
      return { success: false, error: 'Must open at least one tile to cash out.' };
    }

    const winAmount = payload.betAmount * payload.multiplier;
    const balance = await getBalance();
    await updateBalance(balance + winAmount);

    const updatedPayload: GameStatePayload = {
      ...payload,
      isOver: true,
    };

    const newToken = await new EncryptJWT({ ...updatedPayload })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .encrypt(JWT_SECRET);

    return {
      success: true,
      data: {
        token: newToken,
        openedTiles: payload.openedTiles,
        isOver: true,
        multiplier: payload.multiplier,
        serverSeedHash: hashSeed(payload.serverSeed),
        serverSeed: payload.serverSeed,
        bombs: payload.bombs,
        winAmount,
      }
    };

  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to cash out.' };
  }
}
