import { useMemo, useReducer, useState } from 'react';
import { ChordResult } from './components/result/ChordResult';
import { KeySelector } from './components/selectors/KeySelector';
import { QualitySelector } from './components/selectors/QualitySelector';
import { SelectorPanel } from './components/selectors/SelectorPanel';
import { TensionSelector } from './components/selectors/TensionSelector';
import { chordName } from './domain/chord/naming';
import { voicingsForSelection } from './domain/voicing/generate';
import { chordReducer, initialChordState } from './state/chordSelection';

export function App() {
  const [state, dispatch] = useReducer(chordReducer, initialChordState);
  const [selectorOpen, setSelectorOpen] = useState(true);
  const { root, quality, tension, accidental, voicingIndex } = state;

  const selection = useMemo(() => ({ root, quality, tension }), [root, quality, tension]);
  const voicings = useMemo(() => voicingsForSelection(selection), [selection]);
  const safeIndex = Math.min(voicingIndex, voicings.length - 1);

  return (
    <div className={`app${selectorOpen ? "" : " app--focus"}`}>
      <header className="app__header">
        <h1 className="app__title">Guitar Chords</h1>
      </header>

      <main className="app__main">
        <SelectorPanel
          open={selectorOpen}
          onToggle={() => setSelectorOpen((v) => !v)}
          currentLabel={chordName(selection, accidental)}
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
            onSelect={(next) => dispatch({ type: 'SELECT_TENSION', tension: next })}
          />
        </SelectorPanel>

        <ChordResult
          selection={selection}
          accidental={accidental}
          voicings={voicings}
          voicingIndex={safeIndex}
          onSelectVoicing={(index) => dispatch({ type: 'SELECT_VOICING', index })}
        />
      </main>
    </div>
  );
}
