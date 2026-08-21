import { ROOTS, pitchClassOf, type ChordSelection } from './types';

/**
 * ルートを半音単位で移動する。メジャー / マイナーとテンションはそのまま引き継ぐ。
 * カポによる読み替えも「マイナス方向の移調」なので同じ計算を使う。
 */
export function transposeSelection(selection: ChordSelection, semitones: number): ChordSelection {
  const shifted = (((pitchClassOf(selection.root) + semitones) % 12) + 12) % 12;
  return { ...selection, root: ROOTS[shifted] };
}
