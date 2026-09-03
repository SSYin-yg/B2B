# Minelink B2B 项目技术文档

> 矿联矿机官网（`https://ssyin-yg.github.io/B2B/`）是一个面向全球矿业客户的 B2B 设备采购与服务平台。
> 前端为纯静态 HTML，后端基于 **Strapi 5.52.3 + SQLite**。
> 内容编辑通过 Strapi Admin 完成，静态页面由 `scripts/build-pages.js` 生成。

---

## 文档目录

| 序号 | 文件 | 说明 |
|------|------|------|
| — | [CHANGELOG.md](./CHANGELOG.md) | 版本更新记录 |
| 01 | [01-项目架构说明.md](./01-项目架构说明.md) | 整体技术架构、目录结构、数据流 |
| 02 | [02-Strapi安装部署手册.md](./02-Strapi安装部署手册.md) | Strapi 从零安装到运行的完整步骤 |
| 03 | [03-Strapi后台操作手册.md](./03-Strapi后台操作手册.md) | Admin UI 日常操作指南 |
| 04 | [04-Equipment设备管理手册.md](./04-Equipment设备管理手册.md) | Equipment 内容类型的字段说明、发布流程 |
| 05 | [05-Inquiry询盘管理手册.md](./05-Inquiry询盘管理手册.md) | Inquiry 内容类型 + `/api/inquiry` 接口说明 |
| 06 | [06-邮件通知配置手册.md](./06-邮件通知配置手册.md) | SMTP 配置、邮件模板、排错 |
| 07 | [07-静态页面生成手册.md](./07-静态页面生成手册.md) | `build-pages.js` 的用法、输出文件、CLI 参数 |
| 08 | [08-SEO与Sitemap说明.md](./08-SEO与Sitemap说明.md) | SEO 字段、hreflang、Product JSON-LD、sitemap.xml |
| 09 | [09-环境变量配置说明.md](./09-环境变量配置说明.md) | `.env` 所有变量详解 |
| 10 | [10-生产环境部署手册.md](./10-生产环境部署手册.md) | 服务器部署、PM2、GitHub Pages 同步 |
| 11 | [11-故障排查手册.md](./11-故障排查手册.md) | 常见问题与解决办法 |
| 12 | [12-开发维护手册.md](./12-开发维护手册.md) | 日常开发、数据迁移、文档导入脚本 |

---

## 快速导航

### 常用命令

```bash
# 开发
npm run develop          # 启动 Strapi（开发模式）- http://localhost:1337
npm run serve            # 启动静态前端预览 - http://localhost:3000

# 数据
npm run migrate          # 从 assets/equipment-data.js 迁移 31 台设备到 Strapi

# 构建
npm run build-pages      # 从 Strapi 生成所有静态页面 + sitemap.xml
```

### 关键地址

| 服务 | 本地开发 | 生产环境 |
|------|---------|---------|
| Strapi Admin | http://localhost:1337/admin | 需部署 |
| Strapi API | http://localhost:1337/api | 需部署 |
| 静态前端 | http://localhost:3000 | https://ssyin-yg.github.io/B2B/ |

---

## 技术栈一览

| 层 | 技术 | 版本 |
|----|------|------|
| 后端 CMS | Strapi | 5.52.3 |
| 数据库 | SQLite (better-sqlite3) | 12.8.0 |
| 邮件 | Nodemailer | ^6.10.1 |
| Node.js | — | >=20.0.0 |
| 前端 | 原生 HTML/CSS/JS（无框架） | — |
| 静态生成 | Node.js 脚本（fetch + 模板替换） | — |
| 前端托管 | GitHub Pages | — |
| docx 解析 | mammoth | ^1.12.2（开发依赖） |
