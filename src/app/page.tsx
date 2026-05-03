'use client';

import { Header } from '@/components/Header';
import Link from 'next/link';
import { Bomb, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">

        {/* Lobby Section */}
        <section>
          <h1 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            Casino Lobby
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/games/mines">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="aspect-video bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-zinc-900/20 z-0" />
                   <Bomb className="w-16 h-16 text-emerald-500 z-10 group-hover:scale-110 transition-transform" />

                   <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <div className="bg-emerald-500 text-zinc-950 rounded-full p-3 shadow-lg">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                   </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-zinc-100">Mines</h3>
                  <p className="text-sm text-zinc-400 mt-1">Provably Fair Original</p>
                </div>
              </motion.div>
            </Link>

            {/* Placeholder for other games */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden opacity-50 cursor-not-allowed">
              <div className="aspect-video bg-zinc-800/50 flex items-center justify-center">
                 <span className="text-zinc-600 font-semibold">Coming Soon</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-zinc-400">Crash</h3>
                <p className="text-sm text-zinc-500 mt-1">Originals</p>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden opacity-50 cursor-not-allowed">
              <div className="aspect-video bg-zinc-800/50 flex items-center justify-center">
                 <span className="text-zinc-600 font-semibold">Coming Soon</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-zinc-400">Plinko</h3>
                <p className="text-sm text-zinc-500 mt-1">Originals</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Bets Section */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-zinc-100 mb-4">Recent Bets</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950/50 text-xs uppercase font-semibold text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Game</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3 text-right">Bet Amount</th>
                    <th className="px-4 py-3 text-right">Multiplier</th>
                    <th className="px-4 py-3 text-right">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  <tr className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-300">Mines</td>
                    <td className="px-4 py-3">Hidden</td>
                    <td className="px-4 py-3 text-right">Rp10,000</td>
                    <td className="px-4 py-3 text-right text-emerald-500 font-medium">1.50x</td>
                    <td className="px-4 py-3 text-right text-emerald-500 font-bold">+Rp15,000</td>
                  </tr>
                  <tr className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-300">Mines</td>
                    <td className="px-4 py-3">Hidden</td>
                    <td className="px-4 py-3 text-right">Rp2,500</td>
                    <td className="px-4 py-3 text-right text-red-500 font-medium">0.00x</td>
                    <td className="px-4 py-3 text-right text-zinc-500 font-bold">-Rp2,500</td>
                  </tr>
                  <tr className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-300">Mines</td>
                    <td className="px-4 py-3">Hidden</td>
                    <td className="px-4 py-3 text-right">Rp50,000</td>
                    <td className="px-4 py-3 text-right text-emerald-500 font-medium">3.20x</td>
                    <td className="px-4 py-3 text-right text-emerald-500 font-bold">+Rp160,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 text-center border-t border-zinc-800">
              <span className="text-xs text-zinc-500">Showing simulated recent bets</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
