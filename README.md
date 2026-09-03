# 矿联矿机 | Minelink Equipment

面向全球矿业客户的 B2B 设备采购与服务平台官网。

- **线上地址**：https://ssyin-yg.github.io/B2B/
- **技术栈**：Strapi 5.52.3（CMS + API） + 原生静态 HTML（前端）
- **仓库**：https://github.com/SSYin-yg/B2B
- **详细文档**：[docs/README.md](./docs/README.md)

---

## 架构速览

```
┌──────────────────────────────────────────────┐
│  Strapi 后台（localhost:1337）                │
│  • Admin UI（内容编辑）                       │
│  • Equipment + Inquiry 内容类型               │
│  • POST /api/inquiry（询盘接收 + 邮件转发）    │
└─────────────┬────────────────────────────────┘
              │ REST API
              ▼
┌──────────────────────────────────────────────┐
│  scripts/build-pages.js                      │
│  从 Strapi 拉取 → 生成 62 张静态页 + sitemap  │
└─────────────┬────────────────────────────────┘
              │ 输出
              ▼
┌──────────────────────────────────────────────┐
│  GitHub Pages（静态前端）                      │
│  • equipment/{slug}.html（31 中文）            │
│  • en/equipment/{slug}.html（31 英文）         │
│  • sitemap.xml + robots.txt                  │
└──────────────────────────────────────────────┘
```

---

## 目录结构

```
D:\B2B\
├── backend/                         ← Strapi 5.52.3 后端
│   ├── .env                         运行时配置（密钥 + SMTP + CLIENT_URL）
│   ├── .tmp/data.db                 SQLite 数据库
│   ├── config/                      server.js / admin.js / plugins.js / database.js
│   ├── scripts/                     migrate-equipment.js / build-admin-translations.js / ...
│   └── src/
│       ├── admin/app.js             Admin UI 默认中文 + Preview 配置
│       └── api/
│           ├── equipment/           设备内容类型（schema + 核心控制器）
│           └── inquiry/             询盘内容类型 + POST /api/inquiry 自定义路由
│
├── scripts/
│   ├── build-pages.js               ⭐ 静态页面生成（核心）
│   └── serve.js                     本地静态预览服务器（开发用）
│
├── equipment/                       中文设备详情页（31 张，build-pages.js 输出）
│   ├── _template.html               设备页模板
│   └── {slug}.html                  每台设备一张
├── en/equipment/                    英文设备详情页（31 张）
│   └── {slug}.html
├── assets/
│   ├── images/equipment/            设备图片
│   ├── i18n.js                      前端中英文切换（DOM 替换）
│   ├── product-render.js             设备详情页渲染 + 跨语言 URL 跳转
│   ├── inquiry-form.js              询盘表单（POST /api/inquiry）
│   ├── contact.js                   通用弹窗组件
│   ├── equipment-data.js            ⚠️ 由 build-pages.js 回写（请勿手改）
│   ├── model-tables.js              ⚠️ 由 build-pages.js 回写（请勿手改）
│   ├── common.css / product.css / catalog.css / ...
├── index.html / equipment-catalog.html / solutions.html / support.html / about.html / faq.html
├── sitemap.xml                      由 build-pages.js 生成
├── robots.txt
├── package.json                     根级快捷命令
└── docs/                            完整技术文档（12 个文件 + CHANGELOG）
```

---

## 页面一览

| 文件 | 说明 |
|------|------|
| `index.html` | 首页 |
| `equipment-catalog.html` | 设备目录（支持 `?filter=mobile|crushing|screening|washing|parts`） |
| `equipment/{slug}.html` | 中文设备详情页（31 张，静态生成） |
| `en/equipment/{slug}.html` | 英文设备详情页（31 张，独立 URL + hreflang） |
| `solutions.html` | 行业方案 |
| `support.html` | 服务支持 |
| `about.html` | 关于我们 |
| `faq.html` | 常见问题 |

---

## 快速开始

### 前置

- Node.js **>= 20.0.0**
- npm **>= 6**

### 首次启动

