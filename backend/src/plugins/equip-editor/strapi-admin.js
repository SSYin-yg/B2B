/**
 * equip-editor 插件（管理端入口）
 *
 * Strapi 5 的 admin 构建器以 ESM 方式导入该入口，
 * 将 admin/src/index.js 中注册的 custom field 组件打进后台 bundle。
 * 缺少此文件时后台会报「Unsupported field type: plugin::equip-editor.model-tables」。
 */
export { default } from './admin/src/index';
