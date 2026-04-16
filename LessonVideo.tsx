/**
 * LessonVideo.tsx — Remotion Server-Side Renderer
 *
 * Renders all non-interactive sections of a lesson to MP4.
 * Quiz clips are rendered separately via the QuizClip composition.
 *
 * See ARCHITECTURE.md for full field mapping and design decisions.
 *
 * Key rules:
 * - Avatar is at SECTION level: section.avatar_video
 * - Background videos: section.beat_video_paths[N] per segment
 * - Timing: use start_seconds / end_seconds (NOT start_time / end_time)
 * - Green screen: ChromaKeyVideo handles removal (similarity=0.15, smoothness=0.00)
 * - Layout: 70/30 desktop. Fullscreen bg + avatar overlay on mobile.
 */

import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Img,
} from 'remotion';
import { ChromaKeyVideo } from '../components/ChromaKeyVideo';

const FPS = 30;
const BG_COLOR = '#0d1117';
const AVATAR_SIMILARITY = 0.15;
const AVATAR_SMOOTHNESS = 0.00;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Segment {
  segment_id: string;
  text: string;
  start_seconds: number;
  end_seconds: number;
  duration_seconds: number;
  video_path?: string;
}

interface VisualBeat {
  beat_id: string;
  display_text: string;
  start_seconds: number;
  end_seconds: number;
  visual_type: string;
  image_source?: string;
}

interface InfographicBeat {
  beat_id: string;
  segment_id: string;
  image_source?: string;
  start_seconds: number;
  end_seconds: number;
}

interface Flashcard {
  front: string;
  back: string;
}

interface Section {
  section_id: number;
  section_type: string;
  title: string;
  renderer: string;
  avatar_video: string;
  avatar_duration_seconds: number;
  beat_video_paths?: string[];
  visual_beats?: VisualBeat[];
  flashcards?: Flashcard[];
  narration: {
    segments: Segment[];
    total_duration_seconds: number;
  };
  render_spec?: {
    infographic_beats?: InfographicBeat[];
  };
}

interface LessonVideoProps {
  jobId: string;
  sections: Section[];
}

interface QuizClipProps {
  jobId: string;
  sectionId: number;
  variant: 'question' | 'correct' | 'wrong' | 'explain';
  section: Section;
}

// ─── Avatar component — used in all sections ──────────────────────────────────

function Avatar({
  jobId,
  avatarPath,
  style,
}: {
  jobId: string;
  avatarPath: string;
  style?: React.CSSProperties;
}) {
  return (
    <ChromaKeyVideo
      src={staticFile(`/jobs/${jobId}/${avatarPath}`)}
      similarity={AVATAR_SIMILARITY}
      smoothness={AVATAR_SMOOTHNESS}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}

// ─── Subtitle bar ─────────────────────────────────────────────────────────────

function SubtitleBar({ segments }: { segments: Segment[] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const current = segments.find(
    (s) => currentTime >= s.start_seconds && currentTime < s.end_seconds
  );

  if (!current?.text) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 60,
        right: 60,
        zIndex: 50,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          background: 'rgba(0,0,0,0.82)',
          padding: '12px 24px',
          borderRadius: 8,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 28,
          color: 'white',
          lineHeight: 1.5,
          maxWidth: '80%',
        }}
      >
        {current.text}
      </div>
    </div>
  );
}

// ─── SECTION: Intro ───────────────────────────────────────────────────────────
// Avatar centred fullscreen. Dark background. No left/right split.

function IntroSection({ section, jobId }: { section: Section; jobId: string }) {
  return (
    <AbsoluteFill style={{ background: BG_COLOR }}>
      {/* Avatar centred */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '55%',
          height: '80%',
        }}
      >
        <Avatar jobId={jobId} avatarPath={section.avatar_video} />
      </div>
      <SubtitleBar segments={section.narration.segments} />
    </AbsoluteFill>
  );
}

// ─── SECTION: Summary ─────────────────────────────────────────────────────────
// Left 70%: bullet points from visual_beats, revealed progressively.
// Right 30%: avatar weatherman.

