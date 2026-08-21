import { describe, expect, it } from 'vitest';
import { shapeSelectionFor } from './capo';
import { chordName } from './chord/naming';
import type { ChordSelection } from './chord/types';
import { generateVoicings } from './voicing/generate';
import { OPEN_STRING_MIDI, fretsToText, voicingMidiNotes } from './voicing/types';

const sel = (root: ChordSelection['root'], quality: ChordSelection['quality'] = 'major'): ChordSelection => ({
  root,
  quality,
  tension: 'none',
});

describe('shapeSelectionFor', () => {
  it('カポ無しなら何も変えない', () => {
    const selection = sel('E', 'minor');
    expect(shapeSelectionFor(selection, 0)).toEqual(selection);
  });

  it('カポ 3fr で E♭ を鳴らすには C の形を押さえる', () => {
    expect(chordName(shapeSelectionFor(sel('D#'), 3))).toBe('C');
  });

  it('カポ 5fr で E を鳴らすには B の形を押さえる', () => {
    expect(chordName(shapeSelectionFor(sel('E'), 5))).toBe('B');
  });

  it('12 半音回ると元に戻る', () => {
    expect(shapeSelectionFor(sel('C'), 12)).toEqual(sel('C'));
  });

  it('メジャー / マイナーとテンションは変えない', () => {
    const selection: ChordSelection = { root: 'G', quality: 'minor', tension: '7' };
    const shape = shapeSelectionFor(selection, 2);
    expect(shape.quality).toBe('minor');
    expect(shape.tension).toBe('7');
    expect(chordName(shape)).toBe('Fm7');
  });
});

describe('カポを付けたときに実際に鳴る音', () => {
  it('カポ 3fr で C の形を押さえると E♭ の構成音が鳴る', () => {
    const shape = shapeSelectionFor(sel('D#'), 3);
    const [voicing] = generateVoicings(shape.root, 'major');
    expect(fretsToText(voicing.frets)).toBe('x32010');

    const sounded = voicingMidiNotes(voicing, 3).map((n) => n.midi % 12);
    // E♭ メジャー = E♭, G, B♭ → 3, 7, 10
    expect([...new Set(sounded)].sort((a, b) => a - b)).toEqual([3, 7, 10]);
  });

  it('カポの位置ぶんだけ音が高くなる', () => {
    const [voicing] = generateVoicings('C', 'major');
    const withoutCapo = voicingMidiNotes(voicing, 0).map((n) => n.midi);
    const withCapo = voicingMidiNotes(voicing, 4).map((n) => n.midi);
    expect(withCapo).toEqual(withoutCapo.map((m) => m + 4));
  });

  it('開放弦はカポで押さえられた音になる', () => {
    const [voicing] = generateVoicings('E', 'minor');
    expect(fretsToText(voicing.frets)).toBe('022000');
    const notes = voicingMidiNotes(voicing, 2);
    // 6弦開放はカポ 2fr ぶん上がる
    expect(notes[0].midi).toBe(OPEN_STRING_MIDI[0] + 2);
  });
});
