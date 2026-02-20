#!/usr/bin/env python3
"""
🎬 Advanced Green Screen Removal + JSON Auto-Update
====================================================
With adjustable settings for difficult green screens

Usage:
    # Default (aggressive):
    python remove_greenscreen_advanced.py jobs/738ffe51
    
    # Custom settings:
    python remove_greenscreen_advanced.py jobs/738ffe51 --similarity 0.3 --blend 0.2
    
Settings explained:
    --similarity: How much green to remove (0.1-0.4)
        0.15 = Conservative (keeps more, may leave green)
        0.25 = Balanced (recommended)
        0.35 = Aggressive (removes more green, may affect edges)
    
    --blend: Edge smoothing (0.05-0.3)
        0.10 = Sharp edges
        0.15 = Balanced (recommended)
        0.25 = Soft edges (may look blurry)
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from shutil import copy2


def check_ffmpeg():
    """Check if FFmpeg is installed"""
    try:
        subprocess.run(['ffmpeg', '-version'], 
                      stdout=subprocess.DEVNULL, 
                      stderr=subprocess.DEVNULL)
        return True
    except FileNotFoundError:
        return False


def remove_greenscreen(input_file: Path, output_file: Path, 
                      similarity: float = 0.25, blend: float = 0.15,
                      color: str = '0x00FF00'):
    """
    Remove green screen from video using FFmpeg
    
    Args:
        input_file: Path to MP4 with green screen
        output_file: Path to output WebM with transparency
        similarity: How much green to remove (0.1-0.4, higher = more aggressive)
        blend: Edge smoothing (0.05-0.3, higher = softer edges)
        color: Green color to remove (hex, default: 0x00FF00 = pure green)
    
    Returns:
        True if successful, False otherwise
    """
    
    cmd = [
        'ffmpeg',
        '-i', str(input_file),
        '-c:v', 'libvpx-vp9',              # VP9 codec (supports alpha)
        '-pix_fmt', 'yuva420p',            # Pixel format with transparency
        '-vf', f'chromakey={color}:{similarity}:{blend}',  # Remove green
        '-auto-alt-ref', '0',              # Fix Chrome glitches
        '-y',                              # Overwrite output
        str(output_file)
    ]
    
    try:
        result = subprocess.run(cmd, 
                               stdout=subprocess.DEVNULL, 
                               stderr=subprocess.PIPE,
                               text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"    ❌ Error: {e}")
        return False


def update_presentation_json(job_folder: Path, processed_files: dict):
    """
    Update presentation.json with new avatar paths
    
    Args:
        job_folder: Path to job folder
        processed_files: Dict mapping old paths to new paths
    
    Returns:
        Number of sections updated
    """
    
    json_path = job_folder / 'presentation.json'
    
    if not json_path.exists():
        print(f"    ⚠️  presentation.json not found in {job_folder}")
        return 0
    
    # Create backup
    backup_path = job_folder / 'presentation.json.backup'
    copy2(json_path, backup_path)
    print(f"    ✅ Backup created: presentation.json.backup")
    
    # Load JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Update avatar paths
    updated_count = 0
    
    for section in data.get('sections', []):
        if 'avatar_video' in section:
            old_path = section['avatar_video']
            
            # Check if this avatar was processed
            if old_path in processed_files:
                new_path = processed_files[old_path]
                section['avatar_video'] = new_path
                updated_count += 1
    
    # Save updated JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return updated_count


def main():
    parser = argparse.ArgumentParser(
        description='Remove green screen from avatars and update presentation.json',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Default (balanced settings):
  python remove_greenscreen_advanced.py jobs/738ffe51
  
  # More aggressive green removal:
  python remove_greenscreen_advanced.py jobs/738ffe51 --similarity 0.3
  
  # Softer edges:
  python remove_greenscreen_advanced.py jobs/738ffe51 --blend 0.2
  
  # Custom green color (if not pure green):
  python remove_greenscreen_advanced.py jobs/738ffe51 --color 0x00b140
        """
    )
    
    parser.add_argument('job_folder', help='Path to job folder (e.g., jobs/738ffe51)')
    parser.add_argument('--similarity', type=float, default=0.25,
                       help='Green removal sensitivity (0.1-0.4, default: 0.25)')
    parser.add_argument('--blend', type=float, default=0.15,
                       help='Edge blending amount (0.05-0.3, default: 0.15)')
    parser.add_argument('--color', type=str, default='0x00FF00',
                       help='Green color hex (default: 0x00FF00)')
    
    args = parser.parse_args()
    
    print()
    print("=" * 70)
    print("🎬 ADVANCED GREEN SCREEN REMOVAL + JSON AUTO-UPDATE")
    print("=" * 70)
    print()
    
    # Check FFmpeg
    if not check_ffmpeg():
        print("❌ ERROR: FFmpeg is not installed!")
        print()
        print("Please install it first:")
        print("  Windows: winget install ffmpeg")
        print("  Mac:     brew install ffmpeg")
        print()
        sys.exit(1)
    
    print("✅ FFmpeg found!")
    print()
    
    # Settings info
    print("⚙️  Settings:")
    print(f"   Similarity: {args.similarity} (how much green to remove)")
    print(f"   Blend:      {args.blend} (edge smoothing)")
    print(f"   Color:      {args.color} (green color to remove)")
    print()
    
    job_folder = Path(args.job_folder)
    
    # Validate job folder
    if not job_folder.exists():
        print(f"❌ Error: Job folder not found: {job_folder}")
        sys.exit(1)
    
    # Find avatars folder
    avatars_folder = job_folder / 'avatars'
    
    if not avatars_folder.exists():
        print(f"❌ Error: Avatars folder not found: {avatars_folder}")
        print()
        print("Expected structure:")
        print("  jobs/738ffe51/")
        print("  ├── avatars/          ← Should contain MP4 files")
        print("  └── presentation.json")
        print()
        sys.exit(1)
    
    # Find all MP4 files
    mp4_files = list(avatars_folder.glob('*.mp4'))
    
    if not mp4_files:
        print(f"❌ No MP4 files found in: {avatars_folder}")
        sys.exit(1)
    
    # Create output folder
    output_folder = job_folder / 'avatars-transparent'
    output_folder.mkdir(parents=True, exist_ok=True)
    
    print("📁 Processing:")
    print(f"   Job:    {job_folder}")
    print(f"   Input:  {avatars_folder} ({len(mp4_files)} files)")
    print(f"   Output: {output_folder}")
    print()
    
    # Process videos
    print("=" * 70)
    print("STEP 1: Removing Green Screens...")
    print("=" * 70)
    print()
    
    processed_files = {}  # Map old paths to new paths
    success = 0
    failed = 0
    
    for idx, input_file in enumerate(mp4_files, 1):
        output_file = output_folder / f"{input_file.stem}.webm"
        
        # Relative paths for JSON
        old_rel_path = f"avatars/{input_file.name}"
        new_rel_path = f"avatars-transparent/{output_file.name}"
        
        print(f"[{idx}/{len(mp4_files)}] {input_file.name:30s} → {output_file.name}", end=" ")
        
        if remove_greenscreen(input_file, output_file, args.similarity, args.blend, args.color):
            print("✅")
            processed_files[old_rel_path] = new_rel_path
            success += 1
        else:
            print("❌")
            failed += 1
    
    print()
    
    # Update JSON
    if processed_files:
        print("=" * 70)
        print("STEP 2: Updating presentation.json...")
        print("=" * 70)
        print()
        
        updated = update_presentation_json(job_folder, processed_files)
        
        print(f"    ✅ Updated {updated} avatar paths in presentation.json")
        print()
    
    # Summary
    print("=" * 70)
    print("📊 SUMMARY")
    print("=" * 70)
    print()
    print(f"✅ Processed:  {success} videos")
    print(f"❌ Failed:     {failed} videos")
    print(f"📝 Updated:    {updated} sections in presentation.json")
    print()
    
    if success > 0:
        print("=" * 70)
        print("🎯 CHECK YOUR RESULTS:")
        print("=" * 70)
        print()
        print(f"Open one of the WebM files in: {output_folder}")
        print()
        print("✅ GOOD: Transparent background, clean edges, no green")
        print("❌ BAD:  Green edges/halo still visible")
        print()
        print("If still seeing green, try again with higher similarity:")
        print(f"  python remove_greenscreen_advanced.py {job_folder} --similarity 0.3")
        print()
        print("If edges look too harsh, try higher blend:")
        print(f"  python remove_greenscreen_advanced.py {job_folder} --blend 0.2")
        print()
        print("=" * 70)
        print("✅ NEXT STEPS:")
        print("=" * 70)
        print()
        print("1. Verify transparent backgrounds look good")
        print("2. Run the generator:")
        print(f"   python generate_remotion_FINAL_PERFECT.py \\")
        print(f"     {job_folder / 'presentation.json'} \\")
        print(f"     {job_folder} \\")
        print(f"     output-sections")
        print()
    else:
        print("⚠️  No videos were processed successfully.")
        print("   Check that FFmpeg is working and videos are valid MP4 files.")
        print()


if __name__ == '__main__':
    main()
