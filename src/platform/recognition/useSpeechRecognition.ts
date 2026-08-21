import { useCallback, useEffect, useRef, useState } from 'react';
import {
  finalTranscripts,
  interimTranscript,
  isSpeechSupported,
  recognitionErrorMessage,
  speechRecognitionCtor,
  type SpeechRecognitionLike,
} from './speechRecognition';

/** 音声認識が返す候補の数。多いほど「聞き間違い」を救える */
const MAX_ALTERNATIVES = 5;

interface Options {
  /** 確定した候補文（確信度の高い順）を受け取る */
  onResult: (transcripts: string[]) => void;
}

export function useSpeechRecognition({ onResult }: Options) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = speechRecognitionCtor();
    if (!Ctor) return;

    recognitionRef.current?.abort();

    const recognition = new Ctor();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = MAX_ALTERNATIVES;

    recognition.onresult = (event) => {
      setTranscript(interimTranscript(event));
      const finals = finalTranscripts(event);
      if (finals.length === 0) return;
      // 欲しい結果は取れたので、エンジンの onend を待たずに聞き取りを終える。
      // 待つと結果を反映したあとも「聞き取り中」の表示が残ってしまう
      recognition.stop();
      setListening(false);
      onResultRef.current(finals);
    };
    recognition.onerror = (event) => {
      // 中断は利用者の操作なのでエラー表示しない
      if (event.error !== 'aborted') setError(recognitionErrorMessage(event.error));
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setTranscript('');
    setError(null);
    setListening(true);

    try {
      recognition.start();
    } catch {
      // 連打などで start が重なった場合
      setListening(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    supported: isSpeechSupported(),
    listening,
    transcript,
    error,
    start,
    stop,
    clearError,
  };
}
