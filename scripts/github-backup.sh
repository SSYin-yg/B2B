#!/bin/bash
# ============================================================
# GitHub 异地备份 —— B2B 矿山机械网站
# 每 14 天自动推送一次全量仓库（代码 + 静态页 + 图片资产）
#
# 机制：cron 每天凌晨 4:05 调用本脚本，脚本内部检查距上次
#       成功推送是否已满 14 天（状态文件 .last-github-backup），
#       未满则直接退出。这样漏跑/宕机后下次会自动补上。
#
# 首次启用（一次性）：
#   1. GitHub 上新建私有仓库（勿勾选 README 初始化）
#   2. git remote add origin git@github.com:<用户>/<仓库>.git
#   3. 配置推送凭证（SSH 密钥或 HTTPS + PAT），见 docs/18 §7.5
#   4. 手动跑一次验证：bash scripts/github-backup.sh
# ============================================================
set -euo pipefail

ROOT="/var/www/B2B"
STATE_FILE="$ROOT/.last-github-backup"
INTERVAL_DAYS=14
LOG_TAG="[github-backup]"

cd "$ROOT"

# 1. 未配置远程仓库时安静退出（提示写进日志，便于排查）
REMOTE=$(git remote get-url origin 2>/dev/null || true)
if [ -z "$REMOTE" ]; then
    echo "$LOG_TAG $(date '+%F %T') 跳过：未配置 origin 远程（git remote add origin git@github.com:<用户>/<仓库>.git）"
    exit 0
fi

# 2. 间隔检查：距上次成功推送不足 14 天则跳过
NOW=$(date +%s)
LAST=0
[ -f "$STATE_FILE" ] && LAST=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
if [ $((NOW - LAST)) -lt $((INTERVAL_DAYS * 86400)) ]; then
    exit 0
fi

echo "$LOG_TAG $(date '+%F %T') 开始 14 天周期备份 → $REMOTE"

# 3. 收集变更（构建产物一并入库，实现整站可恢复）
git add -A
if git diff --cached --quiet; then
    echo "$LOG_TAG 工作区无变更"
else
    git commit -q -m "auto-backup $(date '+%F %T')（14 天周期自动备份）"
fi

# 4. 推送（-u 便于首次推送建立跟踪）
if git push -u origin main; then
    date +%s > "$STATE_FILE"
    echo "$LOG_TAG $(date '+%F %T') 推送成功，最新提交：$(git log --oneline -1)"
else
    echo "$LOG_TAG $(date '+%F %T') 推送失败：检查网络/凭证（SSH 密钥或 PAT），状态文件未更新，下轮会重试" >&2
    exit 1
fi
