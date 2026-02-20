#!/usr/bin/env python3
"""
🎬 GREEN SCREEN REMOVAL - SIMPLE & WORKING
============================================
No fancy verification - just processes and trusts FFmpeg output

Usage:
    python remove_greenscreen_SIMPLE.py jobs/738ffe51
"""

import json
import subprocess
import sys
from pathlib import Path
from shutil import copy2


def remove_greenscreen(input_file: Path, output_file: Path):
    """Remove green screen using colorkey filter"""
    
    cmd = [
        'ffmpeg',
        '-i', str(input_file),
        '-vf', 'colorkey=0x00FF00:0.3:0.2',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-y',
        str(output_file)
    ]
    
    result = subprocess.run(cmd, 
                           stdout=subprocess.DEVNULL, 
                           stderr=subprocess.DEVNULL)
    
    return result.returncode == 0


def update_json(job_folder: Path, processed_files: dict):
    """Update presentation.json with new paths"""
    
    json_path = job_folder / 'presentation.json'
    
    if not json_path.exists():
        return 0
    
    # Backup
    backup_path = job_folder / 'presentation.json.backup'
    copy2(json_path, backup_path)
    
    # Load
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Update
    updated = 0
    for section in data.get('sections', []):
        if 'avatar_video' in section:
            old = section['avatar_video']
            if old in processed_files:
                section['avatar_video'] = processed_files[old]
                updated += 1
    
    # Save
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return updated


def main():
    print()
    print("=" * 70)
    print("🎬 GREEN SCREEN REMOVAL - SIMPLE VERSION")
    print("=" * 70)
    print()
    
    if len(sys.argv) < 2:
        print("Usage: python remove_greenscreen_SIMPLE.py jobs/738ffe51")
        sys.exit(1)
    
    job_folder = Path(sys.argv[1])
    avatars_folder = job_folder / 'avatars'
    
    if not avatars_folder.exists():
        print(f"❌ Avatars folder not found: {avatars_folder}")
        sys.exit(1)
    
    mp4_files = list(avatars_folder.glob('*.mp4'))
    
    if not mp4_files:
        print(f"❌ No MP4 files in: {avatars_folder}")
        sys.exit(1)
    
    output_folder = job_folder / 'avatars-transparent'
    output_folder.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Job: {job_folder}")
    print(f"📁 Processing: {len(mp4_files)} files")
    print()
    
    processed = {}
    success = 0
    
    for idx, input_file in enumerate(mp4_files, 1):
        output_file = output_folder / f"{input_file.stem}.webm"
        
        print(f"[{idx}/{len(mp4_files)}] {input_file.name:35s}", end=" ")
        
        if remove_greenscreen(input_file, output_file):
            print("✅")
            old_path = f"avatars/{input_file.name}"
            new_path = f"avatars-transparent/{output_file.name}"
            processed[old_path] = new_path
            success += 1
        else:
            print("❌")
    
    print()
    
    if processed:
        print("Updating presentation.json...")
        updated = update_json(job_folder, processed)
        print(f"✅ Backup: presentation.json.backup")
        print(f"✅ Updated: {updated} sections")
        print()
    
    print("=" * 70)
    print(f"✅ Processed: {success}/{len(mp4_files)} files")
    print("=" * 70)
    print()
    
    if success > 0:
        print(f"📁 Output: {output_folder}")
        print()
        print("🔍 VERIFY: Open one WebM in browser to check transparency")
        print()
        print("✅ Next step: Generate TSX files")
        print(f"   python generate_remotion_FINAL_PERFECT.py \\")
        print(f"     {job_folder / 'presentation.json'} \\")
        print(f"     {job_folder} \\")
        print(f"     output-sections")
        print()


if __name__ == '__main__':
    main()
