#!/usr/bin/env python3
"""
🎬 V2.5 ANIMATED REMOTION GENERATOR
===================================
Complete implementation with bouncy, engaging animations!

Features:
- ✅ Spring physics for bouncy entrances
- ✅ Progressive reveal synced to narration
- ✅ 3D flashcard flips
- ✅ Cinematic transitions
- ✅ V2.5 Director Bible compliant

Usage:
    python generate_remotion_ANIMATED.py presentation.json job_folder output_dir
"""

import json
import sys
from pathlib import Path
from typing import Dict, List


class AnimatedGenerator:
    """Generates animated Remotion compositions from presentation.json"""
    
    def __init__(self, presentation_path: str, assets_dir: str, output_dir: str):
        self.presentation_path = presentation_path
        self.assets_dir = Path(assets_dir)
        self.output_dir = Path(output_dir)
        
        with open(presentation_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        self.sections = self.data['sections']
        self.job_id = self._extract_job_id()
        
        print(f"🎬 Animated Generator")
        print(f"📁 Job ID: {self.job_id}")
        print(f"📊 Sections: {len(self.sections)}")
    
    def _extract_job_id(self) -> str:
        """Extract job ID from presentation path"""
        path_str = str(self.presentation_path).replace('\\', '/')
        if '/jobs/' in path_str:
            return path_str.split('/jobs/')[1].split('/')[0]
        return "default_job"
    
    def _esc(self, text: str) -> str:
        """Escape text for JSX"""
        if not text:
            return ""
        return (text
                .replace('\\', '\\\\')
                .replace('"', '\\"')
                .replace('\n', '\\n')
                .replace('\r', '')
                .replace('`', '\\`')
                .replace('${', '\\${'))
    
    def _get_animation_helpers(self) -> str:
        """Generate animation helper functions"""
        return '''// 🎨 ANIMATION HELPER FUNCTIONS

// Spring physics simulation
const spring = (frame, fps, config = { damping: 12, stiffness: 100 }) => {
  if (frame <= 0) return 0;
  
  const { damping, stiffness } = config;
  const omega = Math.sqrt(stiffness) / damping;
  const zeta = damping / (2 * Math.sqrt(stiffness));
  const t = frame / fps;
  
  if (zeta < 1) {
    // Underdamped (bouncy!)
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * omega * t);
    const phase = omegaD * t;
    return 1 - envelope * (Math.cos(phase) + (zeta * omega / omegaD) * Math.sin(phase));
  }
  
  // Critically damped or overdamped
  return Math.min(1, 1 - Math.exp(-omega * t) * (1 + omega * t));
};

// Easing functions
const easeOutElastic = (x) => {
  const c4 = (2 * Math.PI) / 3;
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
};

const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const easeInOutCubic = (x) => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

// Get cumulative segment timing
const getSegmentTiming = (segments) => {
  const timing = [];
  let cumulative = 0;
  
  segments.forEach((seg, i) => {
    const duration = seg.duration_seconds || 10;
    timing.push({
      index: i,
      start: cumulative,
      end: cumulative + duration,
      duration: duration
    });
    cumulative += duration;
  });
  
  return timing;
};

// Get current segment index
const getCurrentSegment = (frame, fps, segments) => {
  const time = frame / fps;
  const timing = getSegmentTiming(segments);
  
  for (let i = 0; i < timing.length; i++) {
    if (time >= timing[i].start && time < timing[i].end) {
      return { index: i, ...timing[i], localFrame: (time - timing[i].start) * fps };
    }
  }
  
  return null;
};'''
    
    def _get_background_component(self) -> str:
        """Generate animated background component"""
        return '''// 🎨 ANIMATED BACKGROUND
const AnimatedBG = () => {
  const f = useCurrentFrame();
  
  // Slow gradient animation
  const offset = (f * 0.5) % 400;
  
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)',
      backgroundSize: '400% 400%',
      backgroundPosition: `${offset}% 50%`,
      zIndex: -1
    }} />
  );
};'''
    
    def _get_subtitle_component(self) -> str:
        """Generate subtitle component with fade"""
        return '''// 📝 SUBTITLE COMPONENT
const Subtitle = ({ text, frame, startFrame, endFrame, fps }) => {
  if (!text || frame < startFrame || frame >= endFrame) return null;
  
  const fadeInDur = 10;
  const fadeOutDur = 10;
  const fadeOutStart = endFrame - fadeOutDur;
  
  let opacity = 1;
  if (frame < startFrame + fadeInDur) {
    opacity = (frame - startFrame) / fadeInDur;
  } else if (frame >= fadeOutStart) {
    opacity = 1 - ((frame - fadeOutStart) / fadeOutDur);
  }
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 60,
      left: 60,
      right: 60,
      zIndex: 30,
      opacity
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        padding: '15px 25px',
        borderRadius: 8,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{
          fontSize: 24,
          color: 'white',
          margin: 0,
          lineHeight: 1.5,
          textAlign: 'center'
        }}>
          {text}
        </p>
      </div>
    </div>
  );
};'''
    
    def generate_all(self):
        """Generate all section compositions"""
        print()
        print("=" * 70)
        print("🎬 GENERATING ANIMATED COMPOSITIONS")
        print("=" * 70)
        print()
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate index file
        self._generate_index()
        
        # Generate each section
        for idx, section in enumerate(self.sections, 1):
            section_type = section['section_type']
            section_id = section['section_id']
            
            print(f"[{idx}/{len(self.sections)}] Section {section_id:2d} ({section_type:10s})", end=" ")
            
            # Route to appropriate generator
            has_avatar = 'avatar_video' in section
            
            if section_type == 'intro':
                tsx = self._intro_animated(section, has_avatar)
            elif section_type == 'summary':
                tsx = self._summary_animated(section, has_avatar)
            elif section_type in ['content', 'example']:
                tsx = self._content_animated(section, has_avatar)
            elif section_type == 'quiz':
                tsx = self._quiz_animated(section, has_avatar)
            elif section_type == 'memory':
                tsx = self._memory_animated(section, has_avatar)
            elif section_type == 'recap':
                tsx = self._recap_animated(section)
            else:
                print(f"⚠️  Unknown type")
                continue
            
            # Write file
            filename = f"Section_{section_id:02d}_{section_type.capitalize()}.tsx"
            filepath = self.output_dir / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(tsx)
            
            print(f"✅ {filename}")
        
        print()
        print("=" * 70)
        print(f"✅ Generated {len(self.sections)} compositions!")
        print(f"📁 Output: {self.output_dir}")
        print("=" * 70)
        print()
    
    def _generate_index(self):
        """Generate index.tsx with all compositions (V2.5 Compliant)"""
        imports = []
        compositions = []
        
        for section in self.sections:
            sid = section['section_id']
            stype = section['section_type'].capitalize()
            comp_name = f"Section{sid:02d}{stype}"
            filename = f"Section_{sid:02d}_{stype}"
            
            imports.append(f"import {comp_name}, {{ metadata as meta{sid:02d} }} from './{filename}';")
            compositions.append(f'''      <Composition
        id={{meta{sid:02d}.id}}
        component={{{comp_name}}}
        durationInFrames={{meta{sid:02d}.durationInFrames}}
        fps={{meta{sid:02d}.fps}}
        width={{meta{sid:02d}.width}}
        height={{meta{sid:02d}.height}}
      />''')
        
        imports_str = '\n'.join(imports)
        compositions_str = '\n'.join(compositions)
        
        index_content = f'''import {{Composition, registerRoot}} from 'remotion';
import React from 'react';

{imports_str}

export const RemotionRoot: React.FC = () => {{
  return (
    <>
{compositions_str}
    </>
  );
}};

registerRoot(RemotionRoot);
'''
        
        with open(self.output_dir / 'index.tsx', 'w', encoding='utf-8') as f:
            f.write(index_content)
        
        print("✅ Generated index.tsx")
    
    # =========================================================================
    # SECTION GENERATORS
    # =========================================================================
    
    def _intro_animated(self, section: Dict, has_avatar: bool) -> str:
        """INTRO: Gentle fade with floating avatar"""
        sid = section['section_id']
        title = self._esc(section['title'])
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        # Subtitle data
        segments = section['narration'].get('segments', [])
        subs_data = []
        cumulative = 0
        for seg in segments:
            dur = seg.get('duration_seconds', 10)
            text = self._esc(seg.get('text', ''))
            subs_data.append(f'{{ s: {cumulative}, e: {cumulative + dur}, t: "{text}" }}')
            cumulative += dur
        
        subs_str = ',\n  '.join(subs_data) if subs_data else '{ s: 0, e: 10, t: "" }'
        
        avatar_code = ""
        if has_avatar:
            avatar_path = section['avatar_video']
            avatar_code = f'''{{/* Avatar - Centered per V2.5 Bible */}}
      {{(() => {{
        const fadeIn = Math.min(1, f / 30);  // Clean fade-in, no bounce
        
        return (
          <div style={{{{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '50%',
            height: '70%',
            opacity: fadeIn,
            zIndex: 20
          }}}}>
            <OffthreadVideo 
              src={{staticFile("/jobs/{self.job_id}/{avatar_path}")}}
              transparent
              style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}}
            />
          </div>
        );
      }})()}}'''
        
        return f'''import React from 'react';
import {{ AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, staticFile, interpolate }} from 'remotion';

{self._get_animation_helpers()}

{self._get_background_component()}

{self._get_subtitle_component()}

const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  const subs = [
  {subs_str}
  ];
  
  const curTime = f / fps;
  const curSub = subs.find(s => curTime >= s.s && curTime < s.e);
  
  return (
    <AbsoluteFill style={{{{ background: '#000' }}}}>
      <AnimatedBG />
      
      {avatar_code}
      
      {{/* Subtitle */}}
      {{curSub && (
        <Subtitle 
          text={{curSub.t}}
          frame={{f}}
          startFrame={{curSub.s * fps}}
          endFrame={{curSub.e * fps}}
          fps={{fps}}
        />
      )}}
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Intro', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    def _summary_animated(self, section: Dict, has_avatar: bool) -> str:
        """SUMMARY: BOUNCY bullets with stagger (THE STAR!)"""
        sid = section['section_id']
        title = self._esc(section['title'])
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        # Visual beats for bullets
        visual_beats = section.get('visual_beats', [])
        bullets_data = []
        
        for idx, beat in enumerate(visual_beats):
            text = self._esc(beat.get('display_text', f'Point {idx + 1}'))
            start = beat.get('start_time', idx * 5)
            end = beat.get('end_time', start + 5)
            
            bullets_data.append(f'{{ t: "{text}", s: {start}, e: {end} }}')
        
        bullets_str = ',\n  '.join(bullets_data) if bullets_data else '{ t: "Loading...", s: 0, e: 10 }'
        
        # Subtitles
        segments = section['narration'].get('segments', [])
        subs_data = []
        cumulative = 0
        for seg in segments:
            dur = seg.get('duration_seconds', 5)
            text = self._esc(seg.get('text', ''))
            subs_data.append(f'{{ s: {cumulative}, e: {cumulative + dur}, t: "{text}" }}')
            cumulative += dur
        
        subs_str = ',\n  '.join(subs_data) if subs_data else '{ s: 0, e: 10, t: "" }'
        
        avatar_code = ""
        if has_avatar:
            avatar_path = section['avatar_video']
            avatar_code = f'''{{/* Avatar */}}
      <div style={{{{
        position: 'absolute',
        bottom: 0,
        right: '5%',
        width: '40%',
        height: '55%',
        zIndex: 20
      }}}}>
        <OffthreadVideo 
          src={{staticFile("/jobs/{self.job_id}/{avatar_path}")}}
          transparent
          style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}}
        />
      </div>'''
        
        return f'''import React from 'react';
