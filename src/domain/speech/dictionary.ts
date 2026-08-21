import type { Quality, Root, Tension } from '../chord/types';

export type SpeechToken =
  | { kind: 'root'; text: string; root: Root }
  | { kind: 'sharp'; text: string }
  | { kind: 'flat'; text: string }
  | { kind: 'quality'; text: string; quality: Quality }
  | { kind: 'tension'; text: string; tension: Tension; quality?: Quality }
  /** ラテン文字の b。文頭なら B、ルートの直後なら ♭ と解釈する */
  | { kind: 'b'; text: string };

function root(root: Root, ...readings: string[]): SpeechToken[] {
  return readings.map((text) => ({ kind: 'root', text, root }));
}

function tension(tension: Tension, quality: Quality | undefined, ...readings: string[]): SpeechToken[] {
  return readings.map((text) => ({ kind: 'tension', text, tension, quality }));
}

function quality(quality: Quality, ...readings: string[]): SpeechToken[] {
  return readings.map((text) => ({ kind: 'quality', text, quality }));
}

const TOKENS: SpeechToken[] = [
  // --- ルート ---
  ...root('A', 'えー', 'えい', 'えぇ', 'え', 'A', 'a'),
  ...root('B', 'びー', 'びい', 'び', 'B'),
  ...root('C', 'しー', 'すぃー', 'しい', 'し', 'C', 'c'),
  ...root('D', 'でぃー', 'でー', 'でい', 'でぃ', 'で', 'D', 'd'),
  // 「いー」は 1 と誤変換されることが多い
  ...root('E', 'いー', 'いい', 'い', 'E', 'e', '1'),
  ...root('F', 'えふ', 'F', 'f'),
  ...root('G', 'じー', 'じい', 'じ', 'G', 'g'),

  // --- 変化記号 ---
  { kind: 'sharp', text: 'しゃーぷ' },
  { kind: 'sharp', text: 'しゃあぷ' },
  { kind: 'sharp', text: '♯' },
  { kind: 'sharp', text: '#' },
  { kind: 'flat', text: 'ふらっと' },
  { kind: 'flat', text: 'ぶらっと' },
  { kind: 'flat', text: '♭' },
  { kind: 'b', text: 'b' },

  // --- メジャー / マイナー ---
  ...quality('minor', 'まいなー', 'まいなあ', 'まいな', 'たんちょう', '短調', 'えむ', 'm'),
  ...quality('major', 'めじゃー', 'めじゃあ', 'めーじゃー', 'ちょうちょう', '長調'),

  // --- テンション ---
  // メジャーセブンスは「めじゃー」より先に照合する必要があるが、
  // 最長一致で走査するので並び順には依存しない
  ...tension('M7', 'major', 'めじゃーせぶんす', 'めじゃーせぶん', 'めじゃせぶん', 'まるなな', 'まる7', 'M7', 'maj7', 'Maj7', 'MAJ7'),
  ...tension('m7b5', 'minor', 'まいなーせぶんふらっとふぁいぶ', 'まいなーせぶんすふらっとふぁいぶ', 'はーふでぃみにっしゅ', 'はーふでぃむ', 'm7b5', 'm7-5'),
  ...tension('7', undefined, 'せぶんす', 'せぶん', 'せふん', 'なな', 'しち', '7'),
  ...tension('6', 'major', 'しっくす', 'ろく', '6'),
  ...tension('sus4', 'major', 'さすふぉー', 'さすふぉあ', 'さすふぉ', 'さすよん', 'さす4', 'sus4', 'さす'),
];

/** 長いものから照合するための表 */
const SORTED_TOKENS = [...TOKENS].sort((a, b) => b.text.length - a.text.length);

/** position から始まる最長のトークンを返す */
export function matchTokenAt(text: string, position: number): SpeechToken | null {
  for (const token of SORTED_TOKENS) {
    if (text.startsWith(token.text, position)) return token;
  }
  return null;
}
