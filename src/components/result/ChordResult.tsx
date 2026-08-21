import type { Accidental } from '../../domain/chord/catalog';
import { chordName, rootLabel } from '../../domain/chord/naming';
import { DEGREE_LABELS, chordTones } from '../../domain/chord/notes';
import { chordTypeOf, type ChordSelection } from '../../domain/chord/types';
import { fretsToText, type Voicing } from '../../domain/voicing/types';
import { ChordDiagram } from '../diagram/ChordDiagram';

interface Props {
  selection: ChordSelection;
  accidental: Accidental;
  voicings: Voicing[];
  voicingIndex: number;
  onSelectVoicing: (index: number) => void;
}

export function ChordResult({
  selection,
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

  return (
    <section className="result">
      <h2 className="result__name">{name}</h2>

      <ChordDiagram voicing={voicing} chordLabel={name} />

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
