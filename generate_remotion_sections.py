#!/usr/bin/env python3
"""
🎬 Remotion Section Generator - V2.5 Director Bible (FIXED)
Converts presentation.json into individual Remotion TSX files (one per section)

FIXED: Proper handling of sections without avatar_video field
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any


class RemotionSectionGenerator:
    """Generates individual TSX files for each section"""
    
    def __init__(self, presentation_path: str, output_dir: str):
        self.presentation_path = presentation_path
        self.output_dir = Path(output_dir)
        
        # Load presentation data
        with open(presentation_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        self.sections = self.data['sections']
        self.metadata = self.data.get('metadata', {})
        self.job_id = self._extract_job_id()
    
    def _extract_job_id(self) -> str:
        """Try to extract job ID from file path"""
        path_str = str(self.presentation_path).replace('\\', '/')
        if '/jobs/' in path_str:
            parts = path_str.split('/jobs/')
            if len(parts) > 1:
                job_part = parts[1].split('/')[0]
                return job_part
        return "f963fc1c"
    
    def generate_all(self):
        """Generate all section TSX files"""
        print("=" * 70)
        print("🎬 REMOTION SECTION GENERATOR - V2.5 Director Bible")
        print("=" * 70)
        print(f"📂 Input:  {self.presentation_path}")
        print(f"📂 Output: {self.output_dir}")
        print(f"🎯 Job ID: {self.job_id}")
        print(f"📊 Total Sections: {len(self.sections)}")
        print(f"⏱️  Total Duration: {self.metadata.get('total_duration_seconds', 0):.1f}s")
        print("=" * 70)
        print()
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate each section
        for idx, section in enumerate(self.sections, 1):
            section_id = section['section_id']
            section_type = section['section_type']
            duration = section['narration']['total_duration_seconds']
            has_avatar = 'avatar_video' in section
            
            print(f"[{idx:2d}/{len(self.sections)}] Section_{section_id:02d}_{section_type.capitalize():10s} ({duration:5.1f}s) {'🎭' if has_avatar else '  '}", end=" ")
            
            try:
                tsx_code = self._generate_section_tsx(section)
                filename = f"Section_{section_id:02d}_{section_type.capitalize()}.tsx"
                output_path = self.output_dir / filename
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(tsx_code)
                
                print("✅")
            except Exception as e:
                print(f"❌ Error: {e}")
        
        print()
        print("📦 Generating package.json...")
        self._generate_package_json()
        
        print("📦 Generating render_all.sh...")
        self._generate_render_script()
        
        print()
        print("=" * 70)
        print("✅ GENERATION COMPLETE!")
        print("=" * 70)
        print()
        print("🚀 Next steps:")
        print(f"   cd {self.output_dir}")
        print("   npm install")
        print()
        print("🎬 Render individual sections:")
        print("   npx remotion render Section_01_Intro.tsx out/section_01.mp4")
        print()
        print("⚡ Or render all at once:")
        print("   chmod +x render_all.sh && ./render_all.sh")
        print("=" * 70)
    
    def _generate_section_tsx(self, section: Dict) -> str:
        """Generate TSX code based on section type"""
        section_type = section['section_type']
        
        if section_type == 'intro':
            return self._tsx_intro(section)
        elif section_type == 'summary':
            return self._tsx_summary(section)
        elif section_type == 'content':
            return self._tsx_content(section)
        elif section_type == 'quiz':
            return self._tsx_quiz(section)
        elif section_type == 'memory':
            return self._tsx_memory(section)
        elif section_type == 'recap':
            return self._tsx_recap(section)
        else:
            return self._tsx_generic(section)
    
    def _escape_text(self, text: str) -> str:
        """Escape text for JavaScript strings"""
        if not text:
            return ""
        return text.replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"').replace('\n', '\\n').replace('\r', '')
    
    def _generate_avatar_jsx(self, section: Dict, position_style: str) -> str:
        """Generate avatar JSX code with conditional rendering"""
        avatar_video = section.get('avatar_video', '')
        
        if not avatar_video:
            return "      {/* No avatar for this section */}"
        
        # Escape curly braces for f-string by doubling them
        return f'''      {{/* Avatar */}}
      <div
        style={{{{
{position_style}
        }}}}
      >
        <Video
          src="/jobs/{self.job_id}/{avatar_video}"
          style={{{{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}}}
        />
      </div>'''
    
    def _tsx_intro(self, section: Dict) -> str:
        """Generate Intro section TSX"""
        duration_frames = round(section['narration']['total_duration_seconds'] * 30)
        title = self._escape_text(section['title'])
        
        avatar_jsx = self._generate_avatar_jsx(section, '''          position: 'absolute',
          right: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '50%',
          height: '60%',
          opacity: avatarOpacity,
          zIndex: 20''')
        
        return f'''import React from 'react';
import {{ Composition }} from 'remotion';
import {{ AbsoluteFill, Audio, Video, useCurrentFrame, interpolate }} from 'remotion';

/**
 * SECTION {section['section_id']}: {title}
 * Type: INTRO
 * Duration: {section['narration']['total_duration_seconds']:.2f}s ({duration_frames} frames @ 30fps)
 * V2.5 Spec: Avatar Only, Clean Start
 */

const DeepSpaceBackground: React.FC = () => {{
  const frame = useCurrentFrame();
  const bgPositionX = interpolate(frame, [0, 600, 1200], [0, 100, 0], {{
    extrapolateRight: 'wrap'
  }});
  
  return (
    <div
      style={{{{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)',
        backgroundSize: '400% 400%',
        backgroundPosition: `${{bgPositionX}}% 50%`,
        zIndex: -1
      }}}}
    />
  );
}};

const IntroComposition: React.FC = () => {{
  const frame = useCurrentFrame();
  
  const avatarOpacity = interpolate(frame, [0, 30], [0, 1], {{
    extrapolateRight: 'clamp'
  }});
  
  return (
    <AbsoluteFill>
      <DeepSpaceBackground />
      
{avatar_jsx}
      
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};

export const RemotionRoot: React.FC = () => {{
  return (
    <Composition
      id="Section_{section['section_id']}_Intro"
      component={{IntroComposition}}
      durationInFrames={{{duration_frames}}}
      fps={{30}}
      width={{1920}}
      height={{1080}}
    />
  );
}};
'''
    
    def _tsx_summary(self, section: Dict) -> str:
        """Generate Summary section TSX"""
        duration_frames = round(section['narration']['total_duration_seconds'] * 30)
        title = self._escape_text(section['title'])
        
        # Build visual beats
        beats_code = []
        for beat in section.get('visual_beats', []):
            display_text = self._escape_text(beat.get('display_text', ''))
            beats_code.append(f'''  {{
    startTime: {beat['start_time']},
    endTime: {beat['end_time']},
    text: "{display_text}"
  }}''')
        
        beats_array = ',\n'.join(beats_code) if beats_code else '  { startTime: 0, endTime: 10, text: "No content" }'
        
        avatar_jsx = self._generate_avatar_jsx(section, '''          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '45%',
          height: '55%',
          zIndex: 20''')
        
        return f'''import React from 'react';
import {{ Composition }} from 'remotion';
import {{ AbsoluteFill, Audio, Video, useCurrentFrame, useVideoConfig, interpolate }} from 'remotion';

/**
 * SECTION {section['section_id']}: {title}
 * Type: SUMMARY
 * Duration: {section['narration']['total_duration_seconds']:.2f}s ({duration_frames} frames @ 30fps)
 */

const visualBeats = [
{beats_array}
];

const DeepSpaceBackground: React.FC = () => {{
  const frame = useCurrentFrame();
  const bgPositionX = interpolate(frame, [0, 600, 1200], [0, 100, 0], {{
    extrapolateRight: 'wrap'
  }});
  
  return (
    <div
      style={{{{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)',
        backgroundSize: '400% 400%',
        backgroundPosition: `${{bgPositionX}}% 50%`,
        zIndex: -1
      }}}}
    />
  );
}};

const SummaryComposition: React.FC = () => {{
  const frame = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  return (
    <AbsoluteFill>
      <DeepSpaceBackground />
      
      <div style={{{{ position: 'absolute', left: 0, top: 0, width: '55%', height: '100%', padding: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}}}>
        <h1 style={{{{ fontSize: 72, color: 'white', marginBottom: 60, fontWeight: 'bold', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}}}>
          {title}
        </h1>
        
        <div>
          {{visualBeats.map((beat, idx) => {{
            const startFrame = beat.startTime * fps;
            const endFrame = beat.endTime * fps;
            const isActive = frame >= startFrame && frame < endFrame;
            const hasAppeared = frame >= startFrame;
            
            const opacity = hasAppeared ? (isActive ? 1 : 0.4) : 0;
            const scale = isActive ? 1.05 : 1;
            const translateX = interpolate(frame, [startFrame, startFrame + 15], [50, 0], {{ extrapolateRight: 'clamp' }});
            
            return (
              <div
                key={{idx}}
                style={{{{
                  opacity,
                  transform: `translateX(${{translateX}}px) scale(${{scale}})`,
                  fontSize: 36,
                  color: isActive ? 'white' : '#94a3b8',
                  marginBottom: 30,
                  borderLeft: isActive ? '4px solid #60a5fa' : '4px solid transparent',
                  paddingLeft: 20,
                  background: isActive ? 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' : 'none'
                }}}}
              >
                • {{beat.text}}
              </div>
            );
          }})}}
        </div>
      </div>
      
{avatar_jsx}
      
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};

export const RemotionRoot: React.FC = () => {{
  return (
    <Composition
      id="Section_{section['section_id']}_Summary"
      component={{SummaryComposition}}
      durationInFrames={{{duration_frames}}}
      fps={{30}}
      width={{1920}}
      height={{1080}}
    />
  );
}};
'''
    
    def _tsx_content(self, section: Dict) -> str:
        """Generate Content section TSX"""
        duration_frames = round(section['narration']['total_duration_seconds'] * 30)
        title = self._escape_text(section['title'])
        
        # Build segments
        segments_code = []
        for seg in section['narration'].get('segments', []):
            text = self._escape_text(seg.get('text', ''))
            display_directives = seg.get('display_directives', {})
            text_layer = display_directives.get('text_layer', 'show')
            visual_layer = display_directives.get('visual_layer', 'hide')
            beat_videos = seg.get('beat_videos', [])
            
            segments_code.append(f'''  {{
    text: "{text[:100]}...",
    duration: {seg.get('duration_seconds', 0)},
    textLayer: "{text_layer}",
    visualLayer: "{visual_layer}",
    beatVideos: {json.dumps(beat_videos)}
  }}''')
        
        segments_array = ',\n'.join(segments_code) if segments_code else '  { text: "No content", duration: 10, textLayer: "show", visualLayer: "hide", beatVideos: [] }'
        
        avatar_jsx = self._generate_avatar_jsx(section, '''          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '45%',
          height: '55%',
          zIndex: 20''')
        
        return f'''import React from 'react';
import {{ Composition }} from 'remotion';
import {{ AbsoluteFill, Audio, Video, useCurrentFrame, useVideoConfig, interpolate }} from 'remotion';

/**
 * SECTION {section['section_id']}: {title}
 * Type: CONTENT
 * Duration: {section['narration']['total_duration_seconds']:.2f}s ({duration_frames} frames @ 30fps)
 */

const segments = [
{segments_array}
];

const DeepSpaceBackground: React.FC = () => {{
  const frame = useCurrentFrame();
  const bgPositionX = interpolate(frame, [0, 600, 1200], [0, 100, 0], {{ extrapolateRight: 'wrap' }});
  return (
    <div style={{{{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)', backgroundSize: '400% 400%', backgroundPosition: `${{bgPositionX}}% 50%`, zIndex: -1 }}}} />
  );
}};

const ContentComposition: React.FC = () => {{
  const frame = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  let cumulativeTime = 0;
  let currentSegmentIdx = -1;
  
  for (let i = 0; i < segments.length; i++) {{
    const segStart = cumulativeTime;
    const segEnd = cumulativeTime + segments[i].duration;
    if (frame / fps >= segStart && frame / fps < segEnd) {{
      currentSegmentIdx = i;
      break;
    }}
    cumulativeTime += segments[i].duration;
  }}
  
  const currentSegment = segments[currentSegmentIdx] || segments[0];
  const isTeachMode = currentSegment.textLayer === 'show';
  const isShowMode = currentSegment.visualLayer === 'show';
  
  return (
    <AbsoluteFill>
      <DeepSpaceBackground />
      
      {{isTeachMode && (
        <>
          <div style={{{{ position: 'absolute', left: 0, top: 0, width: '55%', height: '100%', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}}}>
            <h2 style={{{{ fontSize: 48, color: 'white', marginBottom: 40, fontWeight: 'bold' }}}}>
              {title}
            </h2>
            
            {{segments.map((seg, idx) => {{
              let segStartFrame = 0;
              for (let i = 0; i < idx; i++) segStartFrame += segments[i].duration * fps;
              const segEndFrame = segStartFrame + seg.duration * fps;
              
              const isActive = frame >= segStartFrame && frame < segEndFrame;
              const hasAppeared = frame >= segStartFrame;
              
              const opacity = hasAppeared ? (isActive ? 1 : 0.4) : 0;
              const scale = isActive ? 1.05 : 1;
              const translateX = interpolate(frame, [segStartFrame, segStartFrame + 10], [50, 0], {{ extrapolateRight: 'clamp' }});
              
              return (
                <div key={{idx}} style={{{{ opacity, transform: `translateX(${{translateX}}px) scale(${{scale}})`, borderLeft: isActive ? '4px solid #60a5fa' : '4px solid transparent', padding: 20, marginBottom: 20, fontSize: 28, color: isActive ? 'white' : '#94a3b8' }}}}>
                  {{seg.text}}
                </div>
              );
            }})}}
          </div>
          
{avatar_jsx}
        </>
      )}}
      
      {{isShowMode && currentSegment.beatVideos && currentSegment.beatVideos.length > 0 && (
        <div style={{{{ position: 'absolute', inset: 0, zIndex: 10 }}}}>
          <Video src={{`/jobs/{self.job_id}/videos/${{currentSegment.beatVideos[0]}}.mp4`}} style={{{{ width: '100%', height: '100%', objectFit: 'cover' }}}} />
        </div>
      )}}
      
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};

export const RemotionRoot: React.FC = () => {{
  return (
    <Composition
      id="Section_{section['section_id']}_Content"
      component={{ContentComposition}}
      durationInFrames={{{duration_frames}}}
      fps={{30}}
      width={{1920}}
      height={{1080}}
    />
  );
}};
'''
    
    def _tsx_quiz(self, section: Dict) -> str:
        """Generate Quiz section"""
        duration_frames = round(section['narration']['total_duration_seconds'] * 30)
        title = self._escape_text(section['title'])
        
        avatar_jsx = self._generate_avatar_jsx(section, '''          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '45%',
          height: '55%',
          zIndex: 20''')
        
        return f'''import React from 'react';
import {{ Composition }} from 'remotion';
import {{ AbsoluteFill, Audio, Video }} from 'remotion';

const QuizComposition: React.FC = () => {{
  return (
    <AbsoluteFill style={{{{ background: '#0f172a' }}}}>
      <div style={{{{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48 }}}}>
        <h1>{title}</h1>
      </div>
{avatar_jsx}
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};

export const RemotionRoot: React.FC = () => {{
  return (
    <Composition
      id="Section_{section['section_id']}_Quiz"
      component={{QuizComposition}}
      durationInFrames={{{duration_frames}}}
      fps={{30}}
      width={{1920}}
      height={{1080}}
    />
  );
}};
'''
    
    def _tsx_memory(self, section: Dict) -> str:
        """Generate Memory/Flashcard section"""
        duration_frames = round(section['narration']['total_duration_seconds'] * 30)
        title = self._escape_text(section['title'])
        
        avatar_jsx = self._generate_avatar_jsx(section, '''          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '35%',
          height: '45%',
          zIndex: 20''')
        
        return f'''import React from 'react';
import {{ Composition }} from 'remotion';
import {{ AbsoluteFill, Audio, Video, useCurrentFrame, interpolate }} from 'remotion';

const MemoryComposition: React.FC = () => {{
  const frame = useCurrentFrame();
  const cardDuration = 20 * 30;
  const cardFrame = frame % cardDuration;
  const flipPoint = 10 * 30;
  const rotateY = interpolate(cardFrame, [flipPoint - 15, flipPoint + 15], [0, 180], {{ extrapolateRight: 'clamp' }});
  
  return (
    <AbsoluteFill style={{{{ background: '#0f172a' }}}}>
      <div style={{{{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '70%', height: '400px', perspective: 1000 }}}}>
        <div style={{{{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateY(${{rotateY}}deg)` }}}}>
          <div style={{{{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'white', padding: 40 }}}}>
            {title} - Front
          </div>
          <div style={{{{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', padding: 40 }}}}>
            Answer
          </div>
        </div>
      </div>
{avatar_jsx}
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};

export const RemotionRoot: React.FC = () => {{
  return (
    <Composition
      id="Section_{section['section_id']}_Memory"
      component={{MemoryComposition}}
      durationInFrames={{{duration_frames}}}
      fps={{30}}
      width={{1920}}
      height={{1080}}
    />
  );
}};
'''
    
    def _tsx_recap(self, section: Dict) -> str:
        """Generate Recap section"""
        duration_frames = round(section['narration']['total_duration_seconds'] * 30)
        title = self._escape_text(section['title'])
        
        segments_code = []
        for seg in section['narration'].get('segments', []):
            text = self._escape_text(seg.get('text', ''))[:200]
            beat_videos = seg.get('beat_videos', [])
            segments_code.append(f'''  {{ text: "{text}", duration: {seg.get('duration_seconds', 0)}, beatVideos: {json.dumps(beat_videos)} }}''')
        
        segments_array = ',\n'.join(segments_code) if segments_code else '  { text: "Recap", duration: 10, beatVideos: [] }'
        
        return f'''import React from 'react';
import {{ Composition }} from 'remotion';
import {{ AbsoluteFill, Audio, Video, useCurrentFrame, useVideoConfig }} from 'remotion';

const segments = [
{segments_array}
];

const RecapComposition: React.FC = () => {{
  const frame = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  let cumulativeTime = 0;
  let currentSegment = segments[0];
  
  for (let i = 0; i < segments.length; i++) {{
    if (frame / fps >= cumulativeTime && frame / fps < cumulativeTime + segments[i].duration) {{
      currentSegment = segments[i];
      break;
    }}
    cumulativeTime += segments[i].duration;
  }}
  
  const videoId = currentSegment.beatVideos && currentSegment.beatVideos.length > 0 ? currentSegment.beatVideos[0] : null;
  
  return (
    <AbsoluteFill>
      {{videoId && <Video src={{`/jobs/{self.job_id}/videos/${{videoId}}.mp4`}} style={{{{ width: '100%', height: '100%', objectFit: 'cover' }}}} />}}
      <div style={{{{ position: 'absolute', bottom: 100, left: 80, right: 80, color: 'white', fontSize: 28, padding: 30, background: 'rgba(0,0,0,0.3)', borderRadius: 15 }}}}>
        {{currentSegment.text}}
      </div>
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};

export const RemotionRoot: React.FC = () => {{
  return (
    <Composition
      id="Section_{section['section_id']}_Recap"
      component={{RecapComposition}}
      durationInFrames={{{duration_frames}}}
      fps={{30}}
      width={{1920}}
      height={{1080}}
    />
  );
}};
'''
    
    def _tsx_generic(self, section: Dict) -> str:
        """Generate generic fallback"""
        duration_frames = round(section['narration']['total_duration_seconds'] * 30)
        title = self._escape_text(section['title'])
        
        return f'''import React from 'react';
import {{ Composition }} from 'remotion';
import {{ AbsoluteFill, Audio }} from 'remotion';

const GenericComposition: React.FC = () => {{
  return (
    <AbsoluteFill style={{{{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48 }}}}>
      <h1>{title}</h1>
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};

export const RemotionRoot: React.FC = () => {{
  return (
    <Composition
      id="Section_{section['section_id']}_Generic"
      component={{GenericComposition}}
      durationInFrames={{{duration_frames}}}
      fps={{30}}
      width={{1920}}
      height={{1080}}
    />
  );
}};
'''
    
    def _generate_package_json(self):
        """Generate package.json"""
        package_json = {
            "name": "remotion-v25-sections",
            "version": "1.0.0",
            "scripts": {"render:all": "./render_all.sh"},
            "dependencies": {
                "@remotion/cli": "^4.0.0",
                "remotion": "^4.0.0",
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
            }
        }
        
        with open(self.output_dir / 'package.json', 'w') as f:
            json.dump(package_json, f, indent=2)
    
    def _generate_render_script(self):
        """Generate render script"""
        lines = ["#!/bin/bash", "echo '🎬 Rendering all sections...'", "mkdir -p out", ""]
        
        for section in self.sections:
            sid = section['section_id']
            stype = section['section_type']
            filename = f"Section_{sid:02d}_{stype.capitalize()}.tsx"
            output = f"section_{sid:02d}_{stype}.mp4"
            lines.append(f"echo '[{sid:2d}] Rendering {stype}...'")
            lines.append(f"npx remotion render {filename} out/{output} --codec h264")
        
        lines.append("echo '✅ Done!'")
        
        script_path = self.output_dir / 'render_all.sh'
        with open(script_path, 'w') as f:
            f.write('\n'.join(lines))
        os.chmod(script_path, 0o755)


def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_remotion_sections_fixed.py <presentation.json> <output-dir>")
        sys.exit(1)
    
    presentation_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    if not os.path.exists(presentation_path):
        print(f"❌ Error: File not found: {presentation_path}")
        sys.exit(1)
    
    generator = RemotionSectionGenerator(presentation_path, output_dir)
    generator.generate_all()


if __name__ == '__main__':
    main()
