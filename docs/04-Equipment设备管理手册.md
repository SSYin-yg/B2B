# 04 - Equipment 设备管理手册

## 一、进入 Equipment 管理

Strapi Admin → 左侧 **📦 内容管理器** → **设备**（Equipment）。

列表页显示所有 31 条设备，可按分类筛选、搜索 slug/名称。

## 二、Equipment 字段详解

### 基础字段

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| **slug** | string | ✅ | URL 标识，唯一，对应 `equipment/{slug}.html` | `crawler-jaw` |
| **中文名称** (`name_cn`) | string | ✅ | 中文显示名 | `履带式颚式移动破碎站` |
| **英文名称** (`name_en`) | string | ✅ | 英文显示名 | `Crawler Jaw Crusher` |
| **设备类别** (`category`) | enumeration | ✅ | 分类筛选 + 相关设备分组 | `mobile` |

### 类别枚举值

| 枚举值 | 中文标签 | 英文标签 | 典型设备 |
|--------|---------|---------|---------|
| `mobile` | 移动破碎 | Mobile crushing | 履带/轮胎式破碎站 |
| `crushing` | 破碎设备 | Crushing & sand | 颚破、圆锥、反击、VSI |
| `screening` | 筛分设备 | Screening & feed | 圆振筛、直线筛、给料机 |
| `washing` | 洗选设备 | Sand washing | 螺旋洗砂机、轮斗洗砂机、脱水筛 |
| `parts` | 配件 | Wear parts | 锤头、衬板、筛网 |

### 图片字段

**images** 字段是 JSON 数组，存储图片路径。

```json
["assets/images/equipment/crawler-jaw.jpg"]
```

**建议约定**：
- 路径使用相对路径（不以 `/` 开头）
- 首页为主图，后续为缩略图
- `build-pages.js` 会读取第一幅图作为 OG Image 和相关设备缩略图

### 描述与特点

| 字段 | 类型 | 说明 |
|------|------|------|
| desc_zh | text | 中文产品介绍（多段文本，可用换行） |
| desc_en | text | 英文产品介绍 |
| features_zh | json（数组） | 中文特点列表 |
| features_en | json（数组） | 英文特点列表 |

**features_zh / features_en 格式**：JSON 数组

```json
[
  "移动灵活，适合快速转场",
  "颚腔大开口，处理粗料效率高",
  "可选液压调整排料口",
  "模块化设计便于维护"
]
```

### 规格参数（specs）

JSON 数组，每项含 `k_zh` / `k_en` / `v` 三个字段：

```json
[
  { "k_zh": "进料粒度", "k_en": "Feed size", "v": "≤ 650 mm" },
  { "k_zh": "处理能力", "k_en": "Capacity", "v": "80-250 t/h" },
  { "k_zh": "电机功率", "k_en": "Motor power", "v": "160 kW" }
]
```

**渲染效果**：前端按当前语言显示对应列名（中文页显示 `k_zh`，英文页显示 `k_en`）。

### 型号参数表（model_tables）

多表 JSON 数组：

```json
[
  {
    "title_zh": "技术参数表",
    "title_en": "Technical specifications",
    "columns": [
      { "zh": "型号", "en": "Model" },
      { "zh": "进料口", "en": "Feed opening" },
      { "zh": "排料口", "en": "CSS" }
    ],
    "rows": [
      ["PE400x600", "400x600 mm", "40-100 mm"],
      ["PE500x750", "500x750 mm", "50-125 mm"]
    ]
  }
]
```

### SEO 字段

| 字段 | 说明 | 留空行为 |
|------|------|---------|
| seo_title_zh | 中文 SEO 标题 | 前端自动用 `name_cn + ' | 矿联矿机'` |
| seo_title_en | 英文 SEO 标题 | 前端自动用 `name_en + ' | Minelink Equipment'` |
| seo_description_zh | 中文 SEO 描述 | 前端自动用 `desc_zh` |
| seo_description_en | 英文 SEO 描述 | 前端自动用 `desc_en` |
| og_image | 社交分享图 URL | 前端自动用第一张设备图（`images[0]`） |

## 三、编辑设备条目（日常流程）

### 场景：修改履带式颚破的中文介绍

