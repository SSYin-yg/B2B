#!/bin/bash
# ============================================================
# nginx 安全加固 —— B2B 矿山机械网站（需要 root 执行）
# 用法：sudo bash /var/www/B2B/scripts/harden-nginx.sh
#
# 屏蔽公网对以下内容的访问（2026-09-08 实测曾可下载）：
#   /.git/ /.git.old/        —— 仓库与历史（dotfile 规则覆盖）
#   /backend/                —— Strapi 代码与 .env 变体
#   /backups/                —— 数据库备份（含全部业务数据！）
#   /scripts/ /data/ /docs/  —— 服务器脚本/映射/内部手册
#   *.log *.sql *.gz *.sh *.bak *.save 及所有点文件
#
# 幂等：重复执行自动跳过。执行前自动备份原配置，nginx -t
# 失败会自动回滚，不影响线上。
# ============================================================
set -euo pipefail

CONF="/etc/nginx/sites-available/minelink"
MARKER="安全屏蔽（2026-09-08"
LINK="/etc/nginx/sites-enabled/minelink"
[ -L "$LINK" ] && CONF="$LINK"

if [ "$(id -u)" -ne 0 ]; then
    echo "错误：请用 sudo 执行：sudo bash $0"; exit 1
fi
if [ ! -f "$CONF" ]; then
    echo "错误：未找到站点配置 $CONF"; exit 1
fi

if grep -qF "$MARKER" "$CONF"; then
    echo "已加固过，跳过。验证："
else
    cp "$CONF" "$CONF.bak-$(date +%Y%m%d-%H%M%S)"
    echo "已备份原配置"

    # 插入到 server_name 行之后（确保位于 server{} 块内）
    # 用 python3 插入以完整保留反斜杠（awk -v 会吞掉 \. 等转义）
    python3 - "$CONF" <<'PYEOF'
import sys
path = sys.argv[1]
block = r'''    # === 安全屏蔽（2026-09-08，详见 docs/17 §10） ===
    # 点文件：/.git/ /.git.old/ /.env /.content-hash /.predeploy-snapshot/ 等
    location ~ /\. { deny all; access_log off; log_not_found off; }
    # 项目内部目录：后台代码、数据库备份、脚本、数据、内部文档
    location ^~ /backend/ { deny all; }
    location ^~ /backups/ { deny all; }
    location ^~ /scripts/ { deny all; }
    location ^~ /data/    { deny all; }
    location ^~ /docs/    { deny all; }
    # 敏感后缀：日志 / 数据库 dump / 脚本 / 备份
    location ~* \.(log|sql|gz|sh|bak|save)$ { deny all; access_log off; }
'''
lines = open(path, encoding='utf-8').read().splitlines(keepends=True)
out, inserted = [], False
for line in lines:
    out.append(line)
    if not inserted and line.lstrip().startswith('server_name '):
        out.append('\n' + block)
        inserted = True
if not inserted:
    sys.exit('未找到 server_name 行，插入中止')
open(path, 'w', encoding='utf-8').write(''.join(out))
PYEOF
    echo "已插入屏蔽规则"
fi

# 语法检查，失败回滚
if nginx -t 2>/dev/null; then
    systemctl reload nginx
    echo "✅ nginx 已重载，开始验证（期望全部 403）——"
else
    LATEST_BAK=$(ls -t "$CONF".bak-* | head -1)
    cp "$LATEST_BAK" "$CONF"
    echo "❌ nginx -t 未通过，已回滚到 $LATEST_BAK，未重载。请人工检查。" >&2
    exit 1
fi

sleep 1
FAIL=0
for p in "/.git/HEAD" "/.git.old/HEAD" "/backend/.env" "/backups/db/" "/auto-rebuild.log" "/scripts/backup-db.sh" "/docs/17-系统架构文档.md" "/.content-hash"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" -m 3 "http://127.0.0.1$p")
    [ "$code" = "403" ] || FAIL=1
    echo "  $code  $p"
done
for p in "/" "/equipment/crawler-jaw.html" "/sitemap.xml" "/robots.txt" "/assets/i18n.js"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" -m 3 "http://127.0.0.1$p")
    [ "$code" = "200" ] || FAIL=1
    echo "  $code  $p  （应 200）"
done
[ "$FAIL" = "0" ] && echo "✅ 全部通过：敏感路径 403，正常页面 200" || { echo "⚠️ 有不符合预期项，请检查上方列表"; exit 1; }
