/**
 * Strapi Admin 自定义配置
 *
 * - locales:   启用简体中文 + 英文两种 Admin UI 语言
 * - bootstrap: 首次进入后台时，把界面语言预设为简体中文
 *              （Strapi 5 没有 defaultLocale 配置项，语言保存在
 *               localStorage 'strapi-admin-language'；bootstrap 在
 *               render 之前执行，此时写入可让首屏即中文。
 *               用户之后在「个人资料」中切换语言会被保留，不覆盖。）
 * - translations: 注入预编译的官方中文翻译 + 项目字段汉化
 *                 （由 scripts/build-admin-translations.js 生成，
 *                  绕过 Vite develop 模式下动态 import 解析失败问题）
 *
 * 注意：Admin UI 的 locale 与 Strapi Content 的 i18n locale 完全独立。
 *       这里只控制后台界面语言，不影响前台中英文页面。
 */

// 预编译的 Strapi 官方中文翻译 + 项目覆盖（由 build-admin-translations 生成）
import zhHansTranslations from './translations/zh-Hans.js';

const LANGUAGE_STORAGE_KEY = 'strapi-admin-language';
const DEFAULT_LOCALE = 'zh-Hans';

const config = {
  // 可用的 Admin UI 语言（简体中文 + 英文）
  locales: ['zh-Hans', 'en'],
  // 注入翻译对象（官方 zh-Hans + 项目字段标签汉化，合并优先级最高）
  translations: {
    'zh-Hans': zhHansTranslations,
  },
};

const bootstrap = () => {
  // 仅在用户从未选择过语言时预设简体中文；用户手动切换后不覆盖
  try {
    if (!localStorage.getItem(LANGUAGE_STORAGE_KEY)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, DEFAULT_LOCALE);
    }
  } catch (e) {
    // localStorage 不可用时静默忽略（后台仍可在个人资料中手动切换）
  }
};

export default {
  config,
  bootstrap,
};
