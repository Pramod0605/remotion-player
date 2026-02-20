# 🚀 Python Generator - Quick Start Guide

## What This Does

**Input**: `presentation.json` (your V2.5 data)  
**Output**: 21 individual `.tsx` files (one per section)  
**Each TSX file** → Renders to → **One complete video** with:
- ✅ Avatar (synced)
- ✅ Animations (focus text, bullets, flashcards)
- ✅ Audio (narration)
- ✅ Background videos (WAN/Manim)
- ✅ Deep space background

---

## Step-by-Step Usage

### 1. Run the Generator

```bash
python generate_remotion_sections.py presentation.json output-sections/
```

**Output**:
```
🎬 REMOTION SECTION GENERATOR - V2.5 Director Bible
======================================================================
📂 Input:  presentation.json
📂 Output: output-sections/
🎯 Job ID: f963fc1c
📊 Total Sections: 21
⏱️  Total Duration: 5148.6s
======================================================================

[ 1/21] Generating: Section_01_Intro        ( 25.4s) ✅
[ 2/21] Generating: Section_02_Summary      ( 23.9s) ✅
[ 3/21] Generating: Section_03_Content      (106.2s) ✅
...
[21/21] Generating: Section_21_Recap        (122.4s) ✅

📦 Generating shared components...
📦 Generating package.json...
📦 Generating render_all.sh...

✅ GENERATION COMPLETE!
```

---

### 2. Install Dependencies

```bash
cd output-sections/
npm install
```

---

### 3. Render Individual Sections

#### Option A: Render one section
```bash
npx remotion render Section_01_Intro.tsx out/section_01.mp4
```

**Preview first** (optional):
```bash
npx remotion preview Section_01_Intro.tsx
```

#### Option B: Render all sections at once
```bash
chmod +x render_all.sh
./render_all.sh
```

This will render:
- `out/section_01_intro.mp4`
- `out/section_02_summary.mp4`
- `out/section_03_content.mp4`
- ... (21 files total)

---

## Generated Files

```
output-sections/
├── Section_01_Intro.tsx          ← Avatar + fade-in
├── Section_02_Summary.tsx        ← Bullet list animation
├── Section_03_Content.tsx        ← Teach/Show pattern
├── Section_04_Content.tsx
├── ...
├── Section_20_Memory.tsx         ← Flashcard flips
├── Section_21_Recap.tsx          ← Cinematic full-screen
├── package.json
├── render_all.sh                 ← Batch render script
└── out/
    ├── section_01_intro.mp4      ← 25 seconds
    ├── section_02_summary.mp4    ← 24 seconds
    └── ...                       ← (21 videos)
```

---

## What Each Section Type Generates

### 1️⃣ Intro (Section 1)
- **Visual**: Avatar center-right, animated fade-in
- **Audio**: Narration synced
- **Duration**: ~25 seconds
- **Code**: Fully self-contained TSX file

### 2️⃣ Summary (Section 2)
- **Visual**: Bullet points with progressive reveal
- **Animation**: Focus text engine (active highlight)
- **Avatar**: Bottom-right
- **Duration**: ~24 seconds

### 3️⃣ Content (Sections 3-18)
- **Pattern**: Teach → Show
  - **Teach**: Avatar + text segments
  - **Show**: Full-screen video/Manim
- **Animation**: Focus text, smooth transitions
- **Duration**: 45-120 seconds each

### 4️⃣ Quiz (Section 19)
- **Pattern**: 3-step choreography
  - Question (15-20s)
  - Pause (3-5s)
  - Answer (15-20s)
- **Note**: Template provided, needs customization

### 5️⃣ Memory (Section 20)
- **Visual**: 5 flashcards with 3D flip
- **Animation**: RotateY 180° at midpoint
- **Duration**: ~80 seconds (5 cards × 20s each)

### 6️⃣ Recap (Section 21)
- **Visual**: Full-screen cinematic videos
- **Overlay**: Subtle text at bottom
- **Duration**: ~122 seconds

