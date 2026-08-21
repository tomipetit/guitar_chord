import { midiToFrequency } from '../../domain/pitch';
import { renderPluck } from './pluck';

export type PlaybackMode = 'strum' | 'arpeggio';

export const PLAYBACK_MODES: { id: PlaybackMode; label: string }[] = [
  { id: 'strum', label: 'ストローク' },
  { id: 'arpeggio', label: 'アルペジオ' },
];

/** 6弦→1弦の発音間隔（秒） */
const STAGGER_SECONDS: Record<PlaybackMode, number> = {
  strum: 0.035,
  arpeggio: 0.28,
};

const NOTE_DURATION_SECONDS = 2.6;
const SCHEDULE_LEAD_SECONDS = 0.02;
const STOP_FADE_SECONDS = 0.06;

type AudioContextCtor = typeof AudioContext;

function audioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const legacy = (window as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  return window.AudioContext ?? legacy;
}

export function isAudioSupported(): boolean {
  return audioContextCtor() !== undefined;
}

interface Voice {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

/**
 * コードの発音を受け持つ。
 * AudioContext はユーザー操作の中で初めて生成する（iOS の自動再生制限対策）。
 */
export class ChordPlayer {
  private context: AudioContext | null = null;
  private voices: Voice[] = [];

  get supported(): boolean {
    return isAudioSupported();
  }

  /**
   * コード全体を鳴らす。onEnded は最後の音が鳴り終わったときに呼ばれる。
   * 実際に発音をスケジュールできたかどうかを返す（できなければ onEnded も呼ばれない）。
   */
  async playChord(
    midiNotes: number[],
    mode: PlaybackMode,
    onEnded?: () => void,
  ): Promise<boolean> {
    const context = await this.activate();
    if (!context || midiNotes.length === 0) return false;

    this.stop();

    const stagger = STAGGER_SECONDS[mode];
    // 同時発音数が増えるほど 1 音あたりを絞ってクリッピングを避ける
    const level = 0.9 / Math.sqrt(midiNotes.length);
    const startAt = context.currentTime + SCHEDULE_LEAD_SECONDS;

    const scheduled = midiNotes.map((midi, i) =>
      this.startVoice(context, midi, startAt + i * stagger, level),
    );

    const last = scheduled[scheduled.length - 1];
    if (last && onEnded) {
      last.source.addEventListener('ended', onEnded, { once: true });
    }
    return true;
  }

  /** 1 本の弦だけ鳴らす。鳴っている音は止めない */
  async pluckString(midi: number): Promise<void> {
    const context = await this.activate();
    if (!context) return;
    this.startVoice(context, midi, context.currentTime + SCHEDULE_LEAD_SECONDS, 0.9);
  }

  /** 鳴っている音をフェードアウトさせて止める */
  stop(): void {
    const context = this.context;
    if (!context) return;
    const now = context.currentTime;

    for (const voice of this.voices) {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
      voice.gain.gain.linearRampToValueAtTime(0, now + STOP_FADE_SECONDS);
      try {
        voice.source.stop(now + STOP_FADE_SECONDS);
      } catch {
        // 既に停止済みのソースは無視してよい
      }
    }
    this.voices = [];
  }

  dispose(): void {
    this.stop();
    void this.context?.close();
    this.context = null;
  }

  private startVoice(
    context: AudioContext,
    midi: number,
    when: number,
    level: number,
  ): Voice {
    const source = context.createBufferSource();
    source.buffer = renderPluck(context, midiToFrequency(midi), NOTE_DURATION_SECONDS);

    const gain = context.createGain();
    gain.gain.value = level;

    source.connect(gain);
    gain.connect(context.destination);
    source.start(when);

    const voice: Voice = { source, gain };
    source.addEventListener(
      'ended',
      () => {
        gain.disconnect();
        this.voices = this.voices.filter((v) => v !== voice);
      },
      { once: true },
    );
    this.voices.push(voice);
    return voice;
  }

  /** AudioContext を用意し、サスペンド状態なら再開する */
  private async activate(): Promise<AudioContext | null> {
    if (!this.context) {
      const Ctor = audioContextCtor();
      if (!Ctor) return null;
      try {
        this.context = new Ctor();
      } catch {
        return null;
      }
    }
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    return this.context;
  }
}
