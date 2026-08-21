import { describe, expect, it } from 'vitest';
import { midiToFrequency } from '../../domain/pitch';
import { renderPluck } from './pluck';

/** createBuffer だけを備えた最小の AudioContext 代役 */
function fakeContext(sampleRate = 48000): BaseAudioContext {
  return {
    sampleRate,
    createBuffer(_channels: number, length: number, rate: number) {
      const data = new Float32Array(length);
      return {
        length,
        sampleRate: rate,
        numberOfChannels: 1,
        getChannelData: () => data,
      } as unknown as AudioBuffer;
    },
  } as unknown as BaseAudioContext;
}

function samplesOf(frequency: number, duration = 1, sampleRate = 48000): Float32Array {
  return renderPluck(fakeContext(sampleRate), frequency, duration).getChannelData(0);
}

/** lag サンプルずらした自己相関 */
function autocorrelation(data: Float32Array, lag: number, from: number, count: number): number {
  let sum = 0;
  for (let i = from; i < from + count; i += 1) {
    sum += data[i] * data[i + lag];
  }
  return sum / count;
}

describe('renderPluck', () => {
  it('指定した長さのバッファを返す', () => {
    const data = samplesOf(220, 0.5);
    expect(data.length).toBe(24000);
  });

  it('すべてのサンプルが有限で振幅の範囲に収まる', () => {
    const data = samplesOf(midiToFrequency(40));
    let peak = 0;
    let finite = true;
    for (const sample of data) {
      if (!Number.isFinite(sample)) finite = false;
      peak = Math.max(peak, Math.abs(sample));
    }
    expect(finite).toBe(true);
    expect(peak).toBeLessThanOrEqual(1);
    expect(peak).toBeGreaterThan(0.05);
  });

  it('狙ったピッチで周期的になっている', () => {
    const sampleRate = 48000;
    const frequency = 440;
    const period = Math.round(sampleRate / frequency);
    const data = samplesOf(frequency, 1, sampleRate);

    const window = 8000;
    const from = 4000;
    const energy = autocorrelation(data, 0, from, window);
    const atPeriod = autocorrelation(data, period, from, window);
    const atHalfPeriod = autocorrelation(data, Math.round(period / 2), from, window);

    // 1 周期ずらすと波形がほぼ重なる（＝その周波数で振動している）
    expect(atPeriod / energy).toBeGreaterThan(0.8);
    // 半周期ずらすと重ならない
    expect(atPeriod).toBeGreaterThan(atHalfPeriod);
  });

  it('弾いた直後より終わり際のほうが小さい（減衰している）', () => {
    const data = samplesOf(midiToFrequency(64), 2);
    const peak = (from: number, count: number) => {
      let max = 0;
      for (let i = from; i < from + count; i += 1) max = Math.max(max, Math.abs(data[i]));
      return max;
    };
    expect(peak(0, 4800)).toBeGreaterThan(peak(data.length - 4800, 4800));
  });

  it('末尾はゼロまで落ちる（クリックノイズが出ない）', () => {
    const data = samplesOf(330, 1);
    expect(Math.abs(data[data.length - 1])).toBe(0);
  });

  it('極端に高いピッチでも壊れない', () => {
    const data = samplesOf(20000, 0.2);
    expect(data.every((s) => Number.isFinite(s))).toBe(true);
  });
});
