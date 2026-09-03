# CHANGELOG

> 本文件记录项目重要变更，按时间倒序排列。
> 日期格式：`YYYY-MM-DD`

---

## [1.1.0] - 2026-09-03

### 新增

- **完整项目技术文档**（12 个文件）：`docs/` 目录
  - 01-项目架构说明 / 02-Strapi安装部署 / 03-后台操作 / 04-Equipment管理 / 05-Inquiry管理 / 06-邮件配置 / 07-静态生成 / 08-SEO与Sitemap / 09-环境变量 / 10-生产部署 / 11-故障排查 / 12-开发维护
- **CHANGELOG.md**
- **Strapi 原生 Preview 配置**：`config/admin.js` 启用 preview，Equipment 编辑页"Set up preview"→"Open preview"
- **CLIENT_URL 环境变量**：新增到 `.env` / `.env.example`，Strapi Preview 按钮使用
- **从 docx 批量导入脚本**：`backend/scripts/update-equipment-sqlite.js` + `read-docx.js`
- **mammoth devDependency**：docx 文本解析

### 修复

- **设备详情页 EN→ZH 切换第一次失败的 bug**
  - 根因：`product-render.js` 跨语言导航时未同步写入 `localStorage.minelink-lang`
  - 修复：导航前先 `localStorage.setItem('minelink-lang', targetLang)`
  - 防御：`i18n.js` 的 `detectLangByIP()` 增加设备详情页 URL 强制语言逻辑
- **4 台履带式设备产品介绍更新**（从万仕衡通 docx）
  - crawler-jaw / crawler-cone / crawler-impact-crusher / crawler-impact
  - 自动清理 docx 通用营销模板段落
  - 同步更新 `desc_zh` + `features_zh`（6 条/台）
- **静态页重新生成**：31 中文 + 31 英文 = 62 张，sitemap.xml 同步更新

### 改动文件清单（本 Release）

```
新增：
  docs/README.md
  docs/CHANGELOG.md
  docs/01-项目架构说明.md ... docs/12-开发维护手册.md
  backend/scripts/read-docx.js
  backend/scripts/update-equipment-sqlite.js

修改：
  backend/package.json                  +mammoth devDependency
  backend/config/admin.js               +preview 配置块
  backend/.env                          +CLIENT_URL
  backend/.env.example                  +CLIENT_URL 示例
  assets/product-render.js              导航前同步 localStorage
  assets/i18n.js                        detectLangByIP 增加 URL 强制语言
  backend/.tmp/data.db                  desc_zh / features_zh 批量更新
  equipment/*.html                      由 build-pages.js 重新生成
  en/equipment/*.html                   由 build-pages.js 重新生成
  sitemap.xml                           由 build-pages.js 重新生成
  assets/equipment-data.js              由 build-pages.js 回写
  assets/model-tables.js                由 build-pages.js 回写
```

---

## [1.0.0] - 2026-09-03

**第一阶段全部验收通过**。

### 核心功能

- ✅ Strapi 5.52.3 后端，SQLite
- ✅ Equipment（31 条）/ Inquiry 内容类型
- ✅ `POST /api/inquiry`（先存库再发邮件）
- ✅ 数据迁移：31 台设备从 `assets/equipment-data.js` 迁移
- ✅ 静态页面生成：31 中文 + 31 英文设备页
- ✅ sitemap.xml 自动生成
- ✅ 前端询盘弹窗接入 API
- ✅ Admin UI 中文翻译（zh-Hans，绕过 Vite .mjs 问题）
- ✅ Preview 原生配置

### 项目结构首次建立

```
D:\B2B\
├── backend/           ← Strapi 后端
├── scripts/           ← build-pages.js + serve.js
├── equipment/         ← 中文设备页（31）
├── en/equipment/      ← 英文设备页（31）
├── assets/            ← i18n / product-render / inquiry-form / contact / CSS
├── package.json       ← 根级快捷命令
└── README.md
```

### 技术栈确认

| 层 | 技术 | 版本 |
|----|------|------|
| Strapi | @strapi/strapi | 5.52.3 |
| 数据库 | better-sqlite3 | 12.8.0 |
| 邮件 | nodemailer | ^6.10.1 |
| Node.js | — | 24.19.0（实际）/ 要求 >=20 |
| 前端 | 原生 HTML/CSS/JS | — |

### 第二阶段已预留的功能

- 英文独立 URL：`/en/equipment/{slug}.html` 已生成
- hreflang 互链已实现
- 产品页语言切换跨 URL 跳转（`product-render.js`）
