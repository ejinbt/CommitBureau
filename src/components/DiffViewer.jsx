import React, { useState } from 'react';
import { Copy, Check, FileCode, GitCommit, GitPullRequest, Terminal } from 'lucide-react';
import './DiffViewer.css';

/**
 * DiffViewer Component (High-End Terminal Chrome)
 * Emulates professional developer tools (Warp / VS Code) with:
 * - True gutter divider and line numbers
 * - Modified status badge [M]
 * - Luminous scanline accent on added/removed lines
 * - Real syntax breakdown
 */
export default function DiffViewer({ diff, file, author, date, roundType }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('diff'); // 'diff' | 'raw'

  const lines = (diff || '').split('\n');

  const handleCopy = () => {
    if (!diff) return;
    navigator.clipboard.writeText(diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="diff-terminal-window">
      {/* Top Window Titlebar */}
      <div className="terminal-titlebar">
        <div className="terminal-traffic-lights">
          <span className="light light-close" />
          <span className="light light-min" />
          <span className="light light-expand" />
        </div>

        {/* Tab Header */}
        <div className="terminal-file-tab">
          <FileCode size={13} className="tab-icon" />
          <span className="tab-filename">{file || 'evidence_patch.diff'}</span>
          <span className="tab-git-status" title="Modified in working tree">M</span>
        </div>

        {/* Action buttons */}
        <div className="terminal-window-actions">
          <div className="terminal-view-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'diff' ? 'active' : ''}`}
              onClick={() => setViewMode('diff')}
            >
              Diff
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'raw' ? 'active' : ''}`}
              onClick={() => setViewMode('raw')}
            >
              Raw
            </button>
          </div>

          <button
            type="button"
            className="terminal-copy-action"
            onClick={handleCopy}
            title="Copy diff to clipboard"
          >
            {copied ? <Check size={12} className="copy-ok" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Forensic Metadata Strip */}
      <div className="terminal-evidence-meta">
        <div className="meta-capsule">
          <GitCommit size={12} className="meta-ico" />
          <span className="meta-key">TARGET:</span>
          <span className="meta-val">{file || 'CRITICAL PATCH'}</span>
        </div>
        <div className="meta-capsule">
          <GitPullRequest size={12} className="meta-ico" />
          <span className="meta-key">TIMESTAMP:</span>
          <span className="meta-val">{date || 'UNKNOWN RECORD'}</span>
        </div>
        <div className="meta-capsule">
          <Terminal size={12} className="meta-ico" />
          <span className="meta-key">INQUIRY:</span>
          <span className="meta-val green-highlight">{roundType || 'COMMIT VERIFICATION'}</span>
        </div>
      </div>

      {/* Terminal Editor Pane */}
      <div className="terminal-editor-pane">
        {viewMode === 'raw' ? (
          <pre className="terminal-raw-pre">{diff}</pre>
        ) : (
          <div className="terminal-diff-table">
            {lines.map((line, idx) => {
              let lineType = 'context';
              let linePrefix = ' ';

              if (line.startsWith('+++') || line.startsWith('---')) {
                lineType = 'header';
                linePrefix = '::';
              } else if (line.startsWith('@@')) {
                lineType = 'hunk';
                linePrefix = '@@';
              } else if (line.startsWith('+')) {
                lineType = 'add';
                linePrefix = '+';
              } else if (line.startsWith('-')) {
                lineType = 'del';
                linePrefix = '-';
              }

              return (
                <div key={idx} className={`diff-table-row row-${lineType}`}>
                  <div className="gutter-num">{idx + 1}</div>
                  <div className="gutter-symbol">{linePrefix}</div>
                  <div className="code-content">
                    <code>{line}</code>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Terminal Bottom Seal */}
      <div className="terminal-statusbar">
        <div className="status-item live">
          <span className="live-dot" />
          <span>GIT TREE FORENSICS BUFFER // VERIFIED</span>
        </div>
        <div className="status-item-right">
          <span>UTF-8 // LF // EVIDENCE RECORD</span>
        </div>
      </div>
    </div>
  );
}
