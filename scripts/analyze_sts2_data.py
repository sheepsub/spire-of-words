"""
Slay the Spire 2 (STS2) Data Analyzer
Parses and structures extracted Chinese (zhs) game data into comprehensive reference tables.
"""

import json
from pathlib import Path

LOC_ZHS = Path(r"C:\Users\sheep\Desktop\sts2_extracted\localization\zhs")
OUT_REPORT = Path(r"C:\Users\sheep\Desktop\sts2_extracted\sts2_analysis_summary.json")

def load_json(filename):
    p = LOC_ZHS / filename
    if not p.exists():
        return {}
    with open(p, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze():
    # 1. Characters
    characters_raw = load_json("characters.json")
    characters = {}
    for k, v in characters_raw.items():
        char_key = k.split('.')[0]
        prop = k.split('.')[1] if '.' in k else 'text'
        if char_key not in characters:
            characters[char_key] = {}
        characters[char_key][prop] = v

    # 2. Cards
    cards_raw = load_json("cards.json")
    cards = {}
    for k, v in cards_raw.items():
        card_id = k.split('.')[0]
        prop = k.split('.')[1] if '.' in k else 'text'
        if card_id not in cards:
            cards[card_id] = {}
        cards[card_id][prop] = v

    # 3. Relics
    relics_raw = load_json("relics.json")
    relics = {}
    for k, v in relics_raw.items():
        relic_id = k.split('.')[0]
        prop = k.split('.')[1] if '.' in k else 'text'
        if relic_id not in relics:
            relics[relic_id] = {}
        relics[relic_id][prop] = v

    # 4. Enchantments (附魔)
    enchantments_raw = load_json("enchantments.json")
    enchantments = {}
    for k, v in enchantments_raw.items():
        enc_id = k.split('.')[0]
        prop = k.split('.')[1] if '.' in k else 'text'
        if enc_id not in enchantments:
            enchantments[enc_id] = {}
        enchantments[enc_id][prop] = v

    # 5. Afflictions (苦痛)
    afflictions_raw = load_json("afflictions.json")
    afflictions = {}
    for k, v in afflictions_raw.items():
        aff_id = k.split('.')[0]
        prop = k.split('.')[1] if '.' in k else 'text'
        if aff_id not in afflictions:
            afflictions[aff_id] = {}
        afflictions[aff_id][prop] = v

    # 6. Ancients (先祖)
    ancients_raw = load_json("ancients.json")
    ancients = {}
    for k, v in ancients_raw.items():
        anc_id = k.split('.')[0]
        prop = k.split('.')[1] if '.' in k else 'text'
        if anc_id not in ancients:
            ancients[anc_id] = {}
        ancients[anc_id][prop] = v

    # 7. Potions
    potions_raw = load_json("potions.json")
    potions = {}
    for k, v in potions_raw.items():
        pot_id = k.split('.')[0]
        prop = k.split('.')[1] if '.' in k else 'text'
        if pot_id not in potions:
            potions[pot_id] = {}
        potions[pot_id][prop] = v

    summary = {
        "stats": {
            "characters_count": len(characters),
            "cards_count": len(cards),
            "relics_count": len(relics),
            "enchantments_count": len(enchantments),
            "afflictions_count": len(afflictions),
            "ancients_count": len(ancients),
            "potions_count": len(potions),
        },
        "characters": characters,
        "enchantments": enchantments,
        "afflictions": afflictions,
        "relics_sample": {k: relics[k] for k in list(relics.keys())[:20]},
        "cards_sample": {k: cards[k] for k in list(cards.keys())[:30]},
    }

    with open(OUT_REPORT, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print("=== STS2 Data Analysis Results ===")
    print(f"Characters found: {len(characters)}")
    for k, v in characters.items():
        print(f"  - [{k}] {v.get('title', 'N/A')}: {v.get('description', '')[:50]}...")
    print(f"\nTotal Cards: {len(cards)}")
    print(f"Total Relics: {len(relics)}")
    print(f"Total Enchantments (附魔): {len(enchantments)}")
    for k, v in enchantments.items():
        print(f"  - [附魔] {v.get('title', k)}: {v.get('description', '')}")
    print(f"Total Afflictions (苦痛): {len(afflictions)}")
    for k, v in afflictions.items():
        print(f"  - [苦痛] {v.get('title', k)}: {v.get('description', '')}")
    print(f"Total Ancients (先祖): {len(ancients)}")
    print(f"Total Potions: {len(potions)}")

if __name__ == '__main__':
    analyze()