1. Admin → **内容管理器** → **设备**
2. 列表中找到 `crawler-jaw`（可用搜索框）
3. 点击进入编辑页
4. 找到 **中文描述** 字段 → 修改
5. 点击右上 **保存**
6. 点击右上 **发布**（Draft & Publish 模式下）
7. 运行 `npm run build-pages` 重新生成静态页
8. 本地预览：打开 `http://localhost:3000/equipment/crawler-jaw.html` 确认效果

### 场景：新增一台设备

⚠️ **当前 31 台设备是从 `assets/equipment-data.js` 迁移而来**，新增设备有两种方式：

**方法 A（推荐）：直接在后台新增**

1. 内容管理器 → **设备** → 点击 **Create new entry**
2. 填写所有字段，**slug 必须唯一**
3. 保存 + 发布
4. 运行 `npm run build-pages`（会自动生成新页面）

**方法 B：更新 equipment-data.js + 重新迁移**

不推荐，因为迁移脚本是 upsert 按 slug 合并，可能覆盖后台编辑的内容。

## 四、Draft & Publish（草稿发布）

Equipment 启用了 Draft & Publish。每台设备有两种状态：

| 状态 | 说明 | 对前端的影响 |
|------|------|-------------|
| **草稿**（Draft） | 编辑中，未发布 | `GET /api/equipments` **不会返回** |
| **已发布**（Published） | 正式上线 | `GET /api/equipments` **会返回** |

### 发布流程

1. 编辑页面 → 修改内容
2. 右下 **保存**（保存草稿）
3. 右上 → **发布** 按钮 → 确认
4. 运行 `npm run build-pages`（脚本只拉取已发布条目）

### 草稿预览

Edit 页右上 ENTRY 面板下的 **PREVIEW** 区域 → **Open preview** 按钮会打开本地静态页面。如果设备尚未发布，URL 上会附加 `?preview=draft` 标记。

## 五、后台字段编辑器技巧

| 字段类型 | 编辑方式 | 技巧 |
|---------|---------|------|
| slug | 单行文本 | 只能是小写字母、数字、连字符（`crawler-jaw`），空格会被拒绝 |
| images / specs / features | JSON 编辑器 | 点击字段会打开 JSON 编辑器窗口，支持格式化 |
| desc_zh / desc_en | 多行文本 | 支持换行（实际 HTML 渲染为 `<br>` 或 `<p>`） |
| og_image | 单行文本 | 可以是相对路径或完整 URL |

### JSON 编辑器操作

`images`、`features_zh`、`specs`、`model_tables` 都是 JSON 类型字段，编辑器中会显示原始 JSON 文本。

- 点击字段会弹出 JSON 编辑器
- 支持 **格式化 / 压缩** 切换
- 有语法错误时底部会标红，无法保存
- 复制粘贴时注意不要截断括号

## 六、批量更新

### 场景：从 docx 文档导入设备介绍

使用仓库中已有的脚本：

```bash
cd backend
node scripts/update-equipment-sqlite.js
```

此脚本直接操作 SQLite（绕过 API 鉴权），按 docx 文件中的产品介绍段落批量更新 `desc_zh` 和 `features_zh`。

**使用前注意**：脚本中的 DOCX_MAP 是硬编码的 slug 映射（见脚本顶部数组），新增映射时同时修改脚本。

### 场景：从旧版 equipment-data.js 重新迁移

```bash
cd backend
npm run migrate
```

脚本会 **upsert**（按 slug 查找：有则更新，无则新增），幂等，可重复执行。

## 七、常见问题

### Q1：编辑后前端没变？
A1：需要运行 `npm run build-pages` 重新生成静态页面。

### Q2：新设备生成后 404？
A2：运行 `npm run build-pages`，确认 `equipment/{slug}.html` 文件存在；检查 slug 是否含非法字符（空格、大写、中文）。

### Q3：JSON 字段保存时报错？
A3：底部看错误提示，通常是缺逗号/括号。在 JSON 编辑器中点 **格式化** 按钮能快速定位语法错误。

### Q4：草稿状态的设备能访问预览吗？
A4：后台预览按钮直接打开本地静态页（该页由上一次 build 生成），可能还是旧版本。真正的草稿预览需要 Strapi Live Preview（Growth 计划）。
