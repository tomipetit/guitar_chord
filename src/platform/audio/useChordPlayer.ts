import { useCallback, useEffect, useRef, useState } from 'react';
import { ChordPlayer, isAudioSupported, type PlaybackMode } from './player';

export function useChordPlayer() {
  const playerRef = useRef<ChordPlayer | null>(null);
  const [playing, setPlaying] = useState(false);

  if (playerRef.current === null) {
    playerRef.current = new ChordPlayer();
  }

  useEffect(() => {
    const player = playerRef.current;
    return () => player?.dispose();
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.stop();
    setPlaying(false);
  }, []);

  const playChord = useCallback(async (midiNotes: number[], mode: PlaybackMode) => {
    setPlaying(true);
    const started = await playerRef.current?.playChord(midiNotes, mode, () => setPlaying(false));
    // 発音できなかった場合は「停止」表示のまま固まらないように戻す
    if (!started) setPlaying(false);
  }, []);

  const pluckString = useCallback(async (midi: number) => {
    await playerRef.current?.pluckString(midi);
  }, []);

  return { supported: isAudioSupported(), playing, playChord, pluckString, stop };
}
