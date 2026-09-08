#!/bin/bash
# ============================================================
# ⚠️ 已废弃（DEPRECATED，2026-09-08）—— 请勿运行！
#
# 站点已改用 {{ORIGIN}} 动态地址机制：
#   SITE_URL 留空 → 构建产物写占位符 → nginx sub_filter 运行期
#   替换为访客实际 IP:端口。换 IP/端口/域名无需任何操作。
#
# 本脚本会把绝对地址写死进构建产物，破坏该机制。
# 误运行后的恢复方法见 docs/18-日常使用手册.md §6.3。
# ============================================================
# 站点地址一键更新脚本 —— B2B 矿山机械网站（旧方案存档）
# 适用：IP 或端口变化后，更新 SITE_URL / CLIENT_URL 并重新生成静态页
# 用法：./update-site-url.sh http://1.2.3.4:8080
# ============================================================
set -euo pipefail

ROOT="/var/www/B2B"
ENV_FILE="$ROOT/backend/.env"
NEW_URL="${1:-}"

if [ -z "$NEW_URL" ]; then
    echo "用法: $0 http://<IP或域名>:<端口>"
    echo "示例: $0 http://1.2.3.4:8080"
    echo "      $0 http://ssyin.duckdns.org:11480"
    exit 1
fi

# 去掉结尾斜杠，统一格式
NEW_URL="${NEW_URL%/}"

# 基本校验
if [[ ! "$NEW_URL" =~ ^https?:// ]]; then
    echo "错误：地址必须以 http:// 或 https:// 开头"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "错误：未找到 $ENV_FILE"
    exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 更新站点地址为: $NEW_URL"

# 备份 .env
cp "$ENV_FILE" "$ENV_FILE.bak-$(date +%Y%m%d-%H%M%S)"
echo "已备份 .env"

# 更新或追加 SITE_URL
if grep -q '^SITE_URL=' "$ENV_FILE"; then
    sed -i "s|^SITE_URL=.*|SITE_URL=${NEW_URL}/|" "$ENV_FILE"
else
    echo "SITE_URL=${NEW_URL}/" >> "$ENV_FILE"
fi

# 更新或追加 CLIENT_URL
if grep -q '^CLIENT_URL=' "$ENV_FILE"; then
    sed -i "s|^CLIENT_URL=.*|CLIENT_URL=${NEW_URL}|" "$ENV_FILE"
else
    echo "CLIENT_URL=${NEW_URL}" >> "$ENV_FILE"
fi

echo "已更新 SITE_URL / CLIENT_URL"

# 重新生成静态页
cd "$ROOT"
node scripts/build-pages.js

echo ""
echo "================ 验证结果 ================"
echo -n "sitemap 中 github.io 残留数量: "
grep -c 'ssyin-yg.github.io' sitemap.xml 2>/dev/null || echo 0
echo -n "sitemap 中新地址数量:          "
grep -c "$NEW_URL" sitemap.xml 2>/dev/null || echo 0
echo -n "sitemap URL 总数:              "
grep -c '<loc>' sitemap.xml 2>/dev/null || echo 0
echo "=========================================="
echo ""
echo "提示：若 SITE_URL 未生效，请检查 scripts/build-pages.js 的 loadEnvFile() 路径修复是否已完成"
