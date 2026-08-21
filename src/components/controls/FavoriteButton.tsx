interface Props {
  active: boolean;
  chordLabel: string;
  onToggle: () => void;
}

export function FavoriteButton({ active, chordLabel, onToggle }: Props) {
  return (
    <button
      type="button"
      className="favorite-button"
      aria-pressed={active}
      aria-label={active ? `${chordLabel} をお気に入りから外す` : `${chordLabel} をお気に入りに追加`}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="favorite-button__icon">
        <path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.2 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z" />
      </svg>
    </button>
  );
}
