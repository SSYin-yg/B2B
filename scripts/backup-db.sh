#!/bin/bash
# ============================================================
# 数据库备份脚本 —— B2B 矿山机械网站
# 功能：备份 PostgreSQL 数据库，保留最近 14 天
# 用法：./backup-db.sh
# 建议：加入 crontab 每天执行
# ============================================================
set -euo pipefail

ROOT="/var/www/B2B"
BACKUP_DIR="$ROOT/backups/db"
ENV_FILE="$ROOT/backend/.env"
KEEP_DAYS=56

mkdir -p "$BACKUP_DIR"

# 从 .env 读取数据库连接信息（不在命令行暴露密码）
export PGPASSWORD=$(grep '^DATABASE_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)
DB_USER=$(grep '^DATABASE_USERNAME=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
DB_NAME=$(grep '^DATABASE_NAME='     "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
DB_HOST=$(grep '^DATABASE_HOST='     "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
DB_PORT=$(grep '^DATABASE_PORT='     "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"

STAMP=$(date +%Y%m%d-%H%M%S)
OUT="$BACKUP_DIR/${DB_NAME}-${STAMP}.sql.gz"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始备份 $DB_NAME ..."

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" 2>>"$BACKUP_DIR/error.log" | gzip > "$OUT"; then
    :
else
    echo "[$(date)] 备份失败：pg_dump 执行出错，详见 $BACKUP_DIR/error.log" >&2
    rm -f "$OUT"
    exit 1
fi

# 校验输出非空
if [ ! -s "$OUT" ]; then
    echo "[$(date)] 备份失败：输出文件为空" >&2
    rm -f "$OUT"
    exit 1
fi

# 权限收紧：备份含全部业务数据
chmod 600 "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份成功: $OUT ($SIZE)"

# 清理过期备份
find "$BACKUP_DIR" -name "${DB_NAME}-*.sql.gz" -mtime +$KEEP_DAYS -delete 2>/dev/null || true

echo "当前备份数量: $(ls -1 "$BACKUP_DIR"/${DB_NAME}-*.sql.gz 2>/dev/null | wc -l)"
