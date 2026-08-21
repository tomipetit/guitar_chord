import { ROOTS, type ChordSelection } from '../../domain/chord/types';

const STORAGE_KEY = 'guitar-chord:favorites';

/** 保存する上限。多すぎると一覧が使いものにならなくなる */
export const MAX_FAVORITES = 24;

const QUALITIES: readonly string[] = ['major', 'minor'];
const TENSIONS: readonly string[] = ['none', '7', 'M7', '6', 'sus4', 'm7b5'];

/**
 * 保存内容は利用者が書き換えられるうえ、アプリ側の型が変わることもある。
 * 読み込み時に必ず検証し、知らない値は捨てる。
 */
function isChordSelection(value: unknown): value is ChordSelection {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.root === 'string' &&
    (ROOTS as readonly string[]).includes(candidate.root) &&
    typeof candidate.quality === 'string' &&
    QUALITIES.includes(candidate.quality) &&
    typeof candidate.tension === 'string' &&
    TENSIONS.includes(candidate.tension)
  );
}

export function favoriteKey(selection: ChordSelection): string {
  return `${selection.root}:${selection.quality}:${selection.tension}`;
}

/** 読めない・壊れている場合は「お気に入り無し」として扱い、アプリは動かし続ける */
export function loadFavorites(): ChordSelection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const valid = parsed.filter(isChordSelection);
    // 同じコードが重複して入っていた場合は先勝ちで 1 つに畳む
    const seen = new Set<string>();
    return valid
      .filter((selection) => {
        const key = favoriteKey(selection);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_FAVORITES);
  } catch {
    return [];
  }
}

/** 保存できなくても（プライベートモード・容量超過など）表示は続けられる */
export function saveFavorites(favorites: ChordSelection[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.slice(0, MAX_FAVORITES)));
  } catch {
    // 保存できないだけで、この画面のお気に入りはそのまま使える
  }
}
