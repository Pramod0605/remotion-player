# 🎬 Remotion Player — Dynamic AI Presentation Engine

A **Remotion-powered** video player that renders AI-generated presentations with synchronized avatar narration, animated text, and two distinct visual themes.

## ✨ Features

### 🎨 V1 — Modern Theme
- Gradient backgrounds with glassmorphism cards
- 8 configurable text animations (typewriter, word bounce, karaoke, slide up, scale pop, letter cascade, etc.)
- Particle effects and smooth spring transitions

### 📝 V2 — Chalkboard Theme
- Realistic green chalkboard with wood frame, chalk dust, and chalk tray
- **SVG chalk handwriting animation** — each letter draws stroke-by-stroke using `stroke-dashoffset`
- Hand-drawn jitter for authentic feel
- Videos and images render inside the chalkboard panel
- All section types (intro, summary, content, memory, recap) unified in one renderer

### 🧑‍🏫 Avatar Integration
- Synchronized avatar video playback with chroma key (green screen removal)
- Configurable size and position via Dev Mode
- Avatar audio drives section timing

### 🛠️ Dev Mode (Press `D`)
- **Player Theme Toggle** — switch between V1 Modern and V2 Chalkboard in real-time
- **Text Animation Presets** — 8 animation modes with speed control
- **Font Settings** — size, weight, line height, color
- **Avatar Positioning** — width, height, offset controls
- All settings persist via `localStorage`

---

## 📦 Project Structure

```
src/
├── components/
│   ├── ChalkText.tsx         # SVG chalk animation engine (V2)
│   ├── ChalkboardLayout.tsx  # Board + avatar layout (V2)
│   ├── ChromaKeyVideo.tsx    # Green screen removal
│   ├── SectionRenderer.tsx   # V1/V2 routing
│   ├── DevConfig.tsx         # Settings state + context
│   ├── DevPanel.tsx          # Floating config UI
│   └── AnimatedText.tsx      # 8-mode text animation (V1)
├── sections/
│   ├── ChalkboardSection.tsx # Unified V2 renderer
│   ├── IntroSection.tsx      # V1 intro
│   ├── SummarySection.tsx    # V1 summary
│   ├── ContentSection.tsx    # V1 content/example
│   ├── MemorySection.tsx     # V1 memory/quiz
│   └── RecapSection.tsx      # V1 recap
├── types.ts                  # TypeScript interfaces
├── App.tsx                   # Main application
└── tests/                    # Unit tests
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run
```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build
```bash
npm run build
```

### Test
```bash
npx vitest run
```

---

## 🎯 How It Works

1. **Data Source**: Loads `presentation.json` from a job directory containing sections, segments, avatar videos, and beat videos
2. **Timing Engine**: Avatar MP4 duration is the source of truth — segments are timed to match narration
3. **Rendering**: `SectionRenderer` checks `playerVersion` in DevConfig:
   - `v1` → Routes to individual section components (IntroSection, SummarySection, etc.)
   - `v2` → Routes ALL sections to `ChalkboardSection` which renders inside `ChalkboardLayout`
4. **Animation**: V1 uses spring-based text animations; V2 uses SVG stroke-dashoffset chalk drawing

---

## 📋 Section Types

| Type | V1 Rendering | V2 Rendering |
|------|-------------|-------------|
| `intro` | Gradient + particles + animated title | Avatar centered with chalk text overlay (no board) |
| `summary` | Bullet list with spring reveals | Progressive chalk bullets |
| `content` | Teach (text) / Show (video/image) | Text on board; **video fullscreen** with avatar behind |
| `memory` | 3D flip flashcards | Chalk Q&A with fade-flip |
| `recap` | Video with animated subtitles | **Video fullscreen** or text on board |

---

## 🐳 Docker Deployment

The player runs as a **microservice** inside Docker. Jobs are mounted as volumes.

### Production

```bash
# Build and run
docker compose --profile prod up --build -d

# Access at http://localhost:3000/?job=YOUR_JOB_ID
```

### Development (Hot Reload)

```bash
# Runs Vite dev server inside Docker with HMR
docker compose --profile dev up --build

# Access at http://localhost:5173/?job=YOUR_JOB_ID
# Edit src/ files — changes reflect instantly
```

### Server Deployment

On your server (e.g. `/ai-presentation-server/player/jobs/{job-id}`):

```yaml
# docker-compose.override.yml
services:
  remotion-player:
    volumes:
      - /ai-presentation-server/player/jobs:/app/jobs
```

The container always serves jobs at `http://host:3000/jobs/{job-id}/*` regardless of the host path.

### API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check — `{"status":"ok"}` |
| `GET /api/jobs` | List available jobs with `presentation.json` |
| `GET /?job=ID` | Load player with specific job |

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `JOBS_DIR` | `/app/jobs` | Path to jobs directory inside container |

---

## 🔧 Tech Stack

- **React 19** + **TypeScript**
- **Remotion** — frame-accurate video composition
- **Vite** — dev server and build
- **Express** — production server (Docker)
- **Vitest** — unit testing

---

## 📄 License

MIT
