#!/usr/bin/env python
"""把「本来就是像素画」的参考图 1:1 转成可入库的像素素材，不经过任何重绘。

与 make_pixel_portrait.py 的分工：
    make_pixel_portrait.py  处理 AI 文生图（只能裁切/补白/去噪，改不了造型）
    pixelate_reference.py   处理真像素参考图（降回原生网格，造型逐像素照搬）

流程：
  1. 可选 --knockout：抠掉假透明棋盘格 / 纯色背景（从画布四边泛洪）
  2. 去连通域小碎片：顺手去掉聊天软件叠在图上的「···」按钮、水印、孤立噪点
  3. 估原生块宽：在 2~16 里挑「块内最一致」的那一档
  4. 按块取众数色降采样（不是平均 —— 平均会在描边处造出中间色）
  5. 限色量化（默认 32 色，无抖动）
  6. 最近邻整数倍放大到目标高度

用法:
    python scripts/pixelate_reference.py <输入图> <输出图>
        [--block N] [--palette 32] [--height 1000] [--knockout] [--no-despeckle]

依赖: Pillow。Windows 上用 C:/ProgramData/miniconda3/python.exe
"""
import argparse
import os
import sys
from collections import Counter, deque

try:
    from PIL import Image
except ImportError:
    sys.exit("缺少 Pillow。Windows 上请改用: C:/ProgramData/miniconda3/python.exe")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_pixel_portrait import despeckle, knockout_bg, visible_bbox  # noqa: E402


