# V3 Lesson Video — Architecture & Build Plan

## Why This Document Exists

This document explains every decision made in the V3 video pipeline so that any AI agent
or developer can understand, debug, and extend the system without asking questions.
Read this before touching any code.

---

## The Problem We Are Solving

We generate educational lesson videos from a `presentation.json` file. Each lesson has:
- An AI avatar (weatherman style, green screen MP4)
- Background videos (WAN/LTX2 generated, Manim generated, or static images)
- Interactive quizzes that interrupt the video and resume after

The challenge: quizzes are interactive (student picks A/B/C/D) so they cannot be baked
into a static MP4. Everything else can be pre-rendered offline.

---

## Two-Part Architecture

```
PART 1 — SERVER (offline, runs once per job)
  Remotion renders all non-interactive content → MP4 files
  Python pipeline orchestrates everything

PART 2 — BROWSER (runs on student device)
  React player plays the MP4 files
  Handles quiz interaction
  Mobile responsive
```

---

## File Map

```
remotion-player/
├── ARCHITECTURE.md                    ← this file
├── render_pipeline.py                 ← Python orchestrator (entry point)
├── package.json                       ← Remotion + React deps
├── remotion.config.ts                 ← Remotion render settings
├── src/
│   ├── index.tsx                      ← Remotion composition registry
│   ├── compositions/
│   │   └── LessonVideo.tsx            ← Remotion: bakes all section MP4s
│   ├── components/
│   │   └── ChromaKeyVideo.tsx         ← Green screen removal (WebGL)
│   └── player/
│       └── LessonPlayer.tsx           ← React browser player + quiz
└── jobs/
    └── {job_id}/
        ├── presentation.json          ← single source of truth
        ├── avatars/                   ← green screen MP4s
        ├── videos/                    ← beat videos (WAN/LTX2/Manim)
        ├── images/                    ← static infographic PNGs
        └── output/
            ├── full_lesson.mp4        ← baked linear video (no quizzes)
            └── quiz/
                ├── quiz_3_question.mp4
                ├── quiz_3_correct.mp4
                ├── quiz_3_wrong.mp4
                ├── quiz_3_explain.mp4
                ├── quiz_4_question.mp4
                ├── quiz_4_correct.mp4
                ├── quiz_4_wrong.mp4
                └── quiz_4_explain.mp4
```

---

## presentation.json — Critical Field Mapping

**NEVER use `start_time` or `end_time`. They do not exist in this schema.**
**Always use `start_seconds` and `end_seconds`.**

### Avatar — SECTION LEVEL (not segment level)

```
section["avatar_video"]               → "avatars/section_1_avatar.mp4"
section["avatar_duration_seconds"]    → 19.97  (actual clip length in seconds)
```

The avatar is ONE clip per section. It covers the entire section duration.
There is no per-segment avatar. This was a critical bug in earlier code.

### Background videos — SECTION LEVEL

```
section["beat_video_paths"]           → ["videos/topic_3_beat_1.mp4", ...]
section["renderer"]                   → "image_to_video" | "none" | "infographic"
```

`beat_video_paths` is an ordered array. Index N matches narration segment N.
Each beat video plays during its segment's start_seconds → end_seconds window.

### Narration timing — SEGMENT LEVEL

```
section["narration"]["segments"][N]["start_seconds"]   → 0.0
section["narration"]["segments"][N]["end_seconds"]     → 15.0
section["narration"]["segments"][N]["text"]            → subtitle text
section["narration"]["segments"][N]["video_path"]      → "videos/topic_3_beat_N.mp4"
```

### Quiz — EMBEDDED in content sections

```
section["understanding_quiz"]["avatar_clips"]["question"]
section["understanding_quiz"]["avatar_clips"]["correct"]
section["understanding_quiz"]["avatar_clips"]["wrong"]
section["understanding_quiz"]["avatar_clips"]["explanation"]
section["understanding_quiz"]["explanation_visual"]["video_path"]
section["understanding_quiz"]["correct"]               → "B"
section["understanding_quiz"]["options"]               → { A: "...", B: "...", C: "...", D: "..." }
section["understanding_quiz"]["question"]              → question text
```

---

## Section Types — What Each One Does

| section_type       | renderer       | Has beat_video_paths | Has quiz | Layout |
|--------------------|----------------|----------------------|----------|--------|
| intro              | none           | NO                   | NO       | Avatar centred fullscreen |
| summary            | none           | NO                   | NO       | Bullets left 70%, avatar right 30% |
| content            | image_to_video | YES                  | YES      | Beat video left 70%, avatar right 30% |
| memory             | none           | NO                   | NO       | Flashcards left 70%, avatar right 30% |
| memory_infographic | infographic    | NO                   | NO       | Dark bg, text overlay, avatar right 30% |
| recap              | image_to_video | YES                  | NO       | Beat video fullscreen, avatar small bottom-right |

