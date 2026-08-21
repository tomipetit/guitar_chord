import type { Accidental } from './catalog';
import type { ChordSelection, ChordType, Root } from './types';
import { chordTypeOf } from './types';

const SHARP_LABEL: Record<Root, string> = {
  'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
  'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B',
};

const FLAT_LABEL: Record<Root, string> = {
  'C': 'C', 'C#': 'D♭', 'D': 'D', 'D#': 'E♭', 'E': 'E', 'F': 'F',
  'F#': 'G♭', 'G': 'G', 'G#': 'A♭', 'A': 'A', 'A#': 'B♭', 'B': 'B',
};

const SUFFIX: Record<ChordType, string> = {
  major: '',
  minor: 'm',
  '7': '7',
  M7: 'M7',
  '6': '6',
  sus4: 'sus4',
  m7: 'm7',
  m7b5: 'm7♭5',
};

/** ルート単体の表示名。派生音は現在の ♯/♭ 表記に従う */
export function rootLabel(root: Root, accidental: Accidental = 'sharp'): string {
  return accidental === 'flat' ? FLAT_LABEL[root] : SHARP_LABEL[root];
}

/** 例: {E, minor, none} → "Em" / {A#, major, M7} → "A♯M7" */
export function chordName(selection: ChordSelection, accidental: Accidental = 'sharp'): string {
  return rootLabel(selection.root, accidental) + SUFFIX[chordTypeOf(selection)];
}

export function suffixOf(type: ChordType): string {
  return SUFFIX[type];
}
