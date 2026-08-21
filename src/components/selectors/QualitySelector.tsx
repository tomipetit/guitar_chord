import { QUALITIES } from '../../domain/chord/catalog';
import type { Quality } from '../../domain/chord/types';

interface Props {
  quality: Quality;
  onSelect: (quality: Quality) => void;
}

export function QualitySelector({ quality, onSelect }: Props) {
  return (
    <section className="step">
      <div className="step__head">
        <h2 className="step__title">
          <span className="step__index">2</span> メジャー / マイナー
        </h2>
      </div>
      <div className="chips chips--quality">
        {QUALITIES.map((q) => (
          <button
            key={q.id}
            type="button"
            className="chip chip--quality"
            aria-pressed={quality === q.id}
            onClick={() => onSelect(q.id)}
          >
            {q.label}
          </button>
        ))}
      </div>
    </section>
  );
}
