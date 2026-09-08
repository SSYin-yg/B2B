# 矿联矿机 | Minelink Equipment

面向全球矿业客户的 B2B 设备采购与服务平台官网。

- **部署方式**：自托管单服务器（nginx :80 入口 + Strapi + PostgreSQL，见下）
- **技术栈**：Strapi 5.52.3（CMS + API）+ PostgreSQL 17 + 原生静态 HTML 前端（Node v24）
- **仓库**：https://github.com/SSYin-yg/B2B （私有）
- **当前权威文档**：[docs/17-系统架构文档.md](./docs/17-系统架构文档.md) · [docs/18-日常使用手册.md](./docs/18-日常使用手册.md)

---

## 架构速览（当前部署）

```
            访客 / 管理员
                  │
                  ▼
        nginx :80（唯一公网入口）
        ├── 静态页面/资源        → /var/www/B2B 直接读盘
        ├── sub_filter          → {{ORIGIN}} 动态替换为访客实际 IP:端口
        │                          （换 IP/端口/域名零操作，见 docs/17 §5.5）
        ├── /api/ /admin/ /uploads/ → Strapi :1337（本机）
        ├── /preview/*           → webhook-listener :1340（草稿预览）
        ├── /rebuild             → webhook-listener（仅允许 127.0.0.1）
        └── 19 条旧 slug 301 跳转（SEO 保留）
                  │
     ┌────────────┼──────────────────┐
     ▼            ▼                  ▼
 Strapi 5.52   PostgreSQL 17    webhook-listener（systemd）
 (systemd 自启) strapi_db       草稿预览 + /rebuild 重建触发
     │
     │ 内容变更（lifecycle 钩子，3 秒防抖）
     ▼
 scripts/build-pages.js  ⭐ 核心：拉取 Strapi API → 生成静态页
   ├── equipment/{slug}.html        中文设备页（31 台）
   ├── en/equipment/{slug}.html     英文设备页（31 台）
   ├── sitemap.xml + equipment-data.js + model-tables.js
   ├── 自动清理已删设备页面（PRUNE，legacy 301 页除外）
   └── cron 每 30 分钟内容哈希兜底；周日 03:00 自动备份数据库
```

完整架构说明（数据模型/预览链路/询盘邮件链路/权限/安全现状）见 **docs/17**。

---

## 目录结构

```
/var/www/B2B/
├── index.html / equipment-catalog.html / solutions.html / support.html / about.html / faq.html
├── equipment/                        中文设备详情页（构建输出，勿手改）
│   └── _template.html                设备页模板（唯一可手工编辑的模板文件）
├── en/equipment/                     英文设备详情页（构建输出）
├── assets/
│   ├── images/equipment/             设备图片
│   ├── i18n.js                       前端中英文切换（DOM 替换）
│   ├── product-render.js             设备详情页渲染 + 跨语言 URL 跳转
│   ├── inquiry-form.js               询盘表单（POST /api/inquiry）
│   ├── equipment-data.js / model-tables.js   ⚠️ 构建回写，勿手改
│   └── common.css / product.css / catalog.css / ...
├── scripts/
│   ├── build-pages.js                ⭐ 静态页面生成（核心）
│   ├── webhook-listener.js           草稿预览 + /rebuild（systemd: b2b-webhook）
│   ├── serve.js                      本地开发静态服务器（:3000，勿用于生产）
│   ├── auto-rebuild.sh               cron 内容哈希兜底重建
│   ├── backup-db.sh                  PostgreSQL 备份（保留 56 天）
│   └── update-site-url.sh            ⚠ 已废弃（会写死站点地址，勿运行）
├── data/legacy-equipment-slugs.json  19 条旧 slug 301 映射（SEO）
├── backend/                          Strapi 5.52.3（.env / config / src/api / src/plugins）
├── backups/db/                       自动数据库备份
├── sitemap.xml / robots.txt          sitemap 为构建输出
└── docs/                             技术文档
```

---

## 页面一览

