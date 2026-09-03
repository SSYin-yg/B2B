/**
 * 项目级 Strapi Admin 中文翻译覆盖
 *
 * Strapi 官方 zh-Hans 翻译存在大量缺失 key（如 global.home、
 * global.media-library 等）。本文件补全这些 key，并可按需覆盖
 * 官方翻译以适应项目场景。
 *
 * 生成：npm run build-admin-translations 时会自动合并此文件
 * 到 src/admin/translations/zh-Hans.js 末尾（后覆盖前）
 */

export default {
  // === 官方缺失的 core key ===
  'global.home': '主页',
  'global.media-library': '媒体库',
  'global.plugins.cloud': 'Strapi Cloud',
  'global.plugins.cloud.description': '在 Strapi Cloud 上托管您的 Strapi 项目。',
  'global.plugins.users-permissions': '用户 & 权限',
  'global.settings': '设置',
  'global.users': '用户',
  'global.roles': '角色',
  'global.user': '用户',

  // === HomePage widget ===
  'HomePage.widget.last-activity.title': '最近活动',
  'HomePage.widget.deploy-now.title': '准备上线了吗？',
  'HomePage.widget.deploy-now.description': '部署您的项目。',
  'HomePage.widget.deploy-now.button': '立即部署',
  'HomePage.widget.deploy-now.action': '立即部署',
  'global.deploy': '部署',

  // === Content Manager 插件名（Strapi 动态生成的 key） ===
  'content-manager.plugin.name': '内容管理器',
  'content-manager.plugin.description': '快速查看、编辑和删除数据库中的数据。',

  // === Content-Type Builder ===
  'content-type-builder.plugin.name': '内容类型构建器',

  // === Users & Permissions ===
  'users-permissions.plugin.name': '用户 & 权限',

  // === 其他常见缺失 ===
  'plugin.cloud.name': 'Strapi Cloud',
  'plugin-cloud.plugin.name': 'Strapi Cloud',

  // === Row Actions ===
  'global.rowActions': '行操作',
  'content-manager.containers.List.rowActions': '行操作',
  'content-manager.containers.DynamicTable.row-actions': '行操作',

  // === Settings 子页 ===
  'global.settings.application': '应用信息',
  'global.settings.admin': '管理员面板',
  'global.settings.admin-tokens': 'API 令牌',
  'global.settings.webhooks': 'Webhooks',
  'global.settings.roles': '角色',
  'global.settings.users': '用户',
  'global.settings.media-library': '媒体库设置',
  'global.settings.i18n': '国际化',
  'global.community': '社区',
  'global.community.contributors': '贡献者',

  // === 字段类型 ===
  'content-type-builder.attributes.contentType': '内容类型',

  // === 枚举值中文标签 ===
  'equipment.category.mobile': '移动破碎',
  'equipment.category.crushing': '破碎设备',
  'equipment.category.screening': '筛分设备',
  'equipment.category.washing': '洗选设备',
  'equipment.category.parts': '配件',

  // === Content Manager 列表操作 ===
  'content-manager.containers.List.published': '已发布',
  'content-manager.containers.List.draft': '草稿',
  'content-manager.containers.List.edit': '编辑',
  'content-manager.containers.List.delete': '删除',
  'content-manager.containers.List.clone': '复制',

  // === Settings 页面 ===
  'Settings.application.header': '应用信息',
  'Settings.application.title': '应用',
  'Settings.application.description': '查看并修改您的 Strapi 应用信息。',
  'Settings.application.info': '信息',
  'Settings.application.detail': '详情',
  'Settings.application.version': 'Strapi 版本',
  'Settings.application.node-version': '节点版本',
  'Settings.application.community': '社区',
  'Settings.project-type.header': '项目类型',
  'settings.application.menu': '应用信息',
  'settings.application.logo': '菜单 logo',
  'settings.application.auth-logo': '认证 logo',
  'settings.application.customisations': '定制',
  'settings.application.customisations.title': '菜单 logo',
  'settings.application.auth-logo.title': '认证 logo',
};
