import type { ReactNode } from 'react';

interface Props {
  /** 開いているか（スマホのみ有効。横に余裕がある画面では常に開いた状態で表示する） */
  open: boolean;
  onToggle: () => void;
  /** 閉じているときに現在の選択を示すラベル */
  currentLabel: string;
  children: ReactNode;
}

/**
 * コード指定エリア。
 * スマホではコード表示の面積を稼ぐために折りたためるようにし、
 * 720px 以上では折りたたみ操作ごと隠して常時展開する。
 */
export function SelectorPanel({ open, onToggle, currentLabel, children }: Props) {
  return (
    <div className="selector">
      <button
        type="button"
        className="selector__toggle"
        aria-expanded={open}
        aria-controls="chord-steps"
        onClick={onToggle}
      >
        <span className="selector__toggle-label">コードを選ぶ</span>
        <span className="selector__toggle-current">{currentLabel}</span>
        <span className="selector__chevron" aria-hidden="true" />
      </button>

      <div id="chord-steps" className={`selector__steps${open ? '' : ' selector__steps--collapsed'}`}>
        {children}
      </div>
    </div>
  );
}
