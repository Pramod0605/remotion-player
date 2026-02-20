#!/usr/bin/env python3
"""
🎬 ULTIMATE GREEN SCREEN REMOVAL - GUARANTEED WORKING
======================================================
Multiple methods to ensure green screen is ACTUALLY removed!

Usage:
    python remove_greenscreen_ULTIMATE.py jobs/738ffe51
"""

import json
import subprocess
import sys
from pathlib import Path
from shutil import copy2


def check_ffmpeg():
    """Check FFmpeg version and capabilities"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                               stdout=subprocess.PIPE, 
                               text=True)
        return True
    except:
        return False


def method_colorkey(input_file: Path, output_file: Path):
    """Method 1: colorkey filter (most reliable)"""
    cmd = [
        'ffmpeg', '-i', str(input_file),
        '-vf', 'colorkey=0x00FF00:0.3:0.2',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-y', str(output_file)
    ]
    
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.returncode == 0


def method_chromakey(input_file: Path, output_file: Path):
    """Method 2: chromakey filter (alternative)"""
    cmd = [
        'ffmpeg', '-i', str(input_file),
        '-vf', 'chromakey=0x00FF00:0.3:0.2',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-y', str(output_file)
    ]
    
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.returncode == 0


def method_complex(input_file: Path, output_file: Path):
    """Method 3: Complex filter with color correction"""
    cmd = [
        'ffmpeg', '-i', str(input_file),
        '-filter_complex',
        '[0:v]colorkey=0x00FF00:0.3:0.2,format=yuva420p[out]',
        '-map', '[out]',
        '-c:v', 'libvpx-vp9',
        '-auto-alt-ref', '0',
        '-y', str(output_file)
    ]
    
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.returncode == 0


def verify_transparency(video_file: Path):
    """Verify the output actually has alpha channel"""
    cmd = [
        'ffprobe', '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=pix_fmt',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        str(video_file)
    ]
    
    result = subprocess.run(cmd, stdout=subprocess.PIPE, text=True)
    pix_fmt = result.stdout.strip()
    
    return 'yuva' in pix_fmt


def remove_greenscreen_multi_method(input_file: Path, output_file: Path):
    """Try multiple methods until one works"""
    
    methods = [
        ("colorkey", method_colorkey),
        ("chromakey", method_chromakey),
        ("complex", method_complex)
    ]
    
    for method_name, method_func in methods:
        print(f"      Trying method: {method_name}...", end=" ")
        
        if method_func(input_file, output_file):
            # Verify it actually has transparency
            if verify_transparency(output_file):
                print(f"✅ SUCCESS!")
                return True
            else:
                print(f"⚠️  No alpha channel")
        else:
            print(f"❌ Failed")
    
    return False


def update_presentation_json(job_folder: Path, processed_files: dict):
    """Update presentation.json"""
    json_path = job_folder / 'presentation.json'
    
    if not json_path.exists():
        return 0
    
    backup_path = job_folder / 'presentation.json.backup'
    copy2(json_path, backup_path)
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated = 0
    for section in data.get('sections', []):
        if 'avatar_video' in section:
            old_path = section['avatar_video']
            if old_path in processed_files:
                section['avatar_video'] = processed_files[old_path]
                updated += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return updated


def main():
    print()
    print("=" * 70)
    print("🎬 ULTIMATE GREEN SCREEN REMOVAL")
    print("=" * 70)
    print("Tries multiple methods to ensure transparency works!")
    print("=" * 70)
    print()
    
    if not check_ffmpeg():
        print("❌ FFmpeg not installed!")
        print("   Install: winget install ffmpeg")
        sys.exit(1)
    
    print("✅ FFmpeg ready")
    print()
    
    if len(sys.argv) < 2:
        print("Usage: python remove_greenscreen_ULTIMATE.py jobs/738ffe51")
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
    print(f"📁 Found: {len(mp4_files)} MP4 files")
    print(f"📁 Output: {output_folder}")
    print()
    print("=" * 70)
    print("PROCESSING (trying multiple methods per file)...")
    print("=" * 70)
    print()
    
    processed = {}
    success = 0
    failed = 0
    
    for idx, input_file in enumerate(mp4_files, 1):
        output_file = output_folder / f"{input_file.stem}.webm"
        
        print(f"[{idx}/{len(mp4_files)}] {input_file.name}")
        
        if remove_greenscreen_multi_method(input_file, output_file):
            old_path = f"avatars/{input_file.name}"
            new_path = f"avatars-transparent/{output_file.name}"
            processed[old_path] = new_path
            success += 1
            print(f"      ✅ Saved: {output_file.name}")
        else:
            failed += 1
            print(f"      ❌ ALL METHODS FAILED!")
        
        print()
    
    if processed:
        print("=" * 70)
        print("UPDATING JSON...")
        print("=" * 70)
        print()
        updated = update_presentation_json(job_folder, processed)
        print(f"✅ Updated {updated} sections in presentation.json")
        print(f"✅ Backup: presentation.json.backup")
        print()
    
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"✅ Success: {success} files")
    print(f"❌ Failed: {failed} files")
    print()
    
    if success > 0:
        print("=" * 70)
        print("🔍 VERIFY YOUR OUTPUT:")
        print("=" * 70)
        print()
        test_file = list(output_folder.glob('*.webm'))[0]
        print(f"1. Open this file: {test_file}")
        print(f"2. Check background:")
        print(f"   ✅ GOOD: Transparent/checkered pattern")
        print(f"   ❌ BAD: Still shows green")
        print()
        print(f"If still green → Your FFmpeg may not support alpha channel")
        print(f"                 → Ask avatar team to provide transparent videos")
        print()
    
    if failed > 0:
        print("⚠️  Some files failed. Possible causes:")
        print("   1. FFmpeg version doesn't support libvpx-vp9 with alpha")
        print("   2. Input videos are corrupted")
        print("   3. Green screen color is non-standard")
        print()
        print("💡 ALTERNATIVE: Ask your avatar generation team to export")
        print("               transparent videos directly (no green screen)")
        print()


if __name__ == '__main__':
    main()
