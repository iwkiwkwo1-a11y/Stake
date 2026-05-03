'use server';

import { getBalance, updateBalance } from '@/utils/wallet';

export async function fetchBalanceAction() {
  const balance = await getBalance();
  return { balance };
}

export async function claimFaucetAction() {
  const balance = await getBalance();

  if (balance >= 100) {
    return { success: false, error: 'Balance must be below Rp100 to claim faucet.' };
  }

  const newBalance = balance + 5000;
  await updateBalance(newBalance);

  return { success: true, newBalance };
}
