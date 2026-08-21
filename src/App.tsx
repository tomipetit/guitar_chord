import { useCallback, useMemo, useReducer, useState } from 'react';
import { FavoriteBar } from './components/controls/FavoriteBar';
import { MicButton } from './components/controls/MicButton';
import { CapoSelector } from './components/selectors/CapoSelector';
import { VoiceSheet } from './components/controls/VoiceSheet';
import { ChordResult } from './components/result/ChordResult';
import { KeySelector } from './components/selectors/KeySelector';
import { QualitySelector } from './components/selectors/QualitySelector';
import { SelectorPanel } from './components/selectors/SelectorPanel';
import { TensionSelector } from './components/selectors/TensionSelector';
import { shapeSelectionFor } from './domain/capo';
import { chordName } from './domain/chord/naming';
import type { ChordSelection } from './domain/chord/types';
import { isConfident, parseChordCandidates, type ParsedChord } from './domain/speech/parse';
import { voicingsForSelection } from './domain/voicing/generate';
import { useSpeechRecognition } from './platform/recognition/useSpeechRecognition';
import { chordReducer, initialChordState } from './state/chordSelection';
import { useFavorites } from './state/useFavorites';

export function App() {
  const [state, dispatch] = useReducer(chordReducer, initialChordState);
  const [selectorOpen, setSelectorOpen] = useState(true);
  const [candidates, setCandidates] = useState<ParsedChord[] | null>(null);
  const { root, quality, tension, accidental, voicingIndex, capo } = state;

  const selection = useMemo(() => ({ root, quality, tension }), [root, quality, tension]);
  // 選ぶのは鳴らしたい実音。カポを付けている場合、押さえる形はその ぶんだけ低いコードになる
  const shapeSelection = useMemo(() => shapeSelectionFor(selection, capo), [selection, capo]);
  const voicings = useMemo(() => voicingsForSelection(shapeSelection), [shapeSelection]);
  const safeIndex = Math.min(voicingIndex, voicings.length - 1);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  /** 一覧以外（音声・お気に入り）からコードを決めたとき。確定しているので表示に画面を譲る */
  const applySelection = useCallback((next: ChordSelection) => {
    dispatch({ type: 'APPLY_SELECTION', selection: next });
    setSelectorOpen(false);
    setCandidates(null);
  }, []);

  const applyCandidate = useCallback(
    (candidate: ParsedChord) => applySelection(candidate.selection),
    [applySelection],
  );

  const speech = useSpeechRecognition({
    onResult: (transcripts) => {
      const parsed = parseChordCandidates(transcripts);
      // 迷いなく解釈できたときだけ確認を挟まずに適用する
      if (isConfident(parsed)) applyCandidate(parsed[0]);
      else setCandidates(parsed);
    },
  });

  const closeVoice = () => {
    speech.stop();
    speech.clearError();
    setCandidates(null);
  };

  const startVoice = () => {
    setCandidates(null);
    speech.start();
  };

  const voiceOpen = speech.listening || candidates !== null || speech.error !== null;

  return (
    <div className={`app${selectorOpen ? '' : ' app--focus'}`}>
      <header className="app__header">
        <h1 className="app__title">Guitar Chords</h1>
        {speech.supported && (
          <MicButton listening={speech.listening} onStart={startVoice} onStop={speech.stop} />
        )}
      </header>

      {favorites.length > 0 && (
        <FavoriteBar
          favorites={favorites}
          current={selection}
          accidental={accidental}
          onSelect={applySelection}
        />
      )}

      <main className="app__main">
        <SelectorPanel
          open={selectorOpen}
          onToggle={() => setSelectorOpen((v) => !v)}
          currentLabel={
            capo > 0
              ? `${chordName(selection, accidental)}・カポ${capo}`
              : chordName(selection, accidental)
          }
        >
          <KeySelector
            root={root}
            accidental={accidental}
            onSelect={(next) => dispatch({ type: 'SELECT_ROOT', root: next })}
            onAccidentalChange={(next) =>
              dispatch({ type: 'SET_ACCIDENTAL', accidental: next })
            }
          />
          <QualitySelector
            quality={quality}
            onSelect={(next) => dispatch({ type: 'SELECT_QUALITY', quality: next })}
          />
          <TensionSelector
            quality={quality}
            tension={tension}
            onSelect={(next) => {
              dispatch({ type: 'SELECT_TENSION', tension: next });
              // Step3 まで選べばコードが確定するので、指定エリアを畳んで表示に譲る
              setSelectorOpen(false);
            }}
          />
          <CapoSelector capo={capo} onSelect={(next) => dispatch({ type: 'SET_CAPO', capo: next })} />
        </SelectorPanel>

        <ChordResult
          selection={selection}
          shapeSelection={shapeSelection}
          capo={capo}
          accidental={accidental}
          voicings={voicings}
          voicingIndex={safeIndex}
          onSelectVoicing={(index) => dispatch({ type: 'SELECT_VOICING', index })}
          favorite={isFavorite(selection)}
          onToggleFavorite={() => toggleFavorite(selection)}
        />
      </main>

      {speech.supported && voiceOpen && (
        <VoiceSheet
          listening={speech.listening}
          transcript={speech.transcript}
          error={speech.error}
          candidates={candidates}
          accidental={accidental}
          onPick={applyCandidate}
          onRetry={startVoice}
          onClose={closeVoice}
        />
      )}
    </div>
  );
}