```bash
# 1. 安装 Strapi 依赖
cd backend
npm install

# 2. 配置 .env（必须重新生成密钥，见 docs/02 第七节）
cp .env.example .env
# 编辑 .env

# 3. 启动 Strapi（开发模式）
npm run develop
# 打开 http://localhost:1337/admin 创建超级管理员
# 看到 "Strapi started successfully" 后 Ctrl+C 停止

# 4. 数据迁移（从旧 equipment-data.js 导入 31 台设备）
npm run migrate
```

### 日常开发（两个终端）

```bash
# 终端 A：Strapi（后台编辑）
npm run develop

# 终端 B：静态预览
npm run serve            # → http://localhost:3000

# 修改后台后重新生成静态页
npm run build-pages      # → 输出 62 张页面 + sitemap.xml
```

### 生产部署

详见 [docs/10-生产环境部署手册.md](./docs/10-生产环境部署手册.md)。

---

## npm 命令速查

| 命令 | 作用 |
|------|------|
| `npm run develop` | 启动 Strapi（开发模式，热更新） |
| `npm run build` | Strapi 生产构建 |
| `npm run start` | Strapi 生产启动 |
| `npm run migrate` | 数据迁移（equipment-data.js → Strapi，幂等） |
| `npm run build-pages` | ⭐ 从 Strapi API 生成 62 张静态页 |
| `npm run serve` | 本地静态服务器 http://localhost:3000 |

---

## 设备 ID 一览（全部 31 条）

| slug | 中文名 | 分类 |
|------|--------|------|
| `wheeled-jaw` | 轮胎式颚破移动站 | mobile |
| `wheeled-impact` | 轮胎式反击破移动站 | mobile |
| `wheeled-multi-cone` | 轮胎式多缸圆锥破移动站 | mobile |
| `wheeled-single-cone` | 轮胎式单缸圆锥破移动站 | mobile |
| `wheeled-screen` | 轮胎式移动筛分站 | mobile |
| `crawler-jaw` | 履带式颚破移动站 | mobile |
| `crawler-impact` | 履带式冲击移动破碎站 | mobile |
| `crawler-impact-crusher` | 履带式反击移动破碎站 | mobile |
| `crawler-cone` | 履带式圆锥移动破碎站 | mobile |
| `pe-jaw` | PE 系列颚式破碎机（标准型） | crushing |
| `c-jaw` | C 型颚式破碎机 | crushing |
| `gyratory` | 旋回破碎机 | crushing |
| `heavy-hammer` | 重锤式破碎机 | crushing |
| `multi-cylinder-cone` | 多缸液压圆锥破碎机 | crushing |
| `single-cylinder-cone` | 单缸液压圆锥破碎机 | crushing |
| `vsi` | VSI 立轴冲击式破碎机 | crushing |
| `double-tooth-roll` | 双齿辊破碎机 | crushing |
| `double-rotor-sand` | 双转子制砂机 | crushing |
| `shaping` | 整形破碎机 | crushing |
| `circular-screen` | 圆振动筛 | screening |
| `linear-screen` | 直线振动筛 | screening |
| `dewatering-screen` | 振动脱水筛 | washing |
| `vibrating-feeder` | 振动给料机 | screening |
| `vibrating-screen` | 振动筛 | screening |
| `belt-conveyor` | 皮带输送机 | screening |
| `double-spiral-washer` | 双螺旋洗砂机 | washing |
| `wheel-scoop-washer` | 轮斗式洗砂机 | washing |
| `hammer-heads` | 破碎机锤头 | parts |
| `hammer-shaft` | 破碎机锤轴 | parts |
| `crusher-liner` | 破碎机衬板 | parts |
| `screen-mesh` | 振动筛网 | parts |

---

## 后端 API

### Equipment（公开）

| URL | 方法 | 说明 |
|-----|------|------|
| `/api/equipments` | GET | 列出所有已发布设备 |
| `/api/equipments/{documentId}` | GET | 单台设备详情 |

### Inquiry（公开 POST，后台查看）

| URL | 方法 | 说明 |
|-----|------|------|
| `/api/inquiry` | POST | **自定义询盘接口**（先存库 → 后发 SMTP 邮件） |

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

