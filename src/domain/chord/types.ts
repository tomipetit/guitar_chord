/** 12音。内部表現は常にシャープ表記で持つ */
export const ROOTS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;
export type Root = (typeof ROOTS)[number];

export type Quality = 'major' | 'minor';

/** Step3 で選ぶ付加音。major / minor で選べるものが異なる */
export type Tension = 'none' | '7' | 'M7' | '6' | 'sus4' | 'm7b5';

export interface ChordSelection {
  root: Root;
  quality: Quality;
  tension: Tension;
}

/**
 * (quality, tension) を解決した内部コード種別。
 * フォーム定義・構成音・表示名はすべてこのキーで引く。
 */
export type ChordType =
  | 'major' | 'minor'
  | '7' | 'M7' | '6' | 'sus4'
  | 'm7' | 'm7b5';

/** 選択状態 → コード種別 */
export function chordTypeOf(selection: ChordSelection): ChordType {
  const { quality, tension } = selection;
  if (quality === 'major') {
    return tension === 'none' ? 'major' : (tension as ChordType);
  }
  switch (tension) {
    case '7':
      return 'm7';
    case 'm7b5':
      return 'm7b5';
    default:
      return 'minor';
  }
}

/** ルートの半音位置 (C = 0) */
export function pitchClassOf(root: Root): number {
  return ROOTS.indexOf(root);
}
