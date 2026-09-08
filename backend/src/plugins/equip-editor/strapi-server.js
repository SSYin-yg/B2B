'use strict';

/**
 * equip-editor 插件（服务端）
 *
 * 注册自定义字段 plugin::equip-editor.model-tables（底层类型 JSON），
 * 与 src/plugins/equip-editor/admin 中注册的同名可视化输入组件配对：
 * 管理员在后台看到的是表格网格编辑器，数据以 JSON 结构存储，
 * 形状与原 equip.model-table 组件完全一致（title/columns/rows/notes），
 * 因此 build-pages.js 的归一化逻辑可继续复用。
 */
module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: 'model-tables',
      plugin: 'equip-editor',
      type: 'json',
    });
  },
};
