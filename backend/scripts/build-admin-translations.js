'use strict';

/**
 * 将 Strapi 官方中文翻译预编译成项目级翻译模块
 *
 * 从 node_modules/@strapi/PACKAGE/dist/PATH 读取 zh-Hans.json.mjs，
 * 通过 ESM 动态 import 直接获取 default export 对象，
 * 合并成统一的 zh-Hans 翻译表，输出到 src/admin/translations/zh-Hans.js。
 *
 * 为什么需要这个？
 *   Strapi v5 develop 模式下，admin 框架用动态
 *   import('./translations/zh-Hans.json') 加载内置翻译。
 *   Vite dev server 无法正确解析这些相对路径到 node_modules
 *   中已打包好的 .mjs 文件，导致翻译加载失败 → 后台显示英文。
 *
 *   通过 config.translations 直接传入已编译的翻译对象，
 *   绕过 Vite 动态 import，官方所有翻译 key 都能生效。
 *
 * 运行：node scripts/build-admin-translations.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NODE_MODULES = path.join(ROOT, 'node_modules');
const OUTPUT_DIR = path.join(ROOT, 'src', 'admin', 'translations');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'zh-Hans.js');

/* 直接文件系统路径（require.resolve 对 Strapi 子路径不生效） */
const TRANSLATION_FILES = [
  path.join(NODE_MODULES, '@strapi/admin/dist/admin/admin/src/translations/zh-Hans.json.mjs'),
  path.join(NODE_MODULES, '@strapi/content-manager/dist/admin/translations/zh-Hans.json.mjs'),
  path.join(NODE_MODULES, '@strapi/content-type-builder/dist/admin/translations/zh-Hans.json.mjs'),
  path.join(NODE_MODULES, '@strapi/plugin-users-permissions/dist/admin/translations/zh-Hans.json.mjs'),
  path.join(NODE_MODULES, '@strapi/upload/dist/admin/translations/zh-Hans.json.mjs'),
  path.join(NODE_MODULES, '@strapi/review-workflows/dist/admin/translations/zh-Hans.json.mjs'),
  path.join(NODE_MODULES, '@strapi/i18n/dist/admin/translations/zh-Hans.json.mjs'),
  path.join(NODE_MODULES, '@strapi/email/dist/admin/translations/zh-Hans.json.mjs'),
];

async function main() {
  console.log('== 编译 Strapi Admin 中文翻译 ==');

  const merged = {};
  for (const absPath of TRANSLATION_FILES) {
    if (!fs.existsSync(absPath)) {
      console.warn('  跳过（不存在）: ' + path.basename(absPath));
      continue;
    }
    const fileUrl = 'file:///' + absPath.replace(/\\/g, '/');
    try {
      const mod = await import(fileUrl);
      const data = mod.default;
      if (!data || typeof data !== 'object') {
        console.warn('  跳过（default 非对象）: ' + path.basename(absPath));
        continue;
      }
      const keys = Object.keys(data).length;
      Object.assign(merged, data); // 后覆盖前（插件覆盖核心）
      const pkgName = path.basename(path.dirname(path.dirname(absPath)));
      console.log('  ✓ ' + pkgName + '/zh-Hans (' + keys + ' keys)');
    } catch (e) {
      console.warn('  跳过（import 失败）: ' + path.basename(absPath) + ' - ' + e.message);
    }
  }

  /* 合并项目级翻译覆盖（放在最后，优先级最高） */
  const OVERRIDES_FILE = path.join(OUTPUT_DIR, 'zh-Hans-overrides.js');
  if (fs.existsSync(OVERRIDES_FILE)) {
    try {
      const fileUrl = 'file:///' + OVERRIDES_FILE.replace(/\\/g, '/');
      const mod = await import(fileUrl);
      const overrides = mod.default;
      if (overrides && typeof overrides === 'object') {
        Object.assign(merged, overrides);
        console.log('  ✓ 项目级覆盖 (' + Object.keys(overrides).length + ' keys)');
      }
    } catch (e) {
      console.warn('  跳过项目覆盖: ' + e.message);
    }
  }

  const finalKeys = Object.keys(merged).length;
  console.log('\n合并后 key 总数: ' + finalKeys);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const jsContent =
    '/**\n' +
    ' * Strapi Admin 中文翻译（自动生成，请勿手工编辑）\n' +
    ' * 来源：node_modules/@strapi/PACKAGE/dist/PATH 下的 zh-Hans.json.mjs\n' +
    ' * 重新生成：npm run build-admin-translations\n' +
    ' */\n' +
    'export default ' + JSON.stringify(merged, null, 2) + ';\n';

  fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8');
  const size = fs.statSync(OUTPUT_FILE).size;
  console.log('✔ 输出: ' + OUTPUT_FILE + ' (' + (size / 1024).toFixed(1) + ' KB)');
}

main().catch((err) => {
  console.error('❌ 生成失败: ' + err.message);
  process.exit(1);
});
