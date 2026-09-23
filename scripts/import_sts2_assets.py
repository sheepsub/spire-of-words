"""
Selectively copies high-priority STS2 assets into the web application workspace.
"""

import os
import shutil
from pathlib import Path

SRC_EXTRACTED = Path(r"C:\Users\sheep\Desktop\sts2_extracted")
DEST_PUBLIC_STS2 = Path(r"public/sts2")
DEST_AUDIO = DEST_PUBLIC_STS2 / "audio"
DEST_UI = DEST_PUBLIC_STS2 / "ui"
DEST_POWERS = DEST_PUBLIC_STS2 / "powers"
DEST_CARDS = DEST_PUBLIC_STS2 / "cards"

for d in [DEST_AUDIO, DEST_UI, DEST_POWERS, DEST_CARDS]:
    d.mkdir(parents=True, exist_ok=True)

# 1. Copy audio
audio_src = SRC_EXTRACTED / "audio"
if audio_src.exists():
    for f in audio_src.glob("*.wav"):
        shutil.copy(f, DEST_AUDIO / f.name)
        print(f"Copied audio: {f.name}")
    for f in audio_src.glob("*.ogg"):
        shutil.copy(f, DEST_AUDIO / f.name)
        print(f"Copied audio: {f.name}")

# 2. Copy UI icons
ui_src = SRC_EXTRACTED / "art" / "ui"
if ui_src.exists():
    for f in ui_src.glob("*.webp"):
        if any(k in f.name.lower() for k in ['energy', 'card', 'chest', 'icon', 'button', 'curse']):
            shutil.copy(f, DEST_UI / f.name)
    print(f"Copied {len(list(DEST_UI.glob('*')))} UI assets.")

# 3. Copy top 50 power icons
powers_src = SRC_EXTRACTED / "art" / "powers"
if powers_src.exists():
    for idx, f in enumerate(powers_src.glob("*.webp")):
        if idx >= 60:
            break
        shutil.copy(f, DEST_POWERS / f.name)
    print(f"Copied {len(list(DEST_POWERS.glob('*')))} power icons.")

# 4. Copy representative STS2 card arts
cards_src = SRC_EXTRACTED / "art" / "cards"
if cards_src.exists():
    copied_cards = 0
    for f in cards_src.glob("*.webp"):
        # Select cards with nice clean names (uppercase cards)
        if f.name.isupper() or any(k in f.name.lower() for k in ['strike', 'defend', 'slash', 'blast', 'fire', 'demon', 'blade']):
            shutil.copy(f, DEST_CARDS / f.name)
            copied_cards += 1
            if copied_cards >= 80:
                break
    print(f"Copied {copied_cards} card illustrations.")

print("STS2 asset migration completed!")
