interface Props {
  open: boolean;
  onToggle: () => void;
}

/** コード指定エリアの開閉。スマホでのみ表示し、横に余裕がある画面では隠す */
export function SelectorToggle({ open, onToggle }: Props) {
  return (
    <button
      type="button"
      className="tool-button selector-toggle"
      aria-expanded={open}
      aria-controls="chord-steps"
      aria-label={open ? 'コード選択を閉じる' : 'コードを選ぶ'}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="tool-button__icon">
        <circle cx="5" cy="7" r="1.4" />
        <circle cx="5" cy="12" r="1.4" />
        <circle cx="5" cy="17" r="1.4" />
        <path d="M10 7h9M10 12h9M10 17h9" />
      </svg>
    </button>
  );
}
