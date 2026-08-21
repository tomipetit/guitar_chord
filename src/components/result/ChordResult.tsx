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
}

export function ChordResult({
  selection,
  shapeSelection,
  capo,
  accidental,
  voicings,
  voicingIndex,
  onSelectVoicing,
}: Props) {
  const type = chordTypeOf(selection);
  const name = chordName(selection, accidental);
  const voicing = voicings[voicingIndex] ?? voicings[0];
  const degrees = DEGREE_LABELS[type];
  const tones = chordTones(selection.root, type);

  const { supported, playing, playChord, pluckString, stop } = useChordPlayer();

  // 表示するフォームが変わったら鳴っている音は止める
  useEffect(() => stop, [voicing, stop]);

  const handlePluckString = (stringIndex: number) => {
    const fret = voicing.frets[stringIndex];
    if (fret === null) return;
    void pluckString(OPEN_STRING_MIDI[stringIndex] + capo + fret);
  };

  return (
    <section className="result">
      <h2 className="result__name">{name}</h2>

      {capo > 0 && (
        <p className="result__capo">
          <span className="result__capo-badge">カポ {capo}fr</span>
          押さえる形は <strong>{chordName(shapeSelection, accidental)}</strong>
        </p>
      )}

      <ChordDiagram
        voicing={voicing}
        chordLabel={name}
        onPluckString={supported ? handlePluckString : undefined}
        capo={capo}
      />

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
