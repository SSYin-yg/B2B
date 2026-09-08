'use strict';

/**
 * 网站图片（Website Image）后台界面配置脚本（幂等，可重复执行）
 *
 * 通过 content-manager Configuration 服务写入 core-store：
 *   1. 列表页：显示缩略图 / 名称 / 页面 / 位置 / 分类 / 状态 / 排序，并设为可排序、可筛选
 *   2. 编辑页：字段顺序按「这张图在哪 → 换哪张图 → 图说信息」分组
 *   3. 每个字段的中文标签 + 帮助说明（hints）—— 运营人员看不到 documentId / JSON / API 名
 *
 * 注意：仅改后台显示布局与提示，不影响 API 字段名 / 数据 / 前台页面。
 *
 * 用法：cd backend && node scripts/configure-website-image-admin.js
 */

const fs = require('fs');
const path = require('path');
const { createStrapi } = require('@strapi/core');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const UID = 'api::website-image.website-image';

/* 编辑页字段顺序（每行一个视觉分组；尺寸 6=半行 12=整行）
   对应：这张图用在哪 → 换哪张图 → 图说信息 → 启用与排序 */
const EDIT_LAYOUT = [
  [{ name: 'name', size: 12 }],
  [{ name: 'page', size: 6 }, { name: 'position', size: 6 }],
  [{ name: 'category', size: 6 }, { name: 'key', size: 6 }],
  [{ name: 'image', size: 12 }],
  [{ name: 'alt', size: 12 }],
  [{ name: 'caption', size: 12 }],
  [{ name: 'description', size: 12 }],
  [{ name: 'enabled', size: 6 }, { name: 'sort_order', size: 6 }],
];

/* 列表页字段顺序：让运营一眼看到「缩略图 + 名称 + 用在哪 + 状态」。
   Strapi 5 Content Manager 的 layouts.list 必须是「字段 UID 字符串数组」，
   不能用 {name,size} 对象（那是编辑页 layouts.edit 的语法）。 */
const LIST_LAYOUT = [
  'image', // 缩略图（媒体字段原生渲染为小图，点击行可进详情预览大图）
  'name', // 图片名称（运营主识别信息）
  'page', // 所属页面（枚举，自动显示中文 enumNames）
  'position', // 使用位置（枚举，自动显示中文 enumNames）
  'category', // 图片分类（枚举，自动显示中文 enumNames）
  'enabled', // 启用状态（布尔，列表显示开/关开关）
  'sort_order', // 排序
  'key', // 标识 key（系统字段，放最后，视觉优先级最低）
];

/* 字段：中文标签 + 帮助说明 */
const FIELD_META = {
  name: {
    label: '图片名称',
    description: '运营人员识别用的名称，例如「首页 Banner 1」。仅后台显示，不会出现在网站上。',
    placeholder: '例如 首页 Banner 1',
  },
  key: {
    label: '标识 key',
    description: '系统用来定位这张图片的编号，前端页面按它取图。禁止修改，修改后网站对应位置将取不到图片。',
    placeholder: '例如 home_hero_1',
  },
  page: { label: '所属页面', description: '这张图片用在哪个页面。用于后台筛选。' },
  position: { label: '使用位置', description: '这张图片在页面中的具体位置，例如「顶部 Banner」。用于后台筛选。' },
  category: { label: '图片分类', description: '便于归类筛选，不影响页面显示。' },
  image: {
    label: '图片',
    description: '点击可更换图片：支持从媒体库选择已有图片，或上传新图片（JPG / PNG / WebP / SVG）。更换图片不会删除旧图片，旧图仍保留在媒体库中。',
  },
  alt: {
    label: '替代文字 ALT',
    description: '用于图片无障碍访问及 SEO。图片无法显示时，屏幕阅读器与搜索引擎会读到这段文字。建议用英文简要描述图片内容。',
    placeholder: '例如 Industrial mining equipment',
  },
  caption: {
    label: '图片说明',
    description: '图片的文字说明，可留空。用于后台备注图片内容，例如「矿山破碎生产线现场」。',
    placeholder: '选填',
  },
  description: {
    label: '用途说明',
    description: '记录这张图的使用位置、建议尺寸与注意事项，方便团队其他人接手维护。仅后台可见。',
  },
  enabled: {
    label: '启用',
    description: '关闭后该位置不再使用这张图片，页面会回退到原有默认样式（不会出现裂图）。确认图片正确后再关闭。',
  },
  sort_order: {
    label: '排序',
    description: '同一位置内多张图片的显示顺序，数字越小越靠前。例如首页三张 Banner 按 10 / 20 / 30 排列。',
  },
};

