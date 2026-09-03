# 03 - Strapi 后台操作手册

## 一、访问后台

| 环境 | URL |
|------|-----|
| 本地开发 | http://localhost:1337/admin |
| 生产部署 | 部署地址 + `/admin` |

首次启动会要求创建超级管理员账号。

## 二、界面结构

```
┌──────────────┬────────────────────────────────────────┐
│              │  ← 返回按钮                            │
│  🏠 主页     │  标题（例如 "belt-conveyor"）          │
│  📦 内容管理器│  DRAFT  / PUBLISHED 切换             │
│  🖼️ 媒体库   │                                        │
│  🧱 内容类型 │  左侧字段列表                          │
│  🚀 Deploy   │  右侧 ENTRY + PREVIEW 面板            │
│  🏪 市场     │  • 发布 / 保存 / ...                   │
│  ⚙️ 设置     │  • Open preview                        │
│              │                                        │
└──────────────┴────────────────────────────────────────┘
```

### 左侧导航栏

| 图标 | 菜单 | 作用 |
|------|------|------|
| 🏠 | 主页 | Dashboard，最近编辑条目 |
| 📦 | 内容管理器 | 管理 Equipment 和 Inquiry |
| 🖼️ | 媒体库 | 上传设备图片、文档 |
| 🧱 | 内容类型构建器 | 修改内容类型字段结构 |
| ⚙️ | 设置 | 用户角色、API Token、插件配置 |

## 三、管理员角色与权限

### 默认角色（Strapi 预置）

| 角色 | 权限 |
|------|------|
| Super Admin | 全部权限，包括设置、内容类型构建器 |
| Editor | 内容增删改查，不能改设置 |
| Author | 只能编辑自己创建的条目 |

### 本项目建议角色规划

| 人员 | 角色 | 操作 |
|------|------|------|
| 站长/开发者 | Super Admin | 全部 |
| 内容编辑 | Editor | 编辑 Equipment、Inquiry |
| 销售 | Author | 查看 Inquiry |

### 设置步骤

1. 左侧 → **设置** → **Roles**（或 **Users & Permissions** 插件）
2. 点击 **Editor** → 勾选权限 → **保存**
3. 同样配置 Author 和 Public（匿名用户访问 `/api/inquiry` 需要 Public 勾选 `create` 权限）

⚠️ **关键**：`/api/inquiry` 自定义路由是公开访问的，必须给 **Public** 角色授予 Inquiry 内容类型的 `create` 权限，否则匿名 POST 会被拒绝（403）。

## 四、Equipment 日常操作

详见 [04-Equipment设备管理手册.md](./04-Equipment设备管理手册.md)。

## 五、Inquiry 日常操作

详见 [05-Inquiry询盘管理手册.md](./05-Inquiry询盘管理手册.md)。

## 六、媒体库使用

### 上传设备图片

1. 左侧 → **媒体库**
2. 点击 **上传** 或拖拽图片
3. 建议图片命名：`{slug}.jpg`、`{slug}-2.jpg`（与 `images` 字段数组对应）
4. 图片路径建议使用相对路径（如 `assets/images/equipment/xxx.jpg`），避免依赖 Strapi upload 的绝对 URL

### 媒体安全策略

`config/plugins.js` 中已配置：

```javascript
const allowedMediaTypes = ['image/*', 'application/pdf', ...];
const deniedTypes = ['image/svg+xml', 'application/x-msdownload', ...];
```

SVG 和可执行文件被禁止上传。

## 七、预览按钮（Preview）

### 启用状态

Equipment 编辑页右侧 ENTRY 面板下方应显示 **PREVIEW** 区域，按钮文本为 **"Open preview"**。

### 如果显示 "Set up preview" 怎么办

说明 `config/admin.js` 的 preview 配置未加载。检查：

1. `config/admin.js` 中是否有 `preview.enabled: true`
2. 开发模式需要重启 Strapi（`Ctrl+C` → `npm run develop`）
3. `.env` 中 `CLIENT_URL` 是否正确设置

### 预览 URL 生成逻辑

见 [01-项目架构说明.md 第七节](./01-项目架构说明.md#七前端语言切换机制) 和 [09-环境变量配置说明.md](./09-环境变量配置说明.md)。

## 八、API Tokens（用于脚本/外部集成）

### 创建步骤

1. 左侧 → **设置** → **API Tokens**
2. 点击 **创建新 API Token**
3. 填写名称（如 `dev-token`）+ 描述
4. Token type：**Custom**
5. 权限：勾选 Equipment 的 find / create / update
6. 保存 → 复制生成的 token（格式：`xxx.yyy.zzz`）
7. 该 token 需通过 `Authorization: Bearer <token>` 头使用

### 本项目中 API Token 的用途

| 用途 | 是否需要 Token | 说明 |
|------|--------------|------|
| 访问 `/api/equipments`（公开） | ❌ 不需要 | Public 角色已授予 find 权限 |
| POST `/api/inquiry` | ❌ 不需要 | 自定义路由，绕过 Strapi 权限系统 |
| 写 Equipment（update） | ✅ 需要 Editor + Token | 后台编辑器自动处理 |

## 九、Strapi Admin UI 中文切换

- Admin UI 默认语言已配置为 **简体中文**（`src/admin/app.js`）
- 如果看到英文界面，点击右上角用户头像 → Preferences → Interface language → 中文（简体）
- 如果中文界面有部分翻译缺失，运行 `npm run build-admin-translations` 重新构建

## 十、版本与升级

```bash
# 查看当前版本
cd backend && npx strapi --version

# 检查最新版本
npx @strapi/upgrade latest --dry

# 升级（需谨慎，先备份 SQLite）
npm run upgrade
```

⚠️ **升级前必须备份** `backend/.tmp/data.db`（直接复制文件即可）。
