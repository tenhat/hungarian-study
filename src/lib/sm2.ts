/**
 * Simple implementation of the SuperMemo-2 (SM-2) algorithm.
 *
 * References:
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export interface SM2Item {
  interval: number; // Days until next review
  repetition: number; // Number of consecutive correct answers
  efactor: number; // Easiness Factor (starts at 2.5)
}

// Initial state for a new item
export const initialSM2Item: SM2Item = {
  interval: 0,
  repetition: 0,
  efactor: 2.5,
};

/**
 * Calculates the next state of an item based on the quality of the answer.
 * @param item Current state of the item
 * @param quality Quality of the answer (0-5)
 *  5 - perfect response
 *  4 - correct response after a hesitation
 *  3 - correct response recalled with serious difficulty
 *  2 - incorrect response; where the correct one seemed easy to recall
 *  1 - incorrect response; the correct one remembered
 *  0 - complete blackout.
 *
 * For our app simplified logic:
 * - quality >= 3 (Correct / "Got it!")
 * - quality < 3 (Incorrect / "Still Learning")
 */
export function calculateSM2(item: SM2Item, quality: number): SM2Item {
  let { interval, repetition, efactor } = item;

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition += 1;
  } else {
    // Incorrect response
    repetition = 0;
    interval = 1;
  }

  // Update E-Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // EF cannot go below 1.3
  if (efactor < 1.3) {
    efactor = 1.3;
  }

  return { interval, repetition, efactor };
}
