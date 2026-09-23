import os
import sys
from PIL import Image, ImageDraw
from collections import deque

def process_source_icon(src_path):
    src = Image.open(src_path).convert('RGB')
    w, h = src.size
    pixels = src.load()

    # Step 1: Normalize near-white to pure white (255, 255, 255)
    rgba = Image.new('RGBA', (w, h))
    rgba_pixels = rgba.load()

    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            if r >= 250 and g >= 250 and b >= 250:
                rgba_pixels[x, y] = (255, 255, 255, 255)
            else:
                rgba_pixels[x, y] = (r, g, b, 255)

    # Step 2: Flood-fill from outer boundary to make external background transparent
    # while preserving any internal white highlights (eyes, teeth, card illustrations)
    visited = set()
    q = deque()

    for x in range(w):
        if rgba_pixels[x, 0] == (255, 255, 255, 255):
            q.append((x, 0))
            visited.add((x, 0))
        if rgba_pixels[x, h - 1] == (255, 255, 255, 255):
            q.append((x, h - 1))
            visited.add((x, h - 1))

    for y in range(h):
        if rgba_pixels[0, y] == (255, 255, 255, 255) and (0, y) not in visited:
            q.append((0, y))
            visited.add((0, y))
        if rgba_pixels[w - 1, y] == (255, 255, 255, 255) and (w - 1, y) not in visited:
            q.append((w - 1, y))
            visited.add((w - 1, y))

    while q:
        cx, cy = q.popleft()
        rgba_pixels[cx, cy] = (255, 255, 255, 0)
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                if rgba_pixels[nx, ny] == (255, 255, 255, 255):
                    visited.add((nx, ny))
                    q.append((nx, ny))

    return src, rgba

def generate_adaptive_foreground(src_rgba, size):
    # Adaptive icon canvas is 108dp, safe circle is inner 72dp (66.67% of canvas)
    # We scale the icon to ~64% of size so that the entire artwork has a comfortable margin
    # and will NEVER be clipped by circular, squircle or teardrop masks.
    target_content_size = int(size * 0.64)
    scaled = src_rgba.resize((target_content_size, target_content_size), Image.Resampling.LANCZOS)

    fg = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    pos = ((size - target_content_size) // 2, (size - target_content_size) // 2)
    fg.paste(scaled, pos, scaled)
    return fg

def generate_legacy_icon(src_rgb, size):
    # Standard square legacy launcher icon
    return src_rgb.resize((size, size), Image.Resampling.LANCZOS)

def generate_legacy_round_icon(src_rgb, size):
    # Round legacy launcher icon with anti-aliased circular mask
    # 4x supersampling for high-quality smooth edges
    ss_size = size * 4
    canvas = Image.new('RGBA', (ss_size, ss_size), (0, 0, 0, 0))
    mask = Image.new('L', (ss_size, ss_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, ss_size - 1, ss_size - 1), fill=255)

    bg = Image.new('RGBA', (ss_size, ss_size), (255, 255, 255, 255))

    # Scale icon slightly inside the circle (~92%) so it doesn't touch the very edge
    content_size = int(ss_size * 0.92)
    scaled_icon = src_rgb.resize((content_size, content_size), Image.Resampling.LANCZOS)
    offset = (ss_size - content_size) // 2
    bg.paste(scaled_icon, (offset, offset))

    canvas.paste(bg, (0, 0), mask)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)

def generate_splash(src_rgb, width, height):
    # Clean splash screen with white background matching the icon artwork
    splash = Image.new('RGB', (width, height), (255, 255, 255))
    # Scale icon so its maximum dimension is at most 50% of the screen dimension
    scale_factor = min(width * 0.5 / src_rgb.width, height * 0.5 / src_rgb.height, 1.0)
    target_w = int(src_rgb.width * scale_factor)
    target_h = int(src_rgb.height * scale_factor)
    scaled = src_rgb.resize((target_w, target_h), Image.Resampling.LANCZOS)
    pos = ((width - target_w) // 2, (height - target_h) // 2)
    splash.paste(scaled, pos)
    return splash

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    src_icon_path = os.path.join(base_dir, 'public', 'app-icon.png')
    res_dir = os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res')

    print(f'Loading source icon from {src_icon_path}...')
    src_rgb, src_rgba = process_source_icon(src_icon_path)
    print('Source icon processed (RGB and RGBA with transparent background ready).')

    # Android Mipmap densities:
    densities = {
        'mipmap-mdpi':    {'legacy': 48,  'foreground': 108},
        'mipmap-hdpi':    {'legacy': 72,  'foreground': 162},
        'mipmap-xhdpi':   {'legacy': 96,  'foreground': 216},
        'mipmap-xxhdpi':  {'legacy': 144, 'foreground': 324},
        'mipmap-xxxhdpi': {'legacy': 192, 'foreground': 432},
    }

    for folder, dims in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        # 1. ic_launcher_foreground.png
        fg = generate_adaptive_foreground(src_rgba, dims['foreground'])
        fg_path = os.path.join(folder_path, 'ic_launcher_foreground.png')
        fg.save(fg_path, format='PNG')
        print(f'Saved {fg_path} ({dims["foreground"]}x{dims["foreground"]})')

        # 2. ic_launcher.png (legacy square)
        sq = generate_legacy_icon(src_rgb, dims['legacy'])
        sq_path = os.path.join(folder_path, 'ic_launcher.png')
        sq.save(sq_path, format='PNG')
        print(f'Saved {sq_path} ({dims["legacy"]}x{dims["legacy"]})')

        # 3. ic_launcher_round.png (legacy round)
        rd = generate_legacy_round_icon(src_rgb, dims['legacy'])
        rd_path = os.path.join(folder_path, 'ic_launcher_round.png')
        rd.save(rd_path, format='PNG')
        print(f'Saved {rd_path} ({dims["legacy"]}x{dims["legacy"]})')

    # Android Splash screens
    splash_targets = [
        ('drawable', (480, 320)),
        ('drawable-land-mdpi', (480, 320)),
        ('drawable-land-hdpi', (800, 480)),
        ('drawable-land-xhdpi', (1280, 720)),
        ('drawable-land-xxhdpi', (1600, 960)),
        ('drawable-land-xxxhdpi', (1920, 1280)),
        ('drawable-port-mdpi', (320, 480)),
        ('drawable-port-hdpi', (480, 800)),
        ('drawable-port-xhdpi', (720, 1280)),
        ('drawable-port-xxhdpi', (960, 1600)),
        ('drawable-port-xxxhdpi', (1280, 1920)),
    ]

    for folder, (w, h) in splash_targets:
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        sp = generate_splash(src_rgb, w, h)
        sp_path = os.path.join(folder_path, 'splash.png')
        sp.save(sp_path, format='PNG')
        print(f'Saved Android splash {sp_path} ({w}x{h})')

    # iOS Splash screens
    ios_splash_dir = os.path.join(base_dir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset')
    if os.path.exists(ios_splash_dir):
        ios_splash = generate_splash(src_rgb, 2732, 2732)
        for name in ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']:
            ios_p = os.path.join(ios_splash_dir, name)
            ios_splash.save(ios_p, format='PNG')
            print(f'Saved iOS splash {ios_p} (2732x2732)')

    print('All app icons and splash screens successfully generated!')

if __name__ == '__main__':
    main()
