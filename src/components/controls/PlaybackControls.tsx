import { useState } from 'react';
import { PLAYBACK_MODES, type PlaybackMode } from '../../platform/audio/player';

interface Props {
  playing: boolean;
  onPlay: (mode: PlaybackMode) => void;
  onStop: () => void;
}

export function PlaybackControls({ playing, onPlay, onStop }: Props) {
  const [mode, setMode] = useState<PlaybackMode>('strum');

  return (
    <div className="playback">
      <button
        type="button"
        className="playback__play"
        onClick={() => (playing ? onStop() : onPlay(mode))}
      >
        <span className="playback__icon" aria-hidden="true">
          {playing ? '■' : '▶'}
        </span>
        {playing ? '停止' : '再生'}
      </button>

      <div className="playback__modes" role="group" aria-label="再生モード">
        {PLAYBACK_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className="playback__mode"
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
