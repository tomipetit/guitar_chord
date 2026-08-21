import type { Accidental } from '../domain/chord/catalog';
import { coerceTension } from '../domain/chord/catalog';
import type { ChordSelection, Quality, Root, Tension } from '../domain/chord/types';

export interface ChordState extends ChordSelection {
  /** 派生音の表示表記（♯ or ♭）。鳴る音は変わらない */
  accidental: Accidental;
  /** 表示中のフォーム（generateVoicings の添字） */
  voicingIndex: number;
  /** カポの位置（0 = 付けていない）。選ぶコードは実音のままで、押さえる形が変わる */
  capo: number;
}

export type ChordAction =
  | { type: 'SELECT_ROOT'; root: Root }
  | { type: 'SELECT_QUALITY'; quality: Quality }
  | { type: 'SELECT_TENSION'; tension: Tension }
  | { type: 'SELECT_VOICING'; index: number }
  | { type: 'SET_ACCIDENTAL'; accidental: Accidental }
  | { type: 'SET_CAPO'; capo: number }
  | { type: 'APPLY_SELECTION'; selection: ChordSelection };

export const initialChordState: ChordState = {
  root: 'C',
  quality: 'major',
  tension: 'none',
  accidental: 'sharp',
  voicingIndex: 0,
  capo: 0,
};

export function chordReducer(state: ChordState, action: ChordAction): ChordState {
  switch (action.type) {
    case 'SELECT_ROOT':
      return { ...state, root: action.root, voicingIndex: 0 };

    case 'SELECT_QUALITY':
      return {
        ...state,
        quality: action.quality,
        // 切り替え先に存在しないテンションは 'none' へフォールバック
        tension: coerceTension(action.quality, state.tension),
        voicingIndex: 0,
      };

    case 'SELECT_TENSION':
      return { ...state, tension: action.tension, voicingIndex: 0 };

    case 'SELECT_VOICING':
      return { ...state, voicingIndex: action.index };

    case 'SET_ACCIDENTAL':
      return { ...state, accidental: action.accidental };

    case 'SET_CAPO':
      // 押さえる形が変わるので、選択中のフォームは先頭に戻す
      return { ...state, capo: action.capo, voicingIndex: 0 };

    case 'APPLY_SELECTION':
      return { ...state, ...action.selection, voicingIndex: 0 };

    default:
      return state;
  }
}
