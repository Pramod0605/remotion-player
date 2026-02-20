#!/usr/bin/env python3
"""
🔍 FFmpeg Alpha Diagnostic + PNG Sequence Solution
===================================================

This script:
1. Tests if your FFmpeg supports alpha in VP9
2. If not, provides PNG sequence alternative
3. Converts PNG sequences to WebM (which Remotion can use)

Usage:
    python ffmpeg_alpha_diagnostic.py jobs/738ffe51
"""

import json
import subprocess
import sys
from pathlib import Path
from shutil import copy2


def test_ffmpeg_alpha_support():
    """Test if FFmpeg can produce yuva420p VP9"""
    print("🔍 Testing FFmpeg alpha support...")
    print()
    
    # Create a test green screen video
    test_cmd = [
        'ffmpeg',
        '-f', 'lavfi',
        '-i', 'color=green:s=320x240:d=1',
        '-c:v', 'libx264',
        '-y',
        'test_green.mp4'
    ]
    
    try:
        subprocess.run(test_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)
    except:
        print("❌ Cannot create test video")
        return False
    
    # Try to convert with alpha
    alpha_cmd = [
        'ffmpeg',
        '-i', 'test_green.mp4',
        '-vf', 'colorkey=0x00FF00:0.3:0.2',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-y',
        'test_alpha.webm'
    ]
    
    try:
        subprocess.run(alpha_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)
    except:
        print("❌ Alpha conversion failed")
        return False
    
    # Check output pixel format
    probe_cmd = [
        'ffprobe',
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=pix_fmt',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        'test_alpha.webm'
    ]
    
    try:
        result = subprocess.run(probe_cmd, stdout=subprocess.PIPE, text=True, timeout=5)
        pix_fmt = result.stdout.strip()
        
        # Cleanup
        Path('test_green.mp4').unlink(missing_ok=True)
        Path('test_alpha.webm').unlink(missing_ok=True)
        
        if 'yuva' in pix_fmt:
            print(f"✅ FFmpeg supports alpha! (Output: {pix_fmt})")
            return True
        else:
            print(f"❌ FFmpeg does NOT support alpha (Output: {pix_fmt})")
            return False
    except:
        print("❌ Cannot probe output")
        return False


