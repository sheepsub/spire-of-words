import os
from PIL import Image

src_path = r'scratch/test_cleaned_white_icon.png'
if not os.path.exists(src_path):
    print('Source not found:', src_path)
    exit(1)

img = Image.open(src_path).convert('RGB')
print('Image size:', img.size)

# Update public/app-icon.png
img.save('public/app-icon.png')
# Update public/app-icon.jpg
img.save('public/app-icon.jpg', quality=95)
print('Updated public/app-icon.png and public/app-icon.jpg')

# Update ios AppIcon
ios_path = 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'
if os.path.exists(os.path.dirname(ios_path)):
    img.save(ios_path)
    print('Updated iOS AppIcon-512@2x.png')

# Update android icons if android folder exists
android_res = 'android/app/src/main/res'
sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}
for folder, sz in sizes.items():
    p = os.path.join(android_res, folder)
    if os.path.exists(p):
        resized = img.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(os.path.join(p, 'ic_launcher.png'))
        resized.save(os.path.join(p, 'ic_launcher_round.png'))
        resized.save(os.path.join(p, 'ic_launcher_foreground.png'))
        print(f'Updated {folder} ({sz}x{sz})')

bg_xml = os.path.join(android_res, 'values', 'ic_launcher_background.xml')
if os.path.exists(bg_xml):
    with open(bg_xml, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFFFFF</color>\n</resources>\n')
    print('Updated ic_launcher_background.xml to #FFFFFF')

print('All icons updated successfully!')
