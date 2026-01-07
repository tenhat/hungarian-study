'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningStore } from '@/lib/store';
import { words } from '@/lib/data';
import { BookOpen, Trophy, Flame, Star, X } from 'lucide-react';
import { BGMPlayer } from '@/components/ui/bgm-player';

export default function Home() {
  const items = useLearningStore((state) => state.items);
  const dailyNewLimit = useLearningStore((state) => state.dailyNewLimit);
  const setDailyNewLimit = useLearningStore((state) => state.setDailyNewLimit);
  const [showSettings, setShowSettings] = React.useState(false);

  const studiedCount = Object.keys(items).length;
  const totalWords = words.length;
  const progressPercent = Math.round((studiedCount / totalWords) * 100);

  // Simple mastery calculation: items with interval > 10 are "mastered"
  const masteredCount = Object.values(items).filter(item => item.interval > 10).length;

  return (
    <main className="flex min-h-screen flex-col items-center relative overflow-hidden bg-[#FDFCF8]">
      <BGMPlayer />
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-pink/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-accent-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 w-full max-w-lg px-6 py-12 flex flex-col items-center space-y-10">
        


        {/* Title Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2, duration: 0.6 }}
           className="text-center space-y-3"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-black text-text tracking-tight">
            Hungarian<br />
            <span className="text-accent-pink">Learning</span>
          </h1>
          <p className="text-text/60 font-medium text-lg italic">
            "Minden nap egy új lehetőség."
          </p>
        </motion.div>

        {/* Progress Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 gap-4 w-full"
        >
          <Card className="p-4 bg-white border-accent-pink/10 shadow-sm flex flex-col items-center justify-center space-y-2">
            <BookOpen className="w-6 h-6 text-accent-pink" />
            <div className="text-center">
              <p className="text-2xl font-bold text-text">{studiedCount}</p>
              <p className="text-xs text-text/40 font-bold uppercase tracking-wider">Words Studied</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-white border-accent-green/10 shadow-sm flex flex-col items-center justify-center space-y-2">
            <Trophy className="w-6 h-6 text-accent-green" />
            <div className="text-center">
              <p className="text-2xl font-bold text-text">{masteredCount}</p>
              <p className="text-xs text-text/40 font-bold uppercase tracking-wider">Mastered</p>
            </div>
          </Card>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full pt-4"
        >
          <Link href="/learn" className="block w-full">
            <Button className="w-full h-16 text-2xl font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-accent-pink hover:bg-accent-pink/90 text-white border-none group">
              Start Learning
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="ml-3 inline-block"
              >
                →
              </motion.span>
            </Button>
          </Link>
          
          <div className="mt-8 flex items-center justify-center space-x-6 text-text/30">
             <div className="flex items-center space-x-1">
               <Flame className="w-4 h-4" />
               <span className="text-sm font-bold">Day 1</span>
             </div>
             <div className="flex items-center space-x-1">
               <Star className="w-4 h-4" />
               <span className="text-sm font-bold">{progressPercent}% Overall</span>
             </div>
          </div>
        </motion.div>

      </div>

      {/* Footer Decoration */}
      <footer className="mt-auto py-8 text-text/20 text-xs font-medium uppercase tracking-[0.2em] relative z-10">
        Handcrafted for your Hungarian journey
      </footer>
      
      {/* Settings Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-6 right-6 p-2 text-text/30 hover:text-text/60 transition-colors z-20"
        onClick={() => setShowSettings(true)}
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-text/30 hover:text-text/60"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-serif font-bold text-text mb-6">Daily Goal Settings</h2>
              
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-accent-pink/5 p-4 rounded-2xl border border-accent-pink/10 shadow-inner">
                    <label className="text-sm font-bold text-text/60">New Words per Day</label>
                    <div className="flex items-center space-x-2">
                       <span className="text-3xl font-black text-accent-pink leading-none">{dailyNewLimit}</span>
                       <span className="text-xs font-bold text-text/30 uppercase">words</span>
                    </div>
                  </div>
                  
                  <div className="relative pt-6 pb-2 px-2">
                    {/* Custom Slider Track */}
                    <div className="absolute top-8 left-2 right-2 h-3 bg-secondary/20 rounded-full" />
                    {/* Active Track Highlight */}
                    <div 
                      className="absolute top-8 left-2 h-3 bg-accent-pink rounded-full transition-all duration-200" 
                      style={{ width: `calc(${(dailyNewLimit / 50) * 100}% - 8px)` }}
                    />
                    
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={dailyNewLimit}
                      onChange={(e) => setDailyNewLimit(Number(e.target.value))}
                      className="relative w-full h-8 bg-transparent appearance-none cursor-pointer z-10
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-8
                        [&::-webkit-slider-thumb]:h-8
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:border-4
                        [&::-webkit-slider-thumb]:border-accent-pink
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-webkit-slider-thumb]:active:scale-95
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-moz-range-thumb]:w-8
                        [&::-moz-range-thumb]:h-8
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-thumb]:border-4
                        [&::-moz-range-thumb]:border-accent-pink
                        [&::-moz-range-thumb]:shadow-lg
                        [&::-moz-range-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:active:scale-95
                        [&::-moz-range-thumb]:transition-transform"
                    />
                    
                    {/* Tick Marks */}
                    <div className="flex justify-between px-1 mt-2">
                      {[0, 10, 20, 30, 40, 50].map((tick) => (
                        <div key={tick} className="flex flex-col items-center">
                          <div className={`w-1 h-2 rounded-full mb-1 ${dailyNewLimit >= tick ? 'bg-accent-pink/50' : 'bg-secondary/40'}`} />
                          <span className="text-[10px] font-bold text-text/20">{tick}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[13px] text-text/50 leading-relaxed bg-[#FDFCF8] p-3 rounded-xl border border-dashed border-text/10">
                    <Star className="inline-block w-3 h-3 mr-1 text-accent-yellow mb-0.5" />
                    Set to **0** to focus purely on reviews. New words appear only when you're ready!
                  </p>
                </div>
                
                <Button 
                  onClick={() => setShowSettings(false)}
                  className="w-full rounded-xl bg-text text-white hover:bg-text/90"
                >
                  Save & Close
                </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
