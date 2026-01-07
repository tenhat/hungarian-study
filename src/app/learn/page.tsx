'use client';

import * as React from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/components/features/Flashcard';
import { useLearningStore } from '@/lib/store';
import { Word } from '@/lib/data';
import { X, Check, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function LearnPage() {
  // Use Zustand store
  const getDueWords = useLearningStore((state) => state.getDueWords);
  const submitAnswer = useLearningStore((state) => state.submitAnswer);
  
  // Local state for the current session
  const [sessionWords, setSessionWords] = React.useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<'left' | 'right' | null>(null);
  
  // Load due words on mount
  React.useEffect(() => {
    // In a real app we might limit this to e.g. 10 words per session
    // For now, load all due words
    const due = getDueWords();
    
    // Shuffle the due words
    const shuffled = [...due].sort(() => Math.random() - 0.5);
    // Note: Simple shuffle for now. Fisher-Yates is better but this is sufficient for a local session.
    
    setSessionWords(shuffled);
  }, [getDueWords]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent action if already animating or no words
      if (direction || sessionWords.length === 0) return;

      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, sessionWords.length]); // Dependencies for closure state

  // If no words due (or finished session)
  if (sessionWords.length === 0 || currentIndex >= sessionWords.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-text text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Daily Goal Complete!</h1>
        <p className="mb-8 text-lg opacity-80">You've reviewed all cards due for today.</p>
        <div className="flex gap-4">
           <Link href="/">
             <Button variant="outline">Back to Home</Button>
           </Link>
           {/* Debug option to reset */}
           <Button variant="ghost" onClick={() => window.location.reload()}>
             <RefreshCw className="w-4 h-4 mr-2" /> Check Again
           </Button>
        </div>
      </div>
    );
  }

  const currentWord = sessionWords[currentIndex];

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    
    // Determine grade: 
    // Right (Got it) -> 4 (Correct) or 5 (Perfect). Let's use 4.
    // Left (Still learning) -> 1 (Incorrect).
    const grade = dir === 'right' ? 4 : 1;
    
    // Submit result to store
    // Note: If we just submit(1), the interval resets. That's correct behavior.
    submitAnswer(currentWord.id, grade);
    
    // If incorrect, re-queue the word at the end of the session
    if (grade === 1) {
      setSessionWords((prev) => [...prev, currentWord]);
    }
    
    // Delay to allow animation before showing next card
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex((prev) => prev + 1);
    }, 250);
  };

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleSwipe('right');
    } else if (info.offset.x < -100) {
      handleSwipe('left');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center relative overflow-hidden bg-background">
       {/* Header */}
       <header className="w-full p-4 flex items-center justify-between">
         <Link href="/" className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <ArrowLeft className="w-6 h-6 text-text/60" />
         </Link>
         <div className="text-sm font-medium text-text/40">
           {currentIndex + 1} / {sessionWords.length}
         </div>
         <div className="w-10" /> {/* Spacer */}
       </header>

       <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md p-4 space-y-12">
          
          {/* Card Area */}
          <div className="relative w-full flex justify-center z-10">
             <AnimatePresence mode="wait">
               <motion.div
                 key={`${currentWord.id}-${currentIndex}`}
                 className="absolute w-full flex justify-center"
                 initial={{ scale: 0.95, opacity: 0, y: 20 }}
                 animate={{ scale: 1, opacity: 1, y: 0, x: 0, rotate: 0 }}
                 exit={{ 
                   x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
                   opacity: 0,
                   rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
                   transition: { duration: 0.2 }
                 }}
                 drag="x"
                 dragConstraints={{ left: 0, right: 0 }}
                 onDragEnd={onDragEnd}
                 whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
               >
                 <Flashcard word={currentWord} />
               </motion.div>
             </AnimatePresence>
             {/* Height placeholder since absolute elements remove height */}
             <div className="h-96 w-full max-w-sm opacity-0 pointer-events-none" /> 
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8 z-20">
             <div className="flex flex-col items-center gap-2">
               <Button 
                 size="icon" 
                 variant="outline" 
                 className="w-16 h-16 rounded-full border-2 border-accent-pink/50 text-accent-pink hover:bg-accent-pink hover:text-white hover:border-transparent transition-all"
                 onClick={() => handleSwipe('left')}
               >
                 <X className="w-8 h-8" />
               </Button>
               <span className="text-xs font-medium text-text/40">Still Learning</span>
             </div>

             <div className="flex flex-col items-center gap-2">
               <Button 
                 size="icon" 
                 variant="outline" 
                 className="w-16 h-16 rounded-full border-2 border-accent-green/50 text-accent-green hover:bg-accent-green hover:text-white hover:border-transparent transition-all"
                 onClick={() => handleSwipe('right')}
               >
                 <Check className="w-8 h-8" />
               </Button>
               <span className="text-xs font-medium text-text/40">Got it!</span>
             </div>
          </div>

       </main>
    </div>
  );
}
