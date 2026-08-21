import { describe, expect, it } from 'vitest';
import { midiToFrequency } from './pitch';
import { OPEN_STRING_MIDI } from './voicing/types';

describe('midiToFrequency', () => {
  it('A4 = 440Hz', () => {
    expect(midiToFrequency(69)).toBe(440);
  });

  it('1 オクターブ下は半分の周波数', () => {
    expect(midiToFrequency(57)).toBeCloseTo(220, 6);
  });

  it('6弦開放 E2 は約 82.41Hz', () => {
    expect(midiToFrequency(OPEN_STRING_MIDI[0])).toBeCloseTo(82.41, 2);
  });

  it('1弦開放 E4 は約 329.63Hz', () => {
    expect(midiToFrequency(OPEN_STRING_MIDI[5])).toBeCloseTo(329.63, 2);
  });

  it('半音上は 2^(1/12) 倍', () => {
    expect(midiToFrequency(61) / midiToFrequency(60)).toBeCloseTo(2 ** (1 / 12), 10);
  });
});
