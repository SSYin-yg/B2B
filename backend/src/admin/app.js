/**
 * Strapi Admin 自定义配置
 *
 * - locales / defaultLocale: 启用简体中文为 Admin UI 默认语言
 * - translations: 注入预编译的官方中文翻译包（绕过 Vite develop 模式下
 *                  动态 import('./translations/zh-Hans.json') 解析失败问题）
 *
 * 注意：Admin UI 的 locale 与 Strapi Content 的 i18n locale 完全独立。
 *       这里只控制后台界面语言，不影响前台中英文页面。
 */

// 预编译的 Strapi 官方中文翻译（由 scripts/build-admin-translations.js 生成）
import zhHansTranslations from './translations/zh-Hans.js';

const config = {
  // 可用的 Admin UI 语言（简体中文 + 英文，可按需扩展）
  locales: ['zh-Hans', 'en'],
  // 默认语言：简体中文
  defaultLocale: 'zh-Hans',
  // 注入翻译对象 —— 这是修复 develop 模式中文加载失败的关键
  translations: {
    'zh-Hans': zhHansTranslations,
  },
};

export default {
  config,
};