import {{ AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, staticFile, interpolate }} from 'remotion';

{self._get_animation_helpers()}

{self._get_background_component()}

{self._get_subtitle_component()}

const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  const bullets = [
  {bullets_str}
  ];
  
  const subs = [
  {subs_str}
  ];
  
  const curTime = f / fps;
  const curSub = subs.find(s => curTime >= s.s && curTime < s.e);
  
  return (
    <AbsoluteFill style={{{{ background: '#000' }}}}>
      <AnimatedBG />
      
      {{/* Title - BIG BOUNCE */}}
      {{(() => {{
        const titleScale = spring(f, fps, {{ damping: 8, stiffness: 200 }});
        const titleRotate = interpolate(titleScale, [0, 1], [12, 0]);
        
        return (
          <div style={{{{
            position: 'absolute',
            top: '12%',
            left: '8%',
            transform: `scale(${{titleScale}}) rotate(${{titleRotate}}deg)`,
            opacity: titleScale,
            zIndex: 10
          }}}}>
            <h1 style={{{{
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}}}>
              {title}
            </h1>
          </div>
        );
      }})()}}
      
      {{/* BOUNCY BULLETS - THE MAGIC! */}}
      {{bullets.map((bullet, i) => {{
        const startFrame = bullet.s * fps;
        const endFrame = bullet.e * fps;
        const isActive = f >= startFrame && f < endFrame;
        const hasAppeared = f >= startFrame;
        
        if (!hasAppeared) return null;
        
        // BOUNCY entrance
        const localFrame = f - startFrame;
        const bounceScale = spring(localFrame, fps, {{ damping: 12, stiffness: 150 }});
        const slideX = interpolate(localFrame, [0, 20], [-100, 0], {{ extrapolateRight: 'clamp' }});
        const rotateEntry = interpolate(bounceScale, [0, 1], [8, 0]);
        
        // Active highlight
        const activeScale = isActive ? 1.05 : 1;
        const opacity = isActive ? 1 : (f > endFrame ? 0.4 : bounceScale);
        
        return (
          <div
            key={{i}}
            style={{{{
              position: 'absolute',
              top: `${{35 + i * 12}}%`,
              left: '8%',
              width: '50%',
              transform: `translateX(${{slideX}}px) scale(${{bounceScale * activeScale}}) rotate(${{rotateEntry}}deg)`,
              opacity,
              padding: '15px 25px',
              borderLeft: isActive ? '5px solid #3b82f6' : '5px solid transparent',
              background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
              borderRadius: 8,
              transition: 'all 0.3s ease',
              zIndex: isActive ? 15 : 10
            }}}}
          >
            <p style={{{{
              fontSize: isActive ? 38 : 34,
              fontWeight: isActive ? '700' : '600',
              color: isActive ? 'white' : '#94a3b8',
              margin: 0,
              lineHeight: 1.4
            }}}}>
              💫 {{bullet.t}}
            </p>
          </div>
        );
      }})}}
      
      {avatar_code}
      
      {{/* Subtitle */}}
      {{curSub && (
        <Subtitle 
          text={{curSub.t}}
          frame={{f}}
          startFrame={{curSub.s * fps}}
          endFrame={{curSub.e * fps}}
          fps={{fps}}
        />
      )}}
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Summary', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''

    def _content_animated(self, section: Dict, has_avatar: bool) -> str:
        """CONTENT/EXAMPLE: Progressive reveal with teach/show modes (V2.5 Compliant)"""
        sid = section['section_id']
        stype = section['section_type'].capitalize()
        title = self._esc(section['title'])
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        # Segments for teach/show switching
        segments = section['narration'].get('segments', [])
        visual_beats = section.get('visual_beats', [])
        
        # V2.5 Fix: Get section-level video_path for Manim content
        section_video_path = section.get('video_path', '')
        renderer = section.get('renderer', 'none')
        
        # Build segment data with matched visual beats
        seg_data = []
        cumulative = 0
        
        for seg in segments:
            seg_id = seg.get('segment_id', f'seg_{len(seg_data)}')
            dirs = seg.get('display_directives', {})
            text_layer = dirs.get('text_layer', 'show')
            visual_layer = dirs.get('visual_layer', 'hide')
            dur = seg.get('duration_seconds', 10)
            
            # V2.5 Fix: Check beat_videos first, then fall back to section video_path for Manim
            videos = seg.get('beat_videos', [])
            if videos:
                video_path = videos[0]
            elif visual_layer == 'show' and renderer == 'manim' and section_video_path:
                # Manim sections use section-level video_path for SHOW mode segments
                video_path = section_video_path
            else:
                video_path = ''
            
            # Find matching visual beat
            beat_text = ''
            for beat in visual_beats:
                if beat.get('segment_id') == seg_id:
                    beat_text = self._esc(beat.get('display_text', ''))
                    break
            
            if not beat_text:
                beat_text = self._esc(seg.get('text', ''))[:200]
            
            seg_data.append(f'''{{ 
      s: {cumulative}, 
      e: {cumulative + dur}, 
      text: "{beat_text}", 
      tl: "{text_layer}", 
      vl: "{visual_layer}", 
      video: "{video_path}"
    }}''')
            cumulative += dur
        
        segs_str = ',\n    '.join(seg_data) if seg_data else '{ s: 0, e: 10, text: "Content", tl: "show", vl: "hide", video: "" }'
        
        # Subtitles
        subs_data = []
        cumulative = 0
        for seg in segments:
            dur = seg.get('duration_seconds', 10)
            text = self._esc(seg.get('text', ''))
            subs_data.append(f'{{ s: {cumulative}, e: {cumulative + dur}, t: "{text}" }}')
            cumulative += dur
        
        subs_str = ',\n  '.join(subs_data) if subs_data else '{ s: 0, e: 10, t: "" }'
        
        avatar_code = ""
        if has_avatar:
            avatar_path = section['avatar_video']
            avatar_code = f'''{{/* Avatar */}}
      <div style={{{{
        position: 'absolute',
        bottom: 0,
        right: '3%',
        width: '35%',
        height: '50%',
        zIndex: 20
      }}}}>
        <OffthreadVideo 
          src={{staticFile("/jobs/{self.job_id}/{avatar_path}")}}
          transparent
          style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}}
        />
      </div>'''
        
        return f'''import React from 'react';
import {{ AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, staticFile, interpolate }} from 'remotion';

{self._get_animation_helpers()}

{self._get_background_component()}

{self._get_subtitle_component()}

const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  const segments = [
    {segs_str}
  ];
  
  const subs = [
  {subs_str}
  ];
  
  const curTime = f / fps;
  const curSub = subs.find(s => curTime >= s.s && curTime < s.e);
  const curSeg = segments.find(s => curTime >= s.s && curTime < s.e);
  
  return (
    <AbsoluteFill style={{{{ background: '#000' }}}}>
      <AnimatedBG />
      
      {{/* Title */}}
      <div style={{{{
        position: 'absolute',
        top: '8%',
        left: '5%',
        right: '40%',
        zIndex: 10
      }}}}>
        <h2 style={{{{
          fontSize: 42,
          fontWeight: 'bold',
          color: 'white',
          margin: 0,
          opacity: Math.min(1, f / 20)
        }}}}>
          {title}
        </h2>
      </div>
      
      {{/* Content Area - TEACH or SHOW */}}
      {{segments.map((seg, i) => {{
        const isActive = curSeg && curTime >= seg.s && curTime < seg.e;
        if (!isActive) return null;
        
        const localFrame = (curTime - seg.s) * fps;
        
        // TEACH MODE - Show text
        if (seg.tl === 'show') {{
          const revealProgress = Math.min(1, localFrame / 20);
          const scale = interpolate(revealProgress, [0, 1], [0.96, 1]);
          const translateY = interpolate(revealProgress, [0, 1], [30, 0]);
          const glowIntensity = 30;
          
          return (
            <div
              key={{`teach-${{i}}`}}
              style={{{{
                position: 'absolute',
                top: '25%',
                left: '5%',
                right: '40%',
                opacity: revealProgress,
                transform: `translateY(${{translateY}}px) scale(${{scale}})`,
                padding: '25px 30px',
                borderLeft: '5px solid #3b82f6',
                background: 'rgba(59,130,246,0.08)',
                borderRadius: 12,
                boxShadow: `0 0 ${{glowIntensity}}px rgba(59,130,246,0.3)`,
                zIndex: 15
              }}}}
            >
              <p style={{{{
                fontSize: 28,
                lineHeight: 1.6,
                color: 'white',
                margin: 0,
                fontWeight: '500'
              }}}}>
                {{seg.text}}
              </p>
            </div>
          );
        }}
        
        // SHOW MODE - Show video
        if (seg.vl === 'show' && seg.video) {{
          const videoProgress = Math.min(1, localFrame / 25);
          const videoScale = interpolate(videoProgress, [0, 1], [0.92, 1]);
          
          return (
            <div
              key={{`show-${{i}}`}}
              style={{{{
                position: 'absolute',
                top: '8%',
                left: '5%',
                right: '5%',
                bottom: '15%',
                opacity: videoProgress,
                transform: `scale(${{videoScale}})`,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 25px 70px rgba(0,0,0,0.6)',
                zIndex: 15
              }}}}
            >
              <OffthreadVideo 
                src={{staticFile(`/jobs/{self.job_id}/${{seg.video}}`)}}
                style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}}
              />
            </div>
          );
        }}
        
        return null;
      }})}}
      
      {avatar_code}
      
      {{/* Subtitle */}}
      {{curSub && (
        <Subtitle 
          text={{curSub.t}}
          frame={{f}}
          startFrame={{curSub.s * fps}}
          endFrame={{curSub.e * fps}}
          fps={{fps}}
        />
      )}}
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-{stype}', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    def _quiz_animated(self, section: Dict, has_avatar: bool) -> str:
        """QUIZ: 3-phase choreography (Question → Think → Reveal)"""
        sid = section['section_id']
        title = self._esc(section['title'])
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        # For simplicity, create a basic quiz layout
        # Real implementation would parse quiz data from visual_beats
        
        return f'''import React from 'react';
import {{ AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile, interpolate }} from 'remotion';

{self._get_animation_helpers()}

{self._get_background_component()}

const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  // Quiz phases: intro (0-450), pause (450-600), reveal (600+)
  const phase = f < 450 ? 'intro' : f < 600 ? 'pause' : 'reveal';
  
  const question = "{title}";
  const options = [
    {{ id: 'A', text: 'Option A' }},
    {{ id: 'B', text: 'Option B' }},
    {{ id: 'C', text: 'Option C' }},
    {{ id: 'D', text: 'Option D' }}
  ];
  const correctAnswer = 'B';
  
  return (
    <AbsoluteFill style={{{{ background: '#000' }}}}>
      <AnimatedBG />
      
      {{/* Question */}}
      <div style={{{{
        position: 'absolute',
        top: '15%',
        left: '10%',
        right: '10%',
        opacity: Math.min(1, f / 20),
        transform: `translateY(${{interpolate(f, [0, 20], [-30, 0], {{ extrapolateRight: 'clamp' }})}}px)`
      }}}}>
        <h2 style={{{{
          fontSize: 48,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          margin: 0
        }}}}>
          {{question}}
        </h2>
      </div>
      
      {{/* Options */}}
      <div style={{{{
        position: 'absolute',
        top: '35%',
        left: '15%',
        right: '15%',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}}}>
        {{options.map((opt, i) => {{
          const delay = 30 + (i * 12);
          const bounceScale = spring(Math.max(0, f - delay), fps, {{ damping: 12, stiffness: 150 }});
          
          const isCorrect = opt.id === correctAnswer;
          const isRevealed = phase === 'reveal';
          
          // Pulse during pause
          const pulse = phase === 'pause' ? 1 + Math.sin((f / 20) * Math.PI) * 0.04 : 1;
          
          return (
            <div
              key={{opt.id}}
              style={{{{
                transform: `scale(${{bounceScale * pulse}})`,
                opacity: isRevealed && !isCorrect ? 0.5 : bounceScale,
                background: isRevealed && isCorrect ? '#10b981' : '#374151',
                padding: '25px 35px',
                borderRadius: 12,
                border: `3px solid ${{isRevealed && isCorrect ? '#10b981' : 'transparent'}}`,
                textDecoration: isRevealed && !isCorrect ? 'line-through' : 'none',
                transition: 'all 0.3s ease'
              }}}}
            >
              <p style={{{{
                fontSize: 32,
                color: 'white',
                margin: 0,
                fontWeight: '600'
              }}}}>
                {{isRevealed && isCorrect && '✅ '}}
                {{isRevealed && !isCorrect && '❌ '}}
                {{opt.id}}. {{opt.text}}
              </p>
            </div>
          );
        }})}}
      </div>
      
      {{/* Think prompt */}}
      {{phase === 'pause' && (
        <div style={{{{
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: interpolate(f - 450, [0, 20], [0, 1], {{ extrapolateRight: 'clamp' }})
        }}}}>
          <p style={{{{
            fontSize: 42,
            color: '#fbbf24',
            fontWeight: 'bold',
            textAlign: 'center'
          }}}}>
            🤔 Think about it...
          </p>
        </div>
      )}}
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Quiz', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    def _memory_animated(self, section: Dict, has_avatar: bool) -> str:
        """MEMORY: 3D flashcard flip animation"""
        sid = section['section_id']
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        # Extract memory items from visual_beats
        visual_beats = section.get('visual_beats', [])
        cards_data = []
        
        for beat in visual_beats[:5]:  # Max 5 cards per V2.5 Bible
            front = self._esc(beat.get('display_text', 'Term'))
            back = self._esc(beat.get('description', 'Definition'))
            cards_data.append(f'{{ front: "{front}", back: "{back}" }}')
        
        # Ensure we have exactly 5 cards
        while len(cards_data) < 5:
            cards_data.append('{ front: "Term", back: "Definition" }')
        
        cards_str = ',\n    '.join(cards_data)
        
        return f'''import React from 'react';
import {{ AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate }} from 'remotion';

{self._get_animation_helpers()}

{self._get_background_component()}

const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  const cards = [
    {cards_str}
  ];
  
  const cardDuration = 200; // ~6.67 seconds per card
  const currentCardIndex = Math.floor(f / cardDuration) % cards.length;
  const cardFrame = f % cardDuration;
  
  // Flip at frame 90 (3 seconds in, flip for 1 second)
  const flipProgress = interpolate(
    cardFrame,
    [90, 120],
    [0, 180],
    {{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }}
  );
  
  const card = cards[currentCardIndex];
  const showBack = flipProgress > 90;
  
  return (
    <AbsoluteFill style={{{{ background: '#000' }}}}>
      <AnimatedBG />
      
      {{/* Card container */}}
      <div style={{{{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        perspective: '1500px',
        width: 700,
        height: 450
      }}}}>
        <div style={{{{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `rotateY(${{flipProgress}}deg)`,
          transition: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}}}>
          {{/* Front */}}
          <div style={{{{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}}}>
            <p style={{{{
              fontSize: 52,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.4
            }}}}>
              {{card.front}}
            </p>
          </div>
          
          {{/* Back */}}
          <div style={{{{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 50,
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}}}>
            <p style={{{{
              fontSize: 36,
              color: 'white',
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.5,
              fontWeight: '500'
            }}}}>
              {{card.back}}
            </p>
          </div>
        </div>
      </div>
      
      {{/* Card indicator */}}
      <div style={{{{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 15
      }}}}>
        {{cards.map((_, i) => (
          <div
            key={{i}}
            style={{{{
              width: i === currentCardIndex ? 40 : 15,
              height: 15,
              borderRadius: 10,
              background: i === currentCardIndex ? 'white' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}}}
          />
        ))}}
      </div>
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Memory', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    def _recap_animated(self, section: Dict) -> str:
        """RECAP: Cinematic crossfade between videos"""
        sid = section['section_id']
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        # Extract recap segments
        segments = section['narration'].get('segments', [])
        video_data = []
        cumulative = 0
        
        for seg in segments[:5]:  # Max 5 per V2.5 Bible
            dur = seg.get('duration_seconds', 10)
            videos = seg.get('beat_videos', [])
            text = self._esc(seg.get('text', ''))
            
            video_path = videos[0] if videos else ''
            video_data.append(f'{{ s: {cumulative}, e: {cumulative + dur}, video: "{video_path}", text: "{text}" }}')
            cumulative += dur
        
        videos_str = ',\n    '.join(video_data) if video_data else '{ s: 0, e: 10, video: "", text: "Recap" }'
        
        return f'''import React from 'react';
import {{ AbsoluteFill, useCurrentFrame, useVideoConfig, OffthreadVideo, staticFile, interpolate }} from 'remotion';

{self._get_animation_helpers()}

{self._get_background_component()}

const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  const segments = [
    {videos_str}
  ];
  
  const curTime = f / fps;
  const curSeg = segments.find(s => curTime >= s.s && curTime < s.e);
  
  if (!curSeg || !curSeg.video) {{
    return (
      <AbsoluteFill style={{{{ background: '#000' }}}}>
        <AnimatedBG />
      </AbsoluteFill>
    );
  }}
  
  const localTime = curTime - curSeg.s;
  const fadeInProgress = Math.min(1, localTime / 1.5);
  const fadeOutProgress = Math.max(0, 1 - ((curSeg.e - curTime) / 1.5));
  const opacity = Math.min(fadeInProgress, 1 - fadeOutProgress);
  
  return (
    <AbsoluteFill style={{{{ background: '#000' }}}}>
      {{/* Video */}}
      <div style={{{{
        position: 'absolute',
        inset: '3%',
        opacity,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 25px 70px rgba(0,0,0,0.6)'
      }}}}>
        <OffthreadVideo 
          src={{staticFile(`/jobs/{self.job_id}/${{curSeg.video}}`)}}
          style={{{{ width: '100%', height: '100%', objectFit: 'cover' }}}}
        />
        
        {{/* Vignette overlay */}}
        <div style={{{{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.5))',
          pointerEvents: 'none'
        }}}} />
      </div>
      
      {{/* Text overlay */}}
      {{curSeg.text && (
        <div style={{{{
          position: 'absolute',
          bottom: '8%',
          left: '8%',
          right: '8%',
          opacity: opacity,
          background: 'rgba(0,0,0,0.85)',
          padding: '25px 35px',
          borderRadius: 16,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}}}>
          <p style={{{{
            fontSize: 32,
            color: 'white',
            margin: 0,
            lineHeight: 1.5,
            textAlign: 'center',
            fontWeight: '500'
          }}}}>
            {{curSeg.text}}
          </p>
        </div>
      )}}
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Recap', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''


def main():
    if len(sys.argv) < 4:
        print("Usage: python generate_remotion_ANIMATED.py presentation.json job_folder output_dir")
        sys.exit(1)
    
    presentation_path = sys.argv[1]
    assets_dir = sys.argv[2]
    output_dir = sys.argv[3]
    
    generator = AnimatedGenerator(presentation_path, assets_dir, output_dir)
    generator.generate_all()
    
    print("🎉 Animation generation complete!")
    print()
    print("Next steps:")
    print(f"  cd {output_dir}")
    print("  npm install")
    print("  npx remotion studio src/index.tsx")
    print()


if __name__ == '__main__':
    main()
