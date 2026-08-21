import { tensionsFor } from '../../domain/chord/catalog';
import type { Quality, Tension } from '../../domain/chord/types';

interface Props {
  quality: Quality;
  tension: Tension;
  onSelect: (tension: Tension) => void;
}

export function TensionSelector({ quality, tension, onSelect }: Props) {
  return (
    <section className="step">
      <div className="step__head">
        <h2 className="step__title">
          <span className="step__index">3</span> テンション
        </h2>
      </div>
      <div className="chips chips--tension">
        {tensionsFor(quality).map((t) => (
          <button
            key={t.id}
            type="button"
            className="chip chip--tension"
            aria-pressed={tension === t.id}
            onClick={() => onSelect(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </section>
  );
}
