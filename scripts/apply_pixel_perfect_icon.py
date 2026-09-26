import os
from PIL import Image, ImageDraw

ROOT = r'C:/Users/sheep/Desktop/Slay the Spire mirror'

def load_clean_frog():
    src = os.path.join(ROOT, 'scratch/frog_icon/frog_v1.png')
    im = Image.open(src).convert('RGBA')
    w, h = im.size
    px = im.load()
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            # Remove bottom ruler / paper artifacts
            if y >= 64:
                px[x, y] = (0, 0, 0, 0)
            elif c[3] and max(c[:3]) - min(c[:3]) <= 26 and min(c[:3]) >= 110:
                px[x, y] = (0, 0, 0, 0)
            # Remove isolated stray dots at bottom right
            elif (x, y) in [(55, 62), (55, 63)]:
                px[x, y] = (0, 0, 0, 0)
    
    bbox = im.getchannel('A').getbbox()
    return im.crop(bbox)

frog = load_clean_frog()
print(f"Clean native frog size: {frog.width}x{frog.height}")

def make_solid_icon(frog, size, scale_mult=None, pad_ratio=0.12):
    canvas = Image.new('RGB', (size, size), (255, 255, 255))
    if scale_mult:
        new_w = frog.width * scale_mult
        new_h = frog.height * scale_mult
    else:
        target = int(size * (1 - 2 * pad_ratio))
        scale = max(1, round(target / max(frog.width, frog.height)))
        new_w = frog.width * scale
        new_h = frog.height * scale
    
    scaled = frog.resize((new_w, new_h), Image.Resampling.NEAREST)
    canvas.paste(scaled, ((size - new_w) // 2, (size - new_h) // 2), scaled)
    return canvas

def make_round_icon(frog, size):
    sq = make_solid_icon(frog, size)
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    out = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    out.paste(sq, (0, 0), mask)
    return out

def make_foreground_icon(frog, size):
    # Android adaptive foreground (needs transparent bg, safe center ~66dp/108dp)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    target = int(size * 0.60)
    scale = max(1, round(target / max(frog.width, frog.height)))
    new_w = frog.width * scale
    new_h = frog.height * scale
    scaled = frog.resize((new_w, new_h), Image.Resampling.NEAREST)
    canvas.paste(scaled, ((size - new_w) // 2, (size - new_h) // 2), scaled)
    return canvas

# 1. iOS AppIcon (1024x1024, scale 13 gives perfect breathing room)
ios_path = os.path.join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
ios_icon = make_solid_icon(frog, 1024, scale_mult=13)
ios_icon.save(ios_path, optimize=True)
print("Updated iOS AppIcon-512@2x.png")

# 2. Public web icons
web_png = os.path.join(ROOT, 'public/app-icon.png')
ios_icon.save(web_png, optimize=True)
web_jpg = os.path.join(ROOT, 'public/app-icon.jpg')
ios_icon.save(web_jpg, quality=95)
print("Updated public/app-icon.png and jpg")

src_asset = os.path.join(ROOT, 'src/assets/app-icon.png')
if os.path.exists(src_asset):
    ios_icon.save(src_asset, optimize=True)
    print("Updated src/assets/app-icon.png")

# 3. Android mipmap densities
DENS = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
FG = {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}

for d, px in DENS.items():
    folder = os.path.join(ROOT, f'android/app/src/main/res/mipmap-{d}')
    if os.path.exists(folder):
        make_solid_icon(frog, px, pad_ratio=0.08).save(os.path.join(folder, 'ic_launcher.png'), optimize=True)
        make_round_icon(frog, px).save(os.path.join(folder, 'ic_launcher_round.png'), optimize=True)
        make_foreground_icon(frog, FG[d]).save(os.path.join(folder, 'ic_launcher_foreground.png'), optimize=True)
        print(f"Updated Android {folder}")

# 4. Copy to brain artifact directory for user preview
artifact_dest = r'C:/Users/sheep/.gemini/antigravity-ide/brain/2e4dffb5-3ba5-485b-9406-e2761aaec030/cleaned_app_icon.png'
ios_icon.save(artifact_dest)
print("Updated cleaned_app_icon.png in artifact folder")
