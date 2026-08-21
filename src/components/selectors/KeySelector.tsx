import { ACCIDENTAL_KEYS, NATURAL_KEYS, type Accidental } from '../../domain/chord/catalog';
import { rootLabel } from '../../domain/chord/naming';
import type { Root } from '../../domain/chord/types';

interface Props {
  root: Root;
  accidental: Accidental;
  onSelect: (root: Root) => void;
  onAccidentalChange: (accidental: Accidental) => void;
}

export function KeySelector({ root, accidental, onSelect, onAccidentalChange }: Props) {
  return (
    <section className="step">
      <div className="step__head">
        <h2 className="step__title">
          <span className="step__index">1</span> キー
        </h2>
        <div className="toggle" role="group" aria-label="派生音の表記">
          {(['sharp', 'flat'] as const).map((a) => (
            <button
              key={a}
              type="button"
              className="toggle__button"
              aria-pressed={accidental === a}
              onClick={() => onAccidentalChange(a)}
            >
              {a === 'sharp' ? '♯' : '♭'}
            </button>
          ))}
        </div>
      </div>

      <div className="chips chips--keys">
        {NATURAL_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="chip chip--key"
            aria-pressed={root === key}
            onClick={() => onSelect(key)}
          >
            {rootLabel(key, accidental)}
          </button>
        ))}
      </div>

      <div className="chips chips--accidentals">
        {ACCIDENTAL_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="chip chip--accidental"
            aria-pressed={root === key}
            onClick={() => onSelect(key)}
          >
            {rootLabel(key, accidental)}
          </button>
        ))}
      </div>
    </section>
  );
}
