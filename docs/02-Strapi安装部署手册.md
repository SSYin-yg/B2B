# 02 - Strapi 安装部署手册

## 一、环境要求

| 组件 | 版本要求 |
|------|---------|
| Node.js | >= 20.0.0（推荐 20 LTS 或 22 LTS） |
| npm | >= 6.0.0 |
| 操作系统 | Windows / macOS / Linux 均可 |
| 端口 | 1337（Strapi Admin + API）、3000（静态预览） |

## 二、从零安装 Strapi（如 backend/ 目录已存在，可跳过到第三节）

```bash
# 进入项目根目录
cd D:\B2B

# 使用官方 create-strapi-app 在 backend/ 目录初始化
npx create-strapi-app@latest backend --quickstart

# 或者更明确的参数：
npx create-strapi-app@latest backend \
  --template strapi-template-blog \
  --no-run

# 手动安装依赖
cd backend
npm install

# 启动（首次启动会进入快速向导）
npm run develop
```

⚠️ **注意**：Strapi 5 与 Strapi 4 的配置结构不同。本项目使用 **Strapi 5.52.3**，以下路径均以 v5 为准。

## 三、本项目实际 backend/ 初始化步骤

由于本项目已完成 Strapi 5 初始化，以下步骤是 **从零重建 backend/** 的参考清单。

### 步骤 1：创建 backend 目录

```bash
cd D:\B2B
npx create-strapi-app@latest backend --quickstart
# quickstart 模式默认使用 SQLite
```

### 步骤 2：安装额外依赖

```bash
cd backend
npm install nodemailer mammoth --save-dev
# nodemailer 用于询盘邮件转发
# mammoth 用于 docx 文本提取（开发依赖）
```

### 步骤 3：复制 / 创建配置文件

| 文件 | 来源 | 作用 |
|------|------|------|
| `config/admin.js` | **创建** | 添加 preview 预览配置 |
| `config/server.js` | **编辑** | 增加 CORS 配置（允许 GitHub Pages + localhost） |
| `config/plugins.js` | **编辑** | 配置 users-permissions JWT + upload 安全策略 |
| `.env` | 复制 `.env.example` | 填写密钥 |
| `.env.example` | **编辑** | 增加 SMTP / SITE_URL / CLIENT_URL 变量 |

### 步骤 4：创建内容类型

**方法 A（推荐）：使用 Strapi Content-Type Builder UI**

1. 启动 Strapi：`npm run develop`
2. 打开 http://localhost:1337/admin → 创建超级管理员账号
3. 左侧菜单 → Content-Type Builder → 点击 **Create new collection type**
4. 分别创建 Equipment 和 Inquiry（字段见 [01-项目架构说明.md 第三节](./01-项目架构说明.md#三strapi-内容类型)）

**方法 B：直接复制 schema.json**

将本仓库已有的 `src/api/equipment/content-types/equipment/schema.json` 和 `src/api/inquiry/content-types/inquiry/schema.json` 放到对应位置，Strapi 启动时会自动创建表结构。

### 步骤 5：创建自定义询盘路由

1. 创建 `src/api/inquiry/controllers/inquiry.js` — 含 `submit()` 方法（先存库再发邮件）
2. 创建 `src/api/inquiry/routes/submit.js` — 定义 `POST /api/inquiry`
3. 完整代码见本仓库对应文件，**必须严格使用已实现的代码**

### 步骤 6：配置 Admin UI 语言为简体中文

1. 创建 `scripts/build-admin-translations.js` — 从 Strapi 各包的 `.mjs` 中提取官方中文翻译
2. 运行 `node scripts/build-admin-translations.js` 生成 `src/admin/translations/zh-Hans.js`
3. 编辑 `src/admin/app.js`，注入 translations + 设置 `defaultLocale: 'zh-Hans'`

### 步骤 7：配置 Admin UI 预览按钮

编辑 `config/admin.js`，添加 `preview` 块（完整内容见本仓库）。Strapi v5 原生支持，无需安装插件。

### 步骤 8：执行数据迁移

```bash
# 确保 Strapi 已启动一次（初始化数据库表结构）
npm run develop
# 等看到 "Strapi started successfully" 后 Ctrl+C 停止

# 运行迁移（从 assets/equipment-data.js 导入 31 台设备）
npm run migrate
```

## 四、已初始化的 backend/ 快速启动（推荐路径）

如果 `backend/` 目录和 SQLite 数据库已存在（从仓库同步），只需：

```bash
cd backend
# 1. 检查 .env 密钥是否为占位符，如果是则需要重新生成（见第五节）
# 2. 启动
npm run develop
# 3. 打开 http://localhost:1337/admin — 如果数据库里已有 admin 用户，直接登录
```

## 五、密钥安全

如果 `.env` 中的密钥仍是占位符（`tobemodified`、`toBeModified1` 等），**必须重新生成**：

```bash
# 在 backend/ 目录执行（Strapi 5 命令）
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
# ADMIN_JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
# API_TOKEN_SALT
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
# TRANSFER_TOKEN_SALT
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
# ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# APP_KEYS（逗号分隔多个）
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
# 执行三次得到三个值，用逗号连接
```

## 六、首次启动 Checklist

- [ ] Node.js 版本 >= 20
- [ ] `.env` 密钥不是占位符
- [ ] Equipment 内容类型已创建（schema.json 存在）
- [ ] Inquiry 内容类型已创建（schema.json + submit 路由存在）
- [ ] SQLite 数据库文件 `.tmp/data.db` 存在
- [ ] Admin UI 中文翻译已构建（`npm run build-admin-translations`）
- [ ] 已创建至少一个 Admin 用户
- [ ] 设备数据已迁移（31 条）→ 运行 `npm run migrate`
- [ ] Strapi 启动无报错（`npm run develop`）
- [ ] Admin 后台能正常打开 http://localhost:1337/admin
- [ ] 设备编辑页的 "Open preview" 按钮可点

## 七、Strapi 常用命令

| 命令 | 作用 |
|------|------|
| `npm run develop` | 开发模式（热更新 + debug） |
| `npm run build` | 生产模式构建 |
| `npm run start` | 生产模式运行（需先 build） |
| `npm run migrate` | 数据迁移（equipment-data.js → Strapi） |
| `npm run build-admin-translations` | 重新构建 Admin 中文翻译 |
| `npm run upgrade` | Strapi 升级到最新 |
| `npm run console` | 进入 Strapi 交互式命令行 |
