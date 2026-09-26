#!/usr/bin/env python
"""把一组角色素材拼成总览联络表（contact sheet），用于横向比对形象是否统一。

关键点：按「可见内容高度」而非「画布高度」归一化。
不同素材的画布留白比例差别很大，按画布高度排会让角色大小失真，
看不出真实的视觉体量差异。

用法:
    python scripts/make_contact_sheet.py -o 输出图 [--cols 4] [--tile-h 220] 图1 图2 ...
    python scripts/make_contact_sheet.py -o 输出图 --glob "src/assets/pixel/*_pixel.png"

依赖: Pillow。Windows 上用 C:/ProgramData/miniconda3/python.exe
"""
import argparse
import glob
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("缺少 Pillow。Windows 上请改用: C:/ProgramData/miniconda3/python.exe")

BG = (13, 14, 21)          # 游戏基调 #0d0e15
FG = (226, 232, 240)
MUTED = (148, 163, 184)
PAD = 18
GAP = 14


def load_font(size):
    for p in ("C:/Windows/Fonts/msyh.ttc", "C:/Windows/Fonts/arial.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def visible_bbox(im, threshold=16):
    """按 alpha 阈值求可见内容包围盒。

    不能用 getbbox()：它在 RGBA 上会检查所有通道，透明区域的 RGB 残留值
    （如 (2,2,3,0)）会被算成内容，导致包围盒虚大。
    """
    return im.getchannel("A").point(lambda v: 255 if v >= threshold else 0).getbbox()


def build(paths, out, cols=4, tile_h=220, label=True, title=None):
    tiles = []
    for p in paths:
        im = Image.open(p).convert("RGBA")
        bb = visible_bbox(im)
        if not bb:
            continue
        content = im.crop(bb)
        scale = tile_h / content.height
        tw = max(1, round(content.width * scale))
        tiles.append({
            "img": content.resize((tw, tile_h), Image.LANCZOS),
            "name": os.path.splitext(os.path.basename(p))[0],
            "canvas": im.size,
            "content": (content.width, content.height),
            "kb": os.path.getsize(p) / 1024,
        })
    if not tiles:
        sys.exit("没有可用素材")

    cell_w = max(t["img"].width for t in tiles) + PAD * 2
    cell_w = max(cell_w, 150)
    label_h = 42 if label else 0
    cell_h = tile_h + label_h + PAD * 2
    rows = (len(tiles) + cols - 1) // cols
    header = 46 if title else 0

    W = cols * cell_w + (cols + 1) * GAP
    H = header + rows * cell_h + (rows + 1) * GAP
    sheet = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(sheet)

    f_title = load_font(20)
    f_name = load_font(14)
    f_meta = load_font(11)

    if title:
        d.text((GAP + PAD, 14), title, font=f_title, fill=FG)

    for i, t in enumerate(tiles):
        r, c = divmod(i, cols)
        x0 = GAP + c * (cell_w + GAP)
        y0 = header + GAP + r * (cell_h + GAP)
        d.rectangle([x0, y0, x0 + cell_w - 1, y0 + cell_h - 1],
                    outline=(40, 46, 62), width=1)
        ix = x0 + (cell_w - t["img"].width) // 2
        iy = y0 + PAD
        sheet.paste(t["img"], (ix, iy), t["img"])
        if label:
            ly = y0 + PAD + tile_h + 6
            d.text((x0 + PAD, ly), t["name"], font=f_name, fill=FG)
            d.text((x0 + PAD, ly + 17),
                   "画布 %dx%d · 内容 %dx%d · %.0fKB"
                   % (t["canvas"][0], t["canvas"][1], t["content"][0], t["content"][1], t["kb"]),
                   font=f_meta, fill=MUTED)

    sheet.save(out, quality=94)
    print("联络表 -> %s  (%dx%d, %d 张, %.1f KB)"
          % (out, W, H, len(tiles), os.path.getsize(out) / 1024))
    return sheet


def main():
    ap = argparse.ArgumentParser(description="生成角色素材总览联络表")
    ap.add_argument("images", nargs="*")
    ap.add_argument("--glob", dest="pattern", help="用通配符批量选图")
    ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--tile-h", type=int, default=220)
    ap.add_argument("--title", default=None)
    a = ap.parse_args()

    paths = list(a.images)
    if a.pattern:
        paths += sorted(glob.glob(a.pattern))
    if not paths:
        sys.exit("没有输入素材")
    build(paths, a.out, a.cols, a.tile_h, True, a.title)


if __name__ == "__main__":
    main()
