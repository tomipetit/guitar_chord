import type { Accidental } from '../../domain/chord/catalog';
import { chordName } from '../../domain/chord/naming';
import type { ParsedChord } from '../../domain/speech/parse';

interface Props {
  listening: boolean;
  transcript: string;
  error: string | null;
  /** null = まだ結果が出ていない */
  candidates: ParsedChord[] | null;
  accidental: Accidental;
  onPick: (candidate: ParsedChord) => void;
  onRetry: () => void;
  onClose: () => void;
}

export function VoiceSheet({
  listening,
  transcript,
  error,
  candidates,
  accidental,
  onPick,
  onRetry,
  onClose,
}: Props) {
  const heardNothing = candidates !== null && candidates.length === 0;

  return (
    <div className="voice" role="dialog" aria-modal="true" aria-label="音声入力">
      <button type="button" className="voice__backdrop" aria-label="閉じる" onClick={onClose} />

      <div className="voice__sheet">
        <p className="voice__status" aria-live="polite">
          {listening ? (
            <>
              <span className="voice__pulse" aria-hidden="true" />
              聞き取り中…
            </>
          ) : error ? (
            error
          ) : heardNothing ? (
            'コードとして聞き取れませんでした'
          ) : (
            'コードを選んでください'
          )}
        </p>

        {/* 誤認識をユーザーが把握できるよう、聞き取った文字列は必ず出す */}
        {transcript && <p className="voice__transcript">「{transcript}」</p>}

        {candidates !== null && candidates.length > 0 && (
          <ul className="voice__candidates">
            {candidates.map((candidate) => (
              <li key={`${candidate.selection.root}${candidate.selection.quality}${candidate.selection.tension}`}>
                <button type="button" className="voice__candidate" onClick={() => onPick(candidate)}>
                  {chordName(candidate.selection, accidental)}
                </button>
              </li>
            ))}
          </ul>
        )}

        {(heardNothing || error) && (
          <p className="voice__hint">「いーまいなー」「しーせぶんす」のように言ってください</p>
        )}

        <div className="voice__actions">
          <button type="button" className="voice__action" onClick={onClose}>
            閉じる
          </button>
          {!listening && (
            <button type="button" className="voice__action voice__action--primary" onClick={onRetry}>
              もう一度
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