| 文件 | 说明 |
|------|------|
| `index.html` | 首页 |
| `equipment-catalog.html` | 设备目录（支持 `?filter=mobile|crushing|screening|washing|parts`） |
| `equipment/{slug}.html` | 中文设备详情页（31 张，静态生成） |
| `en/equipment/{slug}.html` | 英文设备详情页（31 张，独立 URL + hreflang） |
| `solutions.html` / `support.html` / `about.html` / `faq.html` | 方案 / 支持 / 关于 / FAQ |

19 个旧 slug（如 `c-jaw.html`）保留物理文件并由 nginx 301 跳转到新页，见 `data/legacy-equipment-slugs.json`。

---

## 快速开始

### 本地开发

```bash
cd backend && npm install          # 安装 Strapi 依赖
cp .env.example .env               # 配置密钥/数据库（生产为 PostgreSQL）
cd .. && npm run develop           # Strapi 开发模式 → http://localhost:1337/admin
npm run serve                      # 静态预览 → http://localhost:3000
npm run build-pages                # 手动重新生成静态页
```

### 服务器（生产）日常

```bash
# Strapi 已在运行时：改后台内容后约 3 秒自动重建，无需手动操作
node scripts/build-pages.js                    # 手动全量重建（--no-prune 关闭清理）
tail -f auto-rebuild.log                       # 观察自动重建日志
# IP/端口/域名变化：无需任何操作（{{ORIGIN}} 动态地址机制，见 docs/18 §6）
```

服务启停 / 预览 / 询盘 / 备份 / 故障排查全部步骤见 **docs/18-日常使用手册**。

---

## npm 命令速查（项目根目录）

| 命令 | 作用 |
|------|------|
| `npm run develop` | Strapi 开发模式（热更新） |
| `npm run build` / `npm run start` | Strapi 生产构建 / 启动 |
| `npm run build-pages` | ⭐ 从 Strapi API 生成静态页 + sitemap |
| `npm run serve` | 本地静态服务器 :3000（仅开发） |
| `npm run migrate` | 数据迁移（equipment-data.js → Strapi，幂等） |

---

## 设备一览（当前 31 台，2026-09-07）

| slug | 中文名 | 分类 |
|------|--------|------|
| `belt-conveyor` | 皮带输送机 | screening |
| `circular-screen` | 圆振动筛 | screening |
| `crawler-cone-mobile-crushing-station` | 履带式圆锥破移动站 | mobile |
| `crawler-impact-crusher` | 履带式反击破移动站 | mobile |
| `crawler-jaw` | 履带式颚破移动站 | mobile |
| `crawler-lmpact-mobile-crushing-station` | 履带式冲击移动破碎站 | mobile |
| `crusher-hammer-heads` | 破碎机锤头 | parts |
| `crusher-hammer-shaft` | 破碎机锤轴 | parts |
| `crusher-liner` | 破碎机衬板 | parts |
| `c-type-jaw-crusher` | C 型颚式破碎机 | crushing |
| `double-rotor-sand-making-machine` | 双转子制砂机 | crushing |
| `double-spiral-sand-washer` | 双螺旋洗砂机 | washing |
| `double-tooth-roll` | 双齿辊破碎机 | crushing |
| `gyratory-crusher` | 旋回破碎机 | crushing |
| `heavy-hammer-crusher` | 重锤式破碎机 | crushing |
| `linear-vibrating-screen` | 直线振动筛 | screening |
| `multi-cylinder-hydraulic-cone-crusher` | 多缸液压圆锥破碎机 | crushing |
| `pe-series-jaw-crusher-standard` | PE 系列颚式破碎机（标准型） | crushing |
| `shaping-crusher` | 整形破碎机 | crushing |
| `single-cylinder-hydraulic-cone-crusher` | 单缸液压圆锥破碎机 | crushing |
| `vibrating-dewatering-screen` | 振动脱水筛 | screening |
| `vibrating-feeder` | 振动给料机 | screening |
| `vibrating-screen` | 振动筛 | screening |
| `vibrating-screen-mesh` | 振动筛网 | parts |
| `vsi-impact-crusher` | VSI 立轴冲击式破碎机 | crushing |
| `wheel-and-scoop-sand-washer` | 轮斗式洗砂机 | washing |
| `wheeled-jaw` | 轮胎式颚破移动站 | mobile |
| `wheeled-screen` | 轮胎式移动筛分站 | mobile |
| `wheel-type-impact-mobile-crushing-station` | 轮胎式反击破移动站 | mobile |
| `wheel-type-multi-cylinder-cone-mobile-crushing-station` | 轮胎式多缸圆锥破移动站 | mobile |
| `wheel-type-single-cylinder-cone-mobile-crushing-station` | 轮胎式单缸圆锥破移动站 | mobile |

