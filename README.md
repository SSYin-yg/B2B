# 矿联矿机 | Minelink Equipment

B2B 矿用设备一站式采购平台官网。

## 页面

- [index.html](./index.html) — 首页
- [equipment-catalog.html](./equipment-catalog.html) — 设备目录（支持 `?filter=mobile|crushing|screening|washing|parts`）
- [equipment.html](./equipment.html) — 设备介绍页（`?id=设备id`，例如 `equipment.html?id=crawler-jaw`）
- [faq.html](./faq.html) — 常见问题

## 如何为设备添加图片

1. 把图片放到目录：

```
assets/images/equipment/
```

2. 文件名与设备 `id` 对应（见 `assets/equipment-data.js`）：

| 文件 | 说明 |
|------|------|
| `{id}.jpg` | 主图（必填建议） |
| `{id}-2.jpg` | 第 2 张（可选） |
| `{id}-3.jpg` | 第 3 张（可选） |

示例（履带式颚破）：

```
assets/images/equipment/crawler-jaw.jpg
assets/images/equipment/crawler-jaw-2.jpg
```

3. 在 `assets/equipment-data.js` 里确认该设备的 `images` 数组路径一致，例如：

```js
images: [
  'assets/images/equipment/crawler-jaw.jpg',
  'assets/images/equipment/crawler-jaw-2.jpg'
]
```

4. 支持格式：`.jpg` / `.jpeg` / `.png` / `.webp`。建议主图比例约 **4:3**，宽度 ≥ 1200px。

5. **没有图片时**：详情页会自动显示占位图，不影响访问与询价。

6. 本地预览可用任意静态服务器，例如：

```bash
npx serve .
# 或
python3 -m http.server 8080
```

然后打开：`http://localhost:8080/equipment.html?id=crawler-jaw`

## 设备 ID 一览（部分）

| id | 中文名 |
|----|--------|
| `wheeled-jaw` | 轮胎式颚破移动站 |
| `crawler-jaw` | 履带式颚破移动站 |
| `multi-cylinder-cone` | 多缸液压圆锥破碎机 |
| `vsi` | VSI 立轴冲击式破碎机 |
| `circular-screen` | 圆振动筛 |
| … | 完整列表见 `assets/equipment-data.js` |

## 从目录进入详情

设备目录中点击卡片标题或图片区域，会进入对应介绍页；「获取报价」仍在当前页弹窗，不跳转。

仓库：https://github.com/SSYin-yg/B2B
