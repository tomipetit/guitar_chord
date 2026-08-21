import type { ChordSelection, ChordType, Root } from '../chord/types';
import { chordTypeOf, pitchClassOf } from '../chord/types';
import { openChordFor } from './openChords';
import { movableShapesFor, type MovableShape } from './shapes';
import { computeBaseFret, fretsToText, type Voicing } from './types';

/** ルート弦の index（0 = 6弦）と開放音のピッチクラス */
const ROOT_STRING: Record<6 | 5, { index: number; pitchClass: number }> = {
  6: { index: 0, pitchClass: 4 }, // 6弦開放 = E
  5: { index: 1, pitchClass: 9 }, // 5弦開放 = A
};

/** そのシェイプでルートを取るためのフレット位置（0〜11） */
function rootFretFor(shape: MovableShape, root: Root): number {
  const { pitchClass } = ROOT_STRING[shape.rootString];
  return (pitchClassOf(root) - pitchClass + 12) % 12;
}

function transpose(shape: MovableShape, rootFret: number): Voicing {
  const frets = shape.offsets.map((o) => (o === null ? null : o + rootFret));
  // 開放弦になった箇所は運指を持たない
  const fingers = shape.fingers.map((f, i) => (frets[i] === 0 ? null : f));
  const barres = (shape.barres ?? [])
    .map((b) => ({ fret: b.offset + rootFret, fromIndex: b.fromIndex, toIndex: b.toIndex }))
    .filter((b) => b.fret > 0);

  const position = shape.rootString === 6 ? '6弦ルート' : '5弦ルート';
  const label = rootFret === 0 ? `${position}・開放` : `${position} ${rootFret}fr`;

  return { frets, fingers, barres, baseFret: computeBaseFret(frets), label };
}

/**
 * コード種別とルートから押弦フォームを生成する。
 * 「開放形テーブル → 6弦ルート → 5弦ルート」の順（＝押さえやすい順）に並べ、
 * 同一フォームは取り除く。
 */
export function generateVoicings(root: Root, type: ChordType): Voicing[] {
  const voicings: Voicing[] = [];

  const open = openChordFor(root, type);
  if (open) {
    voicings.push({
      frets: open.frets,
      fingers: open.fingers,
      barres: open.barres ?? [],
      baseFret: computeBaseFret(open.frets),
      label: '開放',
    });
  }

  for (const shape of movableShapesFor(type)) {
    const rootFret = rootFretFor(shape, root);
    voicings.push(transpose(shape, rootFret));
    // 開放位置でルートが取れる場合は 1 オクターブ上のバレーも候補に出す
    if (rootFret === 0) voicings.push(transpose(shape, 12));
  }

  const seen = new Set<string>();
  return voicings.filter((v) => {
    const key = fretsToText(v.frets);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** 選択状態から直接フォームを得るショートカット */
export function voicingsForSelection(selection: ChordSelection): Voicing[] {
  return generateVoicings(selection.root, chordTypeOf(selection));
}
