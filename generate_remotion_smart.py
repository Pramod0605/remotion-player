#!/usr/bin/env python3
"""
Smart Remotion Generator - Checks what files actually exist
Only includes avatar/audio/video if they're present in your folders
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, Any


class SmartRemotionGenerator:
    
    def __init__(self, presentation_path: str, output_dir: str, assets_dir: str):
        self.presentation_path = presentation_path
        self.output_dir = Path(output_dir)
        self.assets_dir = Path(assets_dir)
        
        with open(presentation_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        self.sections = self.data['sections']
        self.job_id = self._extract_job_id()
        
        # Scan what files actually exist
        self.has_avatars = (self.assets_dir / 'avatars').exists()
        self.has_audio = (self.assets_dir / 'audio').exists()
        self.has_videos = (self.assets_dir / 'videos').exists()
        
        print(f"📁 Assets scan:")
        print(f"   Avatars: {'✅ Found' if self.has_avatars else '❌ Not found'}")
        print(f"   Audio: {'✅ Found' if self.has_audio else '❌ Not found'}")
        print(f"   Videos: {'✅ Found' if self.has_videos else '❌ Not found'}")
        print()
    
    def _extract_job_id(self) -> str:
        path_str = str(self.presentation_path).replace('\\', '/')
        if '/jobs/' in path_str:
            parts = path_str.split('/jobs/')
            if len(parts) > 1:
                return parts[1].split('/')[0]
        return "48808436"
    
    def generate_all(self):
        print("=" * 70)
        print("🎬 SMART REMOTION GENERATOR")
        print("=" * 70)
        print(f"📂 Presentation: {self.presentation_path}")
        print(f"📂 Assets: {self.assets_dir}")
        print(f"📂 Output: {self.output_dir}")
        print(f"🎯 Job ID: {self.job_id}")
        print("=" * 70)
        print()
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate sections
        for idx, section in enumerate(self.sections, 1):
            sid = section['section_id']
            stype = section['section_type']
            duration = section['narration']['total_duration_seconds']
            
            # Check if this section's avatar exists
            avatar_exists = False
            if self.has_avatars and 'avatar_video' in section:
                avatar_file = self.assets_dir / section['avatar_video']
                avatar_exists = avatar_file.exists()
            
            print(f"[{idx:2d}/{len(self.sections)}] Section {sid:02d} {stype:10s} ({duration:5.1f}s) {'🎭' if avatar_exists else '  '}", end=" ")
            
            try:
                tsx_code = self._generate_section(section, avatar_exists)
                filename = f"Section_{sid:02d}_{stype.capitalize()}.tsx"
                
                with open(self.output_dir / filename, 'w', encoding='utf-8') as f:
                    f.write(tsx_code)
                
                print("✅")
            except Exception as e:
                print(f"❌ {e}")
        
        print()
        print("📦 Generating support files...")
        self._generate_index()
        self._generate_config()
        self._generate_package_json()
        self._generate_tsconfig()
        
        print()
        print("=" * 70)
        print("✅ GENERATION COMPLETE!")
        print("=" * 70)
        print()
        print("🚀 Next steps:")
        print(f"   cd {self.output_dir}")
        print("   npm install")
        print("   npx remotion render src/index.tsx Section-01-Intro out/s01.mp4")
        print()
    
    def _esc(self, text: str) -> str:
        if not text:
            return ""
        return text.replace('\\', '\\\\').replace("'", "\\'").replace('"', '\\"').replace('\n', ' ').replace('\r', '')
    
    def _generate_section(self, section: Dict, avatar_exists: bool) -> str:
        sid = section['section_id']
        stype = section['section_type']
        title = self._esc(section['title'])
        duration_frames = round(section['narration']['total_duration_seconds'] * 30)
        comp_name = f"Section{sid}Composition"
        
        # Check for audio file
        audio_exists = False
        if self.has_audio:
            audio_file = self.assets_dir / 'audio' / f'section_{sid}_narration.mp3'
            audio_exists = audio_file.exists()
        
        code = f'''import React from 'react';
import {{ AbsoluteFill, Audio, Video, useCurrentFrame, interpolate }} from 'remotion';

/**
 * Section {sid}: {title}
 * Type: {stype.upper()}
 * Duration: {duration_frames} frames ({section['narration']['total_duration_seconds']:.2f}s)
 */

const DeepSpaceBackground: React.FC = () => {{
  const frame = useCurrentFrame();
  const bgPositionX = interpolate(frame, [0, 600, 1200], [0, 100, 0], {{ extrapolateRight: 'wrap' }});
  
  return (
    <div style={{{{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a)',
      backgroundSize: '400% 400%',
      backgroundPosition: `${{bgPositionX}}% 50%`,
      zIndex: -1
    }}}} />
  );
}};

export const {comp_name}: React.FC = () => {{
  const frame = useCurrentFrame();
  const avatarOpacity = interpolate(frame, [0, 30], [0, 1], {{ extrapolateRight: 'clamp' }});
  
  return (
    <AbsoluteFill>
      <DeepSpaceBackground />
      
      <div style={{{{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}}}>
        <h1 style={{{{ fontSize: 72, color: 'white', textAlign: 'center', padding: 40 }}}}>{title}</h1>
      </div>
'''
        
        # Add avatar if it exists
        if avatar_exists:
            avatar_path = section.get('avatar_video', '')
            code += f'''
      <div style={{{{ position: 'absolute', bottom: 0, right: 0, width: '45%', height: '55%', opacity: avatarOpacity, zIndex: 20 }}}}>
        <Video src="/jobs/{self.job_id}/{avatar_path}" style={{{{ width: '100%', height: '100%', objectFit: 'contain' }}}} />
      </div>
'''
        
        # Add audio if it exists
        if audio_exists:
            code += f'''
      <Audio src="/jobs/{self.job_id}/audio/section_{sid}_narration.mp3" />
'''
        
        code += f'''    </AbsoluteFill>
  );
}};

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
    
    def _generate_index(self):
        imports = []
        registrations = []
        
        for section in self.sections:
            sid = section['section_id']
            stype = section['section_type'].capitalize()
            comp_name = f"Section{sid}Composition"
            filename = f"Section_{sid:02d}_{stype}"
            
            imports.append(f"import {comp_name}, {{ metadata as meta{sid} }} from './compositions/{filename}';")
            registrations.append(f"      <Composition id={{meta{sid}.id}} component={{{comp_name}}} durationInFrames={{meta{sid}.durationInFrames}} fps={{meta{sid}.fps}} width={{meta{sid}.width}} height={{meta{sid}.height}} />")
        
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
        
        src_dir = self.output_dir / 'src'
        src_dir.mkdir(exist_ok=True)
        (src_dir / 'compositions').mkdir(exist_ok=True)
        
        for file in self.output_dir.glob('Section_*.tsx'):
            file.rename(src_dir / 'compositions' / file.name)
        
        with open(src_dir / 'index.tsx', 'w') as f:
            f.write(index_code)
    
    def _generate_config(self):
        config = '''import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setCrf(18);
Config.setOverwriteOutput(true);
'''
        with open(self.output_dir / 'remotion.config.ts', 'w') as f:
            f.write(config)
    
    def _generate_package_json(self):
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
    if len(sys.argv) < 4:
        print("Usage: python generate_remotion_smart.py <presentation.json> <assets-folder> <output-dir>")
        print()
        print("Example:")
        print("  python generate_remotion_smart.py presentation.json public/jobs/48808436 output-sections")
        sys.exit(1)
    
    generator = SmartRemotionGenerator(sys.argv[1], sys.argv[3], sys.argv[2])
    generator.generate_all()


if __name__ == '__main__':
    main()