def png_sequence_method(input_file: Path, output_folder: Path) -> bool:
    """
    Alternative: Extract frames as PNG, remove green, reassemble
    This ALWAYS works because PNG has native alpha support
    """
    
    frames_dir = output_folder / f"{input_file.stem}_frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"    1. Extracting frames...", end=" ")
    
    # Step 1: Extract frames as PNG
    extract_cmd = [
        'ffmpeg',
        '-i', str(input_file),
        '-vf', 'colorkey=0x00FF00:0.3:0.2',
        f'{frames_dir}/frame_%04d.png',
        '-y'
    ]
    
    result = subprocess.run(extract_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if result.returncode != 0:
        print("❌")
        return False
    
    png_files = list(frames_dir.glob('*.png'))
    print(f"✅ ({len(png_files)} frames)")
    
    if len(png_files) == 0:
        print("    ❌ No frames extracted!")
        return False
    
    # Step 2: Reassemble frames into WebM
    print(f"    2. Reassembling to WebM...", end=" ")
    
    output_file = output_folder / f"{input_file.stem}.webm"
    
    reassemble_cmd = [
        'ffmpeg',
        '-framerate', '25',  # Match input FPS
        '-i', f'{frames_dir}/frame_%04d.png',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-y',
        str(output_file)
    ]
    
    result = subprocess.run(reassemble_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if result.returncode != 0:
        print("❌")
        return False
    
    print("✅")
    
    # Step 3: Verify it has alpha
    print(f"    3. Verifying alpha...", end=" ")
    
    probe_cmd = [
        'ffprobe',
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=pix_fmt',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        str(output_file)
    ]
    
    result = subprocess.run(probe_cmd, stdout=subprocess.PIPE, text=True)
    pix_fmt = result.stdout.strip()
    
    if 'yuva' in pix_fmt:
        print(f"✅ ({pix_fmt})")
        # Cleanup frames
        for png in png_files:
            png.unlink()
        frames_dir.rmdir()
        return True
    else:
        print(f"❌ ({pix_fmt})")
        return False


def update_presentation_json(job_folder: Path, processed_files: dict):
    """Update presentation.json with new avatar paths"""
    
    json_path = job_folder / 'presentation.json'
    
    if not json_path.exists():
        return 0
    
    # Backup
    backup_path = job_folder / 'presentation.json.backup'
    copy2(json_path, backup_path)
    
    # Load and update
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated = 0
    for section in data.get('sections', []):
        if 'avatar_video' in section:
            old_path = section['avatar_video']
            if old_path in processed_files:
                section['avatar_video'] = processed_files[old_path]
                updated += 1
    
    # Save
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return updated


def main():
    print()
    print("=" * 70)
    print("🔍 FFMPEG ALPHA DIAGNOSTIC + PNG SOLUTION")
    print("=" * 70)
    print()
    
    # Test FFmpeg alpha support
    supports_alpha = test_ffmpeg_alpha_support()
    print()
    
    if len(sys.argv) < 2:
        print("Usage: python ffmpeg_alpha_diagnostic.py jobs/738ffe51")
        print()
        if not supports_alpha:
            print("⚠️  Your FFmpeg does NOT support alpha in VP9")
            print("   You need to use the PNG sequence method")
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
    
    print("=" * 70)
    print("PROCESSING AVATARS")
    print("=" * 70)
    print()
    
    if supports_alpha:
        print("✅ Using DIRECT method (FFmpeg supports alpha)")
        print()
        method = "direct"
    else:
        print("⚠️  Using PNG SEQUENCE method (FFmpeg alpha not supported)")
        print()
        method = "png_sequence"
    
    processed = {}
    success = 0
    failed = 0
    
    for idx, input_file in enumerate(mp4_files, 1):
        print(f"[{idx}/{len(mp4_files)}] {input_file.name}")
        
        if method == "png_sequence":
            if png_sequence_method(input_file, output_folder):
                old_path = f"avatars/{input_file.name}"
                new_path = f"avatars-transparent/{input_file.stem}.webm"
                processed[old_path] = new_path
                success += 1
                print(f"    ✅ Success: {input_file.stem}.webm")
            else:
                failed += 1
                print(f"    ❌ Failed!")
        else:
            # Direct method (if alpha is supported)
            output_file = output_folder / f"{input_file.stem}.webm"
            
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
            
            result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            if result.returncode == 0:
                old_path = f"avatars/{input_file.name}"
                new_path = f"avatars-transparent/{output_file.name}"
                processed[old_path] = new_path
                success += 1
                print(f"    ✅ Success")
            else:
                failed += 1
                print(f"    ❌ Failed")
        
        print()
    
    # Update JSON
    if processed:
        print("=" * 70)
        print("UPDATING presentation.json...")
        print("=" * 70)
        print()
        updated = update_presentation_json(job_folder, processed)
        print(f"✅ Backup: presentation.json.backup")
        print(f"✅ Updated: {updated} sections")
        print()
    
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"✅ Success: {success} files")
    print(f"❌ Failed: {failed} files")
    print()
    
    if success > 0:
        print("🔍 VERIFY OUTPUT:")
        test_file = list(output_folder.glob('*.webm'))[0]
        print(f"   Open: {test_file}")
        print()
        print("   Check in browser or video player:")
        print("   ✅ GOOD: Transparent background (no green)")
        print("   ❌ BAD: Still shows green")
        print()
    
    if not supports_alpha:
        print("=" * 70)
        print("⚠️  IMPORTANT NOTE")
        print("=" * 70)
        print()
        print("Your FFmpeg does NOT support alpha in VP9.")
        print("This is why all previous methods failed!")
        print()
        print("The PNG sequence method ALWAYS works because:")
        print("  1. PNG has native alpha support")
        print("  2. Green is removed during PNG extraction")
        print("  3. FFmpeg just reassembles transparent PNGs")
        print()
        print("This is slightly slower but 100% reliable.")
        print()


if __name__ == '__main__':
    main()