| 字段 | 必填 | 校验 |
|------|------|------|
| customer_name | ✅ | 非空 |
| email / whatsapp | ⚠️ | 至少一个有值；email 需匹配邮箱 regex |
| country | ✅ | 非空 |
| message | ✅ | 非空 |
| equipment | ✅ | 非空 |

响应 `{ submitted: boolean, emailSent: boolean, documentId: string }`

### SMTP 配置

询盘邮件转发到 `SALES_EMAIL=sales@minelink.cn`，SMTP 未配置时询盘照常入库（emailSent=false）。

在 `backend/.env` 中设置：

```bash
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=<邮箱账号>
SMTP_PASS=<授权码>
SALES_EMAIL=sales@minelink.cn
```

重启 Strapi 生效。详见 [docs/06-邮件通知配置手册.md](./docs/06-邮件通知配置手册.md)。

---

## Admin UI 默认中文

Strapi Admin 默认语言已配置为 **简体中文**，翻译包由 `backend/scripts/build-admin-translations.js` 预编译（Vite develop 模式下动态 import 会失败，所以改用预编译方案）。

后台预览按钮已启用：Equipment 编辑页右侧 ENTRY 面板下方显示 **PREVIEW** → **Open preview**。

---

## 维护原则

| 原则 | 原因 |
|------|------|
| ✅ 从 Strapi 后台编辑设备 | CMS 可视化，不需要改 JSON |
| ✅ 编辑后 `npm run build-pages` | 让静态页与 CMS 同步 |
| ✅ 中文页 `/equipment/{slug}.html` 保持 | SEO 已上线，URL 变更会丢失排名 |
| ❌ 不要手工改 `equipment-data.js` / `model-tables.js` | `build-pages.js` 每次都会回写覆盖 |
| ❌ 不要改 URL 结构 | 影响 sitemap / canonical / 外链 |
| ❌ 不要改 `.env` 后忘记重启 Strapi | `.env` 只在启动时加载 |

---

## 故障排查

详见 [docs/11-故障排查手册.md](./docs/11-故障排查手册.md)，覆盖 12 类常见问题：

- Strapi 启动失败 / 白屏
- API 返回 403
- 询盘不入库 / 收不到邮件
- build-pages.js 报错
- 前端设备页显示异常
- SQLite 数据库损坏
- 性能问题

---

## 完整技术文档

| 文件 | 说明 |
|------|------|
| [docs/README.md](./docs/README.md) | 技术文档索引 |
| [docs/01-项目架构说明.md](./docs/01-项目架构说明.md) | 架构图 + 目录 + Content-Type schema |
| [docs/02-Strapi安装部署手册.md](./docs/02-Strapi安装部署手册.md) | 从零搭建 + 密钥生成 |
| [docs/03-Strapi后台操作手册.md](./docs/03-Strapi后台操作手册.md) | Admin UI 操作指南 |
| [docs/04-Equipment设备管理手册.md](./docs/04-Equipment设备管理手册.md) | 字段详解 + Draft & Publish |
| [docs/05-Inquiry询盘管理手册.md](./docs/05-Inquiry询盘管理手册.md) | API + 校验逻辑 + 角色权限 |
| [docs/06-邮件通知配置手册.md](./docs/06-邮件通知配置手册.md) | SMTP 配置 + 主流服务商参考 |
| [docs/07-静态页面生成手册.md](./docs/07-静态页面生成手册.md) | build-pages.js 详解 |
| [docs/08-SEO与Sitemap说明.md](./docs/08-SEO与Sitemap说明.md) | hreflang + Product JSON-LD |
| [docs/09-环境变量配置说明.md](./docs/09-环境变量配置说明.md) | 所有 .env 变量 |
| [docs/10-生产环境部署手册.md](./docs/10-生产环境部署手册.md) | VPS + PM2 + GitHub Pages |
| [docs/11-故障排查手册.md](./docs/11-故障排查手册.md) | 12 类故障排查 |
| [docs/12-开发维护手册.md](./docs/12-开发维护手册.md) | 开发流程 + 脚本说明 |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | 版本更新记录 |

---

## License

© 2025 Minelink Equipment. All rights reserved.
