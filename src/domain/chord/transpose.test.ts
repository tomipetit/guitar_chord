import { describe, expect, it } from 'vitest';
import { chordName } from './naming';
import { transposeSelection } from './transpose';
import type { ChordSelection } from './types';

const c7: ChordSelection = { root: 'C', quality: 'major', tension: '7' };
const em: ChordSelection = { root: 'E', quality: 'minor', tension: 'none' };

describe('transposeSelection', () => {
  it('半音上げる', () => {
    expect(chordName(transposeSelection(c7, 1))).toBe('C♯7');
  });

  it('半音下げる', () => {
    expect(chordName(transposeSelection(c7, -1))).toBe('B7');
  });

  it('B の上は C に回り込む', () => {
    expect(chordName(transposeSelection({ ...c7, root: 'B' }, 1))).toBe('C7');
  });

  it('C の下は B に回り込む', () => {
    expect(chordName(transposeSelection(c7, -1))).toBe('B7');
  });

  it('メジャー / マイナーとテンションは引き継ぐ', () => {
    const moved = transposeSelection({ root: 'A', quality: 'minor', tension: 'm7b5' }, 3);
    expect(moved.quality).toBe('minor');
    expect(moved.tension).toBe('m7b5');
    expect(chordName(moved)).toBe('Cm7♭5');
  });

  it('12 半音で 1 周する', () => {
    expect(transposeSelection(em, 12)).toEqual(em);
    expect(transposeSelection(em, -12)).toEqual(em);
  });

  it('1 周を超える移動でも壊れない', () => {
    expect(transposeSelection(em, 25)).toEqual(transposeSelection(em, 1));
    expect(transposeSelection(em, -25)).toEqual(transposeSelection(em, -1));
  });

  it('0 半音なら何も変わらない', () => {
    expect(transposeSelection(c7, 0)).toEqual(c7);
  });

  it('12 回上げると元に戻る', () => {
    let current = em;
    for (let i = 0; i < 12; i += 1) current = transposeSelection(current, 1);
    expect(current).toEqual(em);
  });
});
