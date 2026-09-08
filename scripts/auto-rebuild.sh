#!/bin/bash
# B2B 前端自动重建脚本
# 每次运行检查 Strapi 内容是否有变更，有变更则重建前端页面

STRAPI_API="http://127.0.0.1:1337/api/equipments?pagination%5BpageSize%5D=200&populate=images"
HASH_FILE="/var/www/B2B/.content-hash"
BUILD_SCRIPT="/var/www/B2B/scripts/build-pages.js"
LOG_FILE="/var/www/B2B/auto-rebuild.log"

cd /var/www/B2B || exit 1

# 获取当前 API 数据的哈希值
CURRENT_HASH=$(curl -s "$STRAPI_API" | md5sum | awk '{print $1}')

# 读取上次哈希
LAST_HASH=""
if [ -f "$HASH_FILE" ]; then
  LAST_HASH=$(cat "$HASH_FILE")
fi

# 哈希相同 = 内容无变更，跳过
if [ "$CURRENT_HASH" = "$LAST_HASH" ]; then
  exit 0
fi

# 内容有变更，重建前端
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 内容变更检测到，开始重建..." >> "$LOG_FILE"
node "$BUILD_SCRIPT" >> "$LOG_FILE" 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 重建完成" >> "$LOG_FILE"

# 更新哈希
echo "$CURRENT_HASH" > "$HASH_FILE"
