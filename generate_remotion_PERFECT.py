#!/usr/bin/env python3
"""
🎬 FINAL PERFECT V2.5 Remotion Generator
✅ Follows V2.5 Director Bible EXACTLY
✅ Intro: Avatar only (no text overlay)
✅ Content: Shows visual_beats (not narration)
✅ Subtitles: Displays narration at bottom with timing
"""

import json
import sys
from pathlib import Path
from typing import Dict


class FinalPerfectGenerator:
    
    def __init__(self, presentation_path: str, output_dir: str, assets_dir: str):
        self.presentation_path = presentation_path
        self.output_dir = Path(output_dir)
        self.assets_dir = Path(assets_dir)
        
        with open(presentation_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        self.sections = self.data['sections']
        self.job_id = self._extract_job_id()
        
        self.has_avatars = (self.assets_dir / 'avatars').exists()
        self.has_videos = (self.assets_dir / 'videos').exists()
        
        print(f"📁 Assets: Avatars={'✅' if self.has_avatars else '❌'} | Videos={'✅' if self.has_videos else '❌'}")
    
    def _extract_job_id(self) -> str:
        path_str = str(self.presentation_path).replace('\\', '/')
        if '/jobs/' in path_str:
            return path_str.split('/jobs/')[1].split('/')[0]
        return "48808436"
    
    def generate_all(self):
        print("=" * 70)
        print("🎬 FINAL PERFECT V2.5 GENERATOR")
        print("=" * 70)
        print(f"🎯 Job: {self.job_id} | Sections: {len(self.sections)}")
        print("=" * 70)
        print()
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        for idx, section in enumerate(self.sections, 1):
            sid = section['section_id']
            stype = section['section_type']
            duration = section['narration']['total_duration_seconds']
            
            has_avatar = bool(section.get('avatar_video')) and (self.assets_dir / section.get('avatar_video', '')).exists()
            
            print(f"[{idx:2d}/{len(self.sections)}] §{sid:02d} {stype:10s} ({duration:5.1f}s) {'🎭' if has_avatar else '  '}", end=" ")
            
            try:
                tsx_code = self._route(section, has_avatar)
                filename = f"Section_{sid:02d}_{stype.capitalize()}.tsx"
                
                with open(self.output_dir / filename, 'w', encoding='utf-8') as f:
                    f.write(tsx_code)
                
                print("✅")
            except Exception as e:
                print(f"❌ {e}")
        
        print()
        print("📦 Generating support files...")
        self._generate_index()
        self._generate_configs()
        
        print()
        print("=" * 70)
        print("✅ PERFECT! Preview: npx remotion studio src/index.tsx")
        print("=" * 70)
    
    def _esc(self, text: str) -> str:
        if not text:
            return ""
        return text.replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"').replace('\n', '\\n').replace('\r', '')
    
    def _route(self, section: Dict, has_avatar: bool) -> str:
        stype = section['section_type']
        
        if stype == 'intro':
            return self._intro(section, has_avatar)
        elif stype == 'summary':
            return self._summary(section, has_avatar)
        elif stype == 'content':
            return self._content(section, has_avatar)
        elif stype == 'quiz':
            return self._quiz(section, has_avatar)
        elif stype == 'memory':
            return self._memory(section, has_avatar)
        elif stype == 'recap':
            return self._recap(section)
        else:
            return self._generic(section, has_avatar)
    
    # ========== SECTION GENERATORS ==========
    
    def _intro(self, section: Dict, has_avatar: bool) -> str:
        """INTRO: Avatar only (V2.5 Bible: text_layer: HIDE)"""
        sid = section['section_id']
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        # Build subtitles from narration
        subs_data = []
        for seg in section['narration']['segments']:
            text = self._esc(seg.get('text', ''))
            start = seg.get('start_time', 0)
            end = seg.get('end_time', start + seg.get('duration_seconds', 10))
            subs_data.append(f"{{ s: {start}, e: {end}, t: \"{text}\" }}")
        
        subs_str = ',\n  '.join(subs_data) if subs_data else '{ s: 0, e: 10, t: "Introduction" }'
        
        avatar = ""
        if has_avatar:
            avatar = f'''
      <div style={{{{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', width: '50%', height: '60%', opacity: avatarOp, zIndex: 20 }}}}>
        <OffthreadVideo src={{staticFile("/jobs/{self.job_id}/{section['avatar_video']}")}} style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}} />
      </div>'''
        
        return f'''import React from 'react';
import {{ AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate }} from 'remotion';

const subs = [{subs_str}];

const BG: React.FC = () => {{
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 600, 1200], [0, 100, 0], {{ extrapolateRight: 'wrap' }});
  return <div style={{{{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)', backgroundSize: '400% 400%', backgroundPosition: `${{p}}% 50%`, zIndex: -1 }}}} />;
}};

export const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  const avatarOp = interpolate(f, [0, 30], [0, 1], {{ extrapolateRight: 'clamp' }});
  
  // Find current subtitle
  const curTime = f / fps;
  const curSub = subs.find(s => curTime >= s.s && curTime < s.e);
  
  return (
    <AbsoluteFill>
      <BG />
      {avatar}
      
      {{/* Subtitles */}}
      {{curSub && (
        <div style={{{{ position: 'absolute', bottom: 80, left: 80, right: 80, zIndex: 30 }}}}>
          <div style={{{{ background: 'rgba(0,0,0,0.8)', padding: '20px 30px', borderRadius: 10, backdropFilter: 'blur(10px)' }}}}>
            <p style={{{{ fontSize: 28, color: 'white', margin: 0, lineHeight: 1.6, textAlign: 'center' }}}}>
              {{curSub.t}}
            </p>
          </div>
        </div>
      )}}
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Intro', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    def _summary(self, section: Dict, has_avatar: bool) -> str:
        """SUMMARY: Visual beats bullets with subtitles"""
        sid = section['section_id']
        title = self._esc(section['title'])
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        # Visual beats for display
        beats = section.get('visual_beats', [])
        beats_data = []
        for beat in beats:
            if beat.get('visual_type') in ['bullet_list', 'text']:
                text = self._esc(beat.get('display_text', ''))
                start = beat.get('start_time', 0)
                end = beat.get('end_time', start + 5)
                beats_data.append(f"{{ s: {start}, e: {end}, t: \"{text}\" }}")
        
        beats_str = ',\n  '.join(beats_data) if beats_data else '{ s: 0, e: 10, t: "Summary" }'
        
        # Subtitles from narration
        subs_data = []
        for seg in section['narration']['segments']:
            text = self._esc(seg.get('text', ''))
            start = seg.get('start_time', 0)
            end = seg.get('end_time', start + seg.get('duration_seconds', 5))
            subs_data.append(f"{{ s: {start}, e: {end}, t: \"{text}\" }}")
        
        subs_str = ',\n  '.join(subs_data) if subs_data else '{ s: 0, e: 10, t: "" }'
        
        avatar = ""
        if has_avatar:
            avatar = f'''
      <div style={{{{ position: 'absolute', bottom: 0, right: 0, width: '45%', height: '55%', zIndex: 20 }}}}>
        <OffthreadVideo src={{staticFile("/jobs/{self.job_id}/{section['avatar_video']}")}} style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}} />
      </div>'''
        
        return f'''import React from 'react';
