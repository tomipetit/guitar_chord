import { CAPO_POSITIONS } from '../../domain/capo';

interface Props {
  capo: number;
  onSelect: (capo: number) => void;
}

export function CapoSelector({ capo, onSelect }: Props) {
  return (
    <section className="step">
      <div className="step__head">
        <h2 className="step__title">カポ</h2>
        {capo > 0 && <span className="step__note">押さえる形が変わります</span>}
      </div>
      <div className="chips chips--capo">
        {CAPO_POSITIONS.map((position) => (
          <button
            key={position}
            type="button"
            className="chip chip--capo"
            // 数字だけだとテンションのボタンと読み上げ上区別が付かない
            aria-label={position === 0 ? 'カポなし' : `カポ ${position}フレット`}
            aria-pressed={capo === position}
            onClick={() => onSelect(position)}
          >
            {position === 0 ? '—' : position}
          </button>
        ))}
      </div>
    </section>
  );
}
