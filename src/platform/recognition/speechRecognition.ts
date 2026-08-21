/**
 * Web Speech API の最小限の型定義。
 * lib.dom に含まれない環境があるため、使う範囲だけ自前で宣言する。
 */
interface RecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface RecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  readonly [index: number]: RecognitionAlternative;
}

interface RecognitionResultList {
  readonly length: number;
  readonly [index: number]: RecognitionResult;
}

export interface RecognitionEvent {
  readonly results: RecognitionResultList;
  readonly resultIndex: number;
}

export interface RecognitionErrorEvent {
  readonly error: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechCapableWindow {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

export function speechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as SpeechCapableWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** この端末で音声入力が使えるか。使えない場合はマイク自体を出さない */
export function isSpeechSupported(): boolean {
  return speechRecognitionCtor() !== undefined;
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'マイクの使用が許可されていません',
  'service-not-allowed': 'この環境では音声入力を利用できません',
  'no-speech': '音声を聞き取れませんでした',
  'audio-capture': 'マイクが見つかりません',
  network: '音声認識サーバーに接続できませんでした',
  aborted: '音声入力を中断しました',
};

export function recognitionErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? '音声を認識できませんでした';
}

/** 認識結果から、確定した候補文を確信度の高い順に取り出す */
export function finalTranscripts(event: RecognitionEvent): string[] {
  const transcripts: string[] = [];
  for (let i = event.resultIndex; i < event.results.length; i += 1) {
    const result = event.results[i];
    if (!result.isFinal) continue;
    for (let j = 0; j < result.length; j += 1) {
      transcripts.push(result[j].transcript);
    }
  }
  return transcripts;
}

/** 認識途中の読み上げテキスト（画面に出して誤認識を分かるようにする） */
export function interimTranscript(event: RecognitionEvent): string {
  let text = '';
  for (let i = event.resultIndex; i < event.results.length; i += 1) {
    text += event.results[i][0]?.transcript ?? '';
  }
  return text;
}
