#!/usr/bin/env python
"""把 AI 生成的角色立绘加工成可入库的像素立绘素材。

做五件事：
  1. （可选）--knockout：抠掉生图模型画出来的「假透明棋盘格」背景
  2. 按 alpha 阈值裁到真实可见内容（不能用 getbbox()，它会把透明区的非零 RGB 算作内容）
  3. 按参考图的构图比例补白，保证不同角色在 objectFit:contain 下渲染出的角色高度一致
  4. （可选）--despeckle：硬边化 alpha 并抹掉孤立色斑
  5. 报告体积

用法:
    python scripts/make_pixel_portrait.py <输入图> <输出图> [--ref 参考图] [--threshold 16]
                                        [--pad 8] [--quantize 256] [--despeckle]
                                        [--knockout] [--knockout-sat 24] [--knockout-lum 170]

依赖: Pillow。Windows 上用 C:/ProgramData/miniconda3/python.exe

关于 --knockout（2026-09-25 新增）
    部分生图入口只输出 RGB，没有 alpha 通道；让模型画「透明背景」时，它会**把透明画成
    白灰相间的棋盘格**（实测两档色值 252/235 与 255/197，通道最大差 ≤7）。
    不能按「接近白色」全局抠图 —— 菲比的白帽子、白裙子本身就是中性白，会被抠穿。
    正确做法是从**画布四边**做连通域泛洪，只有与边框相连的中性浅灰才算背景，
    被描边包住的内部浅色自动保留。

关于 --despeckle（2026-09-25 新增）
    参考图 artoria_pixel.png 的 alpha 是纯二值的（半透明像素 = 0），也就是真正的硬边像素画。
    但 AI 生图常在角色周围撒一圈彩色噪点（半透明或全不透明），实测某张图半透明像素占 3.13%。
    这些噪点会把 alpha 包围盒撑大 2~6px，让角色在画布里显得偏小，肉眼看则是「彩色灰尘」。
    该开关做两步清理：alpha 在 128 处二值化 + 只保留最大连通域（角色本体）。
    默认关闭，以免改动已确认过的画面。
"""
import argparse
import os
import sys
from collections import deque

try:
    from PIL import Image
except ImportError:
    sys.exit("缺少 Pillow。Windows 上请改用: C:/ProgramData/miniconda3/python.exe")


def knockout_bg(im, sat=24, lum=170, quiet=False):
    """抠掉生图模型画出来的假透明棋盘格，输出带真实 alpha 的 RGBA。

    从画布四边泛洪，只把「与边框连通的中性浅灰」判为背景。
    角色内部的大面积白色（帽子、裙摆）被深色描边包住，不与边框连通，因此自动保留。
    """
    rgb = im.convert("RGB")
    w, h = rgb.size
    data = rgb.tobytes()

    def is_bg(i):
        o = i * 3
        r, g, b = data[o], data[o + 1], data[o + 2]
        return max(r, g, b) - min(r, g, b) <= sat and min(r, g, b) >= lum

    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for i in (x, (h - 1) * w + x):
            if not seen[i] and is_bg(i):
                seen[i] = 1
                q.append(i)
    for y in range(h):
        for i in (y * w, y * w + w - 1):
            if not seen[i] and is_bg(i):
                seen[i] = 1
                q.append(i)

    while q:
        i = q.popleft()
        x = i % w
        y = i // w
        if x > 0:
            j = i - 1
            if not seen[j] and is_bg(j):
                seen[j] = 1
                q.append(j)
        if x < w - 1:
            j = i + 1
            if not seen[j] and is_bg(j):
                seen[j] = 1
                q.append(j)
        if y > 0:
            j = i - w
            if not seen[j] and is_bg(j):
                seen[j] = 1
                q.append(j)
        if y < h - 1:
            j = i + w
            if not seen[j] and is_bg(j):
                seen[j] = 1
                q.append(j)

    mask = Image.frombytes("L", (w, h), bytes(255 if v else 0 for v in seen))
    out = rgb.convert("RGBA")
    out.putalpha(mask.point(lambda v: 0 if v else 255))

    if not quiet:
        kept = sum(1 for v in seen if not v)
        print("抠背景          边框泛洪命中背景 %d px / 保留前景 %d px（%.1f%%）"
              % (sum(1 for v in seen if v), kept, kept / (w * h) * 100))
    return out


