/**
 * 音声認識の結果は「いーまいなー」「Eマイナー」「イー マイナー」など表記が大きく揺れる。
 * 辞書マッチにかける前に、比較できる形へ寄せる。
 *
 * - NFKC で全角英数・半角カナを正規化
 * - 空白と句読点・記号を除去（♯ ♭ # は意味を持つので残す）
 * - 各種ダッシュを長音符「ー」に統一
 * - カタカナをひらがなに統一
 *
 * 大文字小文字は保持する。`M7`（メジャーセブンス）と `m7`（マイナーセブンス）の
 * 区別が失われるため、ここで小文字化してはいけない。
 */
export function normalizeSpeech(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\s　]/g, '')
    .replace(/[、。,.!?！？・「」『』()（）[\]{}]/g, '')
    .replace(/[ーｰ‐-―−-]/g, 'ー')
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}
