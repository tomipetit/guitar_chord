import { transposeSelection } from './chord/transpose';
import type { ChordSelection } from './chord/types';

/** 選べるカポ位置の上限 */
export const MAX_CAPO = 7;

export const CAPO_POSITIONS = Array.from({ length: MAX_CAPO + 1 }, (_, i) => i);

/**
 * カポを付けているとき、実際に押さえるコードフォームを返す。
 *
 * ユーザーが選ぶのは「鳴らしたい実音」。カポは開放弦を n 半音持ち上げるので、
 * 押さえる形はその ぶんだけ低いコードになる。
 * 例: カポ 3fr で E♭ を鳴らしたい → C の形を押さえる。
 */
export function shapeSelectionFor(selection: ChordSelection, capo: number): ChordSelection {
  return transposeSelection(selection, -capo);
}
