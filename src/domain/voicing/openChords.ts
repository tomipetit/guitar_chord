import type { ChordType, Root } from '../chord/types';
import type { Barre } from './types';

interface OpenChord {
  frets: (number | null)[];
  fingers: (number | null)[];
  barres?: Barre[];
}

const x = null;

/**
 * 開放弦を使う定番フォーム。可動シェイプの生成結果より押さえやすいので優先表示する。
 * キーは `${root}:${type}`。
 */
const OPEN_CHORDS: Record<string, OpenChord> = {
  // --- major ---
  'C:major': { frets: [x, 3, 2, 0, 1, 0], fingers: [x, 3, 2, x, 1, x] },
  'D:major': { frets: [x, x, 0, 2, 3, 2], fingers: [x, x, x, 1, 3, 2] },
  'E:major': { frets: [0, 2, 2, 1, 0, 0], fingers: [x, 2, 3, 1, x, x] },
  'G:major': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, x, x, x, 3] },
  'A:major': { frets: [x, 0, 2, 2, 2, 0], fingers: [x, x, 1, 2, 3, x] },

  // --- minor ---
  'D:minor': { frets: [x, x, 0, 2, 3, 1], fingers: [x, x, x, 2, 3, 1] },
  'E:minor': { frets: [0, 2, 2, 0, 0, 0], fingers: [x, 2, 3, x, x, x] },
  'A:minor': { frets: [x, 0, 2, 2, 1, 0], fingers: [x, x, 2, 3, 1, x] },

  // --- 7 ---
  'A:7': { frets: [x, 0, 2, 0, 2, 0], fingers: [x, x, 2, x, 3, x] },
  'B:7': { frets: [x, 2, 1, 2, 0, 2], fingers: [x, 2, 1, 3, x, 4] },
  'C:7': { frets: [x, 3, 2, 3, 1, 0], fingers: [x, 3, 2, 4, 1, x] },
  'D:7': { frets: [x, x, 0, 2, 1, 2], fingers: [x, x, x, 2, 1, 3] },
  'E:7': { frets: [0, 2, 0, 1, 0, 0], fingers: [x, 2, x, 1, x, x] },
  'G:7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, x, x, x, 1] },

  // --- m7 ---
  'D:m7': {
    frets: [x, x, 0, 2, 1, 1],
    fingers: [x, x, x, 2, 1, 1],
    barres: [{ fret: 1, fromIndex: 4, toIndex: 5 }],
  },
  'E:m7': { frets: [0, 2, 0, 0, 0, 0], fingers: [x, 2, x, x, x, x] },
  'A:m7': { frets: [x, 0, 2, 0, 1, 0], fingers: [x, x, 2, x, 1, x] },

  // --- M7 ---
  'C:M7': { frets: [x, 3, 2, 0, 0, 0], fingers: [x, 3, 2, x, x, x] },
  'D:M7': { frets: [x, x, 0, 2, 2, 2], fingers: [x, x, x, 1, 2, 3] },
  'E:M7': { frets: [0, 2, 1, 1, 0, 0], fingers: [x, 3, 1, 2, x, x] },
  'F:M7': { frets: [x, x, 3, 2, 1, 0], fingers: [x, x, 3, 2, 1, x] },
  'G:M7': { frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, x, x, x, 2] },
  'A:M7': { frets: [x, 0, 2, 1, 2, 0], fingers: [x, x, 2, 1, 3, x] },

  // --- 6 ---
  'C:6': { frets: [x, 3, 2, 2, 1, 0], fingers: [x, 4, 2, 3, 1, x] },
  'D:6': { frets: [x, x, 0, 2, 0, 2], fingers: [x, x, x, 1, x, 2] },
  'E:6': { frets: [0, 2, 2, 1, 2, 0], fingers: [x, 2, 3, 1, 4, x] },
  'G:6': { frets: [3, 2, 0, 0, 0, 0], fingers: [3, 2, x, x, x, x] },
  'A:6': { frets: [x, 0, 2, 2, 2, 2], fingers: [x, x, 1, 2, 3, 4] },

  // --- sus4 ---
  'C:sus4': {
    frets: [x, 3, 3, 0, 1, 1],
    fingers: [x, 3, 4, x, 1, 1],
    barres: [{ fret: 1, fromIndex: 4, toIndex: 5 }],
  },
  'D:sus4': { frets: [x, x, 0, 2, 3, 3], fingers: [x, x, x, 1, 3, 4] },
  'E:sus4': { frets: [0, 2, 2, 2, 0, 0], fingers: [x, 2, 3, 4, x, x] },
  'G:sus4': { frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, x, x, 1, 4] },
  'A:sus4': { frets: [x, 0, 2, 2, 3, 0], fingers: [x, x, 1, 2, 3, x] },

  // --- m7♭5 ---
  'D:m7b5': {
    frets: [x, x, 0, 1, 1, 1],
    fingers: [x, x, x, 1, 1, 1],
    barres: [{ fret: 1, fromIndex: 3, toIndex: 5 }],
  },
  'E:m7b5': { frets: [0, 1, 0, 0, 3, x], fingers: [x, 1, x, x, 3, x] },
  'A:m7b5': { frets: [x, 0, 1, 0, 1, x], fingers: [x, x, 2, x, 1, x] },
  'B:m7b5': { frets: [x, 2, 3, 2, 3, x], fingers: [x, 1, 3, 2, 4, x] },
};

export function openChordFor(root: Root, type: ChordType): OpenChord | undefined {
  return OPEN_CHORDS[`${root}:${type}`];
}
