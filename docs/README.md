# Minelink B2B 项目技术文档

> 矿联矿机官网 —— 面向全球矿业客户的 B2B 设备采购与服务平台。
> **当前部署**：自托管单服务器（nginx :80 入口 + Strapi 5.52.3 + PostgreSQL 17 + 静态 HTML 前端），内容编辑走 Strapi 后台，静态页由 `scripts/build-pages.js` 自动生成。

---

## ⭐ 当前权威文档（与系统现状一致，从这里读起）

| 序号 | 文件 | 说明 |
|------|------|------|
| 17 | [17-系统架构文档.md](./17-系统架构文档.md) | **架构权威版**：组件清单、数据流、构建管线、{{ORIGIN}} 动态站点地址机制（§5.5）、草稿预览/询盘邮件链路、权限模型、安全现状、备份恢复 |
| 18 | [18-日常使用手册.md](./18-日常使用手册.md) | **操作权威版**：服务启停、设备管理、草稿预览、询盘处理、IP/端口变更（零操作机制）、备份、故障速查 |

## 仍然有效的专题文档

| 文件 | 说明 | 状态 |
|------|------|------|
| [06-邮件通知配置手册.md](./06-邮件通知配置手册.md) | SMTP 配置、主流服务商参数、排错 | ✅ 有效 |
| [07-静态页面生成手册.md](./07-静态页面生成手册.md) | build-pages.js 用法、CLI 参数、清理规则 | ✅ 已更新（2026-09-07） |
| [08-SEO与Sitemap说明.md](./08-SEO与Sitemap说明.md) | SEO 字段、hreflang、JSON-LD、sitemap | ✅ 机制有效，示例域名说明见 17 号手册 §5.5（{{ORIGIN}} 动态地址） |
| [15-网站图片管理技术文档.md](./15-网站图片管理技术文档.md) | 图片槽位机制 | ✅ 有效 |
| [16-网站图片运营操作手册.md](./16-网站图片运营操作手册.md) | 槽位日常操作 | ✅ 有效 |

## 历史参考文档（⚠️ 部署相关内容已过时，已加横幅标注）

写于早期 GitHub Pages + SQLite + Windows 本机开发时期。字段说明、操作步骤、接口定义等**业务内容大体仍可参考**；凡涉及部署方式、数据库、域名、同步机制的内容一律以 17/18 为准。

| 序号 | 文件 | 主要过时点 |
|------|------|-----------|
| 01 | [01-项目架构说明.md](./01-项目架构说明.md) | 架构图（GitHub Pages/SQLite）、目录结构 |
| 02 | [02-Strapi安装部署手册.md](./02-Strapi安装部署手册.md) | 本机安装流程、SQLite 初始化 |
| 03 | [03-Strapi后台操作手册.md](./03-Strapi后台操作手册.md) | 升级备份方式 |
| 04 | [04-Equipment设备管理手册.md](./04-Equipment设备管理手册.md) | 废弃的 sqlite 批量脚本；删除/改 slug 生效机制已变 |
| 05 | [05-Inquiry询盘管理手册.md](./05-Inquiry询盘管理手册.md) | 缺 resend 接口与 Maillog；备份恢复方式 |
| 09 | [09-环境变量配置说明.md](./09-环境变量配置说明.md) | ✅ 已重写（2026-09-07） |
| 10 | [10-生产环境部署手册.md](./10-生产环境部署手册.md) | ✅ 已重写（2026-09-07） |
| 11 | [11-故障排查手册.md](./11-故障排查手册.md) | ✅ 已更新（2026-09-07，PostgreSQL/自动重建） |
| 12 | [12-开发维护手册.md](./12-开发维护手册.md) | 数据迁移脚本、开发环境说明 |
| — | [CHANGELOG.md](./CHANGELOG.md) | 版本记录（持续维护） |

---

## 快速导航

### 常用命令（项目根目录 /var/www/B2B）

```bash
# 生产环境
systemctl --user status strapi-b2b             # Strapi 状态（systemd 用户服务，开机自启）
journalctl --user -u strapi-b2b -f             # Strapi 日志
node scripts/build-pages.js                    # 手动全量重建
systemctl status b2b-webhook                   # 预览/重建服务状态
bash scripts/backup-db.sh                      # 手动数据库备份
bash scripts/github-backup.sh                  # 手动触发 GitHub 异地备份（自动模式为每 14 天）
sudo bash scripts/harden-nginx.sh              # nginx 安全加固（一次性，幂等）

# 本地开发
npm run develop          # Strapi 开发模式 → http://localhost:1337
npm run serve            # 静态预览 → http://localhost:3000
```

### 关键路径

| 内容 | 位置 |
|------|------|
| 全部密钥/SMTP/数据库配置 | `backend/.env`（说明见 09） |
| nginx 站点配置 | `/etc/nginx/sites-available/minelink` |
| 预览/重建服务 | `scripts/webhook-listener.js`（systemd: b2b-webhook） |
| 自动重建日志 | `auto-rebuild.log` / `webhook-listener.log` |
| 数据库备份 | `backups/db/*.sql.gz`（保留 56 天） |
| GitHub 异地备份 | `scripts/github-backup.sh`（每 14 天，日志 `github-backup.log`） |
| 旧 slug 301 映射 | `data/legacy-equipment-slugs.json` |

> 内容变更生效机制：后台保存/发布/删除设备 → 约 3 秒自动重建（cron 每 30 分钟哈希兜底）。详见 17-系统架构文档 §6。
