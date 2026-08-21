/**
 * Karplus-Strong 法による撥弦音の生成。
 * ノイズを 1 周期ぶん詰めた遅延線をローパス付きで循環させると、
 * 音源ファイルなしで任意のピッチの弦の音が得られる。
 */

/** 減衰の強さ。1 に近いほど長く鳴る */
const DECAY = 0.9965;
/** 発音の最後をなだらかに落とす時間（クリックノイズ防止） */
const RELEASE_SECONDS = 0.25;

export function renderPluck(
  context: BaseAudioContext,
  frequency: number,
  duration: number,
): AudioBuffer {
  const sampleRate = context.sampleRate;
  const period = Math.max(2, Math.round(sampleRate / frequency));
  const length = Math.max(period + 1, Math.ceil(sampleRate * duration));

  const buffer = context.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // 初期励振。生のホワイトノイズは硬すぎるので軽くローパスをかける
  let previous = 0;
  for (let i = 0; i < period; i += 1) {
    const white = Math.random() * 2 - 1;
    previous = (white + previous) * 0.5;
    data[i] = previous;
  }

  // 遅延線を 2 サンプル平均（＝ローパス）しながら循環させる。
  // 高音ほど 1 秒あたりの循環回数が増えるので、自然に早く減衰する
  for (let i = period; i < length; i += 1) {
    data[i] = DECAY * 0.5 * (data[i - period] + data[i - period + 1]);
  }

  const releaseSamples = Math.min(length, Math.ceil(sampleRate * RELEASE_SECONDS));
  const releaseStart = length - releaseSamples;
  for (let i = releaseStart; i < length; i += 1) {
    data[i] *= 1 - (i - releaseStart + 1) / releaseSamples;
  }

  return buffer;
}
