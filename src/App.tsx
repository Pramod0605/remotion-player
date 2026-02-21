/**
 * Dynamic JSON-Driven Remotion Player
 * 
 * Reads presentation.json from a job folder, renders each section
 * using the appropriate renderer based on V2.5 Bible section types.
 * Avatar MP4 duration = single source of truth for timing.
 */
import { useState, useEffect, useMemo } from 'react';
import { Player } from '@remotion/player';
import { SectionRenderer } from './components/SectionRenderer';
import { DevConfigProvider } from './components/DevConfig';
import { DevPanel } from './components/DevPanel';
import { computeSegmentFrames, FPS } from './utils/timing';
import type { PresentationJSON, Section, SegmentFrameRange } from './types';
import './App.css';

// Default job to load (fallback if no ?job= param)
const DEFAULT_JOB = 'SocialScience_20260217095902550_4619a574';

// Read job from URL query param
const getJobFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  return params.get('job') || DEFAULT_JOB;
};

// Hardcoded avatar durations (seconds) — derived from actual MP4 files
// In production, these would be read dynamically via getVideoMetadata
const AVATAR_DURATIONS: Record<string, Record<number, number>> = {
  'SocialScience_20260217095902550_4619a574': {
    1: 29,    // section_1_avatar.mp4
    2: 21,    // section_2_avatar.mp4
    3: 56,    // section_3_avatar.mp4
    4: 74,    // section_4_avatar.mp4
    5: 140,   // section_5_avatar.mp4
    6: 211,   // section_6_avatar.mp4
    7: 71,    // section_7_avatar.mp4
    8: 121,   // section_8_avatar.mp4
  },
};

function App() {
  const [presentation, setPresentation] = useState<PresentationJSON | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number>(1);
  const [jobId, setJobId] = useState<string>(getJobFromUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobBasePath = `/jobs/${jobId}`;

  // Load presentation.json
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${jobBasePath}/presentation.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: PresentationJSON) => {
        setPresentation(data);
        setSelectedSectionId(data.sections[0]?.section_id || 1);
        setLoading(false);
      })
      .catch(err => {
        setError(`Failed to load presentation: ${err.message}`);
        setLoading(false);
      });
  }, [jobBasePath]);

  // Get selected section
  const selectedSection: Section | null = useMemo(
    () => presentation?.sections.find(s => s.section_id === selectedSectionId) || null,
    [presentation, selectedSectionId],
  );

  // Compute avatar duration and segment frames
  const avatarDuration = useMemo(() => {
    if (!selectedSection) return 10;
    const durations = AVATAR_DURATIONS[jobId];
    if (durations && durations[selectedSection.section_id]) {
      return durations[selectedSection.section_id];
    }
    // Fallback to JSON estimated duration
    return selectedSection.narration.total_duration_seconds;
  }, [selectedSection, jobId]);

  const durationInFrames = Math.round(avatarDuration * FPS);

  const segmentFrames: SegmentFrameRange[] = useMemo(() => {
    if (!selectedSection) return [];
    return computeSegmentFrames(
      selectedSection.narration.segments,
      avatarDuration,
      FPS,
    );
  }, [selectedSection, avatarDuration]);

  // Section type badge colors
  const sectionTypeColors: Record<string, string> = {
    intro: '#6c63ff',
    summary: '#48bb78',
    content: '#4299e1',
    example: '#ed8936',
    quiz: '#f56565',
    memory: '#9f7aea',
    recap: '#e53e3e',
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading presentation...</p>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="app-error">
        <h2>⚠️ Error</h2>
        <p>{error || 'No presentation data'}</p>
        <p className="hint">Make sure the job folder exists at <code>jobs/{jobId}/</code></p>
      </div>
    );
  }

  return (
    <DevConfigProvider>
      <div className="app-container">
        <DevPanel />
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-title">🎬 Player</h1>
            <p className="sidebar-subtitle">{presentation.presentation_title}</p>
          </div>

          <div className="sidebar-meta">
            <span className="meta-item">
              {presentation.sections.length} sections
            </span>
            <span className="meta-item">
              {formatDuration(presentation.metadata.total_duration_seconds)}
            </span>
          </div>

          <nav className="section-list">
            {presentation.sections.map(section => {
              const isActive = section.section_id === selectedSectionId;
              const typeColor = sectionTypeColors[section.section_type] || '#888';

              return (
                <button
                  key={section.section_id}
                  className={`section-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedSectionId(section.section_id)}
                >
                  <div className="section-item-header">
                    <span
                      className="section-type-badge"
                      style={{ backgroundColor: typeColor }}
                    >
                      {section.section_type}
                    </span>
                    <span className="section-duration">
                      {formatDuration(section.narration.total_duration_seconds)}
                    </span>
                  </div>
                  <div className="section-title">{section.title}</div>
                </button>
              );
            })}
          </nav>

          {/* Job selector */}
          <div className="sidebar-footer">
            <label className="job-label">Job ID:</label>
            <input
              className="job-input"
              value={jobId}
              onChange={e => setJobId(e.target.value)}
              placeholder="Enter job folder name"
            />
          </div>
        </aside>

        {/* ── MAIN PLAYER ── */}
        <main className="player-area">
          {selectedSection && (
            <>
              <div className="player-header">
                <h2 className="player-title">
                  Section {selectedSection.section_id}: {selectedSection.title}
                </h2>
                <span
                  className="player-type-badge"
                  style={{ backgroundColor: sectionTypeColors[selectedSection.section_type] }}
                >
                  {selectedSection.section_type}
                </span>
              </div>

              <div className="player-container">
                <Player
                  component={SectionRenderer}
                  inputProps={{
                    section: selectedSection,
                    avatarGlobal: presentation.avatar_global,
                    jobBasePath,
                    segmentFrames,
                  }}
                  durationInFrames={durationInFrames}
                  fps={FPS}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                  }}
                  controls
                  autoPlay={false}
                  loop={false}
                  showVolumeControls={true}
                />
              </div>

              {/* Segment timeline */}
              <div className="segment-timeline">
                {segmentFrames.map((sf, _idx) => {
                  const widthPercent = (sf.durationFrames / durationInFrames) * 100;
                  const isTextSeg = sf.displayDirectives?.text_layer === 'show';
                  return (
                    <div
                      key={sf.segmentId}
                      className="segment-bar"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: isTextSeg
                          ? 'rgba(108, 99, 255, 0.5)'
                          : 'rgba(72, 187, 120, 0.5)',
                      }}
                      title={`${sf.segmentId} — ${sf.purpose || 'segment'} (${Math.round(sf.durationFrames / FPS)}s)`}
                    >
                      <span className="segment-label">
                        {sf.purpose === 'introduce' || isTextSeg ? '📝' : '🎬'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="segment-legend">
                <span className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: 'rgba(108, 99, 255, 0.7)' }} />
                  Teach (Text)
                </span>
                <span className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: 'rgba(72, 187, 120, 0.7)' }} />
                  Show (Visual/Video)
                </span>
              </div>
            </>
          )}
        </main>
      </div>
    </DevConfigProvider>
  );
}

export default App;
