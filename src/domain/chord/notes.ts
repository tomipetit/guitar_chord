import type { ChordType, Root } from './types';
import { ROOTS, pitchClassOf } from './types';

/** ルートからの半音距離 */
export const INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  '7': [0, 4, 7, 10],
  M7: [0, 4, 7, 11],
  '6': [0, 4, 7, 9],
  sus4: [0, 5, 7],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
};

/** 度数の表示ラベル（ダイアグラム下の構成音表示用） */
export const DEGREE_LABELS: Record<ChordType, string[]> = {
  major: ['R', '3', '5'],
  minor: ['R', '♭3', '5'],
  '7': ['R', '3', '5', '♭7'],
  M7: ['R', '3', '5', '7'],
  '6': ['R', '3', '5', '6'],
  sus4: ['R', '4', '5'],
  m7: ['R', '♭3', '5', '♭7'],
  m7b5: ['R', '♭3', '♭5', '♭7'],
};

/** コードの構成音（ピッチクラスの集合） */
export function pitchClassesOf(root: Root, type: ChordType): number[] {
  const base = pitchClassOf(root);
  return INTERVALS[type].map((i) => (base + i) % 12);
}

/** 構成音を音名の配列で返す */
export function chordTones(root: Root, type: ChordType): Root[] {
  return pitchClassesOf(root, type).map((pc) => ROOTS[pc]);
}