def visible_bbox(im, threshold):
    """按 alpha 阈值求可见内容包围盒。

    必须用 alpha 通道。PIL 的 getbbox() 在 RGBA 上会检查所有通道，
    透明区域的 RGB 残留值（如 (2,2,3,0)）会被算成内容，导致包围盒虚大 ——
    实测某图 getbbox() 给出 (0,39,1000,1024)，而真实可见内容只有 (168,43,916,993)。
    """
    return im.getchannel("A").point(lambda v: 255 if v >= threshold else 0).getbbox()


def despeckle(im, hard=128, min_blob=256, quiet=False):
    """硬边化 alpha 并只保留最大连通域（角色本体）。

    步骤：
      1. alpha >= hard → 255，否则 0（硬边像素画不应有半透明过渡）
      2. 8 邻域连通域标记，丢掉小于 min_blob 像素的孤立小块

    纯 Python 实现（本机 miniconda 没有 numpy/scipy）。1024x1024 量级约几秒，可接受。
    """
    w, h = im.size
    a = bytearray(im.getchannel("A").point(lambda v: 255 if v >= hard else 0).tobytes())

    visited = bytearray(w * h)
    largest = []
    for start in range(w * h):
        if not a[start] or visited[start]:
            continue
        visited[start] = 1
        stack = [start]
        comp = []
        while stack:
            i = stack.pop()
            comp.append(i)
            x = i % w
            y = i // w
            y0 = y - 1 if y > 0 else 0
            y1 = y + 2 if y < h - 1 else h
            x0 = x - 1 if x > 0 else 0
            x1 = x + 2 if x < w - 1 else w
            for ny in range(y0, y1):
                base = ny * w
                for nx in range(x0, x1):
                    j = base + nx
                    if not visited[j] and a[j]:
                        visited[j] = 1
                        stack.append(j)
        if len(comp) > len(largest):
            largest = comp

    if not largest:
        sys.exit("去噪后没有可见内容，请检查输入图")

    mask = Image.new("L", (w, h), 0)
    px = mask.load()
    for i in largest:
        px[i % w, i // w] = 255

    out = im.copy()
    out.putalpha(mask)

    if not quiet:
        total = sum(1 for v in a if v)
        print("去噪            硬边阈值 %d，最大连通域 %d px / 前景共 %d px（丢弃 %.1f%%）"
              % (hard, len(largest), total, (total - len(largest)) / total * 100 if total else 0))
    return out


def ref_metrics(ref_path):
    """从参考图提取构图比例。"""
    r = Image.open(ref_path).convert("RGBA")
    W, H = r.size
    bbox = visible_bbox(r, 16)
    if not bbox:
        sys.exit("参考图没有可见内容")
    l, t, rt, b = bbox
    return {
        "aspect": W / H,
        "content_h_frac": (b - t) / H,
        "top_frac": t / H,
        "size": (W, H),
    }


def build(src, dst, ref, threshold=16, pad=8, quantize=0, quiet=False, despeckle_on=False,
          knockout_on=False, knockout_sat=24, knockout_lum=170):
    m = ref_metrics(ref)
    im = Image.open(src).convert("RGBA")
    if knockout_on:
        im = knockout_bg(im, knockout_sat, knockout_lum, quiet=quiet)
    if despeckle_on:
        im = despeckle(im, quiet=quiet)
    W, H = im.size

    raw = visible_bbox(im, threshold)
    if not raw:
        sys.exit("输入图没有可见内容")

    # 裁到内容，四周留 pad 安全边（保住边缘抗锯齿像素）
    l = max(0, raw[0] - pad)
    t = max(0, raw[1] - pad)
    r = min(W, raw[2] + pad)
    b = min(H, raw[3] + pad)
    content = im.crop((l, t, r, b))
    cw, ch = content.size

    # 按参考图的「角色占画布高比例」反推画布高度，再按参考图宽高比定宽度
    canvas_h = round(ch / m["content_h_frac"])
    canvas_w = round(canvas_h * m["aspect"])
    if canvas_w < cw:                       # 内容过宽时以宽度为准
        canvas_w = cw
        canvas_h = round(canvas_w / m["aspect"])

    top = round(canvas_h * m["top_frac"])
    left = (canvas_w - cw) // 2             # 水平居中
    if top + ch > canvas_h:                 # 兜底：不越界
        top = max(0, canvas_h - ch)

    out = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    out.paste(content, (left, top))

    if quantize:
        # AI 生成图常有数万种颜色（块内噪声），对像素立绘来说是异常值。
        # 量化到 256 色可省 ~35% 体积，2 倍放大下肉眼无差别。
        # 默认关闭：不改动已确认过的画面。
        alpha = out.getchannel("A")
        q = out.convert("RGB").quantize(colors=quantize, method=Image.MEDIANCUT).convert("RGB")
        out = q.convert("RGBA")
        out.putalpha(alpha)

    os.makedirs(os.path.dirname(os.path.abspath(dst)) or ".", exist_ok=True)
    out.save(dst, optimize=True)

    if not quiet:
        print("参考图构图基准  %s  角色占高 %.1f%%  宽高比 %.3f"
              % (m["size"], m["content_h_frac"] * 100, m["aspect"]))
        print("原始可见内容    %s  (%dx%d)" % (str(raw), raw[2] - raw[0], raw[3] - raw[1]))
        print("裁切(+%dpx 安全边)  %dx%d" % (pad, cw, ch))
        print("输出画布        %dx%d   四边留白 左%d 上%d 右%d 下%d"
              % (canvas_w, canvas_h, left, top, canvas_w - left - cw, canvas_h - top - ch))
        print("角色占画布高    %.1f%%   (参考图 %.1f%%)"
              % (ch / canvas_h * 100, m["content_h_frac"] * 100))
        print("量化            %s" % ("%d 色" % quantize if quantize else "关闭（无损）"))
        print("体积            %.1f KB" % (os.path.getsize(dst) / 1024))
    return out


def main():
    ap = argparse.ArgumentParser(description="加工像素立绘素材")
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--ref", default="src/assets/pixel/artoria_pixel.png",
                    help="构图基准图（默认用阿尔托莉雅）")
    ap.add_argument("--threshold", type=int, default=16,
                    help="alpha 可见阈值，低于此值视为透明（默认 16）")
    ap.add_argument("--pad", type=int, default=8, help="裁切后四周保留的安全边（默认 8px）")
    ap.add_argument("--quantize", type=int, default=0, metavar="N",
                    help="量化到 N 色（如 256）。默认 0 = 关闭，保持无损")
    ap.add_argument("--despeckle", action="store_true",
                    help="硬边化 alpha 并只保留最大连通域，清掉 AI 生图撒在角色周围的彩色噪点")
    ap.add_argument("--knockout", action="store_true",
                    help="抠掉生图模型画出来的假透明棋盘格背景（从画布四边泛洪）")
    ap.add_argument("--knockout-sat", type=int, default=24, metavar="N",
                    help="背景判定的最大通道色差（默认 24，越小越严格）")
    ap.add_argument("--knockout-lum", type=int, default=170, metavar="N",
                    help="背景判定的最低通道值（默认 170，越大越保守）")
    a = ap.parse_args()
    build(a.src, a.dst, a.ref, a.threshold, a.pad, a.quantize, despeckle_on=a.despeckle,
          knockout_on=a.knockout, knockout_sat=a.knockout_sat, knockout_lum=a.knockout_lum)


if __name__ == "__main__":
    main()
