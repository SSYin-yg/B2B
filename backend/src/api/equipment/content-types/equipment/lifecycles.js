'use strict';

/**
 * Equipment 内容类型生命周期钩子
 *
 * 当设备被创建、更新、发布、取消发布或删除时，
 * 自动触发前端静态页面重建（build-pages.js）
 */

const { exec } = require('child_process');
const path = require('path');

/* __dirname = backend/src/api/equipment/content-types/equipment → 向上 6 级到项目根 /var/www/B2B */
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..', '..');
const BUILD_SCRIPT = path.join(ROOT, 'scripts', 'build-pages.js');
const LOG_FILE = path.join(ROOT, 'auto-rebuild.log');

/* 防抖：3 秒内多次操作只触发一次重建 */
let buildPending = false;
let buildTimer = null;

function triggerBuild(eventName) {
  const ts = new Date().toISOString();
  const logLine = `[${ts}] 生命周期钩子触发: ${eventName}\n`;

  /* 追加日志 */
  const fs = require('fs');
  fs.appendFileSync(LOG_FILE, logLine);

  if (buildPending) {
    fs.appendFileSync(LOG_FILE, `[${ts}] 跳过：已有重建任务排队\n`);
    return;
  }

  buildPending = true;

  if (buildTimer) clearTimeout(buildTimer);

  /* 防抖 3 秒：连续保存只触发一次构建 */
  buildTimer = setTimeout(() => {
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] 开始重建前端页面...\n`);

    exec(`node ${BUILD_SCRIPT}`, {
      cwd: ROOT,
      timeout: 120000,
      env: { ...process.env, NODE_ENV: 'development' }
    }, (err, stdout, stderr) => {
      if (err) {
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] 重建失败: ${err.message}\n`);
      } else {
        const lines = stdout.trim().split('\n');
        const lastLine = lines[lines.length - 1] || '';
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] 重建完成: ${lastLine}\n`);
      }
      buildPending = false;
      buildTimer = null;
    });
  }, 3000);
}

module.exports = {
  async afterCreate(event) {
    triggerBuild('afterCreate');
  },

  async afterUpdate(event) {
    triggerBuild('afterUpdate');
  },

  async afterDelete(event) {
    triggerBuild('afterDelete');
  },
};
