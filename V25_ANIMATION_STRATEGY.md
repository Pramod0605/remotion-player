# 🎬 V2.5 ANIMATION STRATEGY - Complete Guide

## 📋 SECTION-BY-SECTION ANIMATION PLAN

Based on V2.5 Director Bible + Your Requirements

---

## 1. INTRO ✨

### V2.5 Bible:
- **Visuals:** AVATAR ONLY (Clean Start)
- **Duration:** 25-30 seconds
- **Purpose:** Establish teacher persona

### Animation Strategy:
```
Avatar: Gentle fade in + subtle float
Subtitle: Fade in word-by-word sync with narration
```

### Implementation:
```tsx
// Avatar entrance
const avatarOp = spring({
  frame: f,
  config: { damping: 20, stiffness: 100 }  // Gentle, not bouncy
});

// Floating effect
const float = Math.sin((f / 30) * Math.PI * 0.5) * 5;

// Subtitle word-by-word reveal
const words = narration.split(' ');
words.map((word, i) => {
  const wordStart = i * 3; // 0.1s per word
  const opacity = interpolate(f, [wordStart, wordStart + 10], [0, 1]);
  return <span style={{ opacity }}>{word} </span>;
});
```

**Effect:** Professional, welcoming, calm

---

## 2. SUMMARY 💫 ← YOUR FAVORITE!

### V2.5 Bible:
- **Visuals:** Bullet Points (Text)
- **Timing:** 5-10 seconds per bullet
- **Purpose:** List key learning objectives

### Animation Strategy (BOUNCY!):
```
Title: Elastic bounce in
Bullets: 
  1. Stagger one-by-one (synced to narration timing!)
  2. Bounce in from left
  3. Active bullet scales up + highlights
  4. Previous bullets fade to 40% opacity
```

### Implementation:
```tsx
// Use actual visual_beats timing from presentation.json
visual_beats.map((beat, i) => {
  const startFrame = beat.start_time * fps;
  const endFrame = beat.end_time * fps;
  const isActive = f >= startFrame && f < endFrame;
  
  // Bouncy entrance
  const scale = spring({
    frame: f - startFrame,
    config: { damping: 12, stiffness: 150 }  // BOUNCY!
  });
  
  // Slide from left
  const translateX = interpolate(f - startFrame, [0, 20], [-100, 0]);
  
  // Rotation for fun
  const rotate = interpolate(scale, [0, 1], [8, 0]);
  
  // Active highlight
  const activeScale = isActive ? 1.08 : 1;
  const opacity = isActive ? 1 : (f > endFrame ? 0.4 : scale);
  
  return (
    <div style={{
      transform: `translateX(${translateX}px) scale(${scale * activeScale}) rotate(${rotate}deg)`,
      opacity,
      borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
      background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
      fontSize: isActive ? 38 : 36,
      color: isActive ? 'white' : '#94a3b8'
    }}>
      💫 {beat.display_text}
    </div>
  );
});
```

**Effect:** Engaging, fun, memorable!

---

## 3. CONTENT 📖 ← MOST COMPLEX!

### V2.5 Bible:
- **Pattern:** Teach → Then Show (Strict!)
- **Teach Mode:** Text/Diagrams (visual_beats)
- **Show Mode:** Video/Manim (full screen)
- **Timing:** Synced to narration segments

### Animation Strategy:

#### **A) TEACH MODE (Text/LaTeX/Tables/Images):**
```
Each visual_beat reveals based on segment timing:
  - Fade in + gentle scale (0.95 → 1.0)
  - Active beat has glow effect
  - Previous beats stay visible but dimmed
```

#### **B) SHOW MODE (Videos):**
```
Video entrance:
  - Fade from black
  - Scale from 0.9 → 1.0 (zoom in)
  - Rounded corners (16px)
  - Subtle shadow
```

### Implementation:

