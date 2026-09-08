'use strict';

/**
 * Equipment 后台编辑界面配置脚本（幂等，可重复执行）
 *
 * 通过 content-manager Configuration 服务写入 core-store：
 *   1. 编辑页字段顺序（按"发布产品"的信息层级分组）
 *   2. 每个字段的中文标签 + 帮助说明（hints）
 *   3. 新组件（equip.feature / equip.spec / equip.model-table）及规格表备注等字段说明
 *
 * 注意：仅改后台显示布局与提示，不影响 API 字段名 / 数据 / 前台页面。
 * 若管理员在后台「配置视图」中手动调整过布局，重跑本脚本会覆盖为下面的预设顺序。
 *
 * 用法：cd backend && node scripts/configure-equipment-admin.js
 */

const fs = require('fs');
const path = require('path');
const { createStrapi } = require('@strapi/core');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const EQUIPMENT_UID = 'api::equipment.equipment';

/* 编辑页字段顺序（每行一个视觉分组；尺寸 6=半行 12=整行）
   对应：基本信息 → 产品图片 → 产品简介 → 产品特点 → 正文内容 → 主要参数 → 型号参数表 → SEO */
const EDIT_LAYOUT = [
  [{ name: 'slug', size: 6 }, { name: 'category', size: 6 }],
  [{ name: 'name_cn', size: 6 }, { name: 'name_en', size: 6 }],
  [{ name: 'images', size: 12 }],
  [{ name: 'desc_zh', size: 6 }, { name: 'desc_en', size: 6 }],
  [{ name: 'features_zh', size: 12 }],
  [{ name: 'features_en', size: 12 }],
  [{ name: 'content', size: 12 }],
  [{ name: 'specs', size: 12 }],
  [{ name: 'model_tables_grid', size: 12 }],
  [{ name: 'seo_title_zh', size: 6 }, { name: 'seo_title_en', size: 6 }],
  [{ name: 'seo_description_zh', size: 6 }, { name: 'seo_description_en', size: 6 }],
  [{ name: 'og_image', size: 12 }],
];

/* 设备字段：中文标签 + 帮助说明 */
const FIELD_META = {
  slug: { label: 'URL 标识', description: '用于生成设备页面 URL（equipment/{slug}.html），请勿随意修改。', placeholder: '例如 jaw-crusher' },
  name_cn: { label: '中文名称', description: '设备页面显示的中文产品名称。' },
  name_en: { label: '英文名称', description: '英文页面显示的产品名称。' },
  category: { label: '设备分类', description: '决定设备在目录页的归类与筛选。' },
  images: { label: '产品图片', description: '第一张为页面主图，其余为缩略图。支持上传、媒体库选择、替换与拖动排序。' },
  desc_zh: { label: '中文简介', description: '设备页顶部显示的中文简介。' },
  desc_en: { label: '英文简介', description: '英文页面顶部显示的简介。' },
  features_zh: { label: '中文产品特点', description: '中文页展示的产品特点列表：可添加、删除、修改、拖动排序。' },
  features_en: { label: '英文产品特点', description: '英文页展示的产品特点列表：可添加、删除、修改、拖动排序。' },
  content: { label: '正文内容', description: '长正文内容块（H2/H3 自动生成右侧目录）：标题 / 正文 / 图片 / 图片组 / 列表 / 规格表，可任意组合与排序。' },
  specs: { label: '主要参数', description: '参数名称 + 参数值列表：可添加、删除、修改、拖动排序。' },
  model_tables_grid: { label: '型号参数表', description: '可视化表格编辑器：可添加/删除行与列、修改表头与单元格、拖动行排序、添加备注，无需编辑 JSON。' },
  seo_title_zh: { label: 'SEO 标题（中文）', description: '用于搜索引擎结果标题，为空时使用设备名称。' },
  seo_title_en: { label: 'SEO 标题（英文）', description: '英文页搜索引擎结果标题，为空时使用英文名称。' },
  seo_description_zh: { label: 'SEO 描述（中文）', description: '用于搜索引擎 Description，为空时使用中文简介。' },
  seo_description_en: { label: 'SEO 描述（英文）', description: '英文页搜索引擎 Description，为空时使用英文简介。' },
  og_image: { label: 'OG 图片', description: '用于社交平台分享时显示的图片，为空时使用产品主图。' },
};

