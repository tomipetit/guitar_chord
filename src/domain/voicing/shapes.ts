import type { ChordType } from '../chord/types';

/**
 * ルート相対で定義した可動シェイプ。
 * ルート音の位置まで平行移動するだけで全キーぶんのフォームが得られる。
 */
export interface MovableShape {
  /** ルートを取る弦（6 = 6弦, 5 = 5弦） */
  rootString: 6 | 5;
  /** 6弦→1弦。null = ミュート、数値 = ルートフレットからのオフセット */
  offsets: (number | null)[];
  /** 6弦→1弦の運指 */
  fingers: (number | null)[];
  /** バレー（オフセットと弦の範囲で指定） */
  barres?: { offset: number; fromIndex: number; toIndex: number }[];
}

/** 6弦ルート（E フォーム） */
const E_FORM: Partial<Record<ChordType, MovableShape>> = {
  major: {
    rootString: 6,
    offsets: [0, 2, 2, 1, 0, 0],
    fingers: [1, 3, 4, 2, 1, 1],
    barres: [{ offset: 0, fromIndex: 0, toIndex: 5 }],
  },
  minor: {
    rootString: 6,
    offsets: [0, 2, 2, 0, 0, 0],
    fingers: [1, 3, 4, 1, 1, 1],
    barres: [{ offset: 0, fromIndex: 0, toIndex: 5 }],
  },
  '7': {
    rootString: 6,
    offsets: [0, 2, 0, 1, 0, 0],
    fingers: [1, 3, 1, 2, 1, 1],
    barres: [{ offset: 0, fromIndex: 0, toIndex: 5 }],
  },
  M7: {
    rootString: 6,
    offsets: [0, 2, 1, 1, 0, 0],
    fingers: [1, 4, 2, 3, 1, 1],
    barres: [{ offset: 0, fromIndex: 0, toIndex: 5 }],
  },
  '6': {
    rootString: 6,
    offsets: [0, 2, 2, 1, 2, 0],
    fingers: [1, 3, 3, 2, 4, 1],
    barres: [
      { offset: 0, fromIndex: 0, toIndex: 5 },
      { offset: 2, fromIndex: 1, toIndex: 2 },
    ],
  },
  sus4: {
    rootString: 6,
    offsets: [0, 2, 2, 2, 0, 0],
    fingers: [1, 2, 3, 4, 1, 1],
    barres: [{ offset: 0, fromIndex: 0, toIndex: 5 }],
  },
  m7: {
    rootString: 6,
    offsets: [0, 2, 0, 0, 0, 0],
    fingers: [1, 3, 1, 1, 1, 1],
    barres: [{ offset: 0, fromIndex: 0, toIndex: 5 }],
  },
  // m7♭5 は 6弦ルートだと押さえにくいため 5弦ルートのみ提供する
};

/** 5弦ルート（A フォーム） */
const A_FORM: Partial<Record<ChordType, MovableShape>> = {
  major: {
    rootString: 5,
    offsets: [null, 0, 2, 2, 2, 0],
    fingers: [null, 1, 3, 3, 3, 1],
    barres: [
      { offset: 0, fromIndex: 1, toIndex: 5 },
      { offset: 2, fromIndex: 2, toIndex: 4 },
    ],
  },
  minor: {
    rootString: 5,
    offsets: [null, 0, 2, 2, 1, 0],
    fingers: [null, 1, 3, 4, 2, 1],
    barres: [{ offset: 0, fromIndex: 1, toIndex: 5 }],
  },
  '7': {
    rootString: 5,
    offsets: [null, 0, 2, 0, 2, 0],
    fingers: [null, 1, 3, 1, 4, 1],
    barres: [{ offset: 0, fromIndex: 1, toIndex: 5 }],
  },
  M7: {
    rootString: 5,
    offsets: [null, 0, 2, 1, 2, 0],
    fingers: [null, 1, 3, 2, 4, 1],
    barres: [{ offset: 0, fromIndex: 1, toIndex: 5 }],
  },
  '6': {
    rootString: 5,
    offsets: [null, 0, 2, 2, 2, 2],
    fingers: [null, 1, 3, 3, 3, 3],
    barres: [
      { offset: 0, fromIndex: 1, toIndex: 5 },
      { offset: 2, fromIndex: 2, toIndex: 5 },
    ],
  },
  sus4: {
    rootString: 5,
    offsets: [null, 0, 2, 2, 3, 0],
    fingers: [null, 1, 2, 3, 4, 1],
    barres: [{ offset: 0, fromIndex: 1, toIndex: 5 }],
  },
  m7: {
    rootString: 5,
    offsets: [null, 0, 2, 0, 1, 0],
    fingers: [null, 1, 3, 1, 2, 1],
    barres: [{ offset: 0, fromIndex: 1, toIndex: 5 }],
  },
  m7b5: {
    rootString: 5,
    offsets: [null, 0, 1, 0, 1, null],
    fingers: [null, 2, 3, 1, 4, null],
  },
};

/** そのコード種別で使える可動シェイプを、押さえやすい順に返す */
export function movableShapesFor(type: ChordType): MovableShape[] {
  return [E_FORM[type], A_FORM[type]].filter((s): s is MovableShape => s !== undefined);
}
