# CHANGELOG

> 本文件记录项目重要变更，按时间倒序排列。
> 日期格式：`YYYY-MM-DD`

---

## [1.5.0] - 2026-09-08

### 文档：补齐 {{ORIGIN}} 动态站点地址机制（IP/端口随时变化场景）

- **docs/17 新增 §5.5「站点地址机制」**：讲清 `SITE_URL` 留空 → 构建产物写 `{{ORIGIN}}` 占位符 → nginx `sub_filter` 运行期替换为访客实际地址的完整链路、生效范围与边界；修正架构图中旧 slug 数量（16 → 19）；§12 改为「IP/端口变更零操作」
- **docs/18 重写 §6「IP/端口变更」**：操作矩阵（换 IP/域名/DDNS 零操作、改端口只动 nginx listen）、30 秒验证清单（假 Host 头 curl）、明确警告勿运行 `update-site-url.sh`（附误运行恢复方法）；§8 排障表补两条（`{{ORIGIN}}` 字面量残留 / canonical 出现旧 IP）
- **`scripts/update-site-url.sh` 标注废弃**（脚本保留存档）：该脚本会把绝对地址写死进构建产物，破坏动态机制
- **README.md / docs/README.md 同步**：架构速览加 sub_filter 一行、删除脚本推荐用法、索引说明更新

### 运维验证（2026-09-08 全链路实测通过）

- Strapi 曾处于未运行状态（手动启动无 systemd 托管），已重新拉起并验证：后台/API/预览/询盘/手动构建（中文 31 + 英文 31）全部正常
- 模拟地址变化实测：`Host: 203.0.113.7:9999` 访问 sitemap.xml 与设备页，canonical/og:url/`<loc>` 均动态替换为该地址，`{{ORIGIN}}` 残留 0

### 运维（2026-09-08）：Strapi 改为 systemd 用户服务，开机自启

- 新增 `~/.config/systemd/user/strapi-b2b.service`（`npm --prefix backend run start`，Restart=always），执行 `loginctl enable-linger ssyin` 后服务器重启无需登录即自动拉起——**服务器重启后不再需要任何手动操作**
- 手册同步：docs/18 §1/§8/§9（启停/排障/速查改为 `systemctl --user` + `journalctl --user`）、docs/17 §1/§2、docs/10 §一/§五/§六/§七、README 维护原则、docs/README 快速导航；新增服务模板 `docs/strapi-b2b.service.example`
- 旧启动方式（`nohup npm start` + `strapi-restart.log`）弃用；验证：服务运行、后台 200、`/rebuild` 触发全量重建 31+31 页成功

### 安全与异地备份（2026-09-08）

- **公网暴露复查**（经 nginx 实测）：`/.git/`、`/.git.old/`、`/backups/db/*.sql.gz`（数据库全量备份！）、日志、`/scripts/`、`/docs/` 等均可下载；`/backend/.env` 仅因文件权限 600 挡住（nginx 本身会服务点文件）
- **新增 `scripts/harden-nginx.sh`**：一键屏蔽点文件 / 内部目录（backend、backups、scripts、data、docs）/ 敏感后缀（log、sql、gz、sh、bak、save），带配置备份、nginx -t 失败自动回滚、执行后自动验证；**待用户 sudo 执行一次**
- **GitHub 备份以全新零历史重建**：旧仓库已删除，本地重新初始提交（`f030695`），`.gitignore` 排除 `.env*`、`backups/`、日志、`.git.old/`，提交前密钥扫描干净——旧仓库历史含 `.env.bak` 密钥的问题随之消除
- **新增 14 天周期 GitHub 异地备份**：`scripts/github-backup.sh`（cron 每日 04:05 调用，脚本内判断距上次成功推送满 14 天才推送，漏跑自动补），推送整站仓库（不含数据库与 .env）；待用户新建私有仓库并 `git remote add origin` 后即生效，机制说明见 docs/18 §7.5

---

## [1.4.0] - 2026-09-07

### 架构修复（代码）

