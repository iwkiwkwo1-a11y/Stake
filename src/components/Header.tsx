'use client';

import { useWallet } from '@/components/WalletProvider';
import { Wallet, Coins } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { balance, loading, claimFaucet } = useWallet();

  const formattedBalance = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(balance);

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-emerald-500 tracking-tight flex items-center gap-2">
          <Coins className="w-6 h-6" />
          Stake<span className="text-zinc-100">Sim</span>
        </Link>

        <div className="flex items-center gap-4">
          {!loading && balance < 100 && (
            <button
              onClick={claimFaucet}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Claim Free Rp5.000
            </button>
          )}

          <div className="bg-zinc-800 border border-zinc-700 flex items-center gap-3 px-4 py-2 rounded-md font-medium">
            <Wallet className="w-4 h-4 text-zinc-400" />
            <span className={loading ? 'opacity-50' : 'opacity-100'}>
              {loading ? 'Rp...' : formattedBalance}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