def drop_small_components(im, min_px=900):
    """只保留最大连通域，去掉叠在图上的 UI 按钮 / 水印 / 碎片。"""
    w, h = im.size
    a = im.getchannel("A").load()
    seen = bytearray(w * h)
    best = []
    for s in range(w * h):
        if not a[s % w, s // w] or seen[s]:
            continue
        seen[s] = 1
        stack, comp = [s], []
        while stack:
            i = stack.pop()
            comp.append(i)
            x, y = i % w, i // w
            for ny in range(max(0, y - 1), min(h, y + 2)):
                for nx in range(max(0, x - 1), min(w, x + 2)):
                    j = ny * w + nx
                    if not seen[j] and a[nx, ny]:
                        seen[j] = 1
                        stack.append(j)
        if len(comp) > len(best):
            best = comp
    if len(best) < min_px:
        sys.exit("最大连通域只有 %d px，可能被误删，请检查输入图" % len(best))
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    for i in best:
        mp[i % w, i // w] = 255
    out = im.copy()
    out.putalpha(mask)
    return out, len(best)


def estimate_block(im, lo=2, hi=24, tol=12):
    """估原生块宽：滞后自相关曲线的**第一个局部波谷**。

    判据方向很容易搞反，这里踩过坑：整数倍放大的像素画，同一块内部所有像素同色，
    所以 lag 越小同色率越**高**（lag=1 恒为最高），曲线整体单调下降；
    真正的块宽 b 表现为「下降过程中的第一个局部波谷」—— 跨到下一个块时同色率骤降，
    随后 lag=b+1..2b-1 又回到高位。取最大值会永远选到最小块。

    必须带颜色容差（tol）：JPEG 重编码后精确相等会掉到 10% 以下，曲线糊成一片。
    找不到明显波谷时返回 None，让调用方显式传 --block
    （用 pixel-art-forensics 的 analyze_pixel_art.py 多尺度表读数更稳）。
    """
    w, h = im.size
    px = im.convert("RGB").load()
    ap = im.getchannel("A").load()
    curve = []
    for b in range(1, min(hi, w // 4) + 1):
        same = tot = 0
        for y in range(0, h, 2):
            for x in range(0, w - b, 2):
                if not (ap[x, y] and ap[x + b, y]):
                    continue
                tot += 1
                c0, c1 = px[x, y], px[x + b, y]
                if max(abs(c0[0] - c1[0]), abs(c0[1] - c1[1]), abs(c0[2] - c1[2])) <= tol:
                    same += 1
        curve.append((same / tot if tot else 0.0, b))

    for i in range(lo - 1, len(curve) - 1):
        r_prev, r, r_next = curve[i - 1][0], curve[i][0], curve[i + 1][0]
        if r < r_prev - 0.03 and r <= r_next:
            return curve[i][1], curve
    return None, curve


def modal_downsample(im, block):
    """每块取出现最多的不透明颜色。比 resize() 的平均更保描边。"""
    w, h = im.size
    rgb = im.convert("RGB").load()
    ap = im.getchannel("A").load()
    nw, nh = max(1, w // block), max(1, h // block)
    out = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
    op = out.load()
    for by in range(nh):
        y0, y1 = by * block, min(h, (by + 1) * block)
        for bx in range(nw):
            x0, x1 = bx * block, min(w, (bx + 1) * block)
            cnt = Counter()
            for y in range(y0, y1):
                for x in range(x0, x1):
                    if ap[x, y] >= 128:
                        cnt[rgb[x, y]] += 1
            if cnt:
                op[bx, by] = cnt.most_common(1)[0][0] + (255,)
    return out


def main():
    ap = argparse.ArgumentParser(description="真像素参考图 -> 可入库像素素材")
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--block", type=int, default=0, help="原生块宽，0 = 自动估算")
    ap.add_argument("--palette", type=int, default=32, help="限色数，0 = 不限")
    ap.add_argument("--height", type=int, default=1000, help="目标输出高度（决定放大倍率）")
    ap.add_argument("--knockout", action="store_true", help="抠掉假透明棋盘格 / 纯色背景")
    ap.add_argument("--no-despeckle", action="store_true", help="跳过去除小连通域")
    a = ap.parse_args()

    im = Image.open(a.src).convert("RGBA")
    if a.knockout:
        im = knockout_bg(im)
    if not a.no_despeckle:
        im, kept = drop_small_components(im)
        print("保留主体        最大连通域 %d px（其余碎片/水印已剔除）" % kept)

    bbox = visible_bbox(im, 16)
    if not bbox:
        sys.exit("没有可见内容")
    im = im.crop(bbox)
    w, h = im.size
    print("裁到内容        %dx%d" % (w, h))

    if a.block:
        block = a.block
        print("块宽            %d px（手工指定）" % block)
    else:
        block, curve = estimate_block(im)
        show = ", ".join("%d:%.0f%%" % (b, r * 100) for r, b in curve[:16])
        if block is None:
            print("块宽估计        未找到明显波谷（曲线: %s）" % show)
            sys.exit("自动估块失败。请用 analyze_pixel_art.py 读出块宽后传 --block N")
        print("块宽估计        %d px（滞后自相关首个波谷；曲线 %s）" % (block, show))

    native = modal_downsample(im, block)
    nw, nh = native.size
    print("原生网格        %dx%d  色数 %d" % (nw, nh, len(Counter(native.convert("RGB").getdata()))))

    if a.palette:
        alpha = native.getchannel("A")
        q = native.convert("RGB").quantize(colors=a.palette, method=Image.MEDIANCUT)
        native = q.convert("RGBA")
        native.putalpha(alpha)
        print("限色            %d 色（无抖动）" % a.palette)

    scale = max(1, round(a.height / nh))
    out = native.resize((nw * scale, nh * scale), Image.NEAREST)
    print("放大            x%d  ->  %dx%d（块宽 %dpx，与项目风格锚点 artoria 的 ~10px 同级）"
          % (scale, out.size[0], out.size[1], scale))

    os.makedirs(os.path.dirname(os.path.abspath(a.dst)) or ".", exist_ok=True)
    out.save(a.dst, optimize=True)
    print("体积            %.1f KB" % (os.path.getsize(a.dst) / 1024))


if __name__ == "__main__":
    main()
