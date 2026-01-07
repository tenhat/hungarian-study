'use client';

import * as React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Word } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Volume2, Edit } from 'lucide-react';
import { useLearningStore } from '@/lib/store';
import { Modal } from '@/components/ui/modal';

interface FlashcardProps {
  word: Word;
  onSwipeResult?: (result: 'known' | 'unknown') => void;
}

export function Flashcard({ word, onSwipeResult }: FlashcardProps) {
  const [timeLeft, setTimeLeft] = React.useState(3);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Memo state
  const setMemo = useLearningStore((state) => state.setMemo);
  // We access the item directly to get the current memo.
  const storedItem = useLearningStore((state) => state.items[word.id]);
  const savedMemo = storedItem?.memo || '';
  const [localMemo, setLocalMemo] = React.useState(savedMemo);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Sync local memo when word or stored memo changes
  React.useEffect(() => {
    setLocalMemo(savedMemo);
  }, [word.id, savedMemo]);

  // Handle memo input change
  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLocalMemo(newVal);
    setMemo(word.id, newVal);
  };
  
  // Reset flip state and timer when word changes
  React.useEffect(() => {
    setIsFlipped(false);
    setTimeLeft(3);
    setIsModalOpen(false);
  }, [word.id]);

  // Countdown logic
  React.useEffect(() => {
    if (isFlipped || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isFlipped, timeLeft]);

  // Auto-flip trigger
  React.useEffect(() => {
    if (timeLeft === 0 && !isFlipped) {
      setIsFlipped(true);
      setTimeLeft(-1); // Prevent re-trigger
    }
  }, [timeLeft, isFlipped]);

  const handleFlip = () => {
    // If modal is open, do not flip
    if (isModalOpen) return;
    
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setTimeLeft(-1); // Stop countdown if manually flipped to back
    }
  };
  
  // Keyboard shortcut for flipping
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable shortcuts if modal is open
      if (isModalOpen) return;

      if (e.key === 'ArrowUp') {
        if (document.activeElement?.tagName === 'TEXTAREA') return;

        e.preventDefault(); // Prevent scrolling
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, isModalOpen]);

  // Audio handler
  const playWordAudio = React.useCallback(() => {
    // Web Speech API fallback for now
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel previous utterances to avoid overlapping
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word.hu);
      utterance.lang = 'hu-HU';
      window.speechSynthesis.speak(utterance);
    }
  }, [word.hu]);

  // Auto-play audio when word changes
  React.useEffect(() => {
    // Small delay to ensure smoother transition visually before audio starts
    const timer = setTimeout(() => {
      playWordAudio();
    }, 100);
    return () => clearTimeout(timer);
  }, [word.id, playWordAudio]);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWordAudio();
  };

  return (
    <>
      <div className="perspective-1000 w-full max-w-sm h-96">
        <motion.div
          className="relative w-full h-full preserve-3d"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <Card 
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center backface-hidden bg-white border-none shadow-xl overflow-hidden cursor-pointer",
              isFlipped ? "pointer-events-none" : ""
            )}
            style={{ transform: 'translateZ(1px)' }}
            onClick={handleFlip}
          >
            {!isFlipped && (
              <div className="absolute top-6 left-6 flex items-center justify-center">
                 {/* Timer SVG */}
                 {timeLeft > 0 && (
                  <svg className="w-8 h-8 transform -rotate-90">
                    <circle
                      cx="16" cy="16" r="14"
                      stroke="#E5E7EB" strokeWidth="3" fill="none"
                    />
                    <motion.circle
                      cx="16" cy="16" r="14"
                      stroke="#F4A6A6" strokeWidth="3" fill="none"
                      strokeDasharray="88"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: 88 }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </svg>
                 )}
              </div>
            )}
            
            <div className="text-center z-10 px-4">
              <h2 className="text-6xl font-serif font-bold text-text mb-4">{word.hu}</h2>
              <div className="flex items-center justify-center gap-2 mb-8">
                 <span className="text-sm font-medium text-text/50 uppercase tracking-widest bg-secondary/30 px-3 py-1 rounded-full">
                   {word.pos}
                 </span>
                 <span className="text-sm font-medium text-text/50 uppercase tracking-widest bg-secondary/30 px-3 py-1 rounded-full">
                    Level {word.level}
                 </span>
              </div>
               <p className="text-text/30 font-light text-sm animate-pulse">Tap to flip</p>
            </div>
            
             <button 
               onClick={handlePlayClick}
               className="absolute bottom-6 right-6 p-3 rounded-full bg-secondary/20 hover:bg-secondary/40 text-text transition-colors z-20"
             >
               <Volume2 className="w-5 h-5" />
             </button>
          </Card>

          {/* Back */}
          <Card
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-between backface-hidden bg-white border-2 border-accent-green/30 shadow-xl p-6 cursor-default isolate overflow-hidden",
              !isFlipped ? "pointer-events-none" : ""
            )}
            style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Clickable Area for Flip */}
            <div 
              className="flex-1 flex flex-col items-center justify-center w-full space-y-2 cursor-pointer hover:bg-secondary/5 rounded-xl transition-colors py-2"
              onClick={handleFlip}
            >
               <h3 className="text-3xl font-bold text-text text-center leading-normal">
                 {word.ja}
               </h3>
               <p className="text-text/60 italic text-sm text-center">
                 {word.category}
               </p>
            </div>
               
            {/* Memo Button - Opens Modal */}
            <div className="w-full py-4 relative z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full bg-accent-green/5 p-4 rounded-2xl flex items-center justify-center gap-2 border-2 border-dashed border-accent-green/30 hover:bg-accent-green/10 hover:border-accent-green/50 transition-all group"
              >
                 <Edit className="w-5 h-5 text-accent-green group-hover:scale-110 transition-transform" />
                 <span className="text-sm font-bold text-accent-green/70 uppercase tracking-widest">
                   {localMemo ? 'Edit Memo' : 'Add Memo'}
                 </span>
                 {localMemo && (
                   <span className="ml-2 w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                 )}
              </button>
              {localMemo && (
                <p className="mt-2 text-xs text-text/40 truncate max-w-full px-2 text-center">
                  {localMemo}
                </p>
              )}
            </div>
            
            {/* Bottom Clickable Area for Flip */}
            <div 
              className="w-full pt-2 pb-2 text-center cursor-pointer hover:text-text/60 transition-colors"
              onClick={handleFlip}
            >
               <p className="text-text/30 font-medium text-[10px] uppercase tracking-wider">Tap to flip</p>
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Memo"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 p-3 bg-secondary/10 rounded-lg">
             <span className="text-sm font-bold text-text/60">{word.hu}</span>
             <span className="text-text/30">→</span>
             <span className="text-sm font-medium text-text">{word.ja}</span>
          </div>
          <textarea
            ref={textareaRef}
            value={localMemo}
            onChange={handleMemoChange}
            placeholder="Type your notes here..."
            className="w-full h-40 text-base text-text bg-white border-2 border-secondary/20 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
            autoFocus
          />
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 bg-accent-green text-white font-bold rounded-xl hover:bg-accent-green/90 transition-colors shadow-lg shadow-accent-green/20"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
