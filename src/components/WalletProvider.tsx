'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchBalanceAction, claimFaucetAction } from '@/actions/wallet';

interface WalletContextType {
  balance: number;
  loading: boolean;
  refreshBalance: () => Promise<void>;
  claimFaucet: () => Promise<void>;
  updateOptimisticBalance: (amount: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshBalance = async () => {
    try {
      const res = await fetchBalanceAction();
      setBalance(res.balance);
    } catch (err) {
      console.error('Failed to fetch balance', err);
    } finally {
      setLoading(false);
    }
  };

  const claimFaucet = async () => {
    try {
      const res = await claimFaucetAction();
      if (res.success && res.newBalance !== undefined) {
        setBalance(res.newBalance);
      } else {
        alert(res.error || 'Failed to claim faucet');
      }
    } catch (err) {
      console.error('Failed to claim faucet', err);
    }
  };

  const updateOptimisticBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  useEffect(() => {
    refreshBalance();
  }, []);

  return (
    <WalletContext.Provider value={{ balance, loading, refreshBalance, claimFaucet, updateOptimisticBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
