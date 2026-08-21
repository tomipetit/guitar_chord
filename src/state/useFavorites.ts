import { useCallback, useState } from 'react';
import type { ChordSelection } from '../domain/chord/types';
import {
  MAX_FAVORITES,
  favoriteKey,
  loadFavorites,
  saveFavorites,
} from '../platform/storage/favorites';

/**
 * お気に入りは「どのコードを表示しているか」とは別軸なので、
 * コード選択の reducer には持たせず、保存領域と同期する専用の状態にする。
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<ChordSelection[]>(loadFavorites);

  const toggleFavorite = useCallback((selection: ChordSelection) => {
    setFavorites((current) => {
      const key = favoriteKey(selection);
      const registered = current.some((f) => favoriteKey(f) === key);
      const next = registered
        ? current.filter((f) => favoriteKey(f) !== key)
        : [selection, ...current].slice(0, MAX_FAVORITES);
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (selection: ChordSelection) => favorites.some((f) => favoriteKey(f) === favoriteKey(selection)),
    [favorites],
  );

  return { favorites, toggleFavorite, isFavorite };
}
