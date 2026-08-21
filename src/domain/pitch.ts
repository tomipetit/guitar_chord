/** A4 = MIDI 69 = 440Hz を基準に周波数を求める */
export const A4_MIDI = 69;
export const A4_FREQUENCY = 440;

export function midiToFrequency(midi: number, a4: number = A4_FREQUENCY): number {
  return a4 * 2 ** ((midi - A4_MIDI) / 12);
}
