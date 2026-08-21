import { DIAGRAM_FRET_SPAN, type Voicing } from '../../domain/voicing/types';

const STRING_GAP = 26;
const FRET_GAP = 34;
const PADDING_LEFT = 34;
const PADDING_RIGHT = 22;
const PADDING_TOP = 34;
const PADDING_BOTTOM = 18;

const GRID_WIDTH = STRING_GAP * 5;
const GRID_HEIGHT = FRET_GAP * DIAGRAM_FRET_SPAN;
const WIDTH = PADDING_LEFT + GRID_WIDTH + PADDING_RIGHT;
const HEIGHT = PADDING_TOP + GRID_HEIGHT + PADDING_BOTTOM;

/** 実際のギターに合わせ、低音弦ほど太く描く（6弦→1弦） */
const STRING_WIDTHS = [1.9, 1.65, 1.4, 1.2, 1, 0.85];

/** 弦 index（0 = 6弦）の x 座標 */
const stringX = (index: number) => PADDING_LEFT + index * STRING_GAP;
/** フレット番号（baseFret 起点）の中心 y 座標 */
const fretCenterY = (offset: number) => PADDING_TOP + (offset + 0.5) * FRET_GAP;

interface Props {
  voicing: Voicing;
  chordLabel: string;
  /** 弦をタップしたとき（0 = 6弦）。ミュート弦では呼ばれない */
  onPluckString?: (stringIndex: number) => void;
  /** カポの位置。0 より大きければナットをカポとして描く */
  capo?: number;
}

export function ChordDiagram({ voicing, chordLabel, onPluckString, capo = 0 }: Props) {
  const { frets, fingers, barres, baseFret } = voicing;
  const isOpenPosition = baseFret === 1;

  return (
    <svg
      className="diagram"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`${chordLabel} のコードダイアグラム`}
    >
      {/* ナット / 開始フレット表記 */}
      {isOpenPosition ? (
        <rect
          x={stringX(0) - 1}
          y={PADDING_TOP - 5}
          width={GRID_WIDTH + 2}
          height={6}
          rx={2}
          className={capo > 0 ? 'diagram__nut diagram__nut--capo' : 'diagram__nut'}
        />
      ) : (
        <text x={stringX(0) - 13} y={fretCenterY(0)} className="diagram__base-fret">
          {baseFret}fr
        </text>
      )}

      {/* フレット線 */}
      {Array.from({ length: DIAGRAM_FRET_SPAN + 1 }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={stringX(0)}
          y1={PADDING_TOP + i * FRET_GAP}
          x2={stringX(5)}
          y2={PADDING_TOP + i * FRET_GAP}
          className="diagram__fret"
        />
      ))}

      {/* 弦 */}
      {STRING_WIDTHS.map((width, i) => (
        <line
          key={`string-${i}`}
          x1={stringX(i)}
          y1={PADDING_TOP}
          x2={stringX(i)}
          y2={PADDING_TOP + GRID_HEIGHT}
          strokeWidth={width}
          className="diagram__string"
        />
      ))}

      {/* バレー */}
      {barres.map((barre) => {
        const y = fretCenterY(barre.fret - baseFret);
        return (
          <rect
            key={`barre-${barre.fret}-${barre.fromIndex}`}
            x={stringX(barre.fromIndex) - 9}
            y={y - 9}
            width={stringX(barre.toIndex) - stringX(barre.fromIndex) + 18}
            height={18}
            rx={9}
            className="diagram__barre"
          />
        );
      })}

      {/* 開放弦(○) / ミュート(×) */}
      {frets.map((fret, i) => {
        const y = PADDING_TOP - 16;
        if (fret === null) {
          return (
            <g key={`mute-${i}`} className="diagram__mute">
              <line x1={stringX(i) - 5} y1={y - 5} x2={stringX(i) + 5} y2={y + 5} />
              <line x1={stringX(i) - 5} y1={y + 5} x2={stringX(i) + 5} y2={y - 5} />
            </g>
          );
        }
        if (fret === 0) {
          return <circle key={`open-${i}`} cx={stringX(i)} cy={y} r={5} className="diagram__open" />;
        }
        return null;
      })}

      {/* 押弦ポジション */}
      {frets.map((fret, i) => {
        if (fret === null || fret === 0) return null;
        const cy = fretCenterY(fret - baseFret);
        const finger = fingers[i];
        return (
          <g key={`dot-${i}`}>
            <circle cx={stringX(i)} cy={cy} r={9} className="diagram__dot" />
            {finger !== null && (
              <text x={stringX(i)} y={cy} className="diagram__finger">
                {finger}
              </text>
            )}
          </g>
        );
      })}

      {/* 弦ごとのタップ領域。再生ボタンで全体は鳴らせるので、補助的な操作として扱う */}
      {onPluckString &&
        frets.map((fret, i) =>
          fret === null ? null : (
            <rect
              key={`hit-${i}`}
              className="diagram__hit"
              x={stringX(i) - STRING_GAP / 2}
              y={PADDING_TOP - 24}
              width={STRING_GAP}
              height={GRID_HEIGHT + 24}
              rx={6}
              aria-hidden="true"
              onClick={() => onPluckString(i)}
            />
          ),
        )}
    </svg>
  );
}
