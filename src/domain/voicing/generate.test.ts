import { describe, expect, it } from 'vitest';
import { tensionsFor } from '../chord/catalog';
import { INTERVALS, pitchClassesOf } from '../chord/notes';
import { ROOTS, chordTypeOf, pitchClassOf } from '../chord/types';
import type { ChordType, Quality, Root } from '../chord/types';
import { generateVoicings, voicingsForSelection } from './generate';
import {
  DIAGRAM_FRET_SPAN,
  fretsToText,
  voicingDifficulty,
  voicingMidiNotes,
  type Voicing,
} from './types';

const QUALITIES: Quality[] = ['major', 'minor'];

/** 全 root × quality × tension の組み合わせ */
function allSelections() {
  return ROOTS.flatMap((root) =>
    QUALITIES.flatMap((quality) =>
      tensionsFor(quality).map((t) => ({ root, quality, tension: t.id })),
    ),
  );
}

function soundedPitchClasses(v: Voicing): number[] {
  return voicingMidiNotes(v).map((n) => n.midi % 12);
}

describe('generateVoicings', () => {
  it('すべての組み合わせでフォームが 1 つ以上生成される', () => {
    for (const sel of allSelections()) {
      expect(voicingsForSelection(sel).length, JSON.stringify(sel)).toBeGreaterThan(0);
    }
  });

  it('コード構成音以外の音を鳴らさない', () => {
    for (const sel of allSelections()) {
      const type = chordTypeOf(sel);
      const tones = new Set(pitchClassesOf(sel.root, type));
      for (const v of voicingsForSelection(sel)) {
        for (const pc of soundedPitchClasses(v)) {
          expect(tones.has(pc), `${sel.root} ${type} / ${fretsToText(v.frets)} / pc=${pc}`).toBe(true);
        }
      }
    }
  });

  it('ルート音と、コードの性格を決める音（3度・4度と最上位テンション）を必ず含む', () => {
    for (const sel of allSelections()) {
      const type = chordTypeOf(sel);
      const base = pitchClassOf(sel.root);
      const intervals = INTERVALS[type];
      const essential = [
        intervals[0], // ルート
        intervals[1], // 3度（sus4 は 4度）
        intervals[intervals.length - 1], // 7th / 6th など性格音
      ].map((i) => (base + i) % 12);

      for (const v of voicingsForSelection(sel)) {
        const sounded = new Set(soundedPitchClasses(v));
        for (const pc of essential) {
          expect(sounded.has(pc), `${sel.root} ${type} / ${fretsToText(v.frets)} / pc=${pc}`).toBe(true);
        }
      }
    }
  });

  it('押弦がダイアグラムの表示幅に収まる', () => {
    for (const sel of allSelections()) {
      for (const v of voicingsForSelection(sel)) {
        const pressed = v.frets.filter((f): f is number => f !== null && f > 0);
        if (pressed.length === 0) continue;
        expect(Math.max(...pressed) - v.baseFret).toBeLessThan(DIAGRAM_FRET_SPAN);
        expect(Math.min(...pressed)).toBeGreaterThanOrEqual(v.baseFret);
        expect(Math.max(...pressed)).toBeLessThanOrEqual(15);
      }
    }
  });

  it('運指はフレットを押さえている弦にだけ割り当てられる', () => {
    for (const sel of allSelections()) {
      for (const v of voicingsForSelection(sel)) {
        v.frets.forEach((fret, i) => {
          const finger = v.fingers[i];
          const where = `${sel.root} ${chordTypeOf(sel)} / ${fretsToText(v.frets)} / string ${6 - i}`;
          if (fret === null || fret === 0) {
            expect(finger, where).toBeNull();
          } else {
            expect(finger, where).toBeGreaterThanOrEqual(1);
            expect(finger, where).toBeLessThanOrEqual(4);
          }
        });
      }
    }
  });

  it('同じ押弦のフォームが重複しない', () => {
    for (const sel of allSelections()) {
      const keys = voicingsForSelection(sel).map((v) => fretsToText(v.frets));
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('バレーは実在するフレットを指している', () => {
    for (const sel of allSelections()) {
      for (const v of voicingsForSelection(sel)) {
        for (const barre of v.barres) {
          expect(barre.fret).toBeGreaterThan(0);
          expect(barre.fromIndex).toBeLessThan(barre.toIndex);
          for (let i = barre.fromIndex; i <= barre.toIndex; i += 1) {
            const fret = v.frets[i];
            if (fret === null) continue;
            expect(fret, `${fretsToText(v.frets)} @${barre.fret}fr`).toBeGreaterThanOrEqual(barre.fret);
          }
        }
      }
    }
  });
});

describe('フォームの並び順', () => {
  it('押さえやすい順に並んでいる', () => {
    for (const sel of allSelections()) {
      const difficulties = voicingsForSelection(sel).map(voicingDifficulty);
      const sorted = [...difficulties].sort((a, b) => a - b);
      expect(difficulties, JSON.stringify(sel)).toEqual(sorted);
    }
  });

  it('開放弦を使うフォームがあれば先頭に来る', () => {
    for (const sel of allSelections()) {
      const voicings = voicingsForSelection(sel);
      const openIndex = voicings.findIndex((v) => v.frets.some((f) => f === 0));
      if (openIndex === -1) continue;
      expect(openIndex, `${JSON.stringify(sel)} / ${voicings[0].label}`).toBe(0);
    }
  });

  it('ローポジションのバレーがハイポジションより先に来る', () => {
    expect(generateVoicings('E', 'm7').map((v) => v.label)).toEqual([
      '開放',
      '5弦ルート 7fr',
      '6弦ルート 12fr',
    ]);
    expect(generateVoicings('C', 'major').map((v) => v.label)).toEqual([
      '開放',
      '5弦ルート 3fr',
      '6弦ルート 8fr',
    ]);
  });
});

describe('定番フォームが期待どおり生成される', () => {
  const cases: [Root, ChordType, string][] = [
    ['C', 'major', 'x32010'],
    ['A', 'major', 'x02220'],
    ['G', 'major', '320003'],
    ['E', 'minor', '022000'],
    ['A', 'minor', 'x02210'],
    ['D', 'minor', 'xx0231'],
    ['E', '7', '020100'],
    ['A', 'm7', 'x02010'],
    ['C', 'M7', 'x32000'],
    ['B', 'm7b5', 'x2323x'],
  ];

  it.each(cases)('%s %s の先頭は %s', (root, type, expected) => {
    expect(fretsToText(generateVoicings(root, type)[0].frets)).toBe(expected);
  });

  it('F メジャーは 1fr のバレーになる', () => {
    const [first] = generateVoicings('F', 'major');
    expect(fretsToText(first.frets)).toBe('133211');
    expect(first.barres).toContainEqual({ fret: 1, fromIndex: 0, toIndex: 5 });
  });

  it('B♭ メジャーには 5弦ルート 1fr のフォームがある', () => {
    const forms = generateVoicings('A#', 'major').map((v) => fretsToText(v.frets));
    expect(forms).toContain('x13331');
  });
});
