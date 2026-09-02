# 矿联矿机 | Minelink Equipment

B2B 矿用设备一站式采购平台官网（已按 Emil Kowalski 设计工程原则优化交互与动画）。

## 页面

- [index.html](./index.html) — 首页
- [equipment-catalog.html](./equipment-catalog.html) — 设备目录（31 款设备筛选）

## 优化要点

- 使用自定义 `cubic-bezier` ease-out 曲线
- 按钮 / 卡片 / 筛选器增加 `:active` scale(0.97) 反馈
- 精确 transition 属性（避免 `transition: all`）
- 模态从 scale(0.95) + opacity 进入
- 卡片 hover 阴影与位移更自然

仓库：https://github.com/SSYin-yg/B2B
