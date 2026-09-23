"""
Slay the Spire 2 (STS2) Comprehensive Asset Extractor & Pipeline
Decodes Godot 4 (Format 3) PCK archive, extracts all data configurations (JSON),
converts .ctex textures into standard .webp images, extracts Spine skeletons and audio.
"""

import os
import sys
import struct
import json
import re
from pathlib import Path

PCK_PATH = Path(r"C:\Users\sheep\Desktop\sts2_extracted\SlayTheSpire2.pck")
OUT_DIR = Path(r"C:\Users\sheep\Desktop\sts2_extracted")
FILE_BASE = 112
DIR_OFFSET = 0x6a12f960

def extract_image_data(raw_data):
    """
    Extracts embedded image stream (WEBP, PNG, JPEG) from Godot 4 GST2 / CTEX data.
    """
    # Check for RIFF...WEBP
    riff_pos = raw_data.find(b'RIFF')
    if riff_pos != -1 and raw_data[riff_pos+8:riff_pos+12] == b'WEBP':
        return '.webp', raw_data[riff_pos:]
    
    # Check for PNG
    png_pos = raw_data.find(b'\x89PNG\r\n\x1a\n')
    if png_pos != -1:
        return '.png', raw_data[png_pos:]
    
    # Check for JPEG
    jpg_pos = raw_data.find(b'\xff\xd8\xff')
    if jpg_pos != -1:
        return '.jpg', raw_data[jpg_pos:]
    
    return None, None

def run_extraction():
    print(f"=== Slay the Spire 2 Comprehensive Extractor ===")
    print(f"Opening PCK: {PCK_PATH} ({PCK_PATH.stat().st_size:,} bytes)...")

    # Define destination folders
    loc_dir = OUT_DIR / "localization"
    cards_art_dir = OUT_DIR / "art" / "cards"
    relics_art_dir = OUT_DIR / "art" / "relics"
    powers_art_dir = OUT_DIR / "art" / "powers"
    ui_art_dir = OUT_DIR / "art" / "ui"
    characters_art_dir = OUT_DIR / "art" / "characters"
    spine_dir = OUT_DIR / "spine"
    audio_dir = OUT_DIR / "audio"
    other_dir = OUT_DIR / "misc"

    for d in [loc_dir, cards_art_dir, relics_art_dir, powers_art_dir, ui_art_dir, characters_art_dir, spine_dir, audio_dir, other_dir]:
        d.mkdir(parents=True, exist_ok=True)

    with open(PCK_PATH, 'rb') as f:
        f.seek(DIR_OFFSET)
        file_count = struct.unpack('<I', f.read(4))[0]
        print(f"Reading directory index: {file_count:,} total files...")

        # Parse index entries
        entries = []
        for _ in range(file_count):
            path_len = struct.unpack('<I', f.read(4))[0]
            path = f.read(path_len).decode('utf-8', errors='replace').split('\x00')[0].strip()
            offset, size = struct.unpack('<QQ', f.read(16))
            md5 = f.read(16)
            flags = struct.unpack('<I', f.read(4))[0]
            entries.append((path, offset + FILE_BASE, size))

        print(f"Index loaded. Processing and extracting targets...")

        counts = {
            'localization': 0,
            'cards_art': 0,
            'relics_art': 0,
            'powers_art': 0,
            'ui_art': 0,
            'characters_art': 0,
            'spine': 0,
            'audio': 0,
            'other_json': 0,
        }

        # Process each entry
        for idx, (path, real_offset, size) in enumerate(entries):
            # 1. Localization JSONs
            if path.startswith('localization/'):
                dest_file = loc_dir / path.replace('localization/', '')
                dest_file.parent.mkdir(parents=True, exist_ok=True)
                f.seek(real_offset)
                dest_file.write_bytes(f.read(size))
                counts['localization'] += 1
                continue

            # Other JSONs
            if path.endswith('.json') and not path.startswith('localization/'):
                dest_file = other_dir / path
                dest_file.parent.mkdir(parents=True, exist_ok=True)
                f.seek(real_offset)
                dest_file.write_bytes(f.read(size))
                counts['other_json'] += 1
                continue

            # 2. Audio Files
            if path.endswith('.bank') or path.endswith('.ogg') or path.endswith('.wav'):
                dest_file = audio_dir / Path(path).name
                f.seek(real_offset)
                dest_file.write_bytes(f.read(size))
                counts['audio'] += 1
                continue

            # 3. Spine Skeletons
            if path.endswith('.skel') or path.endswith('.atlas') or 'spine' in path.lower():
                dest_file = spine_dir / path
                dest_file.parent.mkdir(parents=True, exist_ok=True)
                f.seek(real_offset)
                dest_file.write_bytes(f.read(size))
                counts['spine'] += 1
                continue

            # 4. Textures (.ctex, .png, .jpg, .webp)
            if path.endswith('.ctex'):
                # Extract embedded image stream
                f.seek(real_offset)
                raw = f.read(size)
                ext, img_data = extract_image_data(raw)
                if not img_data:
                    continue

                # Determine clean base name
                # Godot imported files are usually: .godot/imported/ORIGINAL_NAME.ext-hash.ctex
                filename = Path(path).name
                m = re.match(r'^(.*?)\.[a-zA-Z0-9]+-[0-9a-f]{32}\.ctex$', filename)
                clean_name = m.group(1) if m else filename[:-5]
                out_name = f"{clean_name}{ext}"

                # Categorize image by name and original path
                path_lower = path.lower()
                clean_lower = clean_name.lower()

                if 'relic' in path_lower or 'relic' in clean_lower:
                    out_path = relics_art_dir / out_name
                    counts['relics_art'] += 1
                elif 'power' in path_lower or 'power' in clean_lower or 'buff' in clean_lower:
                    out_path = powers_art_dir / out_name
                    counts['powers_art'] += 1
                elif 'character' in path_lower or 'player' in path_lower:
                    out_path = characters_art_dir / out_name
                    counts['characters_art'] += 1
                elif 'ui' in path_lower or 'icon' in path_lower or 'map' in path_lower or 'button' in path_lower:
                    out_path = ui_art_dir / out_name
                    counts['ui_art'] += 1
                else:
                    # Likely a card or general portrait
                    out_path = cards_art_dir / out_name
                    counts['cards_art'] += 1

                out_path.write_bytes(img_data)

            elif path.endswith(('.png', '.jpg', '.webp', '.svg')):
                dest_file = ui_art_dir / Path(path).name
                f.seek(real_offset)
                dest_file.write_bytes(f.read(size))
                counts['ui_art'] += 1

            if (idx + 1) % 5000 == 0:
                print(f"  Processed {idx + 1:,} / {file_count:,} files...")

    print("\nExtraction Complete! Summary:")
    for k, v in counts.items():
        print(f"  - {k.replace('_', ' ').title()}: {v:,} items")
    print(f"\nAll files saved to: {OUT_DIR}")

if __name__ == '__main__':
    run_extraction()