```tsx
// TEACH MODE - Visual Beats Reveal
segments.map((seg, segIdx) => {
  if (seg.display_directives.text_layer === 'show') {
    // Find matching visual beat
    const beat = visual_beats.find(b => b.segment_id === seg.segment_id);
    
    const segStart = getSegmentStartFrame(segIdx);
    const segEnd = segStart + (seg.duration_seconds * fps);
    const isActive = f >= segStart && f < segEnd;
    
    // Reveal animation
    const revealProgress = interpolate(
      f - segStart,
      [0, 15],  // 0.5s reveal
      [0, 1],
      { extrapolateRight: 'clamp' }
    );
    
    // Entry effects
    const opacity = revealProgress;
    const scale = interpolate(revealProgress, [0, 1], [0.95, 1]);
    const translateY = interpolate(revealProgress, [0, 1], [20, 0]);
    
    // Active glow
    const activeScale = isActive ? 1.02 : 1;
    const glowStrength = isActive ? 1 : 0;
    
    return (
      <div style={{
        opacity: opacity * (isActive ? 1 : 0.5),  // Dim when not active
        transform: `translateY(${translateY}px) scale(${scale * activeScale})`,
        padding: 20,
        borderLeft: `4px solid ${isActive ? '#3b82f6' : 'transparent'}`,
        background: isActive ? 'rgba(59,130,246,0.05)' : 'transparent',
        boxShadow: `0 0 ${glowStrength * 30}px rgba(59,130,246,0.3)`,
        borderRadius: 8,
        marginBottom: 20
      }}>
        {/* Handle different content types */}
        {beat.visual_type === 'text' && <Text>{beat.display_text}</Text>}
        {beat.visual_type === 'latex' && <LaTeX>{beat.display_text}</LaTeX>}
        {beat.visual_type === 'table' && <Table data={beat.table_data} />}
        {beat.visual_type === 'image' && <Image src={beat.image_path} />}
      </div>
    );
  }
});

// SHOW MODE - Video Display
segments.map((seg, segIdx) => {
  if (seg.display_directives.visual_layer === 'show' && seg.beat_videos.length > 0) {
    const segStart = getSegmentStartFrame(segIdx);
    const videoEntranceProgress = interpolate(
      f - segStart,
      [0, 20],  // 0.67s entrance
      [0, 1],
      { extrapolateRight: 'clamp' }
    );
    
    const scale = interpolate(videoEntranceProgress, [0, 1], [0.9, 1]);
    const opacity = videoEntranceProgress;
    
    return (
      <div style={{
        position: 'absolute',
        inset: '5%',  // Padding around edges
        opacity,
        transform: `scale(${scale})`,
        borderRadius: 16,  // Rounded corners!
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <OffthreadVideo src={seg.beat_videos[0]} />
      </div>
    );
  }
});
```

**Effect:** 
- Teach: Focused, clear, progressive reveal
- Show: Cinematic, immersive, professional

---

## 4. EXAMPLE 🎯

### V2.5 Bible:
- **Structure:** Similar to Content but step-focused
- **Purpose:** Deep-dive walkthrough

### Animation Strategy:
```
Same as Content but with step numbers:
  - Each step bounces in
  - Step number has circular badge
  - Previous steps stay visible but faded
```

### Implementation:
```tsx
steps.map((step, i) => {
  const stepStart = step.start_time * fps;
  const isActive = f >= stepStart;
  
  // Step badge bounce
  const badgeScale = spring({
    frame: f - stepStart,
    config: { damping: 10, stiffness: 200 }
  });
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
      {/* Step badge */}
      <div style={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        transform: `scale(${badgeScale})`,
        opacity: badgeScale
      }}>
        {i + 1}
      </div>
      
      {/* Step content */}
      <div style={{ flex: 1, opacity: isActive ? 1 : 0.3 }}>
        {step.display_text}
      </div>
    </div>
  );
});
```

**Effect:** Clear progression, engaging, educational

---

## 5. QUIZ ❓

### V2.5 Bible:
- **3-Step Choreography:**
  1. Introduce: Show question + options (15-20s)
  2. Pause: Thinking time (3-5s)
  3. Reveal: Highlight correct + explain (15-20s)

