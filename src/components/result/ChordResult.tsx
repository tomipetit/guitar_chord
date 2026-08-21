import { useEffect } from 'react';
import type { Accidental } from '../../domain/chord/catalog';
import { chordName, rootLabel } from '../../domain/chord/naming';
import { DEGREE_LABELS, chordTones } from '../../domain/chord/notes';
import { chordTypeOf, type ChordSelection } from '../../domain/chord/types';
import {
  OPEN_STRING_MIDI,
  fretsToText,
  voicingMidiNotes,
  type Voicing,
} from '../../domain/voicing/types';
import { useChordPlayer } from '../../platform/audio/useChordPlayer';
import { useSwipe } from '../../platform/gesture/useSwipe';
import { FavoriteButton } from '../controls/FavoriteButton';
import { PlaybackControls } from '../controls/PlaybackControls';
import { ChordDiagram } from '../diagram/ChordDiagram';

interface Props {
  selection: ChordSelection;
  /** カポを付けているとき、実際に押さえるコード */
  shapeSelection: ChordSelection;
  capo: number;
  accidental: Accidental;
  voicings: Voicing[];
  voicingIndex: number;
  onSelectVoicing: (index: number) => void;
  favorite: boolean;
  onToggleFavorite: () => void;
  /** 半音単位でキーを移す。スワイプと左右ボタンの両方から呼ぶ */
  onTranspose: (semitones: number) => void;
  onToggleQuality: () => void;
}

export function ChordResult({
  selection,
  shapeSelection,
  capo,
  accidental,
  voicings,
  voicingIndex,
  onSelectVoicing,
  favorite,
  onToggleFavorite,
  onTranspose,
  onToggleQuality,
}: Props) {
  const type = chordTypeOf(selection);
  const name = chordName(selection, accidental);
  const voicing = voicings[voicingIndex] ?? voicings[0];
  const degrees = DEGREE_LABELS[type];
  const tones = chordTones(selection.root, type);

  const { supported, playing, playChord, pluckString, stop } = useChordPlayer();
  // 左スワイプで次のキー（高い方）、右スワイプで前のキー
  const swipe = useSwipe({
    onSwipeLeft: () => onTranspose(1),
    onSwipeRight: () => onTranspose(-1),
  });

  // 表示するフォームが変わったら鳴っている音は止める
  useEffect(() => stop, [voicing, stop]);

  const handlePluckString = (stringIndex: number) => {
    // スワイプの終わりに発生する click で弦が鳴らないようにする
    if (swipe.swiped.current) return;
    const fret = voicing.frets[stringIndex];
    if (fret === null) return;
    void pluckString(OPEN_STRING_MIDI[stringIndex] + capo + fret);
  };

  return (
    <section className="result">
      {/* コード名は常に単独行。左右にボタンを置くと中央からずれる */}
      <h2 className="result__name">{name}</h2>

      <div className="result__actions">
        <button
          type="button"
          className="minor-toggle"
          aria-pressed={selection.quality === 'minor'}
          aria-label={selection.quality === 'minor' ? 'メジャーに切り替え' : 'マイナーに切り替え'}
          onClick={onToggleQuality}
        >
          minor
        </button>
        <FavoriteButton active={favorite} chordLabel={name} onToggle={onToggleFavorite} />
      </div>

      {capo > 0 && (
        <p className="result__capo">
          <span className="result__capo-badge">カポ {capo}fr</span>
          押さえる形は <strong>{chordName(shapeSelection, accidental)}</strong>
        </p>
      )}

      <div className="stage">
        <button
          type="button"
          className="stage__step"
          aria-label="半音下げる"
          onClick={() => onTranspose(-1)}
        >
          ‹
        </button>

        {/* 横スワイプでも前後のキーに移れる */}
        <div className="stage__swipe" {...swipe.handlers}>
          <ChordDiagram
            voicing={voicing}
            chordLabel={name}
            onPluckString={supported ? handlePluckString : undefined}
            capo={capo}
          />
        </div>

        <button
          type="button"
          className="stage__step"
          aria-label="半音上げる"
          onClick={() => onTranspose(1)}
        >
          ›
        </button>
      </div>

      <p className="result__frets">{fretsToText(voicing.frets)}</p>

      {voicings.length > 1 && (
        <div className="forms" role="tablist" aria-label="押さえ方の切り替え">
          {voicings.map((v, i) => (
            <button
              key={v.label}
              type="button"
              role="tab"
              className="forms__tab"
              aria-selected={i === voicingIndex}
              onClick={() => onSelectVoicing(i)}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {supported && (
        <PlaybackControls
          playing={playing}
          onPlay={(mode) => void playChord(voicingMidiNotes(voicing, capo).map((n) => n.midi), mode)}
          onStop={stop}
        />
      )}

      <dl className="tones">
        {tones.map((tone, i) => (
          <div key={tone} className="tones__item">
            <dt className="tones__degree">{degrees[i]}</dt>
            <dd className="tones__note">{rootLabel(tone, accidental)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
