import React from 'react';

/**
 * equip-editor 插件（管理端）
 *
 * 注册 3 个自定义字段：
 * - model-tables : 型号参数表（多表格 + 备注，网格编辑，用于「产品参数」）
 * - plain-table  : 普通表格（单表格网格编辑，用于正文 Dynamic Zone 的 sec.table）
 * - section      : 编辑页分节标题（纯视觉分隔，不承载业务数据）
 *
 * 并注册一个「打开草稿预览」按钮到 Equipment 编辑页右侧 ENTRY 面板：
 * 通过 content-manager 的 apis.addDocumentAction 注入一个 DescriptionComponent
 * （函数，接收 EditViewContext props，返回 action 描述对象），点击后打开
 * webhook-listener 提供的自定义草稿预览 /preview/{slug}.html。
 *
 * 注意：Strapi 5 的 components.Input 必须是「动态导入 thunk」
 * （() => import(...)），useLazyComponents 会调用该函数并读取
 * 返回模块的 default 导出。直接传组件本身会被无参调用，
 * 导致 "Cannot destructure property 'name' of 't' as it is undefined"。
 */
export default {
  register(app) {
    app.customFields.register({
      name: 'model-tables',
      // Strapi 5 的 customFields.register 属性名是 pluginId（不是 plugin），
      // uid 生成规则为 `plugin::${pluginId}.${name}`
      pluginId: 'equip-editor',
      type: 'json',
      icon: () => React.createElement('span', null, '▦'),
      intlLabel: {
        id: 'equip-editor.model-tables.label',
        defaultMessage: '型号参数表（可视化编辑）',
      },
      intlDescription: {
        id: 'equip-editor.model-tables.description',
        defaultMessage: '可视化表格编辑器：表头列、数据行、备注，全部图形化操作，无需 JSON',
      },
      components: {
        Input: () => import('./components/ModelTablesInput'),
      },
    });

    app.customFields.register({
      name: 'plain-table',
      pluginId: 'equip-editor',
      type: 'json',
      icon: () => React.createElement('span', null, '▦'),
      intlLabel: {
        id: 'equip-editor.plain-table.label',
        defaultMessage: '普通表格（可视化编辑）',
      },
      intlDescription: {
        id: 'equip-editor.plain-table.description',
        defaultMessage: '通用表格网格编辑器：增删列、增删行、拖动排序、单元格直接编辑，无需 JSON',
      },
      components: {
        Input: () => import('./components/PlainTableInput'),
      },
    });

    app.customFields.register({
      name: 'section',
      pluginId: 'equip-editor',
      type: 'json',
      icon: () => React.createElement('span', null, '§'),
      intlLabel: {
        id: 'equip-editor.section.label',
        defaultMessage: '分节标题',
      },
      intlDescription: {
        id: 'equip-editor.section.description',
        defaultMessage: '编辑页视觉分节标题（如【基本信息】），不存储业务数据',
      },
      components: {
        Input: () => import('./components/SectionInput'),
      },
    });

    /* ========== 草稿预览按钮（Equipment 编辑页右侧 ENTRY 面板） ========== */
    // addDocumentAction 接收 DescriptionComponent 数组：每个元素是「函数」，
    // 接收 EditViewContext props，返回 action 描述对象（label/onClick/position 等）。
    // 非 equipment 内容类型返回 null（不渲染该按钮）。
    const cm = app.getPlugin('content-manager');
    if (cm && cm.apis && typeof cm.apis.addDocumentAction === 'function') {
      cm.apis.addDocumentAction([
        (props) => {
          const { model, documentId, document } = props || {};
          if (model !== 'api::equipment.equipment') {
            return null;
          }
          const slug = document && document.slug;
          // 无 slug 或尚未保存（无 documentId）时不显示
          if (!slug || !documentId) {
            return null;
          }

          // 语言：document 里若有 locale 字段则用，否则默认中文
          const locale = (document && document.locale) || 'zh';
          const langSegment = locale === 'en' ? 'en' : 'zh';

          return {
            label: '打开草稿预览',
            position: ['panel'],
            variant: 'secondary',
            onClick: () => {
              // 从 localStorage 取 admin JWT（Strapi 5 存为 JSON 字符串）
              let token = '';
              try {
                const raw = window.localStorage.getItem('jwtToken');
                token = raw ? JSON.parse(raw) : '';
              } catch (e) {
                token = '';
              }
              if (!token) {
                window.alert('未找到后台登录凭证，请刷新页面或重新登录后再预览。');
                return;
              }
              // 草稿预览 URL：走 nginx -> webhook-listener(1340) 的自定义草稿渲染
              const url =
                '/preview/' +
                langSegment +
                '/' +
                encodeURIComponent(slug) +
                '.html?doc=' +
                encodeURIComponent(documentId) +
                '&token=' +
                encodeURIComponent(token);
              window.open(url, '_blank');
            },
          };
        },
      ]);
    }
  },

  bootstrap() {},
};