### Animation Strategy:
```
Phase 1 (Introduce):
  - Question fades in from top
  - Options bounce in one-by-one (stagger)

Phase 2 (Pause):
  - All options pulse gently
  - "Think about it..." text fades in

Phase 3 (Reveal):
  - Incorrect options fade to gray + cross-out
  - Correct option: Green glow + checkmark bounce
  - Explanation slides up from bottom
```

### Implementation:
```tsx
const phase = f < 450 ? 'intro' : f < 570 ? 'pause' : 'reveal';

// Question
<div style={{
  opacity: interpolate(f, [0, 20], [0, 1]),
  transform: `translateY(${interpolate(f, [0, 20], [-30, 0])}px)`
}}>
  {question.text}
</div>

// Options
{options.map((opt, i) => {
  const delay = 30 + (i * 10);
  const bounceScale = spring({
    frame: f - delay,
    config: { damping: 12, stiffness: 150 }
  });
  
  const isCorrect = opt.id === correctAnswer;
  const isRevealed = phase === 'reveal';
  
  // Pulse during pause
  const pulse = phase === 'pause' ? 1 + Math.sin((f / 15) * Math.PI) * 0.05 : 1;
  
  return (
    <div style={{
      transform: `scale(${bounceScale * pulse})`,
      opacity: isRevealed && !isCorrect ? 0.4 : 1,
      background: isRevealed && isCorrect ? '#10b981' : '#374151',
      borderColor: isRevealed && isCorrect ? '#10b981' : 'transparent',
      borderWidth: 3,
      textDecoration: isRevealed && !isCorrect ? 'line-through' : 'none'
    }}>
      {isRevealed && isCorrect && '✅ '}
      {isRevealed && !isCorrect && '❌ '}
      {opt.text}
    </div>
  );
})}

// Thinking prompt (pause phase)
{phase === 'pause' && (
  <div style={{
    opacity: interpolate(f - 450, [0, 20], [0, 1]),
    fontSize: 32,
    color: '#fbbf24'
  }}>
    🤔 Think about it...
  </div>
)}

// Explanation (reveal phase)
{phase === 'reveal' && (
  <div style={{
    opacity: interpolate(f - 570, [0, 20], [0, 1]),
    transform: `translateY(${interpolate(f - 570, [0, 20], [30, 0])}px)`
  }}>
    {explanation}
  </div>
)}
```

**Effect:** Engaging, interactive, clear feedback

---

## 6. MEMORY 💳

### V2.5 Bible:
- **Structure:** Flashcard flip
- **Count:** 5 items
- **Behavior:** Front → Pause → Back flips

### Animation Strategy:
```
3D card flip animation:
  - Front shows (2s)
  - Pause (1s)
  - Card flips 180° with perspective (1s)
  - Back shows (2s)
  - Repeat for next card
```

### Implementation:
```tsx
const cards = [
  { front: "SOH CAH TOA", back: "Sine = Opposite/Hypotenuse..." },
  // ... 4 more
];

const cardDuration = 6 * fps; // 6 seconds per card
const currentCardIndex = Math.floor(f / cardDuration) % 5;
const cardFrame = f % cardDuration;

// Flip happens at frame 90 (3 seconds in)
const flipProgress = interpolate(
  cardFrame,
  [90, 120],  // 1 second flip
  [0, 180],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);

return (
  <div style={{
    perspective: '1000px',
    width: 600,
    height: 400
  }}>
    <div style={{
      width: '100%',
      height: '100%',
      transformStyle: 'preserve-3d',
      transform: `rotateY(${flipProgress}deg)`,
      transition: 'transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)'  // Bouncy flip!
    }}>
      {/* Front */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white'
      }}>
        {cards[currentCardIndex].front}
      </div>
      
      {/* Back */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        background: 'linear-gradient(135deg, #f093fb, #f5576c)',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        color: 'white',
        padding: 40
      }}>
        {cards[currentCardIndex].back}
      </div>
    </div>
  </div>
);
```

**Effect:** Fun, memorable, satisfying flip!

---

## 7. RECAP 🎬

### V2.5 Bible:
- **Visuals:** FULL SCREEN VIDEO
- **Count:** 5 segments
- **Purpose:** Emotional closure

