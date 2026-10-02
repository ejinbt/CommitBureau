import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Terminal, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import Header from '../components/Header';
import logoImg from '../assets/logo.webp';
import { finalReport, HINT_PENALTY } from '../api';
import './DebriefPage.css';

/**
 * DebriefPage Component (Section 4)
 * Case clearance debrief and detective rank promotion:
 * - Classified clearance stamp (Promoted / Solved)
 * - Detective Rank badge and level progression
 * - Forensic skills breakdown
 * - Shareable case verdict & copy to clipboard
 * - Launch next archive case action
 */
export default function DebriefPage({
  targetRepo,
  gameState,
  level = 1,
  daily = null,
  onPlayAgain,
  onReturnIntake,
  onNavigate
}) {
  const [copiedShare, setCopiedShare] = useState(false);

  // Compute official report per engine contract using level played
  const report = finalReport(gameState, level);
  const repoName = targetRepo ? `${targetRepo.owner}/${targetRepo.repo}` : 'torvalds/linux';

  const shareText = `CommitBureau Forensics Report
Target: ${repoName}
Rank: ${report.rank.toUpperCase()} (${report.percent}%)
Score: ${report.score} PTS | Max Streak: ${gameState?.maxStreak || 0}x
Clearance: ${report.unlocked ? 'Level Up Authorized' : 'Standard Archival'}
Inspect your commits: ${window.location.origin}`;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="debrief-page-screen">
      <Header
        level={level}
        rank={report.rank}
        onStartCaseClick={onReturnIntake}
        onNavigate={onNavigate || ((sec, tab) => onReturnIntake(tab))}
      />

      <main className="debrief-viewport">
        <div className="debrief-dossier-frame">
          {/* Dossier Header Tag */}
          <div className="debrief-header-strip">
            <div className="clearance-stamp-row">
              <span className="clearance-tag">// CLASSIFIED DEBRIEF</span>
              <span className="case-id-tag">ARCHIVE RECORD #{repoName.toUpperCase()}</span>
            </div>
            <div className="debrief-date-stamp">
              STATUS: CASE CLOSED & SEALED
            </div>
          </div>

          {/* Main Clearance Banner */}
          <div className="debrief-verdict-hero">
            <div className="verdict-rank-badge">
              <div className="debrief-logo-emblem">
                <img src={logoImg} alt="CommitBureau Logo" className="debrief-logo-img" />
              </div>
              <div className="rank-title-group">
                <span className="rank-label">DETECTIVE CLEARANCE RANK</span>
                <h1 className="rank-value">{report.rank}</h1>
              </div>
            </div>

            <div className="verdict-metrics-summary">
              <div className="metric-cell">
                <span className="cell-k">FINAL SCORE</span>
                <span className="cell-v highlight-green">{report.score}</span>
              </div>
              <div className="metric-cell">
                <span className="cell-k">SOLVE ACCURACY</span>
                <span className="cell-v highlight-cyan">{report.percent}%</span>
              </div>
              <div className="metric-cell">
                <span className="cell-k">CASES CLEARED</span>
                <span className="cell-v">{report.correctCount} / {report.totalCount}</span>
              </div>
              <div className="metric-cell">
                <span className="cell-k">MAX COMBO</span>
                <span className="cell-v highlight-amber">{gameState?.maxStreak || 0}X</span>
              </div>
            </div>
          </div>

          {/* Promotion / Clearance Status Callout. A Daily case doesn't change the player's level, so it gets its own banner. */}
          {daily ? (
            <div className={`clearance-unlock-banner ${report.unlocked ? 'banner-promoted' : 'banner-retained'}`}>
              <Sparkles size={18} className="unlock-ico" />
              <div className="unlock-content">
                <span className="unlock-title">
                  DAILY CASE CLOSED // {daily.difficulty.toUpperCase()} · {report.correctCount}/{report.totalCount} SOLVED
                </span>
                <span className="unlock-desc">
                  {report.unlocked
                    ? 'Case cracked. Come back tomorrow for three new repos.'
                    : 'Not every lead checked out. Replay it, or come back tomorrow for three new repos.'}
                </span>
              </div>
            </div>
          ) : report.unlocked ? (
            <div className="clearance-unlock-banner banner-promoted">
              <Sparkles size={18} className="unlock-ico" />
              <div className="unlock-content">
                <span className="unlock-title">
                  {level < 5
                    ? `PROMOTION AUTHORIZED // CLEARANCE LEVEL ${level + 1} UNLOCKED`
                    : 'TOP CLEARANCE // CHIEF OF THE BUREAU'}
                </span>
                <span className="unlock-desc">
                  Excellent forensic analysis. Your clearance allows access to multi-commit rebases, patch splices, and advanced blame forensics.
                </span>
              </div>
            </div>
          ) : (
            <div className="clearance-unlock-banner banner-retained">
              <ShieldCheck size={18} className="unlock-ico" />
              <div className="unlock-content">
                <span className="unlock-title">FIELD REPORT RECORDED // RANK MAINTAINED: {report.rank.toUpperCase()}</span>
                <span className="unlock-desc">
                  Case archived in central records. Score 80% or higher to unlock senior investigator clearance tier.
                </span>
              </div>
            </div>
          )}

          {/* Two-Column Grid: Forensic Skills & Round Breakdown */}
          <div className="debrief-dual-grid">
            {/* Skills Breakdown */}
            <div className="debrief-panel skills-panel">
              <div className="panel-title-bar">
                <Terminal size={14} className="panel-ico" />
                <span>FORENSIC SKILLS ASSESSMENT</span>
              </div>

              <div className="skills-list">
                {report.skills?.map((sk, idx) => (
                  <div key={idx} className="skill-meter-row">
                    <div className="skill-meta-line">
                      <span className="skill-name">{sk.label}</span>
                      <span className="skill-ratio">{sk.ratio} ({sk.percentage}%)</span>
                    </div>
                    <div className="skill-track">
                      <div
                        className="skill-bar-fill"
                        style={{ width: `${sk.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Rounds Breakdown */}
            <div className="debrief-panel rounds-panel">
              <div className="panel-title-bar">
                <ShieldCheck size={14} className="panel-ico" />
                <span>CASE EVIDENCE LOG</span>
              </div>

              <div className="rounds-log-list">
                {gameState?.answers?.map((ans, idx) => (
                  <div
                    key={idx}
                    className={`evidence-log-row ${ans.isCorrect ? 'log-passed' : 'log-failed'}`}
                  >
                    <div className="log-status-col">
                      {ans.isCorrect ? (
                        <CheckCircle2 size={16} className="log-icon-ok" />
                      ) : (
                        <XCircle size={16} className="log-icon-bad" />
                      )}
                    </div>
                    <div className="log-detail-col">
                      <span className="log-round-name">
                        ROUND {idx + 1}: {(ans.type || 'Inquiry').replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="log-round-sub">
                        {ans.isCorrect ? 'HYPOTHESIS CONFIRMED' : 'EVIDENCE MISMATCH'}
                        {ans.usedHint && ` // HINT PENALTY (-${HINT_PENALTY})`}
                      </span>
                    </div>
                    <div className="log-points-col">
                      <span>{ans.isCorrect ? `+${ans.points} PTS` : '0 PTS'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Suite & Share Bar */}
          <div className="debrief-action-bar">
            <button
              type="button"
              className="share-report-btn"
              onClick={handleCopyShare}
            >
              {copiedShare ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedShare ? 'DEBRIEF COPIED TO CLIPBOARD' : 'SHARE FORENSIC VERDICT'}</span>
            </button>

            <div className="primary-actions-group">
              <button
                type="button"
                className="action-replay-btn"
                onClick={onPlayAgain}
              >
                <RotateCcw size={14} />
                {/* After a promotion, App has already moved to the next level, so say so. */}
                <span>{daily ? 'REPLAY CASE' : report.unlocked && level < 5 ? `START LEVEL ${level + 1}` : 'RE-EXAMINE REPO'}</span>
              </button>

              <button
                type="button"
                className="action-next-case-btn"
                onClick={onReturnIntake}
              >
                <span>OPEN NEXT CASE INTAKE</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
