/** 弦は常に 6弦(index 0) → 1弦(index 5) の順で並べる */
export const STRING_COUNT = 6;

/** レギュラーチューニングの開放弦 MIDI ノート番号（6弦→1弦） */
export const OPEN_STRING_MIDI = [40, 45, 50, 55, 59, 64] as const;

/** 開放弦のピッチクラス（6弦→1弦） */
export const OPEN_STRING_PITCH_CLASS = OPEN_STRING_MIDI.map((m) => m % 12);

export interface Barre {
  fret: number;
  /** 押さえる弦の範囲（index。0 = 6弦） */
  fromIndex: number;
  toIndex: number;
}

export interface Voicing {
  /** 6弦→1弦。null = ミュート(×), 0 = 開放(○), 1.. = フレット番号 */
  frets: (number | null)[];
  /** 6弦→1弦。1=人差し指 … 4=小指, null = 押さえない */
  fingers: (number | null)[];
  barres: Barre[];
  /** ダイアグラム左端のフレット番号（1 ならナット表示） */
  baseFret: number;
  /** フォームの由来（切替タブの見出し） */
  label: string;
}

/** 表示する押弦位置の窓（フレット数） */
export const DIAGRAM_FRET_SPAN = 5;

/** ダイアグラムの左端フレットを決める */
export function computeBaseFret(frets: (number | null)[]): number {
  const pressed = frets.filter((f): f is number => f !== null && f > 0);
  if (pressed.length === 0) return 1;
  const max = Math.max(...pressed);
  if (max <= DIAGRAM_FRET_SPAN - 1) return 1;
  return Math.min(...pressed);
}

/** タブ表記（例: "x32010" / 10 フレット以上は "-" 区切り） */
export function fretsToText(frets: (number | null)[]): string {
  const needsSeparator = frets.some((f) => f !== null && f >= 10);
  const cells = frets.map((f) => (f === null ? 'x' : String(f)));
  return needsSeparator ? cells.join('-') : cells.join('');
}

/** 実際に鳴る音の MIDI ノート番号（ミュート弦は除外） */
export function voicingMidiNotes(voicing: Voicing): { stringIndex: number; midi: number }[] {
  return voicing.frets.flatMap((fret, i) =>
    fret === null ? [] : [{ stringIndex: i, midi: OPEN_STRING_MIDI[i] + fret }],
  );
}