### Animation Strategy:
```
Each video segment:
  - Cross-fade transition between videos
  - Text overlay fades in/out with video
  - Cinematic feel with subtle vignette
```

### Implementation:
```tsx
const videos = recap.segments;
const currentVideoIndex = getCurrentSegmentIndex(f);
const currentVideo = videos[currentVideoIndex];

// Transition between videos
const transitionProgress = getTransitionProgress(f);

return (
  <>
    {/* Current video */}
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: 1 - transitionProgress,
      borderRadius: 12,
      overflow: 'hidden'
    }}>
      <OffthreadVideo src={currentVideo.beat_videos[0]} />
      
      {/* Vignette overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.4))',
        pointerEvents: 'none'
      }} />
    </div>
    
    {/* Next video (during transition) */}
    {transitionProgress > 0 && (
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: transitionProgress
      }}>
        <OffthreadVideo src={videos[currentVideoIndex + 1]?.beat_videos[0]} />
      </div>
    )}
    
    {/* Text overlay */}
    <div style={{
      position: 'absolute',
      bottom: 60,
      left: 60,
      right: 60,
      opacity: 1 - transitionProgress,
      background: 'rgba(0,0,0,0.8)',
      padding: '20px 30px',
      borderRadius: 12,
      backdropFilter: 'blur(10px)'
    }}>
      <p style={{ fontSize: 28, color: 'white', margin: 0 }}>
        {currentVideo.narration}
      </p>
    </div>
  </>
);
```

**Effect:** Cinematic, emotional, professional

---

## 🎯 TIMING SYNC STRATEGY

### Key Principle: **Everything syncs to narration.segments timing!**

```tsx
// Helper function to get segment timing
const getSegmentStartFrame = (segmentIndex, segments) => {
  let cumulative = 0;
  for (let i = 0; i < segmentIndex; i++) {
    cumulative += segments[i].duration_seconds;
  }
  return cumulative * fps;
};

// Usage in any section
segments.map((seg, i) => {
  const startFrame = getSegmentStartFrame(i, segments);
  const endFrame = startFrame + (seg.duration_seconds * fps);
  const isActive = frame >= startFrame && frame < endFrame;
  
  // Animation happens during active window
  if (isActive) {
    // Show this content with entrance animation
  }
});
```

---

## 📊 ANIMATION INTENSITY BY SECTION:

| Section | Bounce Level | Speed | Purpose |
|---------|--------------|-------|---------|
| Intro | Low (damping: 20) | Slow | Professional, welcoming |
| Summary | **HIGH (damping: 10)** | Fast | **Engaging, fun** |
| Content | Medium (damping: 15) | Medium | Clear, focused |
| Example | Medium (damping: 12) | Medium | Educational |
| Quiz | High (damping: 10) | Variable | Interactive |
| Memory | High (3D flip) | Fast | Memorable |
| Recap | Low (crossfade) | Slow | Cinematic |

---

## 🚀 IMPLEMENTATION PLAN:

### Phase 1: Core Animations (1 hour)
- ✅ Spring helper functions
- ✅ Timing calculation utilities
- ✅ Easing functions library

### Phase 2: Section Generators (3 hours)
- ✅ Summary with bouncy bullets
- ✅ Content with reveal animations
- ✅ Quiz with 3-phase choreography
- ✅ Memory with 3D flip
- ✅ Recap with crossfades

### Phase 3: Polish (1 hour)
- ✅ Adjust damping/stiffness values
- ✅ Test with actual presentation.json
- ✅ Fine-tune timing sync

**Total: ~5 hours** for complete implementation

---

## ✅ FINAL CHECKLIST:

- ✅ All animations sync to narration timing
- ✅ Bouncy where appropriate (Summary, Quiz, Memory)
- ✅ Subtle where needed (Intro, Content, Recap)
- ✅ Rounded corners on videos (16px)
- ✅ Fade in/out transitions
- ✅ Active element highlighting
- ✅ 3D effects for Memory
- ✅ Progressive reveal for Content
- ✅ Stagger effects for lists
- ✅ Professional + engaging balance

**Ready to build?** 🚀
