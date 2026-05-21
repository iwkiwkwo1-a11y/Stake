'use client';

import { Header } from '@/components/Header';
import Link from 'next/link';
import { Bomb, Dices, TrendingUp, Pyramid, Play } from 'lucide-react';
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

            <Link href="/games/dice">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="aspect-video bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-zinc-900/20 z-0" />
                   <Dices className="w-16 h-16 text-indigo-500 z-10 group-hover:scale-110 transition-transform" />

                   <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <div className="bg-indigo-500 text-zinc-950 rounded-full p-3 shadow-lg">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                   </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-zinc-100">Dice</h3>
                  <p className="text-sm text-zinc-400 mt-1">Provably Fair Original</p>
                </div>
              </motion.div>
            </Link>

            <Link href="/games/plinko">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="aspect-video bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-zinc-900/20 z-0" />
                   <Pyramid className="w-16 h-16 text-amber-500 z-10 group-hover:scale-110 transition-transform" />

                   <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <div className="bg-amber-500 text-zinc-950 rounded-full p-3 shadow-lg">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                   </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-zinc-100">Plinko</h3>
                  <p className="text-sm text-zinc-400 mt-1">Provably Fair Original</p>
                </div>
              </motion.div>
            </Link>

            <Link href="/games/crash">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="aspect-video bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-zinc-900/20 z-0" />
                   <TrendingUp className="w-16 h-16 text-rose-500 z-10 group-hover:scale-110 transition-transform" />

                   <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <div className="bg-rose-500 text-zinc-950 rounded-full p-3 shadow-lg">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                   </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-zinc-100">Crash</h3>
                  <p className="text-sm text-zinc-400 mt-1">Provably Fair Original</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>


      </main>
    </div>
  );
}
