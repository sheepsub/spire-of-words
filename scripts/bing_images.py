import urllib.request
import urllib.parse
import re
import json

def search_bing_images(query, count=5):
    encoded = urllib.parse.quote_plus(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Extract murl from m="{...}"
            matches = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not matches:
                # alternative format
                matches = re.findall(r'"murl":"(https?://[^"]+)"', html)
            print(f"Query: '{query}' -> Found {len(matches)} images")
            return matches[:count]
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return []

if __name__ == '__main__':
    queries = [
        "Slay the Spire Ironclad official art wallpaper",
        "Slay the Spire Silent official art wallpaper",
        "Slay the Spire Defect official art wallpaper",
        "Slay the Spire 2 Necrobinder",
        "Slay the Spire 2 Regent"
    ]
    for q in queries:
        imgs = search_bing_images(q, count=4)
        for img in imgs:
            print("  ", img)
