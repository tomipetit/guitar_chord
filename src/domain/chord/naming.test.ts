import { describe, expect, it } from 'vitest';
import { chordName, rootLabel } from './naming';
import { chordTypeOf } from './types';

describe('chordName', () => {
  it('メジャーはサフィックスなし', () => {
    expect(chordName({ root: 'C', quality: 'major', tension: 'none' })).toBe('C');
  });

  it('マイナーは m が付く', () => {
    expect(chordName({ root: 'E', quality: 'minor', tension: 'none' })).toBe('Em');
  });

  it('マイナー + 7 は m7 になる', () => {
    expect(chordName({ root: 'A', quality: 'minor', tension: '7' })).toBe('Am7');
  });

  it('メジャー + 7 は 7 のまま', () => {
    expect(chordName({ root: 'G', quality: 'major', tension: '7' })).toBe('G7');
  });

  it('m7♭5', () => {
    expect(chordName({ root: 'B', quality: 'minor', tension: 'm7b5' })).toBe('Bm7♭5');
  });

  it('♯/♭ 表記を切り替えられる', () => {
    const sel = { root: 'A#', quality: 'major', tension: 'M7' } as const;
    expect(chordName(sel, 'sharp')).toBe('A♯M7');
    expect(chordName(sel, 'flat')).toBe('B♭M7');
  });

  it('ナチュラル音は表記切替の影響を受けない', () => {
    expect(rootLabel('F', 'flat')).toBe('F');
  });
});

describe('chordTypeOf', () => {
  it('マイナーで未対応のテンションはマイナー扱いに丸める', () => {
    expect(chordTypeOf({ root: 'C', quality: 'minor', tension: '6' })).toBe('minor');
  });
});
