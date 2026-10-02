import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FEATURED_REPOS, getUserRepos } from '../api';
import LevelPicker from './LevelPicker';
import { SpiderPeep, SpiderLoader, SpiderInspector } from './character';
import './CaseIntakeConsole.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 2: Case Intake Console
 * Features tactile Forensic Folder Dossier cards,
 * smooth tab transition physics, and staggered entrance animations.
 */
export default function CaseIntakeConsole({ onSelectRepo, initialTab = 'featured', level = 1, onSelectLevel, mode, onSelectMode }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'featured' | 'custom' | 'archive'
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  // Custom Target State
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');

  // My Archive State
  const [username, setUsername] = useState('');
  const [userRepos, setUserRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [archiveError, setArchiveError] = useState('');

  // Token Management
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  const [githubToken, setGithubToken] = useState(() => {
    try {
      return localStorage.getItem('cb_github_token') || '';
    } catch {
      return ''; // storage blocked (private mode)
    }
  });
  const [tokenSaved, setTokenSaved] = useState(false);

  const contentRef = useRef(null);

  // Animate tab content whenever activeTab changes
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 16, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
      );

      // Stagger folder cards if on featured tab
      const cards = contentRef.current.querySelectorAll('.cb-folder-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.05 }
        );
      }
    }
  }, [activeTab]);

  // Section 3 ScrollTrigger entrance animation (triggers when scrolling into Section 3)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const header = document.querySelector('.cb-intake-header');
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#case-intake',
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      const tabs = document.querySelector('.cb-intake-tabs');
      if (tabs) {
        gsap.fromTo(
          tabs,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#case-intake',
              start: 'top 75%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      const cards = document.querySelectorAll('.cb-folder-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 35, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#case-intake',
              start: 'top 70%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    });

    return () => ctx.revert();
  }, [activeTab]);

  const handleSaveToken = (e) => {
    e.preventDefault();
    try {
      if (githubToken.trim()) {
        localStorage.setItem('cb_github_token', githubToken.trim());
      } else {
        localStorage.removeItem('cb_github_token');
      }
    } catch {
      // Storage blocked (private mode): the token can't be saved, but the game still works.
    }
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
  };

  const parseRepoInput = (input) => {
    let clean = input.trim();
    clean = clean.replace(/^https?:\/\//, '');
    clean = clean.replace(/^github\.com\//, '');
    clean = clean.replace(/\/$/, '');
    clean = clean.replace(/\.git$/, '');

    const parts = clean.split('/');
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { owner: parts[0], repo: parts[1] };
    }
    return null;
  };

  const handleLaunchCustom = (e) => {
    e.preventDefault();
    setCustomError('');

    const parsed = parseRepoInput(customInput);
    if (!parsed) {
      setCustomError('Please provide a valid repository URL or owner/repo format (e.g. facebook/react).');
      return;
    }

    onSelectRepo(parsed);
  };

  const handleFetchArchive = async (e) => {
    e.preventDefault();
    setArchiveError('');
    if (!username.trim()) {
      setUserRepos([]);
      setArchiveError('Please enter a GitHub username.');
      return;
    }

    setLoadingRepos(true);
    setUserRepos([]); // Clear previous user's repos immediately
    try {
      const repos = await getUserRepos(username.trim());
      if (!repos || repos.length === 0) {
        setUserRepos([]);
        setArchiveError(`No public repositories found for user '${username.trim()}'.`);
      } else {
        setUserRepos(repos);
      }
    } catch (err) {
      setUserRepos([]);
      setArchiveError(err.message || 'Failed to fetch repositories.');
    } finally {
      setLoadingRepos(false);
    }
  };

  return (
    <section id="case-intake" className="cb-intake-section">
      {/* Interactive Spider Detective Surveillance Peep */}
      <SpiderPeep side="left" mode="viewport" top="36%" delay={3.5} interval={16} />

      <div className="cb-container">
        {/* Section Header */}
        <div className="cb-intake-header">
          <div className="cb-intake-eyebrow cb-mono">
            <span className="cb-eyebrow-accent">//</span>
            <span>SECTION 02</span>
            <span className="cb-eyebrow-sep">/</span>
            <span>REPOSITORY INTAKE</span>
          </div>

          <h2 className="cb-intake-title cb-heading">
            Select Your <span className="cb-gradient-text">Target Repo.</span>
          </h2>

          <p className="cb-intake-subtitle">
            Choose a famous open-source repository, paste any custom GitHub target, 
            or investigate your own personal commit history.
          </p>
        </div>

        {/* Level Picker: jump to any clearance level */}
        {onSelectLevel && (
          <LevelPicker level={level} onSelectLevel={onSelectLevel} mode={mode} onSelectMode={onSelectMode} />
        )}

        {/* Tab Switcher */}
        <div className="cb-tabs-wrapper">
          <div className="cb-intake-tabs">
            <button
              type="button"
              className={`cb-tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
              onClick={() => setActiveTab('featured')}
            >
              <span>Featured Folders</span>
              <span className="cb-tab-count">{FEATURED_REPOS.length}</span>
            </button>

            <button
              type="button"
              className={`cb-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
              onClick={() => setActiveTab('custom')}
            >
              <span>Custom Repository</span>
            </button>

            <button
              type="button"
              className={`cb-tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
              onClick={() => setActiveTab('archive')}
            >
              <span>My Archive Mode</span>
            </button>
          </div>
        </div>

        {/* Animated Tab Content Container */}
        <div ref={contentRef} className="cb-tab-content-area">
          {/* TAB 1: Forensic Case Folder Dossiers */}
          {activeTab === 'featured' && (
            <div className="cb-folders-grid">
              {FEATURED_REPOS.map((item, index) => (
                <div key={`${item.owner}/${item.repo}`} className="cb-folder-card">
                  {/* Folder Tab (Sticks up from the folder sleeve) */}
                  <div className="cb-folder-tab">
                    <span className="cb-folder-tab-num cb-mono">CASE 0{index + 1}</span>
                    <span className="cb-folder-tab-badge cb-mono">{item.tag}</span>
                  </div>

                  {/* Folder Sleeve Body */}
                  <div className="cb-folder-body">
                    <div className="cb-folder-meta cb-mono">
                      <span className="cb-folder-stamp">CLASSIFIED EVIDENCE</span>
                      <span className="cb-folder-level">LEVEL {level}</span>
                    </div>

                    <h3 className="cb-folder-name cb-heading">{item.title}</h3>

                    <div className="cb-folder-repo cb-mono">
                      <span className="cb-folder-icon" aria-hidden="true">📂</span>
                      <span>{item.owner}/{item.repo}</span>
                    </div>

                    <p className="cb-folder-summary">{item.description}</p>

                    <div className="cb-folder-action">
                      <button
                        type="button"
                        className="cb-folder-open-btn"
                        onClick={() => onSelectRepo({ owner: item.owner, repo: item.repo })}
                      >
                        <span>Open Case File</span>
                        <span className="cb-folder-open-arrow" aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Custom Target URL Input */}
          {activeTab === 'custom' && (
            <div className="cb-custom-wrapper">
              <div className="cb-folder-card cb-custom-folder">
                <div className="cb-folder-tab">
                  <span className="cb-folder-tab-num cb-mono">NEW CASE</span>
                  <span className="cb-folder-tab-badge cb-mono">CUSTOM TARGET</span>
                </div>

                <div className="cb-folder-body cb-custom-body">
                  <div className="cb-custom-top-row">
                    <div className="cb-custom-header">
                      <h3 className="cb-heading">Investigate Any Public Repository</h3>
                      <p>Paste a GitHub link or specify owner and repository name.</p>
                    </div>
                    <SpiderInspector label="TARGET FORENSIC AUDITOR" className="cb-custom-inspector" />
                  </div>

                  <form onSubmit={handleLaunchCustom} className="cb-custom-form">
                    <div className="cb-input-group">
                      <span className="cb-input-prefix cb-mono">github.com/</span>
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="owner/repository (e.g. facebook/react)"
                        className="cb-custom-input cb-mono"
                        autoFocus
                      />
                      <button type="submit" className="cb-custom-submit-btn">
                        <span>Open Case</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>

                    {customError && (
                      <div className="cb-error-banner cb-mono">
                        <span>⚠</span> {customError}
                      </div>
                    )}

                    <div className="cb-input-hints cb-mono">
                      <span>Supported formats:</span>
                      <code>facebook/react</code>
                      <code>https://github.com/torvalds/linux</code>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: My Archive Mode */}
          {activeTab === 'archive' && (
            <div className="cb-archive-wrapper">
              <div className="cb-folder-card cb-archive-folder">
                <div className="cb-folder-tab">
                  <span className="cb-folder-tab-num cb-mono">ARCHIVE RETRIEVAL</span>
                  <span className="cb-folder-tab-badge cb-mono">COLD CASES</span>
                </div>

                <div className="cb-folder-body cb-archive-body">
                  <div className="cb-archive-header">
                    <h3 className="cb-heading">Investigate Your Own Code Archive</h3>
                    <p>
                      Enter your GitHub username to review your old projects and solve cases based on your own past commit messages.
                    </p>
                  </div>

                  <form onSubmit={handleFetchArchive} className="cb-archive-form">
                    <div className="cb-input-group">
                      <span className="cb-input-prefix cb-mono">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your GitHub username (e.g. torvalds)"
                        className="cb-custom-input cb-mono"
                      />
                      <button 
                        type="submit" 
                        className="cb-custom-submit-btn"
                        disabled={loadingRepos}
                      >
                        {loadingRepos ? (
                          <span>Scanning Archive...</span>
                        ) : (
                          <>
                            <span>Fetch My Repos</span>
                            <span aria-hidden="true">→</span>
                          </>
                        )}
                      </button>
                    </div>

                    {archiveError && (
                      <div className="cb-error-banner cb-mono">
                        <span>⚠</span> {archiveError}
                      </div>
                    )}
                  </form>

                  {/* High-Action Forensic Detective Loader */}
                  {loadingRepos && (
                    <div className="cb-archive-loader-wrapper">
                      <SpiderLoader
                        text="SCANNING GITHUB USER ARCHIVE..."
                        subtext={`INTERROGATING PUBLIC REPOSITORIES FOR @${username.toUpperCase() || 'USER'}`}
                      />
                    </div>
                  )}

                  {/* Retrieved User Repos List */}
                  {userRepos.length > 0 && (
                    <div className="cb-archive-results">
                      <h4 className="cb-archive-results-title cb-heading">
                        Found {userRepos.length} Repositories for @{username}
                      </h4>

                      <div className="cb-user-repo-list">
                        {/* The engine's getUserRepos returns { owner, repo, description, language, fork }
                            (docs/CONTRACT.md), not GitHub's raw name / full_name. */}
                        {userRepos.map((item) => (
                          <div key={`${item.owner}/${item.repo}`} className="cb-user-repo-item">
                            <div className="cb-user-repo-info">
                              <span className="cb-user-repo-name cb-heading">
                                {item.repo}
                                {item.fork && <span className="cb-user-repo-fork"> (fork)</span>}
                              </span>
                              <span className="cb-user-repo-desc">
                                {item.description || 'No description provided.'}
                                {item.language && ` · ${item.language}`}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="cb-user-repo-btn"
                              onClick={() => onSelectRepo({ owner: item.owner, repo: item.repo })}
                            >
                              <span>Solve Cases</span>
                              <span aria-hidden="true">→</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Investigator Token Key (Rate Limit Helper) */}
        <div className="cb-token-container">
          <button
            type="button"
            className="cb-token-toggle-btn"
            onClick={() => setShowTokenSettings(!showTokenSettings)}
          >
            <span className="cb-token-icon">⚡</span>
            <span>Boost GitHub API Rate Limit (Optional Token)</span>
            <span className="cb-token-arrow">{showTokenSettings ? '▲' : '▼'}</span>
          </button>

          {showTokenSettings && (
            <div className="cb-token-drawer">
              <p className="cb-token-desc">
                Unauthenticated GitHub requests are limited to 60 per hour. Supplying a personal token raises this to 5,000 per hour.
              </p>

              <form onSubmit={handleSaveToken} className="cb-token-form">
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="Paste GitHub Personal Access Token (classic or fine-grained)"
                  className="cb-token-input cb-mono"
                />
                <button type="submit" className="cb-token-save-btn">
                  {tokenSaved ? 'Saved!' : 'Save Key'}
                </button>
              </form>

              <div className="cb-token-security-note cb-mono">
                <span>🔒</span>
                <span>Your token stays in your browser's local storage and is sent only to GitHub.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