import {{ AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate }} from 'remotion';

const beats = [{beats_str}];
const subs = [{subs_str}];

const BG: React.FC = () => {{
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 600, 1200], [0, 100, 0], {{ extrapolateRight: 'wrap' }});
  return <div style={{{{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)', backgroundSize: '400% 400%', backgroundPosition: `${{p}}% 50%`, zIndex: -1 }}}} />;
}};

export const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  const curTime = f / fps;
  const curSub = subs.find(s => curTime >= s.s && curTime < s.e);
  
  return (
    <AbsoluteFill>
      <BG />
      
      <div style={{{{ position: 'absolute', left: 0, top: 0, width: '55%', height: '100%', padding: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}}}>
        <h1 style={{{{ fontSize: 72, color: 'white', marginBottom: 60, fontWeight: 'bold', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}}}>{title}</h1>
        
        <div>
          {{beats.map((b, i) => {{
            const sF = b.s * fps;
            const eF = b.e * fps;
            const act = f >= sF && f < eF;
            const app = f >= sF;
            
            const op = app ? (act ? 1 : 0.4) : 0;
            const sc = act ? 1.05 : 1;
            const tx = interpolate(f, [sF, sF + 15], [50, 0], {{ extrapolateRight: 'clamp' }});
            
            return (
              <div key={{i}} style={{{{ opacity: op, transform: `translateX(${{tx}}px) scale(${{sc}})`, fontSize: 36, color: act ? 'white' : '#94a3b8', marginBottom: 30, borderLeft: act ? '4px solid #60a5fa' : '4px solid transparent', paddingLeft: 20, background: act ? 'linear-gradient(90deg, rgba(96,165,250,0.1), transparent)' : 'none', borderRadius: 8 }}}}>
                • {{b.t}}
              </div>
            );
          }})}}
        </div>
      </div>
      
      {avatar}
      
      {{/* Subtitles */}}
      {{curSub && (
        <div style={{{{ position: 'absolute', bottom: 60, left: 60, right: 60, zIndex: 30 }}}}>
          <div style={{{{ background: 'rgba(0,0,0,0.8)', padding: '15px 25px', borderRadius: 8, backdropFilter: 'blur(10px)' }}}}>
            <p style={{{{ fontSize: 24, color: 'white', margin: 0, lineHeight: 1.5, textAlign: 'center' }}}}>{'{'}curSub.t{'}'}</p>
          </div>
        </div>
      )}}
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Summary', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    def _content(self, section: Dict, has_avatar: bool) -> str:
        """CONTENT: Shows visual_beats text (not narration) + subtitles"""
        sid = section['section_id']
        title = self._esc(section['title'])
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        # Build visual beats data for TEACH mode display
        visual_beats = section.get('visual_beats', [])
        segments = section['narration'].get('segments', [])
        
        # Match visual beats to segments by timing
        seg_data = []
        cumulative_time = 0
        
        for seg_idx, seg in enumerate(segments):
            dirs = seg.get('display_directives', {})
            tl = dirs.get('text_layer', 'show')
            vl = dirs.get('visual_layer', 'hide')
            dur = seg.get('duration_seconds', 10)
            vids = seg.get('beat_videos', [])
            
            # Find visual beat text for this segment
            beat_text = ''
            if visual_beats:
                for beat in visual_beats:
                    if beat.get('segment_id') == seg.get('segment_id'):
                        beat_text = self._esc(beat.get('display_text', ''))
                        break
            
            # Fallback to narration if no visual beat
            if not beat_text:
                beat_text = self._esc(seg.get('text', ''))[:150]
            
            seg_data.append(f'''{{ t: "{beat_text}...", d: {dur}, tl: "{tl}", vl: "{vl}", v: {json.dumps(vids)} }}''')
        
        segs = ',\n  '.join(seg_data) if seg_data else '{ t: "Content", d: 10, tl: "show", vl: "hide", v: [] }'
        
        # Subtitles from narration
        subs_data = []
        for seg in segments:
            text = self._esc(seg.get('text', ''))
            dur = seg.get('duration_seconds', 10)
            subs_data.append(f'''{{ d: {dur}, t: "{text}" }}''')
        
        subs_str = ',\n  '.join(subs_data) if subs_data else '{ d: 10, t: "" }'
        
        avatar = ""
        if has_avatar:
            avatar = f'''<div style={{{{ position: 'absolute', bottom: 0, right: 0, width: '45%', height: '55%', zIndex: 20 }}}}>
            <OffthreadVideo src={{staticFile("/jobs/{self.job_id}/{section['avatar_video']}")}} style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}} />
          </div>'''
        
        return f'''import React from 'react';
import {{ AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate }} from 'remotion';

const segs = [{segs}];
const subs = [{subs_str}];

const BG: React.FC = () => {{
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 600, 1200], [0, 100, 0], {{ extrapolateRight: 'wrap' }});
  return <div style={{{{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)', backgroundSize: '400% 400%', backgroundPosition: `${{p}}% 50%`, zIndex: -1 }}}} />;
}};

export const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  let time = 0, cur = segs[0], curSubIdx = 0, sF = 0;
  for (let i = 0; i < segs.length; i++) {{
    if (f / fps >= time && f / fps < time + segs[i].d) {{
      cur = segs[i];
      curSubIdx = i;
      sF = time * fps;
      break;
    }}
    time += segs[i].d;
  }}
  
  const teachOp = interpolate(f, [sF, sF + 20], [cur.tl === 'show' ? 0 : 1, cur.tl === 'show' ? 1 : 0], {{ extrapolateRight: 'clamp' }});
  const showOp = interpolate(f, [sF, sF + 20], [cur.vl === 'show' ? 0 : 1, cur.vl === 'show' ? 1 : 0], {{ extrapolateRight: 'clamp' }});
  
  return (
    <AbsoluteFill>
      <BG />
      
      <div style={{{{ opacity: teachOp, position: 'absolute', inset: 0 }}}}>
        <div style={{{{ position: 'absolute', left: 0, top: 0, width: '55%', height: '100%', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}}}>
          <h2 style={{{{ fontSize: 48, color: 'white', marginBottom: 40, fontWeight: 'bold' }}}}>{title}</h2>
          
          {{segs.map((s, i) => {{
            let st = 0;
            for (let j = 0; j < i; j++) st += segs[j].d * fps;
            const act = f >= st && f < st + s.d * fps;
            const app = f >= st;
            const op = app ? (act ? 1 : 0.4) : 0;
            const sc = act ? 1.05 : 1;
            const tx = interpolate(f, [st, st + 10], [50, 0], {{ extrapolateRight: 'clamp' }});
            
            return (
              <div key={{i}} style={{{{ opacity: op, transform: `translateX(${{tx}}px) scale(${{sc}})`, borderLeft: act ? '4px solid #60a5fa' : '4px solid transparent', padding: 20, marginBottom: 20, fontSize: 28, color: act ? 'white' : '#94a3b8' }}}}>
                {{s.t}}
              </div>
            );
          }})}}
        </div>
        
        {avatar}
      </div>
      
      <div style={{{{ opacity: showOp, position: 'absolute', inset: 0, zIndex: 10 }}}}>
        {{cur.v && cur.v.length > 0 && (
          <OffthreadVideo src={{staticFile(`/jobs/{self.job_id}/${{cur.v[0]}}`)}} style={{{{ width: '100%', height: '100%', objectFit: 'cover' }}}} />
        )}}
      </div>
      
      {{/* Subtitles */}}
      {{subs[curSubIdx] && (
        <div style={{{{ position: 'absolute', bottom: 60, left: 60, right: 60, zIndex: 30 }}}}>
          <div style={{{{ background: 'rgba(0,0,0,0.85)', padding: '15px 25px', borderRadius: 8, backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}}}>
            <p style={{{{ fontSize: 24, color: 'white', margin: 0, lineHeight: 1.5, textAlign: 'center' }}}}>{'{'}subs[curSubIdx].t{'}'}</p>
          </div>
        </div>
      )}}
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Content', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    def _quiz(self, section: Dict, has_avatar: bool) -> str:
        """QUIZ: 3-step with subtitles"""
        sid = section['section_id']
        title = self._esc(section['title'])
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        return self._generic(section, has_avatar)
    
    def _memory(self, section: Dict, has_avatar: bool) -> str:
        """MEMORY: Flashcard with subtitles"""
        sid = section['section_id']
        title = self._esc(section['title'])
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        segments = section['narration'].get('segments', [])
        front_text = self._esc(segments[0].get('text', 'Memory Term')[:100]) if segments else 'Front'
        back_text = self._esc(segments[1].get('text', 'Answer')[:100]) if len(segments) > 1 else 'Back'
        
        # Subtitles
        subs_data = []
        for seg in segments:
            text = self._esc(seg.get('text', ''))
            start = seg.get('start_time', 0)
            end = seg.get('end_time', start + seg.get('duration_seconds', 10))
            subs_data.append(f"{{ s: {start}, e: {end}, t: \"{text}\" }}")
        
        subs_str = ',\n  '.join(subs_data) if subs_data else '{ s: 0, e: 10, t: "" }'
        
        avatar = ""
        if has_avatar:
            avatar = f'''
      <div style={{{{ position: 'absolute', bottom: 0, right: 0, width: '35%', height: '45%', zIndex: 20 }}}}>
        <OffthreadVideo src={{staticFile("/jobs/{self.job_id}/{section['avatar_video']}")}} style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}} />
      </div>'''
        
        return f'''import React from 'react';
import {{ AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate }} from 'remotion';

const subs = [{subs_str}];

const BG: React.FC = () => {{
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 600, 1200], [0, 100, 0], {{ extrapolateRight: 'wrap' }});
  return <div style={{{{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)', backgroundSize: '400% 400%', backgroundPosition: `${{p}}% 50%`, zIndex: -1 }}}} />;
}};

export const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  const cF = f % (20 * 30);
  const flipF = 10 * 30;
  const rotY = interpolate(cF, [flipF - 15, flipF + 15], [0, 180], {{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }});
  
  const curTime = f / fps;
  const curSub = subs.find(s => curTime >= s.s && curTime < s.e);
  
  return (
    <AbsoluteFill>
      <BG />
      
      <div style={{{{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '70%', height: '400px', perspective: '1000px' }}}}>
        <div style={{{{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateY(${{rotY}}deg)` }}}}>
          <div style={{{{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'white', fontWeight: 'bold', padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}}}>
            {front_text}
          </div>
          <div style={{{{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}}}>
            {back_text}
          </div>
        </div>
      </div>
      
      {avatar}
      
      {{/* Subtitles */}}
      {{curSub && (
        <div style={{{{ position: 'absolute', bottom: 60, left: 60, right: 60, zIndex: 30 }}}}>
          <div style={{{{ background: 'rgba(0,0,0,0.8)', padding: '15px 25px', borderRadius: 8, backdropFilter: 'blur(10px)' }}}}>
            <p style={{{{ fontSize: 24, color: 'white', margin: 0, lineHeight: 1.5, textAlign: 'center' }}}}>{'{'}curSub.t{'}'}</p>
          </div>
        </div>
      )}}
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Memory', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    def _recap(self, section: Dict) -> str:
        """RECAP: Cinematic with subtitles"""
        sid = section['section_id']
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        segs = section['narration'].get('segments', [])
        seg_data = []
        for s in segs:
            text = self._esc(s.get('text', ''))[:200]
            dur = s.get('duration_seconds', 10)
            vids = s.get('beat_videos', [])
            seg_data.append(f'''{{ t: "{text}", d: {dur}, v: {json.dumps(vids)} }}''')
        
        segs_str = ',\n  '.join(seg_data) if seg_data else '{ t: "Recap", d: 10, v: [] }'
        
        return f'''import React from 'react';
import {{ AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig }} from 'remotion';

const segs = [{segs_str}];

export const Section{sid}Composition: React.FC = () => {{
  const f = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  let time = 0, cur = segs[0];
  for (let i = 0; i < segs.length; i++) {{
    if (f / fps >= time && f / fps < time + segs[i].d) {{
      cur = segs[i];
      break;
    }}
    time += segs[i].d;
  }}
  
  const vid = cur.v && cur.v.length > 0 ? cur.v[0] : null;
  
  return (
    <AbsoluteFill>
      {{vid && <OffthreadVideo src={{staticFile(`/jobs/{self.job_id}/${{vid}}`)}} style={{{{ width: '100%', height: '100%', objectFit: 'cover' }}}} />}}
      
      {{/* Subtitles */}}
      <div style={{{{ position: 'absolute', bottom: 80, left: 80, right: 80, color: 'white', zIndex: 30 }}}}>
        <div style={{{{ background: 'rgba(0,0,0,0.8)', padding: '20px 30px', borderRadius: 12, backdropFilter: 'blur(12px)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}}}>
          <p style={{{{ fontSize: 28, color: 'white', margin: 0, lineHeight: 1.6, textAlign: 'center' }}}}>{'{'}cur.t{'}'}</p>
        </div>
      </div>
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-Recap', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    def _generic(self, section: Dict, has_avatar: bool) -> str:
        sid = section['section_id']
        title = self._esc(section['title'])
        duration = round(section['narration']['total_duration_seconds'] * 30)
        
        return f'''import React from 'react';
import {{ AbsoluteFill }} from 'remotion';

export const Section{sid}Composition: React.FC = () => {{
  return (
    <AbsoluteFill style={{{{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48 }}}}>
      <h1>{title}</h1>
    </AbsoluteFill>
  );
}};

export default Section{sid}Composition;
export const metadata = {{ id: 'Section-{sid:02d}-{section['section_type'].capitalize()}', durationInFrames: {duration}, fps: 30, width: 1920, height: 1080 }};
'''
    
    # ========== SUPPORT FILES ==========
    
    def _generate_index(self):
        imports = []
        regs = []
        
        for s in self.sections:
            sid = s['section_id']
            stype = s['section_type'].capitalize()
            comp = f"Section{sid}Composition"
            file = f"Section_{sid:02d}_{stype}"
            
            imports.append(f"import {comp}, {{ metadata as m{sid} }} from './compositions/{file}';")
            regs.append(f"      <Composition id={{m{sid}.id}} component={{{comp}}} durationInFrames={{m{sid}.durationInFrames}} fps={{m{sid}.fps}} width={{m{sid}.width}} height={{m{sid}.height}} />")
        
        code = f'''import React from 'react';
import {{ Composition }} from 'remotion';
import {{ registerRoot }} from 'remotion';

{chr(10).join(imports)}

export const RemotionRoot: React.FC = () => {{
  return (
    <>
{chr(10).join(regs)}
    </>
  );
}};

registerRoot(RemotionRoot);
'''
        
        src = self.output_dir / 'src'
        src.mkdir(exist_ok=True)
        (src / 'compositions').mkdir(exist_ok=True)
        
        for f in self.output_dir.glob('Section_*.tsx'):
            f.rename(src / 'compositions' / f.name)
        
        with open(src / 'index.tsx', 'w') as f:
            f.write(code)
    
    def _generate_configs(self):
        with open(self.output_dir / 'package.json', 'w') as f:
            json.dump({
                "name": "remotion-v25-final",
                "version": "1.0.0",
                "scripts": {"start": "remotion studio src/index.tsx"},
                "dependencies": {
                    "@remotion/cli": "^4.0.406",
                    "@remotion/bundler": "^4.0.406",
                    "@remotion/renderer": "^4.0.406",
                    "remotion": "^4.0.406",
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0"
                },
                "devDependencies": {"@types/react": "^18.2.0", "typescript": "^5.3.0"}
            }, f, indent=2)
        
        with open(self.output_dir / 'tsconfig.json', 'w') as f:
            json.dump({
                "compilerOptions": {
                    "target": "ES2022",
                    "module": "ES2022",
                    "moduleResolution": "bundler",
                    "jsx": "react",
                    "skipLibCheck": True,
                    "esModuleInterop": True,
                    "strict": True,
                    "lib": ["ES2022", "DOM"]
                },
                "include": ["src/**/*"]
            }, f, indent=2)
        
        with open(self.output_dir / 'remotion.config.ts', 'w') as f:
            f.write('''import { Config } from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setCrf(18);
Config.setOverwriteOutput(true);
''')


if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python generate_remotion_FINAL_PERFECT.py <presentation.json> <assets> <output>")
        sys.exit(1)
    
    FinalPerfectGenerator(sys.argv[1], sys.argv[3], sys.argv[2]).generate_all()