function loadEnvFile(appDir) {
  const envPath = path.join(appDir, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}

function applyMetas(metadatas, fieldMetas) {
  const out = { ...metadatas };
  for (const [field, meta] of Object.entries(fieldMetas)) {
    const cur = out[field] && typeof out[field] === 'object' ? out[field] : { edit: {}, list: {} };
    out[field] = {
      ...cur,
      edit: {
        ...cur.edit,
        label: meta.label !== undefined ? meta.label : cur.edit.label,
        description: meta.description !== undefined ? meta.description : cur.edit.description,
        placeholder: meta.placeholder !== undefined ? meta.placeholder : cur.edit.placeholder,
      },
      list: {
        ...cur.list,
        label: meta.label !== undefined ? meta.label : cur.list.label,
      },
    };
  }
  return out;
}

async function main() {
  console.log('== 网站图片后台界面配置 ==');
  loadEnvFile(BACKEND_ROOT);
  const strapi = await createStrapi({ appDir: BACKEND_ROOT }).load();

  try {
    /* 触发 content-manager 初始化，保证内容类型已注册 */
    await strapi.plugin('content-manager').service('content-types').findAllContentTypes();

    const contentType = strapi.plugin('content-manager').service('content-types').findContentType(UID);
    if (!contentType) {
      console.error('!! 未找到内容类型 ' + UID);
      console.error('   请确认已创建 backend/src/api/website-image/ 并重启 Strapi。');
      process.exit(1);
    }

    const svc = strapi.plugin('content-manager').service('content-types');
    const current = await svc.findConfiguration(contentType);
    const schemaFields = Object.keys(strapi.contentTypes[UID].attributes);
    const editFields = EDIT_LAYOUT.flat().map((f) => f.name);
    const listFields = LIST_LAYOUT.slice();
    const missingEdit = editFields.filter((f) => !schemaFields.includes(f));
    const missingList = listFields.filter((f) => !schemaFields.includes(f));
    if (missingEdit.length || missingList.length) {
      console.error('!! 布局中包含 Schema 不存在的字段: ' + [].concat(missingEdit, missingList).join(', '));
      process.exit(1);
    }

    /* 列表页：名称 / key / 页面 / 位置 / 分类 支持搜索（运营可输入名称、key、页面、位置检索） */
    const metadatas = applyMetas(current.metadatas || {}, FIELD_META);
    ['name', 'key', 'page', 'position', 'category'].forEach(function (f) {
      if (metadatas[f]) metadatas[f].list = { ...(metadatas[f].list || {}), searchable: true };
    });
    /* 名称 / key / 页面 / 位置 / 分类 / 启用 / 排序 支持排序与筛选 */
    ['name', 'key', 'page', 'position', 'category', 'enabled', 'sort_order'].forEach(function (f) {
      if (metadatas[f]) metadatas[f].list = { ...(metadatas[f].list || {}), sortable: true, filterable: true };
    });

    await svc.updateConfiguration(contentType, {
      settings: {
        ...(current.settings || {}),
        /* 列表页每页条数 + 默认排序，图片数量不多，一页看全更省事 */
        pageSize: 50,
        defaultSortBy: 'sort_order',
        defaultSortOrder: 'ASC',
        mainField: 'name',
      },
      metadatas: metadatas,
      layouts: {
        list: LIST_LAYOUT,
        edit: EDIT_LAYOUT,
      },
    });
    console.log('✔ 网站图片列表页与编辑页布局、字段说明已写入');
    console.log('  列表页：缩略图 / 名称 / 页面 / 位置 / 分类 / 启用 / 排序（可按页面、位置、分类、状态筛选）');
    console.log('  编辑页：图片名称 → 所属页面/使用位置 → 图片 → ALT → 说明 → 启用/排序');
  } finally {
    try {
      await strapi.destroy();
    } catch (e) {
      console.warn('关闭 Strapi 连接时出错（配置已写入，不影响结果）: ' + (e && e.message ? e.message : e));
    }
  }
  console.log('✔ 完成（如已启动 Strapi，请刷新浏览器页面查看）');
}

process.on('unhandledRejection', (err) => {
  const msg = String((err && err.message) || err);
  if (/aborted/.test(msg)) {
    process.exit(process.exitCode || 0);
  }
  throw err;
});

main().catch((err) => {
  console.error('配置脚本异常: ' + (err && err.stack ? err.stack : err));
  process.exit(1);
});
