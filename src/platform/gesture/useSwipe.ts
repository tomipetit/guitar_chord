import { useRef, type DragEvent as ReactDragEvent, type PointerEvent as ReactPointerEvent } from 'react';

/** これ未満の移動はタップとして扱う */
const SWIPE_THRESHOLD_PX = 40;

interface Options {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * 横スワイプを拾う。
 *
 * 同じ領域には弦をタップして鳴らす操作もあるため、
 * スワイプと判定したときは直後の click を無視できるよう `swiped` を返す。
 * 縦方向の動きが勝っている場合はスクロール操作とみなして何もしない。
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }: Options) {
  const origin = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const onPointerDown = (event: ReactPointerEvent) => {
    origin.current = { x: event.clientX, y: event.clientY };
    swiped.current = false;
    // 指やポインタが領域の外に出ても pointerup を受け取れるようにする
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerUp = (event: ReactPointerEvent) => {
    const from = origin.current;
    origin.current = null;
    if (!from) return;

    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;

    swiped.current = true;
    if (dx < 0) onSwipeLeft();
    else onSwipeRight();
  };

  const onPointerCancel = () => {
    origin.current = null;
  };

  /**
   * ブラウザ標準のドラッグが始まると pointercancel が飛び、pointerup を取り逃がす。
   * 画像や SVG の上をドラッグすると実際に発生するので、明示的に止める。
   */
  const onDragStart = (event: ReactDragEvent) => {
    event.preventDefault();
  };

  return {
    /** スワイプ直後かどうか。true の間はタップ由来の操作を行わない */
    swiped,
    handlers: { onPointerDown, onPointerUp, onPointerCancel, onDragStart },
  };
}
