import type { Accidental } from '../../domain/chord/catalog';
import { chordName } from '../../domain/chord/naming';
import type { ChordSelection } from '../../domain/chord/types';
import { favoriteKey } from '../../platform/storage/favorites';

interface Props {
  favorites: ChordSelection[];
  current: ChordSelection;
  accidental: Accidental;
  onSelect: (selection: ChordSelection) => void;
}

export function FavoriteBar({ favorites, current, accidental, onSelect }: Props) {
  const currentKey = favoriteKey(current);

  return (
    <div className="favorites" role="group" aria-label="お気に入り">
      {favorites.map((favorite) => (
        <button
          key={favoriteKey(favorite)}
          type="button"
          className="favorites__item"
          aria-pressed={favoriteKey(favorite) === currentKey}
          onClick={() => onSelect(favorite)}
        >
          {chordName(favorite, accidental)}
        </button>
      ))}
    </div>
  );
}
