#!/usr/bin/env python3
"""
🎬 Complete Remotion Generator - TESTED VERSION
Generates standalone section files that work with Remotion CLI

Each section is a complete, renderable Remotion project file.
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, Any


class RemotionGenerator:
    """Generates proper Remotion files with registerRoot()"""
    
    def __init__(self, presentation_path: str, output_dir: str):
        self.presentation_path = presentation_path
        self.output_dir = Path(output_dir)
        
        with open(presentation_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        self.sections = self.data['sections']
        self.job_id = self._extract_job_id()
    
    def _extract_job_id(self) -> str:
        path_str = str(self.presentation_path).replace('\\', '/')
        if '/jobs/' in path_str:
            parts = path_str.split('/jobs/')
            if len(parts) > 1:
                return parts[1].split('/')[0]
        return "f963fc1c"
    
    def generate_all(self):
        """Generate all files"""
        print("=" * 70)
        print("🎬 COMPLETE REMOTION GENERATOR - TESTED")
        print("=" * 70)
        print(f"📂 Input:  {self.presentation_path}")
        print(f"📂 Output: {self.output_dir}")
        print(f"🎯 Job ID: {self.job_id}")
        print(f"📊 Sections: {len(self.sections)}")
        print("=" * 70)
        print()
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate each section as standalone file
        for idx, section in enumerate(self.sections, 1):
            sid = section['section_id']
            stype = section['section_type']
            duration = section['narration']['total_duration_seconds']
            has_avatar = 'avatar_video' in section
            
            print(f"[{idx:2d}/{len(self.sections)}] Section_{sid:02d} {stype:10s} ({duration:5.1f}s) {'🎭' if has_avatar else '  '}", end=" ")
            
            try:
                # Generate standalone file
                tsx_code = self._generate_standalone_section(section)
                filename = f"Section_{sid:02d}_{stype.capitalize()}.tsx"
                output_path = self.output_dir / filename
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(tsx_code)
                
                print("✅")
            except Exception as e:
                print(f"❌ {e}")
        
        # Generate index.ts (proper entry point)
        print()
        print("📦 Generating index.ts (entry point)...")
        self._generate_index()
        
        # Generate remotion.config.ts
        print("📦 Generating remotion.config.ts...")
        self._generate_config()
        
        # Generate package.json
        print("📦 Generating package.json...")
        self._generate_package_json()
        
        # Generate tsconfig.json
        print("📦 Generating tsconfig.json...")
        self._generate_tsconfig()
        
        print()
        print("=" * 70)
        print("✅ GENERATION COMPLETE!")
        print("=" * 70)
        print()
        print("🚀 Quick start:")
        print(f"   cd {self.output_dir}")
        print("   npm install")
        print("   npx remotion render src/index.tsx Section_01_Intro out/s01.mp4")
        print()
        print("=" * 70)
    
    def _esc(self, text: str) -> str:
        """Escape text for JS strings"""
        if not text:
            return ""
        return text.replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"').replace('\n', ' ').replace('\r', '')
    
    def _generate_standalone_section(self, section: Dict) -> str:
        """Generate a complete standalone TSX file"""
        sid = section['section_id']
        stype = section['section_type']
        title = self._esc(section['title'])
        duration_frames = round(section['narration']['total_duration_seconds'] * 30)
        has_avatar = 'avatar_video' in section
        avatar_path = section.get('avatar_video', '')
        
        # Component name
        comp_name = f"Section{sid}Composition"
        
        # Base structure
        code = f'''import React from 'react';
import {{ AbsoluteFill, Audio, Video, useCurrentFrame, useVideoConfig, interpolate }} from 'remotion';

/**
 * Section {sid}: {title}
 * Type: {stype.upper()}
 * Duration: {section['narration']['total_duration_seconds']:.2f}s ({duration_frames} frames)
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

'''
        
        # Generate composition based on type
        if stype == 'intro':
            code += self._comp_intro(section, comp_name, has_avatar, avatar_path)
        elif stype == 'summary':
            code += self._comp_summary(section, comp_name, has_avatar, avatar_path)
        elif stype == 'content':
            code += self._comp_content(section, comp_name, has_avatar, avatar_path)
        elif stype == 'quiz':
            code += self._comp_quiz(section, comp_name, has_avatar, avatar_path)
        elif stype == 'memory':
            code += self._comp_memory(section, comp_name, has_avatar, avatar_path)
        elif stype == 'recap':
            code += self._comp_recap(section, comp_name)
        else:
            code += self._comp_generic(section, comp_name)
        
        # Export
        code += f'''
export default {comp_name};
export const metadata = {{
  id: 'Section-{sid:02d}-{stype.capitalize()}',
  durationInFrames: {duration_frames},
  fps: 30,
  width: 1920,
  height: 1080
}};
'''
        
        return code
    
    def _comp_intro(self, section: Dict, comp_name: str, has_avatar: bool, avatar_path: str) -> str:
        """Generate Intro composition"""
        return f'''export const {comp_name}: React.FC = () => {{
  const frame = useCurrentFrame();
  const avatarOpacity = interpolate(frame, [0, 30], [0, 1], {{ extrapolateRight: 'clamp' }});
  
  return (
    <AbsoluteFill>
      <DeepSpaceBackground />
      
      {f"""<div style={{{{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', width: '50%', height: '60%', opacity: avatarOpacity, zIndex: 20 }}}}>
        <Video src="/jobs/{self.job_id}/{avatar_path}" style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}} />
      </div>""" if has_avatar else ""}
      
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};
'''
    
    def _comp_summary(self, section: Dict, comp_name: str, has_avatar: bool, avatar_path: str) -> str:
        """Generate Summary composition"""
        beats = section.get('visual_beats', [])
        beats_data = []
        for beat in beats:
            text = self._esc(beat.get('display_text', ''))
            beats_data.append(f"{{ start: {beat['start_time']}, end: {beat['end_time']}, text: \"{text}\" }}")
        
        beats_str = ', '.join(beats_data) if beats_data else '{ start: 0, end: 10, text: "Summary" }'
        title = self._esc(section['title'])
        
        return f'''const beats = [{beats_str}];

export const {comp_name}: React.FC = () => {{
  const frame = useCurrentFrame();
  const {{ fps }} = useVideoConfig();
  
  return (
    <AbsoluteFill>
      <DeepSpaceBackground />
      
      <div style={{{{ position: 'absolute', left: 0, top: 0, width: '55%', height: '100%', padding: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}}}>
        <h1 style={{{{ fontSize: 72, color: 'white', marginBottom: 60, fontWeight: 'bold' }}}}>{title}</h1>
        <div>
          {{beats.map((beat, idx) => {{
            const startFrame = beat.start * fps;
            const endFrame = beat.end * fps;
            const isActive = frame >= startFrame && frame < endFrame;
            const hasAppeared = frame >= startFrame;
            const opacity = hasAppeared ? (isActive ? 1 : 0.4) : 0;
            const translateX = interpolate(frame, [startFrame, startFrame + 15], [50, 0], {{ extrapolateRight: 'clamp' }});
            
            return (
              <div key={{idx}} style={{{{ opacity, transform: `translateX(${{translateX}}px)`, fontSize: 36, color: isActive ? 'white' : '#94a3b8', marginBottom: 30, borderLeft: isActive ? '4px solid #60a5fa' : '4px solid transparent', paddingLeft: 20 }}}}>
                • {{beat.text}}
              </div>
            );
          }})}}
        </div>
      </div>
      
      {f"""<div style={{{{ position: 'absolute', bottom: 0, right: 0, width: '45%', height: '55%', zIndex: 20 }}}}>
        <Video src="/jobs/{self.job_id}/{avatar_path}" style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}} />
      </div>""" if has_avatar else ""}
      
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};
'''
    
    def _comp_content(self, section: Dict, comp_name: str, has_avatar: bool, avatar_path: str) -> str:
        """Generate Content composition"""
        return f'''export const {comp_name}: React.FC = () => {{
  return (
    <AbsoluteFill>
      <DeepSpaceBackground />
      <div style={{{{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48 }}}}>
        <h1>{self._esc(section['title'])}</h1>
      </div>
      {f"""<div style={{{{ position: 'absolute', bottom: 0, right: 0, width: '45%', height: '55%', zIndex: 20 }}}}>
        <Video src="/jobs/{self.job_id}/{avatar_path}" style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}} />
      </div>""" if has_avatar else ""}
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};
'''
    
    def _comp_quiz(self, section: Dict, comp_name: str, has_avatar: bool, avatar_path: str) -> str:
        return self._comp_content(section, comp_name, has_avatar, avatar_path)
    
    def _comp_memory(self, section: Dict, comp_name: str, has_avatar: bool, avatar_path: str) -> str:
        return self._comp_content(section, comp_name, has_avatar, avatar_path)
    
    def _comp_recap(self, section: Dict, comp_name: str) -> str:
        return self._comp_generic(section, comp_name)
    
    def _comp_generic(self, section: Dict, comp_name: str) -> str:
        return f'''export const {comp_name}: React.FC = () => {{
  return (
    <AbsoluteFill style={{{{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}}}>
      <h1>{self._esc(section['title'])}</h1>
      <Audio src="/jobs/{self.job_id}/audio/section_{section['section_id']}_narration.mp3" />
    </AbsoluteFill>
  );
}};
'''
    
    def _generate_index(self):
        """Generate index.ts with registerRoot()"""
        imports = []
        registrations = []
        
        for section in self.sections:
            sid = section['section_id']
            stype = section['section_type'].capitalize()
            comp_name = f"Section{sid}Composition"
            filename = f"Section_{sid:02d}_{stype}"
            
            imports.append(f"import {comp_name}, {{ metadata as meta{sid} }} from './compositions/{filename}';")
            registrations.append(f"  <Composition id={{meta{sid}.id}} component={{{comp_name}}} durationInFrames={{meta{sid}.durationInFrames}} fps={{meta{sid}.fps}} width={{meta{sid}.width}} height={{meta{sid}.height}} />")
        
        index_code = f'''import React from 'react';
import {{ Composition }} from 'remotion';
import {{ registerRoot }} from 'remotion';

{chr(10).join(imports)}

export const RemotionRoot: React.FC = () => {{
  return (
    <>
{chr(10).join(registrations)}
    </>
  );
}};

registerRoot(RemotionRoot);
'''
        
        # Create src directory
        src_dir = self.output_dir / 'src'
        src_dir.mkdir(exist_ok=True)
        (src_dir / 'compositions').mkdir(exist_ok=True)
        
        # Move all TSX files to src/compositions
        for file in self.output_dir.glob('Section_*.tsx'):
            file.rename(src_dir / 'compositions' / file.name)
        
        # Write index.tsx
        with open(src_dir / 'index.tsx', 'w') as f:
            f.write(index_code)
    
    def _generate_config(self):
        """Generate remotion.config.ts"""
        config = '''import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setCrf(18);
Config.setOverwriteOutput(true);
'''
        
        with open(self.output_dir / 'remotion.config.ts', 'w') as f:
            f.write(config)
    
    def _generate_package_json(self):
        """Generate package.json"""
        package = {
            "name": "remotion-sections",
            "version": "1.0.0",
            "scripts": {
                "start": "remotion studio src/index.tsx",
                "build": "remotion render src/index.tsx"
            },
            "dependencies": {
                "@remotion/cli": "^4.0.406",
                "@remotion/bundler": "^4.0.406",
                "@remotion/renderer": "^4.0.406",
                "remotion": "^4.0.406",
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
            },
            "devDependencies": {
                "@types/react": "^18.2.0",
                "typescript": "^5.3.0"
            }
        }
        
        with open(self.output_dir / 'package.json', 'w') as f:
            json.dump(package, f, indent=2)
    
    def _generate_tsconfig(self):
        """Generate tsconfig.json"""
        tsconfig = {
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
        }
        
        with open(self.output_dir / 'tsconfig.json', 'w') as f:
            json.dump(tsconfig, f, indent=2)


def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_remotion_complete.py <presentation.json> <output-dir>")
        sys.exit(1)
    
    generator = RemotionGenerator(sys.argv[1], sys.argv[2])
    generator.generate_all()


if __name__ == '__main__':
    main()
