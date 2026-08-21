interface Props {
  listening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function MicButton({ listening, onStart, onStop }: Props) {
  return (
    <button
      type="button"
      className="tool-button"
      aria-pressed={listening}
      aria-label={listening ? '音声入力を止める' : '音声でコードを指定する'}
      onClick={listening ? onStop : onStart}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="tool-button__icon">
        <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v3" />
      </svg>
    </button>
  );
}
