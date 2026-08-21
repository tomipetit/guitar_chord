import { coerceTension } from '../chord/catalog';
import { ROOTS, pitchClassOf, type ChordSelection, type Quality, type Root, type Tension } from '../chord/types';
import { matchTokenAt } from './dictionary';
import { normalizeSpeech } from './normalize';

export interface ParsedChord {
  selection: ChordSelection;
  /** 0〜1。1 に近いほど、聞き取り結果をそのままコードとして解釈できたことを示す */
  confidence: number;
  /** 画面に出す「聞き取り」テキスト */
  transcript: string;
}

/** メジャー限定のテンション。マイナーと同時に言われたら片方を優先する */
const MAJOR_ONLY_TENSIONS: Tension[] = ['6', 'sus4', 'M7'];

/**
 * 認識テキスト 1 件をコード指定として解釈する。
 * ルートが取れなければ null（＝コードとして解釈できなかった）。
 */
export function parseChord(transcript: string): ParsedChord | null {
  const normalized = normalizeSpeech(transcript);

  let root: Root | null = null;
  let semitone = 0;
  let accidentalSet = false;
  let quality: Quality | null = null;
  let tension: Tension | null = null;
  let matchedLength = 0;
  let unmatchedLength = 0;

  let i = 0;
  while (i < normalized.length) {
    const token = matchTokenAt(normalized, i);
    if (!token) {
      unmatchedLength += 1;
      i += 1;
      continue;
    }

    switch (token.kind) {
      case 'root':
        // 最初に出てきたルートだけを採用する
        if (root === null) root = token.root;
        break;
      case 'sharp':
        if (root !== null && !accidentalSet) {
          semitone = 1;
          accidentalSet = true;
        }
        break;
      case 'flat':
        if (root !== null && !accidentalSet) {
          semitone = -1;
          accidentalSet = true;
        }
        break;
      case 'b':
        // 文頭なら音名の B、ルートの直後なら ♭
        if (root === null) root = 'B';
        else if (!accidentalSet) {
          semitone = -1;
          accidentalSet = true;
        }
        break;
      case 'quality':
        if (quality === null) quality = token.quality;
        break;
      case 'tension':
        if (tension === null) {
          tension = token.tension;
          if (token.quality && quality === null) quality = token.quality;
        }
        break;
    }

    matchedLength += token.text.length;
    i += token.text.length;
  }

  if (root === null) return null;

  const resolvedRoot = ROOTS[(pitchClassOf(root) + semitone + 12) % 12];
  const resolvedQuality = resolveQuality(quality, tension);
  const selection: ChordSelection = {
    root: resolvedRoot,
    quality: resolvedQuality,
    tension: coerceTension(resolvedQuality, tension ?? 'none'),
  };

  return {
    selection,
    confidence: scoreConfidence(matchedLength, unmatchedLength, quality !== null),
    transcript,
  };
}

/**
 * メジャー / マイナーが言われていなければメジャーとみなす。
 * ただし m7♭5 のようにマイナー確定のテンションが来ていればそちらを優先する。
 */
function resolveQuality(quality: Quality | null, tension: Tension | null): Quality {
  if (tension === 'm7b5') return 'minor';
  if (quality !== null) return quality;
  if (tension !== null && MAJOR_ONLY_TENSIONS.includes(tension)) return 'major';
  return 'major';
}

function scoreConfidence(matched: number, unmatched: number, qualitySpoken: boolean): number {
  const total = matched + unmatched;
  let score = total === 0 ? 0 : matched / total;
  // メジャーと仮定した場合は少しだけ確信度を下げる
  if (!qualitySpoken) score *= 0.9;
  return Math.round(score * 100) / 100;
}

function selectionKey(selection: ChordSelection): string {
  return `${selection.root}:${selection.quality}:${selection.tension}`;
}

/**
 * 音声認識が返した複数の候補文をまとめて解釈し、
 * 同じコードを指すものを畳んで確信度の高い順に返す。
 */
export function parseChordCandidates(transcripts: string[]): ParsedChord[] {
  const best = new Map<string, ParsedChord>();

  for (const transcript of transcripts) {
    const parsed = parseChord(transcript);
    if (!parsed) continue;
    const key = selectionKey(parsed.selection);
    const current = best.get(key);
    if (!current || parsed.confidence > current.confidence) best.set(key, parsed);
  }

  return [...best.values()].sort((a, b) => b.confidence - a.confidence);
}

/** 迷わず適用してよいか（候補が 1 つで、聞き取りをほぼ解釈できている） */
export function isConfident(candidates: ParsedChord[]): boolean {
  return candidates.length === 1 && candidates[0].confidence >= 0.8;
}
