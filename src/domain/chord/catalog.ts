import type { Quality, Root, Tension } from './types';

/** Step1 上段: ナチュラルキー */
export const NATURAL_KEYS: Root[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/** Step1 下段: 派生音（表示ラベルは ♯/♭ 設定に従う） */
export const ACCIDENTAL_KEYS: Root[] = ['C#', 'D#', 'F#', 'G#', 'A#'];

/** 派生音の表示表記。選ばれるコードそのものは変わらない */
export type Accidental = 'sharp' | 'flat';

export const QUALITIES: { id: Quality; label: string }[] = [
  { id: 'major', label: 'Major' },
  { id: 'minor', label: 'Minor' },
];

export interface TensionOption {
  id: Tension;
  label: string;
}

const MAJOR_TENSIONS: TensionOption[] = [
  { id: 'none', label: '—' },
  { id: '7', label: '7' },
  { id: 'M7', label: 'M7' },
  { id: '6', label: '6' },
  { id: 'sus4', label: 'sus4' },
];

const MINOR_TENSIONS: TensionOption[] = [
  { id: 'none', label: '—' },
  { id: '7', label: '7' },
  { id: 'm7b5', label: 'm7♭5' },
];

export function tensionsFor(quality: Quality): TensionOption[] {
  return quality === 'major' ? MAJOR_TENSIONS : MINOR_TENSIONS;
}

/** 種別を切り替えたとき、現在のテンションが使えなければ 'none' に落とす */
export function coerceTension(quality: Quality, tension: Tension): Tension {
  return tensionsFor(quality).some((t) => t.id === tension) ? tension : 'none';
}