---

## 后端 API

### Equipment（公开只读）

| URL | 方法 | 说明 |
|-----|------|------|
| `/api/equipments` | GET | 列出所有已发布设备 |
| `/api/equipments/{documentId}` | GET | 单台设备详情 |

### Inquiry（公开 POST）

| URL | 方法 | 说明 |
|-----|------|------|
| `/api/inquiry` | POST | 询盘提交（先入库 → 后发 SMTP 通知邮件） |
| `/api/inquiry/resend` | POST | 重发邮件（请求头 `x-retry-key`，密钥在 backend/.env 的 RETRY_KEY） |

`POST /api/inquiry` 请求体：

```json
{
  "equipment": "crawler-jaw",
  "customer_name": "张三",
  "email": "zhangsan@example.com",
  "whatsapp": "+86 13800000000",
  "country": "Indonesia",
  "message": "Need quote for 200t/h granite"
}
```

响应 `{ submitted: boolean, emailSent: boolean, documentId: string }`。邮件发送日志见后台 Maillog。

### SMTP 配置（backend/.env，改后重启 Strapi）

```bash
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=<邮箱账号>
SMTP_PASS=<授权码>
SALES_EMAIL=sales@minelink.cn
```

SMTP 未配置时询盘照常入库（emailSent=false），详见 [docs/06-邮件通知配置手册.md](./docs/06-邮件通知配置手册.md)。

---

## 维护原则

| 原则 | 原因 |
|------|------|
| ✅ 设备内容一律从 Strapi 后台编辑 | CMS 可视化，改完约 3 秒自动重建 |
| ✅ 全部服务 systemd 托管、开机自启 | nginx/PostgreSQL/b2b-webhook 系统级；Strapi 为用户服务 `strapi-b2b`（linger 自启） |
| ✅ 中文页 `/equipment/{slug}.html` URL 保持稳定 | SEO 已上线，变更丢排名；确需改名配 legacy 301 |
| ❌ 不要手工改 `equipment/*.html`、`equipment-data.js`、`model-tables.js` | 均为构建输出，下次重建即被覆盖 |
| ❌ 不要在生产运行 `npm run serve` | serve.js 监听 0.0.0.0 且无敏感文件过滤 |
| ❌ 不要改 `.env` 后忘记重启 Strapi | `.env` 只在启动时加载 |

---

## 技术文档索引

**当前权威**（与现状一致）：

| 文件 | 说明 |
|------|------|
| [docs/17-系统架构文档.md](./docs/17-系统架构文档.md) | ⭐ 当前架构：组件/数据流/预览/权限/安全现状 |
| [docs/18-日常使用手册.md](./docs/18-日常使用手册.md) | ⭐ 日常操作：内容/预览/询盘/备份/排障 |
| [docs/15/16-网站图片管理](./docs/15-网站图片管理技术文档.md) | 图片槽位机制与运营（仍有效） |
| [docs/06-邮件通知配置手册.md](./docs/06-邮件通知配置手册.md) | SMTP 配置（仍有效） |

**历史参考**（写于 GitHub Pages + SQLite 时期，部署相关内容已过时，仅作背景参考）：docs/01–05、07–12 及 [docs/README.md](./docs/README.md) 索引。

---

## License

© 2025 Minelink Equipment. All rights reserved.
