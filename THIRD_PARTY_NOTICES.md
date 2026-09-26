# 第三方资源与许可

本项目内嵌了以下第三方作品。各作品的著作权归原作者所有，按原许可条款使用。

---

## pixelarticons

- **用途**：`src/data/pixelIcons.ts` 中的像素图标 path 数据（24×24 网格）
- **来源**：https://github.com/halfmage/pixelarticons
- **作者**：Gerrit Halfmann
- **许可**：MIT License
- **说明**：项目从该图标集中抽取实际使用的图标（约 195 枚），以 vendor 形式内联为
  `src/data/pixelIcons.ts`，**不是**运行时 npm 依赖。图标 path 数据未做修改。

```
MIT License

Copyright (c) 2019 Gerrit Halfmann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 重新生成图标数据

`src/data/pixelIcons.ts` 由脚本生成，请勿手工编辑。重新生成步骤：

```bash
# 1. 在隔离工作区安装图标集（不污染项目依赖）
cd ~/.workbuddy-ai/binaries/node/workspace
npm install pixelarticons

# 2. 运行抽取脚本
node scratch/icon_audit/vendor_icons.cjs
```

需要新增图标时，编辑 `scratch/icon_audit/vendor_icons.cjs` 里的 `NEEDED` 数组
（填入 pixelarticons 的 kebab-case 文件名），再跑一次即可。
