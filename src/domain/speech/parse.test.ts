import { describe, expect, it } from 'vitest';
import { chordName } from '../chord/naming';
import type { Accidental } from '../chord/catalog';
import { isConfident, parseChord, parseChordCandidates } from './parse';
import { normalizeSpeech } from './normalize';

/** 聞き取りテキストを解釈してコード名にする */
function heard(transcript: string, accidental: Accidental = 'sharp'): string | null {
  const parsed = parseChord(transcript);
  return parsed ? chordName(parsed.selection, accidental) : null;
}

describe('normalizeSpeech', () => {
  it('カタカナをひらがなに寄せる', () => {
    expect(normalizeSpeech('イーマイナー')).toBe('いーまいなー');
  });

  it('空白と句読点を落とす', () => {
    expect(normalizeSpeech('イー　マイナー、')).toBe('いーまいなー');
  });

  it('全角英数を半角にする', () => {
    expect(normalizeSpeech('Ｅｍ７')).toBe('Em7');
  });

  it('M7 と m7 の区別を壊さない', () => {
    expect(normalizeSpeech('CM7')).toBe('CM7');
    expect(normalizeSpeech('Cm7')).toBe('Cm7');
  });

  it('ハイフンや全角長音を長音符に統一する', () => {
    expect(normalizeSpeech('イ-マイナ―')).toBe('いーまいなー');
  });
});

describe('parseChord: 日本語の読み', () => {
  it('「いーまいなー」→ Em', () => {
    expect(heard('いーまいなー')).toBe('Em');
  });

  it.each([
    ['イーマイナー', 'Em'],
    ['えーまいなー', 'Am'],
    ['しー', 'C'],
    ['しーめじゃー', 'C'],
    ['でぃー', 'D'],
    ['えふ', 'F'],
    ['じー', 'G'],
    ['びー', 'B'],
    ['1マイナー', 'Em'],
  ])('%s → %s', (transcript, expected) => {
    expect(heard(transcript)).toBe(expected);
  });
});

describe('parseChord: テンション', () => {
  it.each([
    ['しーせぶんす', 'C7'],
    ['えーまいなーせぶん', 'Am7'],
    ['しーめじゃーせぶんす', 'CM7'],
    ['じーしっくす', 'G6'],
    ['でぃーさすふぉー', 'Dsus4'],
    ['びーまいなーせぶんふらっとふぁいぶ', 'Bm7♭5'],
    ['えーはーふでぃみにっしゅ', 'Am7♭5'],
  ])('%s → %s', (transcript, expected) => {
    expect(heard(transcript)).toBe(expected);
  });

  it('メジャーセブンスを「めじゃー」より優先して読む', () => {
    expect(heard('えふめじゃーせぶんす')).toBe('FM7');
  });
});

describe('parseChord: 変化記号', () => {
  it('シャープ', () => {
    expect(heard('えふしゃーぷまいなーせぶん')).toBe('F♯m7');
  });

  it('フラット', () => {
    expect(heard('びーふらっとめじゃーせぶんす', 'flat')).toBe('B♭M7');
  });

  it('♯ 記号でも読める', () => {
    expect(heard('C♯マイナー')).toBe('C♯m');
  });

  it('ルートの前のシャープは無視する', () => {
    expect(heard('しゃーぷしー')).toBe('C');
  });
});

describe('parseChord: b の曖昧性', () => {
  it('文頭の b は音名の B', () => {
    expect(heard('b')).toBe('B');
  });

  it('ルートの直後の b は ♭', () => {
    expect(heard('Bb', 'flat')).toBe('B♭');
    expect(heard('Eb', 'flat')).toBe('E♭');
  });

  it('すでに変化記号があれば無視する', () => {
    expect(heard('C#b')).toBe('C♯');
  });
});

describe('parseChord: ラテン文字表記', () => {
  it.each([
    ['Am7', 'Am7'],
    ['AM7', 'AM7'],
    ['Cmaj7', 'CM7'],
    ['Em', 'Em'],
    ['G7', 'G7'],
    ['Dsus4', 'Dsus4'],
  ])('%s → %s', (transcript, expected) => {
    expect(heard(transcript)).toBe(expected);
  });
});

describe('parseChord: 解釈できない入力', () => {
  it('空文字は null', () => {
    expect(parseChord('')).toBeNull();
  });

  it('ルートが無ければ null', () => {
    expect(parseChord('まいなー')).toBeNull();
    expect(parseChord('せぶんす')).toBeNull();
  });

  it('関係のない発話は確信度が大きく下がる', () => {
    const parsed = parseChord('きょうはいいてんきですね');
    // 「い」を E と拾ってしまうことはあるが、確信度で弾ける
    if (parsed) expect(parsed.confidence).toBeLessThan(0.4);
  });
});

describe('parseChord: 確信度', () => {
  it('過不足なく解釈できれば 1.0', () => {
    expect(parseChord('いーまいなー')?.confidence).toBe(1);
  });

  it('メジャー / マイナーを言わなかった場合は少し下がる', () => {
    expect(parseChord('しー')?.confidence).toBe(0.9);
  });

  it('余分な語が混じると下がる', () => {
    const clean = parseChord('いーまいなー')!.confidence;
    const noisy = parseChord('いーまいなーだとおもう')!.confidence;
    expect(noisy).toBeLessThan(clean);
  });
});

describe('parseChordCandidates', () => {
  it('同じコードを指す候補はまとめる', () => {
    const candidates = parseChordCandidates(['いーまいなー', 'イーマイナー', 'Em']);
    expect(candidates).toHaveLength(1);
    expect(chordName(candidates[0].selection)).toBe('Em');
  });

  it('異なるコードは確信度の高い順に並ぶ', () => {
    const candidates = parseChordCandidates(['いーまいなー', 'しー']);
    expect(candidates.map((c) => chordName(c.selection))).toEqual(['Em', 'C']);
  });

  it('解釈できない候補は捨てる', () => {
    expect(parseChordCandidates(['まいなー', 'ほげ'])).toEqual([]);
  });

  it('候補が 1 つで確信度が高ければそのまま適用してよい', () => {
    expect(isConfident(parseChordCandidates(['いーまいなー']))).toBe(true);
  });

  it('候補が割れたら確認を挟む', () => {
    expect(isConfident(parseChordCandidates(['いーまいなー', 'しー']))).toBe(false);
  });
});
