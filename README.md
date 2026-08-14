# 「宫园薰 × 小猫」主题皮肤 — DSH Web

为 DeepSeek Harness Web 界面（`dsh web`，http://127.0.0.1:3080）定制的皮肤：
明亮樱粉配色（薰的裙子 × 薰的蓝眼睛）、漂浮樱花花瓣、右上角薰主题画卡、左下角小猫头像、定制 favicon。

## 包含什么

| 文件 | 作用 |
|---|---|
| `kaori-kitten.css` | 覆盖 `--dsw-alias-*` / `--dsw-specific-*` / `--dsw-static-*` 设计 token（亮/暗两套），画卡/小猫/花瓣样式 |
| `kaori-overlay.js` | 生成花瓣层、右上角薰画卡、左下角小猫头像（全部 `pointer-events: none`，不挡任何操作） |
| `favicon.svg` | 小猫 × 小提琴 × 樱花 定制图标 |
| `images\kaori-portrait.svg` | 薰主题画卡图（小提琴×樱花×「四月は君の嘘」） |
| `images\cat-avatar.svg` | 小猫头像（戴蝴蝶结） |
| `apply.ps1` | 一键应用（备份 → 复制 → 补丁 index.html），幂等 |
| `rollback.ps1` | 一键还原原版前端 |
| `backup\` | 首次应用时自动生成：原版 `index.html` / `favicon.svg` / `manifest.webmanifest` 备份（不入库，见 `.gitignore`） |

## 如何应用 / 还原

```powershell
# 应用（需要写 node_modules 目录，会弹出权限确认）
powershell -ExecutionPolicy Bypass -File .\apply.ps1

# 还原
powershell -ExecutionPolicy Bypass -File .\rollback.ps1
```

应用后**刷新页面即可生效（建议 Ctrl+F5）**，无需重启 `dsh web`。

换了安装位置可用 `-Dist` 指定新的 dist 路径：
`powershell -ExecutionPolicy Bypass -File .\apply.ps1 -Dist "D:\某处\node_modules\@deepseek-ai\dsh-web-frontend\dist"`

## 如何换成你自己的图

脚本会自动尝试 `svg → jpg → png → webp` 四种格式，所以：

1. 把你的薰的图片放进 `images\`，命名为 **`kaori-portrait.jpg`**（或 .png/.webp）
2. 把小猫图命名为 **`cat-avatar.jpg`**（或 .png/.webp）
3. 重跑 `apply.ps1`，刷新页面即可

（不换就用内置的 SVG 占位图；画卡比例约 3:4，正方形图会被裁成 104×140 的圆角卡。）

## 布局说明（不挡对话框）

- **右上角**：薰主题画卡（104px 宽，图 + 台词小字），`pointer-events: none`，点击穿透。
- **左下角**：小猫头像（54px 圆形），同样点击穿透。
- **右下角**：不放任何东西，不挡输入框/对话框。
- 想移动/改大小：改 `kaori-kitten.css` 里 `#kaori-card` / `#kaori-cat` 的 `top/right/left/bottom/width`，重跑 apply 即可。

## 原理

- 前端配色全部由 CSS 变量（design token）控制：`--dsw-alias-*`、`--dsw-specific-*`、`--dsw-static-*`；亮色在 `body{...}`、暗色在 `body[data-ds-dark-theme]{...}`。
- 本皮肤是纯 CSS 覆盖 + 静态图片/脚本：不改任何 JS bundle、不动功能逻辑。
- `dsh-host-frontend-static` 每次请求都从磁盘读文件，改动即时生效。

## 维护注意

- **`pnpm install` / 升级会覆盖 dist** → 重跑 `apply.ps1` 即可恢复。
- 想关掉花瓣动画：CSS 已有 `prefers-reduced-motion` 支持；或把 `kaori-overlay-v3.js` 里 `PETALS` 改为 0。
- 台词文字：改 `kaori-overlay-v3.js` 里 `cap.textContent`。

## v3（四月与小猫，当前默认）

- 配色：天蓝（薰校服/眼睛）+ 暖金（金发）+ 柔粉（琴箱）+ 奶油白（背景）+ 祖母绿（小猫项圈）。
- **实现原则**：只覆盖真实存在的 `--dsw-*` 设计令牌（亮/暗两套），装饰层（花瓣/角色卡/小猫/能量条/🎻开关）由 `kaori-overlay-v3.js` 注入，**不使用任何虚构的 `.dsh-*` 类名**（旧 v3 因此全部失效）。
- **图片引用**：`01-kaori.jpg`（右上角角色卡）与 `02-cat.jpg`（左下角小猫）直接引用 `images\` 里的原图，`apply.ps1` 自动复制到 `dist\assets\images\`。
- **深蓝金边侧边栏**（效果图A）：由 JS 运行时定位侧边栏并打 `.kaori-sidebar-v3` 标，找不到时安全回退为浅色，不影响其余样式。
- **高能区能量条**（效果图B）：顶部居中，按对话内容增长；无内容时自动隐藏。
- `apply.ps1` 已修复 Windows PowerShell 5.1 中文乱码（UTF-8 BOM + 字符码点构造标题）。

## License

MIT © Bonny0430