function SummarySection({
  section,
  jobId,
}: {
  section: Section;
  jobId: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const beats = (section.visual_beats || []).filter(
    (b) => b.display_text && b.display_text !== '[Teacher Welcome]'
  );

  return (
    <AbsoluteFill style={{ background: BG_COLOR }}>
      {/* Left 70% — bullets */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '70%',
          height: '100%',
          padding: '80px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 36,
            fontWeight: 600,
            color: '#f0c040',
            marginBottom: 24,
          }}
        >
          {section.title}
        </div>

        {beats.map((beat, i) => {
          const isActive =
            currentTime >= beat.start_seconds && currentTime < beat.end_seconds;
          const hasAppeared = currentTime >= beat.start_seconds;
          const opacity = hasAppeared ? (isActive ? 1 : 0.4) : 0;
          const translateX = interpolate(
            frame,
            [Math.round(beat.start_seconds * fps), Math.round(beat.start_seconds * fps) + 20],
            [40, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${translateX}px)`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 30,
                color: isActive ? '#e6edf3' : '#8b949e',
                borderLeft: isActive ? '4px solid #60a5fa' : '4px solid #30363d',
                paddingLeft: 24,
              }}
            >
              {beat.display_text}
            </div>
          );
        })}
      </div>

      {/* Right 30% — avatar */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '30%',
          height: '100%',
        }}
      >
        <Avatar jobId={jobId} avatarPath={section.avatar_video} />
      </div>

      <SubtitleBar segments={section.narration.segments} />
    </AbsoluteFill>
  );
}

// ─── SECTION: Content ─────────────────────────────────────────────────────────
// Left 70%: beat_video_paths[N] switches per segment timing.
//           Infographic images overlay at their timestamps.
// Right 30%: avatar weatherman.

function ContentSection({
  section,
  jobId,
}: {
  section: Section;
  jobId: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const segments = section.narration.segments;
  const beatPaths = section.beat_video_paths || [];
  const infographicBeats = section.render_spec?.infographic_beats || [];

  // Find which segment is currently active
  const currentSegIdx = segments.findIndex(
    (s) => currentTime >= s.start_seconds && currentTime < s.end_seconds
  );
  const activeSegIdx = currentSegIdx >= 0 ? currentSegIdx : segments.length - 1;
  const currentBeatPath = beatPaths[activeSegIdx];

  // Check if an infographic should show at this timestamp
  const activeInfographic = infographicBeats.find(
    (b) =>
      b.image_source &&
      currentTime >= b.start_seconds &&
      currentTime < b.end_seconds
  );

  return (
    <AbsoluteFill style={{ background: BG_COLOR }}>
      {/* Left 70% — background content */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '70%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Beat video */}
        {currentBeatPath && (
          <OffthreadVideo
            src={staticFile(`/jobs/${jobId}/${currentBeatPath}`)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Infographic overlay — sits on top of beat video at specific timestamps */}
        {activeInfographic && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: BG_COLOR,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <Img
              src={staticFile(`/jobs/${jobId}/${activeInfographic.image_source}`)}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      {/* Right 30% — avatar */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '30%',
          height: '100%',
        }}
      >
        <Avatar jobId={jobId} avatarPath={section.avatar_video} />
      </div>

      <SubtitleBar segments={segments} />
    </AbsoluteFill>
  );
}

// ─── SECTION: Memory ──────────────────────────────────────────────────────────
// Left 70%: 3D flashcard flip animation. One card per narration segment.
// Right 30%: avatar.

function MemorySection({
  section,
  jobId,
}: {
  section: Section;
  jobId: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const segments = section.narration.segments;
  const flashcards = section.flashcards || [];

  // Find active card index
  const activeIdx = segments.findIndex(
    (s) => currentTime >= s.start_seconds && currentTime < s.end_seconds
  );
  const cardIdx = activeIdx >= 0 ? activeIdx : segments.length - 1;
  const card = flashcards[cardIdx] || flashcards[0];

  if (!card) return null;

  const seg = segments[cardIdx];
  if (!seg) return null;

  // Flip happens at the midpoint of the segment
  const segStartFrame = Math.round(seg.start_seconds * fps);
  const segEndFrame = Math.round(seg.end_seconds * fps);
  const segMidFrame = Math.round((seg.start_seconds + seg.end_seconds) / 2 * fps);

  const rotY = interpolate(
    frame,
    [segMidFrame - 10, segMidFrame + 10],
    [0, 180],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const showBack = rotY > 90;

  return (
    <AbsoluteFill style={{ background: BG_COLOR }}>
      {/* Left 70% — flashcard */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '70%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 700,
            height: 320,
            perspective: 1000,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transform: `rotateY(${rotY}deg)`,
              position: 'relative',
            }}
          >
            {/* Front */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #1e3a5f, #0c2340)',
                borderRadius: 20,
                border: '1px solid #30363d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
              }}
            >
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 36,
                  fontWeight: 600,
                  color: '#f0c040',
                  textAlign: 'center',
                }}
              >
                {card.front}
              </div>
            </div>

            {/* Back */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(135deg, #1a3a2a, #0c2018)',
                borderRadius: 20,
                border: '1px solid #30363d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
              }}
            >
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 30,
                  color: '#3fb950',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                {card.back}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right 30% — avatar */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '30%',
          height: '100%',
        }}
      >
        <Avatar jobId={jobId} avatarPath={section.avatar_video} />
      </div>

      <SubtitleBar segments={segments} />
    </AbsoluteFill>
  );
}

// ─── SECTION: Memory Infographic ─────────────────────────────────────────────
// Dark bg, narration text overlay, avatar right 30%.
// No generated image file exists for this job — fallback to text.

function MemoryInfoSection({
  section,
  jobId,
}: {
  section: Section;
  jobId: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const segments = section.narration.segments;
  const current = segments.find(
    (s) => currentTime >= s.start_seconds && currentTime < s.end_seconds
  );

  return (
    <AbsoluteFill style={{ background: BG_COLOR }}>
      {/* Left 70% — text description */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '70%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
        }}
      >
        {current && (
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 28,
              color: '#e6edf3',
              lineHeight: 1.7,
              textAlign: 'center',
            }}
          >
            {current.text}
          </div>
        )}
      </div>

      {/* Right 30% — avatar */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '30%',
          height: '100%',
        }}
      >
        <Avatar jobId={jobId} avatarPath={section.avatar_video} />
      </div>

      <SubtitleBar segments={segments} />
    </AbsoluteFill>
  );
}

// ─── SECTION: Recap ───────────────────────────────────────────────────────────
// Background video fullscreen. Avatar small overlay bottom-right.

function RecapSection({
  section,
  jobId,
}: {
  section: Section;
  jobId: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const segments = section.narration.segments;
  const beatPaths = section.beat_video_paths || [];

  const activeIdx = segments.findIndex(
    (s) => currentTime >= s.start_seconds && currentTime < s.end_seconds
  );
  const idx = activeIdx >= 0 ? activeIdx : segments.length - 1;
  const currentBeatPath = beatPaths[idx];

  return (
    <AbsoluteFill style={{ background: BG_COLOR }}>
      {/* Full screen background video */}
      {currentBeatPath && (
        <OffthreadVideo
          src={staticFile(`/jobs/${jobId}/${currentBeatPath}`)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Avatar — small overlay bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          right: 40,
          width: '22%',
          height: '35%',
          zIndex: 20,
        }}
      >
        <Avatar jobId={jobId} avatarPath={section.avatar_video} />
      </div>

      <SubtitleBar segments={segments} />
    </AbsoluteFill>
  );
}

// ─── SECTION: Quiz Clip (baked avatar clips) ──────────────────────────────────
// Used by QuizClip composition to render question/correct/wrong/explain clips.

export function QuizClipRenderer({
  section,
  jobId,
  variant,
}: {
  section: Section;
  jobId: string;
  variant: 'question' | 'correct' | 'wrong' | 'explain';
}) {
  const uq = (section as any).understanding_quiz;
  if (!uq) return <AbsoluteFill style={{ background: BG_COLOR }} />;

  const avatarPath = uq.avatar_clips?.[variant === 'explain' ? 'explanation' : variant];
  const bgVideoPath =
    variant === 'explain' ? uq.explanation_visual?.video_path : null;

  return (
    <AbsoluteFill style={{ background: BG_COLOR }}>
      {/* Background video for explanation variant */}
      {bgVideoPath && (
        <OffthreadVideo
          src={staticFile(`/jobs/${jobId}/${bgVideoPath}`)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Avatar — centred for question/correct/wrong, right 30% for explain */}
      {avatarPath && (
        <div
          style={
            variant === 'explain'
              ? {
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '30%',
                  height: '100%',
                  zIndex: 20,
                }
              : {
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '50%',
                  height: '70%',
                  zIndex: 20,
                }
          }
        >
          <Avatar jobId={jobId} avatarPath={avatarPath} />
        </div>
      )}
    </AbsoluteFill>
  );
}

// ─── Section router ───────────────────────────────────────────────────────────

function SectionRenderer({
  section,
  jobId,
}: {
  section: Section;
  jobId: string;
}) {
  switch (section.section_type) {
    case 'intro':
      return <IntroSection section={section} jobId={jobId} />;
    case 'summary':
      return <SummarySection section={section} jobId={jobId} />;
    case 'content':
    case 'example':
      return <ContentSection section={section} jobId={jobId} />;
    case 'memory':
      return <MemorySection section={section} jobId={jobId} />;
    case 'memory_infographic':
      return <MemoryInfoSection section={section} jobId={jobId} />;
    case 'recap':
      return <RecapSection section={section} jobId={jobId} />;
    default:
      return <AbsoluteFill style={{ background: BG_COLOR }} />;
  }
}

// ─── Main composition ─────────────────────────────────────────────────────────

export const LessonVideo: React.FC<LessonVideoProps> = ({ jobId, sections }) => {
  // Filter out standalone quiz sections — they are handled separately
  const linearSections = sections.filter(
    (s) => s.section_type !== 'quiz' && s.avatar_duration_seconds > 0
  );

  return (
    <Series>
      {linearSections.map((section) => (
        <Series.Sequence
          key={section.section_id}
          durationInFrames={Math.round(section.avatar_duration_seconds * FPS)}
          name={`§${section.section_id} ${section.section_type}`}
        >
          <SectionRenderer section={section} jobId={jobId} />
        </Series.Sequence>
      ))}
    </Series>
  );
};

// ─── Quiz clip composition ────────────────────────────────────────────────────

export const QuizClip: React.FC<QuizClipProps> = ({
  jobId,
  sectionId,
  variant,
  section,
}) => {
  return (
    <QuizClipRenderer section={section} jobId={jobId} variant={variant} />
  );
};