---

## Customization

Each `.tsx` file is **standalone and editable**. To customize:

1. Open the TSX file (e.g., `Section_03_Content.tsx`)
2. Edit animations, colors, layouts
3. Re-render just that section

Example customization:
```tsx
// In Section_03_Content.tsx
// Change text size
fontSize: 48  // was 28

// Change colors
color: '#00ff00'  // was 'white'

// Adjust timing
const fadeIn = interpolate(frame, [0, 60], [0, 1])  // slower fade
```

---

## Parallel Rendering (FAST!)

Render multiple sections simultaneously:

```bash
# Terminal 1
npx remotion render Section_01_Intro.tsx out/section_01.mp4 &

# Terminal 2
npx remotion render Section_02_Summary.tsx out/section_02.mp4 &

# Terminal 3
npx remotion render Section_03_Content.tsx out/section_03.mp4 &

# Wait for all to complete
wait
```

**With 8 CPU cores**: Render 8 sections at once = 8x faster!

---

## Quality Settings

### High Quality (slow)
```bash
npx remotion render Section_01_Intro.tsx out/section_01.mp4 \
  --codec h264 \
  --crf 15 \
  --audio-bitrate 320k
```

### Fast Preview (quick)
```bash
npx remotion render Section_01_Intro.tsx out/section_01.mp4 \
  --codec h264 \
  --crf 28 \
  --scale 0.5  # 960x540 resolution
```

### Balanced (recommended)
```bash
npx remotion render Section_01_Intro.tsx out/section_01.mp4 \
  --codec h264 \
  --crf 18 \
  --audio-bitrate 192k
```

---

## Troubleshooting

### Issue: "Cannot find module '/jobs/...'"
**Solution**: Copy your assets to the right location:
```bash
mkdir -p public/jobs/f963fc1c
cp -r /path/to/avatars public/jobs/f963fc1c/
cp -r /path/to/videos public/jobs/f963fc1c/
cp -r /path/to/audio public/jobs/f963fc1c/
```

### Issue: "Audio not playing in preview"
**Solution**: Click the play button in Remotion Studio (browser autoplay policy)

### Issue: Render is slow
**Solutions**:
- Use `--scale 0.5` for faster preview renders
- Use `--concurrency 4` to use more CPU cores
- Render multiple sections in parallel (see above)

---

## Combining Sections (Optional)

To stitch all sections into one long video:

```bash
# Create file list
for i in {01..21}; do
  echo "file 'section_${i}_*.mp4'" >> list.txt
done

# Concatenate with ffmpeg
ffmpeg -f concat -safe 0 -i list.txt -c copy full_lesson.mp4
```

---

## Next Steps

1. **Test with one section first**:
   ```bash
   npx remotion render Section_01_Intro.tsx out/test.mp4
   ```

2. **Verify output quality** (audio sync, animations)

3. **Customize as needed** (edit TSX files)

4. **Batch render all sections**:
   ```bash
   ./render_all.sh
   ```

5. **Distribute**:
   - Upload to YouTube
   - Share via Google Drive
   - Embed in LMS

---

## Benefits of This Approach

✅ **One section = One video** (easy to manage)  
✅ **Fully customizable** (edit any TSX file)  
✅ **Parallel rendering** (8x faster with 8 cores)  
✅ **Independent updates** (re-render only changed sections)  
✅ **Version controlled** (TSX files in Git)  
✅ **No manual work** (Python generates everything)

---

## Summary

```
presentation.json
       ↓
   python generate_remotion_sections.py
       ↓
   21 × .tsx files (one per section)
       ↓
   npx remotion render (per file)
       ↓
   21 × .mp4 videos (ready to use!)
```

**Total Time**: 
- Generation: ~5 seconds
- Rendering: ~2 hours for all 21 sections (or ~15 min with parallel rendering)

---

**Ready to generate? Run the command!** 🚀
