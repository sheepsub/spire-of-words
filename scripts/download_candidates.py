import urllib.request
import urllib.parse
import os

candidates = {
    "ironclad_mobalytics": "https://cdn.mobalytics.gg/uploads/images/slay-the-spire-2/ironclad%20art.png",
    "ironclad_thegamer": "https://static1.thegamerimages.com/wordpress/wp-content/uploads/2024/05/slay-the-spire-best-builds-and-relics-to-use-with-ironclad.jpg",
    "silent_banner": "https://slaythespire.wiki.gg/images/SilentBanner.jpg",
    "silent_wp": "https://wallpaperaccess.com/full/3177317.png",
    "defect_wp": "https://wallpaperaccess.com/full/7145086.png",
    "defect_srcdn": "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/09/Slay-the-Spire-Game-the-Defect.jpg",
    "necro_wikigg": "https://slaythespire.wiki.gg/images/StS2_Necrobinder.png",
    "necro_keengamer": "https://www.keengamer.com/wp-content/uploads/2026/03/Necrobinder-Build-Slay-The-Spire-2.png",
    "regent_gamespot": "https://www.gamespot.com/a/uploads/original/1745/17457013/4665680-sts2-characters_003_regent.jpg",
    "regent_icyveins": "https://static.icy-veins.com/wp/wp-content/uploads/2025/12/Slay-The-Spire-2-The-Regent.webp",
    "regent_wikigg": "https://slaythespire.wiki.gg/images/StS2_Regent.png"
}

os.makedirs("candidate_art", exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
}

for name, url in candidates.items():
    ext = url.split("?")[0].split(".")[-1]
    if len(ext) > 4: ext = "png"
    filepath = f"candidate_art/{name}.{ext}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(filepath, "wb") as f:
                f.write(data)
            print(f"Downloaded {name}: {len(data)} bytes -> {filepath}")
    except Exception as e:
        print(f"Failed {name} ({url}): {e}")