- **lifecycle 自动重建路径修复**：`equipment` 钩子 ROOT 少算一级导致自动重建从未生效（`auto-rebuild.log` 中持续报 `Cannot find module`），修正后后台增/改/删设备约 3 秒自动重建
- **PRUNE 过期页清理改为默认开启**：`build-pages.js` 删除设备后中英文页面、sitemap、数据文件自动清理（此前只警告不删，导致已删设备页面残留）；`--no-prune` 可临时关闭
- **后台草稿预览修复**：CSP `frame-src` 仅含 localhost 白名单导致 iframe「该内容被屏蔽」→ `backend/config/middlewares.js` 增加 `'self'`（适配任意 IP/端口）；草稿状态预览改走 webhook-listener `/preview/` 渲染真实草稿（原 handler 草稿/发布均返回静态页）；`/preview/` 无 token 时返回引导页从 localStorage 取 admin JWT 自动重载

### 文档重构

- 新增 **17-系统架构文档**（当前架构权威版：组件/数据流/预览/询盘/权限/安全现状）与 **18-日常使用手册**（内容/预览/询盘/备份/排障）
- 重写根 README.md（架构图/设备清单/API/维护原则对齐现状）
- 重写 09-环境变量配置说明、10-生产环境部署手册（nginx + PostgreSQL，替换废弃的 PM2/GitHub Pages 方案）
- 修补 07-静态页面生成（PRUNE/触发链路）、11-故障排查（PostgreSQL/自动重建章节）
- 01/02/12 及 03/04/05/08 加「历史文档/状态」标注；修正 `backend/.env.example`（sqlite→postgres、补 RETRY_KEY）
- 重写 docs/README.md 索引（区分当前权威与历史参考）

### 安全

- 代码审查确认关键待办：nginx 未屏蔽 `/.git/` 与日志（公网可下载）、git 历史含 `.env.bak` 真实密钥（待轮换）、CORS 反射任意 Origin、resend/submit 无限流——详见 17-系统架构文档 §10

---

## [1.3.0] - 2026-09-06

### 修复（v1.3.0）：Strapi Website Image → 前端数据闭环

**根因**：13 个 Website Image 槽位中 9 个 `enabled=false`，`build-pages.js → writeWebsiteImageCss()` 不为禁用槽位生成 CSS 规则 → 运营后台改图后前端完全不变。

**改动**：
- `scripts/website-image-slots.js`：11/13 槽位启用（site_logo、favicon 保留 disabled 是合理设计）；9 个新启用槽位加 `defaultFile: 'Mining Solutions.jpg'`（仅登记元数据，不复制文件）
- `backend/scripts/migrate-website-images.js`：仅补登记缺的图、只写 enabled 字段、不动运营已配置的图（幂等）
- `scripts/build-pages.js`：未改（链路本就打通，是 slots 配置欠补）

**v1.2.1 → v1.3.0**：
- 列表 layout 修正（v1.2.1）
- 数据闭环修复（v1.3.0）

---

## [1.2.0] - 2026-09-06

### 新增

- **网站图片管理（Website Image）**：运营人员可在 Strapi 后台直接更换网站公共图片，无需改动 HTML / CSS / JS
  - 新增内容类型 `api::website-image.website-image`（图片名称 / 标识 key / 页面 / 使用位置 / 分类 / 图片 / ALT / 说明 / 启用 / 排序）
  - 槽位注册表 `scripts/website-image-slots.js`：13 个真实槽位（首页 3 张 Banner、默认 OG 图、页头背景、Logo、Favicon、方案配图等）
  - 初始化脚本 `backend/scripts/migrate-website-images.js`：幂等登记现有公共图进媒体库并写入 13 条 Website Image
  - 后台界面脚本 `backend/scripts/configure-website-image-admin.js`：列表/编辑页中文标签、筛选、排序配置
  - `scripts/build-pages.js` 接入：读取 Website Image → 替换静态页标记 + 生成 `assets/website-images.css`
  - 前端 6 个页面（`index/about/solutions/support/faq/equipment-catalog`）与 `equipment/_template.html` 加 `data-wb-img` 标记与 css 引用
  - 文档：`docs/15-网站图片管理技术文档.md`、`docs/16-网站图片运营操作手册.md`
  - 备份：`backups/pre-website-image-20260906-045221.tar.gz`

### 修复

- **默认 OG 分享图 404**：原 `og-cover.jpg` 不存在，现由 `default_og_image` 槽位提供真实图片并写入所有页面 OG / Twitter 元标签

### 设备图片与网站图片分离

- 设备详情页图片仍由 Equipment 管理，网站公共图片由 Website Image 管理，两套系统互不干扰

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