/* 组件内部字段：中文标签 + 帮助说明 */
const COMPONENT_META = {
  'equip.feature': {
    text: { label: '特点内容', description: '一条产品特点，例如：带宽与长度可定制。' },
  },
  'equip.spec': {
    k_zh: { label: '参数名称（中文）' },
    k_en: { label: '参数名称（英文）' },
    v: { label: '参数值', description: '例如：500–1400 mm。' },
  },
  'equip.model-table': {
    title_zh: { label: '表格标题（中文）' },
    title_en: { label: '表格标题（英文）' },
    columns: { label: '表头列', description: '可添加/删除列、修改列名、拖动排序。' },
    rows: { label: '参数行', description: '可添加/删除行，单元格按列顺序填写，支持拖动排序。' },
    notes: { label: '备注', description: '用于补充参数说明、适用条件或配置限制。' },
  },
  'sec.note': {
    text_zh: { label: '备注（中文）', description: '用于补充参数说明、适用条件或配置限制。' },
  },
  'sec.heading': {
    level: { label: '标题级别', description: 'H2 会自动进入页面右侧内容目录；H3 作为对应 H2 的子目录。' },
  },
  'sec.spec-row': {
    cells: { label: '单元格', description: '按表头列顺序逐个填写，数量应与列数一致。' },
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

/** 把字段元信息（label/description/placeholder）合并进现有配置的 metadatas */
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
    };
  }
  return out;
}

async function main() {
  console.log('== Equipment 后台编辑界面配置 ==');
  loadEnvFile(BACKEND_ROOT);
  const strapi = await createStrapi({ appDir: BACKEND_ROOT }).load();
  const cm = strapi.plugin('content-manager').service('content-types');

  /* 1. 设备内容类型：字段顺序 + 标签 + 帮助说明 */
  const contentType = cm.findContentType(EQUIPMENT_UID);
  if (!contentType) {
    console.error('!! 未找到内容类型 ' + EQUIPMENT_UID);
    process.exit(1);
  }
  const current = await cm.findConfiguration(contentType);
  const schemaFields = Object.keys(strapi.contentTypes[EQUIPMENT_UID].attributes);
  const layoutFields = EDIT_LAYOUT.flat().map((f) => f.name);
  const missing = layoutFields.filter((f) => !schemaFields.includes(f));
  if (missing.length) {
    console.error('!! 布局中包含 Schema 不存在的字段: ' + missing.join(', '));
    process.exit(1);
  }
  const ordered = EDIT_LAYOUT.flat().map((f) => f.name);
  const rest = schemaFields.filter((f) => !ordered.includes(f));
  if (rest.length) {
    console.warn('  提示: 以下 Schema 字段未纳入预设布局，将按默认尺寸追加到末尾: ' + rest.join(', '));
  }

  await cm.updateConfiguration(contentType, {
    settings: current.settings || {},
    metadatas: applyMetas(current.metadatas, FIELD_META),
    layouts: {
      list: (current.layouts && current.layouts.list && current.layouts.list.length) ? current.layouts.list : undefined,
      edit: EDIT_LAYOUT,
    },
  });
  console.log('✔ 设备编辑页布局与字段说明已写入');

  /* 2. 组件内部字段标签与说明 */
  for (const [uid, fieldMetas] of Object.entries(COMPONENT_META)) {
    const component = strapi.components[uid];
    if (!component) {
      console.warn('  跳过（组件不存在）: ' + uid);
      continue;
    }
    const compService = strapi.plugin('content-manager').service('components');
    const compCurrent = await compService.findConfiguration(component);
    await compService.updateConfiguration(component, {
      settings: compCurrent.settings || {},
      metadatas: applyMetas(compCurrent.metadatas, fieldMetas),
      layouts: compCurrent.layouts || {},
    });
    console.log('✔ 组件字段说明已写入: ' + uid);
  }

  try {
    await strapi.destroy();
  } catch (e) {
    console.warn('关闭 Strapi 连接时出错（配置已写入，不影响结果）: ' + (e && e.message ? e.message : e));
  }
  console.log('✔ 后台编辑界面配置完成（如已启动 Strapi，请刷新浏览器页面查看）');
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
