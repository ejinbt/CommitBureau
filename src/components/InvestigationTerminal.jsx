import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
import { createInvestigation } from '../api';
import './InvestigationTerminal.css';

/**
 * InvestigationTerminal
 * Detective mode: instead of being shown the evidence, the player digs it up by typing real git
 * commands against the repo. The engine runs them (src/engine/terminal.js) and prints Git-style output.
 * Suggested commands fill the prompt rather than running, so the player still types Enter themselves.
 */
export default function InvestigationTerminal({ round, targetRepo, onCommandRun }) {
  const investigation = useMemo(() => createInvestigation(targetRepo, round), [targetRepo, round]);
  const [entries, setEntries] = useState([]); // { cmd, output, error }
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the newest output in view.
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [entries, busy]);

  const run = async (raw) => {
    const cmd = raw.trim();
    if (!cmd || busy) return;
    setBusy(true);
    setHistory((h) => [...h, cmd]);
    setHistoryIdx(-1);
    setInput('');
    const result = await investigation.run(cmd);
    if (result.clear) setEntries([]);
    else setEntries((e) => [...e, { cmd, output: result.output, error: result.error }]);
    if (!result.clear && onCommandRun) onCommandRun(cmd);
    setBusy(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(input);
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(idx);
      setInput(history[idx]);
    } else if (e.key === 'ArrowDown' && historyIdx !== -1) {
      e.preventDefault();
      const idx = historyIdx + 1;
      if (idx >= history.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    }
  };

  const fillSuggestion = (cmd) => {
    setInput(cmd);
    inputRef.current?.focus();
  };

  const repoName = targetRepo ? `${targetRepo.owner}/${targetRepo.repo}` : 'repo';

  return (
    <div className="inv-terminal" onClick={() => inputRef.current?.focus()}>
      <div className="inv-titlebar">
        <div className="inv-lights" aria-hidden="true">
          <span className="inv-light inv-light-close" />
          <span className="inv-light inv-light-min" />
          <span className="inv-light inv-light-expand" />
        </div>
        <span className="inv-title">
          <Terminal size={12} /> ~/{repoName}
        </span>
        <span className="inv-count">{history.length} command{history.length === 1 ? '' : 's'}</span>
      </div>

      <div className="inv-brief">
        <span className="inv-brief-tag">CASE BRIEF</span>
        <span>{round.investigate?.brief}</span>
      </div>

      {round.investigate?.suggest?.length > 0 && (
        <div className="inv-suggest" onClick={(e) => e.stopPropagation()}>
          <span className="inv-suggest-label">Try:</span>
          {round.investigate.suggest.map((cmd) => (
            <button key={cmd} type="button" className="inv-chip" onClick={() => fillSuggestion(cmd)}>
              {cmd}
            </button>
          ))}
          <button type="button" className="inv-chip inv-chip-quiet" onClick={() => run('help')}>
            help
          </button>
        </div>
      )}

      <div className="inv-output" ref={outputRef} aria-live="polite">
        {entries.length === 0 && (
          <div className="inv-empty">Type a git command and press Enter. Pick a suggestion above to get started.</div>
        )}
        {entries.map((entry, i) => (
          <div key={i} className="inv-entry">
            <div className="inv-cmd">
              <span className="inv-prompt">$</span> {entry.cmd}
            </div>
            <pre className={`inv-result ${entry.error ? 'inv-result-error' : ''}`}>
              {entry.output.split('\n').map((line, j) => (
                <span key={j} className={lineClass(line, entry.error)}>
                  {line}
                  {'\n'}
                </span>
              ))}
            </pre>
          </div>
        ))}
        {busy && <div className="inv-busy">running...</div>}
      </div>

      <label className="inv-input-row">
        <span className="inv-prompt">$</span>
        <input
          ref={inputRef}
          type="text"
          className="inv-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="git log --oneline"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-label="Git command"
          disabled={busy}
        />
      </label>
    </div>
  );
}

// Colour diff lines the way a terminal does.
function lineClass(line, isError) {
  if (isError) return '';
  if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff --git')) return 'inv-line-meta';
  if (line.startsWith('+')) return 'inv-line-add';
  if (line.startsWith('-')) return 'inv-line-del';
  if (line.startsWith('@@')) return 'inv-line-hunk';
  if (line.startsWith('commit ')) return 'inv-line-commit';
  return '';
}