---

## Layout Rules

### Desktop (≥ 768px)

```
┌─────────────────────────────────┬──────────────┐
│                                 │              │
│   Background — 70%              │  Avatar 30%  │
│   beat video / text / cards     │  weatherman  │
│                                 │              │
│   Subtitles bottom-left         │              │
└─────────────────────────────────┴──────────────┘
```

**Exception — Intro**: Avatar centred, full frame, no split.
**Exception — Recap**: Background video fills full frame. Avatar sits as small overlay bottom-right.

### Mobile (< 768px)

Option B: Background video fills full screen. Avatar is a small overlay pinned bottom-right corner.
No side-by-side split on mobile. Everything stacks under the background.

```
┌─────────────────┐
│                 │
│   Background    │
│   full screen   │
│           ┌───┐ │
│           │Av │ │  ← avatar small overlay
│           └───┘ │
│ Subtitle        │
└─────────────────┘
```

---

## Green Screen Removal

Avatar clips are shot on a dark muted green (#216D3E), NOT standard bright green (#00FF00).

**Detection**: Sample pixel at coordinates (2, 2) from frame 0 of the avatar clip.
Check if green channel is dominant (G > R && G > B). This mirrors player_v3.html lines 1920–1923.

**Remotion**: `ChromaKeyVideo.tsx` handles this in the browser using WebGL canvas.
It samples pixel (2,2) to auto-detect the colour — same logic as the player.

**Parameters that match the player exactly**:
- similarity: 0.15
- smoothness: 0.00

---

## Quiz Flow (Full Screen Takeover)

```
full_lesson.mp4 playing...
        ↓
Reaches quiz timestamp (cumulative section end time)
        ↓
Video PAUSES
Quiz takes over FULL SCREEN
        ↓
Avatar plays quiz_N_question.mp4
        ↓
A/B/C/D buttons appear (large, thumb-friendly on mobile)
        ↓
Student taps answer
        ↓ 
IF correct:
  → play quiz_N_correct.mp4 (avatar celebrates)
  → play quiz_N_explain.mp4 (explanation + bg video)
IF wrong:
  → play quiz_N_wrong.mp4 (avatar corrects)
  → play quiz_N_explain.mp4 (explanation + bg video)
        ↓
Quiz ends → full_lesson.mp4 RESUMES from pause point
```

### Calculating Quiz Timestamps

Quiz timestamps in full_lesson.mp4 are cumulative sums of avatar_duration_seconds
for all sections that appear BEFORE the quiz point.

Example for this job:
```
section 1 (intro):   19.97s  → cumulative: 19.97
section 2 (summary): 38.12s  → cumulative: 58.09
section 3 (content): 103.37s → cumulative: 161.46 ← quiz_3 fires here
section 4 (content): 119.09s → cumulative: 280.55 ← quiz_4 fires here
section 5 (memory):  56.68s  → cumulative: 337.23
section 6 (meminfo): 24.43s  → cumulative: 361.66
section 7 (recap):   64.42s  → cumulative: 426.08
```

---

## Remotion Render Pipeline

The Python `render_pipeline.py` calls Remotion for each output file:

```bash
# Full lesson (all non-quiz sections)
npx remotion render src/index.tsx LessonVideo \
  --props '{"jobId":"abc123"}' \
  --output jobs/abc123/output/full_lesson.mp4

# Quiz clips (one per variant per quiz section)
npx remotion render src/index.tsx QuizClip \
  --props '{"jobId":"abc123","sectionId":3,"variant":"question"}' \
  --output jobs/abc123/output/quiz/quiz_3_question.mp4
```

---

## AI Correction Guide

If something is wrong, check in this order:

1. **Wrong field name** → check the field mapping table above
2. **Avatar not showing** → confirm you are reading `section.avatar_video` not `segment.avatar_file`
3. **Beat video wrong** → confirm you are reading `beat_video_paths[N]` not `seg.beat_videos`
4. **Wrong timing** → confirm you are using `start_seconds` / `end_seconds` not `start_time` / `end_time`
5. **Green screen visible** → confirm ChromaKeyVideo similarity=0.15 smoothness=0.00
6. **Quiz fires at wrong time** → recalculate cumulative timestamps from avatar_duration_seconds
7. **Mobile layout broken** → check breakpoint at 768px, avatar must be overlay not panel on mobile
