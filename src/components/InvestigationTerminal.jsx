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
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState({ pos: 0, scroll: 0, show: true });

  // Where the block caret goes: the input's cursor position and how far its text has scrolled.
  // Hidden while text is selected, so the browser's own selection highlight shows instead.
  const syncCaret = () => {
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const pos = el.selectionStart ?? el.value.length;
      setCaret({ pos, scroll: el.scrollLeft, show: el.selectionStart === el.selectionEnd });
    });
  };

  // Moving through history or filling a suggestion puts the cursor at the end.
  useEffect(() => {
    syncCaret();
  }, [input]);

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

  // Clicking a suggestion puts it in the prompt. The player still presses Enter.
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
            {entry.error ? (
              <pre className="inv-result inv-result-error">{entry.output}</pre>
            ) : (
              splitDiffs(entry.output).map((part, j) =>
                part.kind === 'diff' ? (
                  <DiffBlock key={j} file={part.file} lines={part.lines} />
                ) : (
                  <pre key={j} className="inv-result">
                    {part.lines.map((line, k) => (
                      <span key={k} className={lineClass(line)}>
                        {line}
                        {'\n'}
                      </span>
                    ))}
                  </pre>
                )
              )
            )}
          </div>
        ))}
        {busy && <div className="inv-busy">running...</div>}
      </div>

      <label className="inv-input-row">
        <span className="inv-prompt">$</span>
        <span className="inv-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="inv-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              syncCaret();
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={syncCaret}
            onSelect={syncCaret}
            onClick={syncCaret}
            onFocus={() => {
              setFocused(true);
              syncCaret();
            }}
            onBlur={() => setFocused(false)}
            placeholder="git log --oneline"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Git command"
            disabled={busy}
          />
          {/* Vim-style block caret, drawn over the input (the browser's own caret is hidden). */}
          {caret.show && (
            <span className="inv-caret-layer" aria-hidden="true" style={{ transform: `translateX(${-caret.scroll}px)` }}>
              <span className="inv-caret-before">{input.slice(0, caret.pos)}</span>
              <span className={`inv-caret ${focused ? '' : 'inv-caret-idle'}`}>{input[caret.pos] || ' '}</span>
            </span>
          )}
        </span>
      </label>
    </div>
  );
}

// Plain output lines: only the commit line gets a colour.
function lineClass(line) {
  return line.startsWith('commit ') ? 'inv-line-commit' : '';
}

// Cut command output into plain text and per-file diffs. A diff starts at "diff --git a/<file> b/<file>".
function splitDiffs(output) {
  const parts = [];
  for (const line of output.split('\n')) {
    const start = line.match(/^diff --git a\/(.+) b\/.+$/);
    if (start) parts.push({ kind: 'diff', file: start[1], lines: [] });
    else if (parts.length && parts[parts.length - 1].kind === 'diff') parts[parts.length - 1].lines.push(line);
    else if (parts.length && parts[parts.length - 1].kind === 'text') parts[parts.length - 1].lines.push(line);
    else parts.push({ kind: 'text', lines: [line] });
  }
  // Drop the blank line git leaves between the commit message and the diff.
  return parts.filter((p) => p.kind === 'diff' || p.lines.some((l) => l.trim()));
}

// Turn patch lines into GitHub-style rows with old and new line numbers.
function diffRows(lines) {
  const rows = [];
  let oldNo = 0;
  let newNo = 0;
  for (const line of lines) {
    if (line.startsWith('--- ') || line.startsWith('+++ ')) continue; // the file name is in the block header
    const hunk = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/);
    if (hunk) {
      oldNo = Number(hunk[1]);
      newNo = Number(hunk[2]);
      rows.push({ type: 'hunk', text: line });
    } else if (line.startsWith('+')) {
      rows.push({ type: 'add', newNo: newNo++, sign: '+', text: line.slice(1) });
    } else if (line.startsWith('-')) {
      rows.push({ type: 'del', oldNo: oldNo++, sign: '-', text: line.slice(1) });
    } else if (line.startsWith('\\') || line.startsWith('... ') || line.startsWith('(')) {
      rows.push({ type: 'note', text: line });
    } else if (line !== '' || rows.length) {
      rows.push({ type: 'context', oldNo: oldNo++, newNo: newNo++, sign: ' ', text: line.slice(1) });
    }
  }
  // A trailing empty line is just the end of the output, not part of the file.
  while (rows.length && rows[rows.length - 1].type === 'context' && rows[rows.length - 1].text === '') rows.pop();
  return rows;
}

function DiffBlock({ file, lines }) {
  const rows = diffRows(lines);
  return (
    <div className="inv-diff">
      <div className="inv-diff-file">{file}</div>
      <div className="inv-diff-rows">
        {rows.map((row, i) =>
          row.type === 'hunk' || row.type === 'note' ? (
            <div key={i} className={`inv-diff-row inv-diff-${row.type}`}>
              <span className="inv-diff-wide">{row.text}</span>
            </div>
          ) : (
            <div key={i} className={`inv-diff-row inv-diff-${row.type}`}>
              <span className="inv-diff-num">{row.oldNo ?? ''}</span>
              <span className="inv-diff-num">{row.newNo ?? ''}</span>
              <span className="inv-diff-sign">{row.sign}</span>
              <code className="inv-diff-code">{row.text}</code>
            </div>
          )
        )}
      </div>
    </div>
  );
}
