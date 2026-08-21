import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ChordSelection } from '../../domain/chord/types';
import { MAX_FAVORITES, favoriteKey, loadFavorites, saveFavorites } from './favorites';

/** テスト用の localStorage 代役 */
function useFakeStorage(overrides: Partial<Storage> = {}) {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
    ...overrides,
  } as Storage;
  vi.stubGlobal('localStorage', storage);
  return store;
}

const em: ChordSelection = { root: 'E', quality: 'minor', tension: 'none' };
const c7: ChordSelection = { root: 'C', quality: 'major', tension: '7' };

afterEach(() => vi.unstubAllGlobals());

describe('お気に入りの保存と読み込み', () => {
  it('保存したものを読み戻せる', () => {
    useFakeStorage();
    saveFavorites([em, c7]);
    expect(loadFavorites()).toEqual([em, c7]);
  });

  it('何も保存されていなければ空', () => {
    useFakeStorage();
    expect(loadFavorites()).toEqual([]);
  });

  it('上限を超えたぶんは切り捨てる', () => {
    useFakeStorage();
    const many = Array.from({ length: MAX_FAVORITES + 10 }, (_, i) => ({
      ...em,
      tension: i % 2 === 0 ? ('7' as const) : ('none' as const),
    }));
    saveFavorites(many);
    expect(loadFavorites().length).toBeLessThanOrEqual(MAX_FAVORITES);
  });
});

describe('壊れた保存内容の扱い', () => {
  it('JSON として壊れていれば空を返す', () => {
    const store = useFakeStorage();
    store.set('guitar-chord:favorites', '{壊れている');
    expect(loadFavorites()).toEqual([]);
  });

  it('配列でなければ空を返す', () => {
    const store = useFakeStorage();
    store.set('guitar-chord:favorites', '{"root":"C"}');
    expect(loadFavorites()).toEqual([]);
  });

  it('知らない値が混ざっていればその要素だけ捨てる', () => {
    const store = useFakeStorage();
    store.set(
      'guitar-chord:favorites',
      JSON.stringify([em, { root: 'H', quality: 'major', tension: 'none' }, { root: 'C' }, null, c7]),
    );
    expect(loadFavorites()).toEqual([em, c7]);
  });

  it('重複は 1 つに畳む', () => {
    const store = useFakeStorage();
    store.set('guitar-chord:favorites', JSON.stringify([em, em, c7]));
    expect(loadFavorites()).toEqual([em, c7]);
  });
});

describe('保存領域が使えない環境', () => {
  it('読み込みで例外が出ても落ちない', () => {
    useFakeStorage({
      getItem: () => {
        throw new Error('storage disabled');
      },
    });
    expect(loadFavorites()).toEqual([]);
  });

  it('保存で例外が出ても落ちない', () => {
    useFakeStorage({
      setItem: () => {
        throw new Error('quota exceeded');
      },
    });
    expect(() => saveFavorites([em])).not.toThrow();
  });
});

describe('favoriteKey', () => {
  it('同じコードは同じキー、違うコードは違うキー', () => {
    expect(favoriteKey(em)).toBe(favoriteKey({ ...em }));
    expect(favoriteKey(em)).not.toBe(favoriteKey(c7));
  });
});
