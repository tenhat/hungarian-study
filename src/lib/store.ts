// import { creating } from 'zustand'; 
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SM2Item, initialSM2Item, calculateSM2 } from './sm2';
import { words, Word } from './data';

interface LearningItem extends SM2Item {
  lastReviewed: number; // Timestamp
  memo?: string; // User notes
}

interface UserProgress {
  /**
   * Map of wordId to LearningItem.
   */
  items: Record<number, LearningItem>;
  
  /**
  /**
   * Daily limit for new words (default: 10).
   */
  dailyNewLimit: number;
  
  /**
   * Number of new words learned today.
   */
  newLearnedToday: number;
  
  /**
   * Date string (YYYY-MM-DD) of the last learning activity for daily reset.
   */
  lastLearnDate: string; // YYYY-MM-DD
  
  /**
   * Timestamp of the last study activity.
   */
  lastStudiedAt: number | null;
}

interface LearningState extends UserProgress {
  // ... existing methods ...
  submitAnswer: (wordId: number, grade: number) => void;
  getDueWords: () => Word[];
  resetProgress: () => void;
  getReviewInterval: (wordId: number) => number;
  
  /**
   * Set the daily limit for new words.
   */
  setDailyNewLimit: (limit: number) => void;

  /**
   * Update the memo for a specific word.
   */
  setMemo: (wordId: number, memo: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      items: {},
      lastStudiedAt: null,
      dailyNewLimit: 10,
      newLearnedToday: 0,
      lastLearnDate: new Date().toISOString().split('T')[0],

      getReviewInterval: (wordId) => {
        const item = get().items[wordId];
        return item ? item.interval : 0;
      },

      setDailyNewLimit: (limit) => {
        set({ dailyNewLimit: limit });
      },

      setMemo: (wordId, memo) => {
        set((state) => {
          const currentItem = state.items[wordId] || initialSM2Item;
          return {
            items: {
              ...state.items,
              [wordId]: {
                ...currentItem,
                memo,
                lastReviewed: currentItem.repetition > 0 ? (state.items[wordId]?.lastReviewed || Date.now()) : Date.now(), // Preserve or init
              },
            },
          };
        });
      },

      submitAnswer: (wordId, grade) => {
        set((state) => {
          const currentItem = state.items[wordId] || initialSM2Item;
          const today = new Date().toISOString().split('T')[0];
          
          // Check if reset is needed
          let newLearnedCount = state.newLearnedToday;
          if (state.lastLearnDate !== today) {
            newLearnedCount = 0;
          }

          // Check if it's a "new" word learning event (interval 0 -> >0)
          // Actually, purely creating the item means it was new.
          // If grade >= 3 (correct), interval becomes > 0.
          // Or if we just count "attempting a new word" as learning it?
          // Usually "Learning" implies successfully passing it or at least seeing it.
          // Let's count it if it WAS new (interval 0) and we are submitting an answer.
          // Even if they get it wrong, they "studied" it today.
          // But purely "New Learned" usually means passed? 
          // Let's stick to: if it was interval 0, we increment count.
          const wasNew = currentItem.interval === 0;
          if (wasNew) {
            newLearnedCount += 1;
          }

          // Calculate next state
          const newItem = calculateSM2(currentItem, grade);
          
          return {
            items: {
              ...state.items,
              [wordId]: {
                ...newItem,
                memo: currentItem.memo,
                lastReviewed: Date.now(), 
              },
            },
            lastStudiedAt: Date.now(),
            lastLearnDate: today,
            newLearnedToday: newLearnedCount,
          };
        });
      },

      getDueWords: () => {
        const state = get();
        const { items, dailyNewLimit, lastLearnDate } = state;
        const now = Date.now();
        const today = new Date().toISOString().split('T')[0];
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Reset check (read-only check, mutation happens in submitAnswer mostly, 
        // but for display we need to know the effective count)
        // If date changed effectively newLearnedToday is 0.
        const effectiveNewLearnedToday = (lastLearnDate === today) ? state.newLearnedToday : 0;
        const newWordsRemaining = Math.max(0, dailyNewLimit - effectiveNewLearnedToday);

        // Filter words
        const dueWords: Word[] = [];
        let newWordsAdded = 0;

        for (const word of words) {
          const item = items[word.id];

          if (!item) {
            // New word
            if (newWordsAdded < newWordsRemaining) {
              dueWords.push(word);
              newWordsAdded++;
            }
          } else {
            // Existing word - check if due
             // If interval is 0, it's technically still "learning/new" phase or failed today.
             // If interval > 0, check time.
             if (item.interval === 0) {
               // Re-learning due immediately (same session usually)
               dueWords.push(word);
             } else {
               const daysSinceReview = (now - item.lastReviewed) / oneDayMs;
               if (daysSinceReview >= item.interval) {
                 dueWords.push(word);
               }
             }
          }
        }
        
        return dueWords;
      },
      
      resetProgress: () => {
        set({ items: {}, lastStudiedAt: null, newLearnedToday: 0 });
      }
    }),
    {
      name: 'hungarian-learning-storage', // key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
