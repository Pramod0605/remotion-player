/**
 * LessonPlayer.tsx — React Browser Player
 *
 * Plays full_lesson.mp4 linearly. At quiz timestamps, pauses the video,
 * shows full-screen interactive quiz, then resumes.
 *
 * Mobile: Option B — background fullscreen, avatar small bottom-right overlay.
 * Desktop: 70/30 side-by-side layout.
 *
 * See ARCHITECTURE.md for quiz timestamp calculation and field mapping.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Segment {
  segment_id: string;
  text: string;
  start_seconds: number;
  end_seconds: number;
}

interface QuizData {
  question: string;
  options: Record<string, string>;
  correct: string;
  avatar_clips: {
    question: string;
    correct: string;
    wrong: string;
    explanation: string;
  };
  explanation_visual?: {
    video_path?: string;
  };
}

interface Section {
  section_id: number;
  section_type: string;
  avatar_duration_seconds: number;
  understanding_quiz?: QuizData;
  narration: { segments: Segment[] };
}

interface PresentationData {
  sections: Section[];
}

type QuizPhase = 'question' | 'answering' | 'correct' | 'wrong' | 'explain';

interface QuizState {
  sectionId: number;
  quiz: QuizData;
  phase: QuizPhase;
  selectedAnswer?: string;
  resumeTime: number;
}

// ─── Quiz timestamp calculator ────────────────────────────────────────────────
// Quiz fires AFTER the section that contains it finishes playing.
// Cumulative sum of avatar_duration_seconds for all non-quiz sections.

function calculateQuizTimestamps(
  sections: Section[]
): Array<{ time: number; sectionId: number; quiz: QuizData }> {
  const timestamps: Array<{ time: number; sectionId: number; quiz: QuizData }> = [];
  let cumulative = 0;

  for (const section of sections) {
    if (section.section_type === 'quiz') continue;
    cumulative += section.avatar_duration_seconds;
    if (section.understanding_quiz) {
      timestamps.push({
        time: cumulative,
        sectionId: section.section_id,
        quiz: section.understanding_quiz,
      });
    }
  }

  return timestamps;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100vh',
    background: '#0d1117',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: 'JetBrains Mono, monospace',
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mainVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // Quiz full-screen overlay
  quizOverlay: {
    position: 'absolute',
    inset: 0,
    background: '#0d1117',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 60px',
  },
  quizAvatarVideo: {
    width: '100%',
    maxHeight: '40vh',
    objectFit: 'contain',
    marginBottom: 32,
  },
  questionText: {
    fontSize: 28,
    color: '#e6edf3',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 1.6,
    maxWidth: 800,
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    width: '100%',
    maxWidth: 800,
  },
  optionButton: {
    padding: '20px 24px',
    borderRadius: 12,
    border: '1px solid #30363d',
    background: '#161b22',
    color: '#e6edf3',
    fontSize: 20,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    fontFamily: 'JetBrains Mono, monospace',
    // Mobile: large tap target
    minHeight: 64,
  },
  progressBar: {
    height: 3,
    background: '#21262d',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    background: '#f0c040',
    transition: 'width 0.1s linear',
  },
};

// ─── Option button ─────────────────────────────────────────────────────────────

function OptionButton({
  letter,
  text,
  onClick,
  state,
}: {
  letter: string;
  text: string;
  onClick: () => void;
  state: 'default' | 'correct' | 'wrong' | 'disabled';
}) {
  const bgMap = {
    default: '#161b22',
    correct: '#0d3b1a',
    wrong: '#3b0d0d',
    disabled: '#0d1117',
  };
  const borderMap = {
    default: '#30363d',
    correct: '#3fb950',
    wrong: '#e24b4a',
    disabled: '#21262d',
  };
  const colorMap = {
    default: '#e6edf3',
    correct: '#3fb950',
    wrong: '#e24b4a',
    disabled: '#484f58',
  };

  return (
    <button
      onClick={state === 'default' ? onClick : undefined}
      style={{
        ...styles.optionButton,
        background: bgMap[state],
        border: `1px solid ${borderMap[state]}`,
        color: colorMap[state],
        cursor: state === 'default' ? 'pointer' : 'default',
      }}
    >
      <span style={{ color: '#f0c040', marginRight: 12 }}>{letter}.</span>
      {text}
    </button>
  );
}

// ─── Main player ──────────────────────────────────────────────────────────────

export function LessonPlayer({
  jobId,
  data,
  baseUrl = '',
}: {
  jobId: string;
  data: PresentationData;
  baseUrl?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const quizVideoRef = useRef<HTMLVideoElement>(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [triggeredQuizzes, setTriggeredQuizzes] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  const quizTimestamps = calculateQuizTimestamps(data.sections);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Asset URL helper
  const asset = (path: string) =>
    path ? `${baseUrl}/jobs/${jobId}/${path}` : '';

  // ── Video time watcher — triggers quiz at correct timestamps ──
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || quizState) return;

    const currentTime = video.currentTime;
    setProgress(currentTime);

    for (const qt of quizTimestamps) {
      if (
        currentTime >= qt.time - 0.3 &&
        !triggeredQuizzes.has(qt.sectionId)
      ) {
        // Pause video and start quiz
        video.pause();
        setTriggeredQuizzes((prev) => new Set([...prev, qt.sectionId]));
        setQuizState({
          sectionId: qt.sectionId,
          quiz: qt.quiz,
          phase: 'question',
          resumeTime: qt.time,
        });
        break;
      }
    }
  }, [quizState, quizTimestamps, triggeredQuizzes]);

  // ── Auto-play quiz avatar clip when phase changes ──
  useEffect(() => {
    if (!quizState || !quizVideoRef.current) return;

    const clipMap: Partial<Record<QuizPhase, string>> = {
      question: quizState.quiz.avatar_clips.question,
      correct: quizState.quiz.avatar_clips.correct,
      wrong: quizState.quiz.avatar_clips.wrong,
      explain: quizState.quiz.avatar_clips.explanation,
    };

    const clipPath = clipMap[quizState.phase];
    if (clipPath) {
      quizVideoRef.current.src = asset(clipPath);
      quizVideoRef.current.play().catch(() => {});
    }
  }, [quizState?.phase]);

  // ── Quiz video ended → advance to next phase ──
  const handleQuizVideoEnded = useCallback(() => {
    if (!quizState) return;

    setQuizState((prev) => {
      if (!prev) return null;
      switch (prev.phase) {
        case 'question':
          return { ...prev, phase: 'answering' };
        case 'correct':
        case 'wrong':
          return { ...prev, phase: 'explain' };
        case 'explain':
          // Resume main video
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.currentTime = prev.resumeTime;
              videoRef.current.play().catch(() => {});
            }
          }, 500);
          return null;
        default:
          return prev;
      }
    });
  }, [quizState]);

  // ── Student picks an answer ──
  const handleAnswer = useCallback(
    (letter: string) => {
      if (!quizState || quizState.phase !== 'answering') return;

      const isCorrect = letter === quizState.quiz.correct;
      setQuizState((prev) =>
        prev
          ? { ...prev, phase: isCorrect ? 'correct' : 'wrong', selectedAnswer: letter }
          : null
      );
    },
    [quizState]
  );

  // ── Render option button state ──
  function optionState(letter: string): 'default' | 'correct' | 'wrong' | 'disabled' {
    if (!quizState) return 'default';
    if (quizState.phase === 'answering') return 'default';
    if (letter === quizState.quiz.correct) return 'correct';
    if (letter === quizState.selectedAnswer) return 'wrong';
    return 'disabled';
  }

  // ── Progress bar ──
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div style={styles.container}>
      {/* Progress bar */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
      </div>

      {/* Main video area */}
      <div style={styles.videoWrapper}>
        {/* Main lesson video */}
        <video
          ref={videoRef}
          src={`${baseUrl}/jobs/${jobId}/output/full_lesson.mp4`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) =>
            setDuration((e.target as HTMLVideoElement).duration)
          }
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: quizState ? 'none' : 'block',
          }}
        />

        {/* ── QUIZ OVERLAY — full screen takeover ── */}
        {quizState && (
          <div style={styles.quizOverlay}>
            {/* Quiz avatar video */}
            <video
              ref={quizVideoRef}
              onEnded={handleQuizVideoEnded}
              playsInline
              style={styles.quizAvatarVideo}
            />

            {/* Question text — visible during answering */}
            {(quizState.phase === 'answering' ||
              quizState.phase === 'correct' ||
              quizState.phase === 'wrong') && (
              <>
                <div style={styles.questionText}>
                  {quizState.quiz.question}
                </div>

                {/* A/B/C/D options */}
                <div
                  style={{
                    ...styles.optionsGrid,
                    // Single column on small mobile
                    gridTemplateColumns:
                      window.innerWidth < 480 ? '1fr' : '1fr 1fr',
                  }}
                >
                  {Object.entries(quizState.quiz.options).map(([letter, text]) => (
                    <OptionButton
                      key={letter}
                      letter={letter}
                      text={text}
                      onClick={() => handleAnswer(letter)}
                      state={
                        quizState.phase === 'answering'
                          ? 'default'
                          : optionState(letter)
                      }
                    />
                  ))}
                </div>
              </>
            )}

            {/* Explanation phase: bg video behind, avatar right 30% */}
            {quizState.phase === 'explain' &&
              quizState.quiz.explanation_visual?.video_path && (
                <video
                  src={asset(quizState.quiz.explanation_visual.video_path)}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '70%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: -1,
                  }}
                />
              )}
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div
        style={{
          height: 56,
          background: '#161b22',
          borderTop: '1px solid #21262d',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 16,
        }}
      >
        {/* Play/Pause */}
        <button
          onClick={() => {
            const v = videoRef.current;
            if (!v || quizState) return;
            v.paused ? v.play() : v.pause();
          }}
          style={{
            background: 'none',
            border: '1px solid #30363d',
            borderRadius: 6,
            color: '#e6edf3',
            padding: '6px 16px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
          }}
        >
          {videoRef.current?.paused ? '▶ Play' : '⏸ Pause'}
        </button>

        {/* Time display */}
        <span style={{ color: '#8b949e', fontSize: 12 }}>
          {Math.floor(progress / 60)}:{String(Math.floor(progress % 60)).padStart(2, '0')}
          {' / '}
          {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
        </span>

        {/* Scrubber */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          step={0.1}
          onChange={(e) => {
            if (videoRef.current && !quizState) {
              videoRef.current.currentTime = Number(e.target.value);
            }
          }}
          style={{ flex: 1, accentColor: '#f0c040' }}
        />
      </div>
    </div>
  );
}

// ─── App entry point ──────────────────────────────────────────────────────────
// Loads presentation.json and mounts LessonPlayer.

export default function App() {
  const [data, setData] = useState<PresentationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read jobId from URL: ?job=abc123
  const jobId =
    new URLSearchParams(window.location.search).get('job') || '';

  useEffect(() => {
    if (!jobId) {
      setError('No job ID. Add ?job=YOUR_JOB_ID to the URL.');
      return;
    }
    fetch(`/jobs/${jobId}/presentation.json`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError('Could not load presentation.json'));
  }, [jobId]);

  if (error) {
    return (
      <div
        style={{
          background: '#0d1117',
          color: '#e24b4a',
          fontFamily: 'JetBrains Mono, monospace',
          padding: 40,
          minHeight: '100vh',
        }}
      >
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          background: '#0d1117',
          color: '#8b949e',
          fontFamily: 'JetBrains Mono, monospace',
          padding: 40,
          minHeight: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }

  return <LessonPlayer jobId={jobId} data={data} />;
}
