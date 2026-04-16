# 📚 Developer Handover Document

This document provides a complete guide for developers and AI agents joining the remotion-player project.

---

## 🎯 Project Overview

**remotion-player** is a Remotion-powered video player that renders AI-generated educational lesson videos with:
- Synchronized avatar narration (green screen removal)
- Multiple visual themes (V1 Modern, V2 Chalkboard)
- Interactive quizzes that interrupt video playback
- Mobile-responsive design

---

## 🛠️ Quick Start

### For Developers

```bash
# Clone the repo
git clone https://github.com/Pramod0605/remotion-player.git
cd remotion-player

# Install dependencies
npm install

# Install code-review-graph (for AI-assisted analysis)
pip install code-review-graph
code-review-graph install --platform opencode
code-review-graph build

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### For AI Agents (OpenCode, Claude Code, Cursor)

When you start working on this project:

1. **First, check the knowledge graph:**
   ```bash
   code-review-graph update
   ```

2. **Use graph tools for exploration** — see AGENTS.md for:
   - `semantic_search_nodes` — find code by name
   - `query_graph` — trace relationships
   - `get_impact_radius` — understand what might break

3. **Don't scan entire files** — use graph tools first, then Grep/Glob/Read only if needed

---

## 📦 Project Structure

```
remotion-player/
├── src/
│   ├── index.tsx                    # Remotion composition registry
│   ├── compositions/
│   │   └── LessonVideo.tsx          # Video rendering composition
│   ├── components/
│   │   └── ChromaKeyVideo.tsx       # Green screen removal
│   ├── player/
│   │   └── LessonPlayer.tsx         # Browser player with quiz
│   └── ...
├── jobs/                           # Job folders (presentation + media)
│   └── {job_id}/
│       ├── presentation.json
│       ├── avatars/
│       ├── videos/
│       └── images/
├── AGENTS.md                      # AI agent instructions
├── CLAUDE.md                      # AI tool configs
├── ARCHITECTURE.md                # Pipeline design decisions
└── README.md                     # Project docs
```

---

## 🔑 Key Concepts

### 1. presentation.json Schema

**Critical fields (NEVER use `start_time`/`end_time`):**
- `section.avatar_video` — path to green screen MP4 (one per section)
- `section.avatar_duration_seconds` — actual clip length
- `section.beat_video_paths` — array of background videos
- `segment.start_seconds` / `segment.end_seconds` — timing (NOT start_time/end_time)

### 2. Section Types

| Type | Layout |
|------|--------|
| `intro` | Avatar centered, fullscreen |
| `summary` | 70% bullets left, 30% avatar right |
| `content` | 70% beat video left, 30% avatar right |
| `memory` | 70% flashcards left, 30% avatar right |
| `memory_infographic` | Dark bg with text overlay |
| `recap` | Fullscreen video, small avatar bottom-right |

### 3. Green Screen

- **Color**: Dark muted green (#216D3E)
- **Detection**: Sample pixel at (2,2), check G > R && G > B
- **Remotion params**: similarity=0.20, smoothness=0.05

### 4. Quiz Flow

```
full_lesson.mp4 playing
    ↓
Reaches quiz timestamp (cumulative section end time)
    ↓
Video PAUSES, Quiz takes FULL SCREEN
    ↓
Student picks A/B/C/D
    ↓
Play correct/wrong avatar clip + explanation
    ↓
Resume full_lesson.mp4
```

---

## 🐛 Debugging Guide

### Video not showing?
1. Check `section.avatar_video` path exists in `jobs/{job_id}/avatars/`
2. Verify `section.avatar_duration_seconds` is set when rendering

### Green screen visible?
- Update ChromaKeyVideo similarity to 0.20, smoothness to 0.05

### Quiz fires at wrong time?
- Recalculate cumulative timestamps from `avatar_duration_seconds`

### Mobile layout broken?
- Check breakpoint at 768px — avatar must be overlay, not panel

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and setup |
| `AGENTS.md` | AI agent instructions + code-review-graph guide |
| `CLAUDE.md` | AI tool configurations |
| `ARCHITECTURE.md` | Pipeline design decisions |
| `HANDOVER.md` | This document |

---

## 🚀 Common Tasks

### Render a video (via Remotion)

```bash
# Render full lesson
npx remotion render src/index.tsx LessonVideo \
  --props '{"jobId":"YOUR_JOB_ID"}' \
  --output jobs/YOUR_JOB_ID/output/full_lesson.mp4

# Render quiz clip
npx remotion render src/index.tsx QuizClip \
  --props '{"jobId":"YOUR_JOB_ID","sectionId":3,"variant":"question"}' \
  --output jobs/YOUR_JOB_ID/output/quiz/quiz_3_question.mp4
```

### Update code-review-graph

```bash
# After pulling new code
code-review-graph update

# Or rebuild completely
code-review-graph build

# Visualize graph
code-review-graph visualize
```

### Add a new section type

1. Add type to `ARCHITECTURE.md` section types table
2. Create section component in `src/compositions/LessonVideo.tsx`
3. Update routing in main LessonVideo component

---

## 📞 Getting Help

1. **Check ARCHITECTURE.md** — full pipeline design
2. **Check AGENTS.md** — code-review-graph usage
3. **Run `code-review-graph visualize`** — interactive graph
4. **Run `code-review-graph detect-changes`** — analyze changes

---

## 🔄 After GitHub Commit

When you've committed code to GitHub:

### For You (Developer)

```bash
# Pull latest and update your local graph
git pull
code-review-graph update
```

### For Next Developer/AI Agent

The graph is **local** — they'll need to run:
```bash
code-review-graph update   # OR
code-review-graph build  # for full rebuild
```

---

*Last updated: 2026-04-16*
*Project: remotion-player*
*Repository: https://github.com/Pramod0605/remotion-player*