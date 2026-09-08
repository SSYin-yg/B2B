'use strict';

/**
 * 长正文迁移脚本：equipment-data.js + model-tables.js → Equipment.content 动态区域
 *
 * 生成的正文块（Dynamic Zone / Components，后台全部可视化编辑）：
 *   H2 产品介绍          → Rich Text（desc_zh / desc_en，Blocks 富文本）
 *   H2 性能特点          → List（features_zh / features_en，✓ 列表）
 *   H2 规格表            → Spec Table × N（specs 键值表 + model-tables 型号表，含表头/行/备注）
 *
 * 用法：
 *   cd backend && npm run migrate-sections                       # 迁移全部（已有正文的设备跳过）
 *   npm run migrate-sections -- --slug=belt-conveyor             # 只迁移一台
 *   npm run migrate-sections -- --slug=belt-conveyor --force     # 覆盖已有正文
 *   npm run migrate-sections -- --slug=belt-conveyor --demo-images  # 追加测试用正文图片/图片组
 *
 * 幂等：默认跳过 content 非空的设备；--force 才重建。发布状态保持 published。
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createStrapi } = require('@strapi/core');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(BACKEND_ROOT, '..');

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

function loadWindowGlobal(relPath) {
  const file = path.join(PROJECT_ROOT, relPath);
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file });
  return sandbox.window;
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

/* 纯文本 → Strapi Blocks 富文本（按换行拆段落） */
function textBlocks(s) {
  const paras = String(s || '').split(/\n+/).map((t) => t.trim()).filter(Boolean);
  if (!paras.length) return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  return paras.map((t) => ({ type: 'paragraph', children: [{ type: 'text', text: t }] }));
}

const heading = (level, text_zh, text_en) => ({ __component: 'sec.heading', level, text_zh, text_en });
const richText = (zh, en) => ({ __component: 'sec.rich-text', body_zh: textBlocks(zh), body_en: textBlocks(en) });
const listBlock = (itemsZh, itemsEn) => ({
  __component: 'sec.list',
  variant: 'check',
  items: itemsZh.map((t, i) => ({ __component: 'sec.list-item', text_zh: t, text_en: itemsEn[i] || '' })),
});
const column = (name_zh, name_en) => ({ __component: 'sec.spec-column', name_zh: name_zh || '', name_en: name_en || '' });
const cell = (value_zh, value_en) => ({ __component: 'sec.spec-cell', value_zh: value_zh || '', value_en: value_en || value_zh || '' });
const row = (cells) => ({ __component: 'sec.spec-row', cells });

function specTableFromSpecs(specs) {
  return {
    __component: 'sec.spec-table',
    title_zh: '主要参数',
    title_en: 'Key Parameters',
    columns: [column('参数项', 'Item'), column('参数值', 'Value')],
    rows: specs.map((s) => row([cell(s.k_zh || '', s.k_en || ''), cell(s.v || '', s.v || '')])),
  };
}

function specTableFromModelTable(t) {
  return {
    __component: 'sec.spec-table',
    title_zh: t.title_zh || '',
    title_en: t.title_en || '',
    columns: asArray(t.columns).map((c) => column(c.zh, c.en)),
    rows: asArray(t.rows).map((r) => row(asArray(r).map((v) => cell(v, v)))),
  };
}

/* 组装一台设备的正文内容块 */
function buildContent(item, modelTables, mediaIds, demoImages) {
  const content = [];

  content.push(heading('h2', '产品介绍', 'Product Overview'));
  content.push(richText(item.desc_zh, item.desc_en));

  if (demoImages && mediaIds.length) {
    content.push({ __component: 'sec.image', image: mediaIds[0], alt_zh: item.cn || '', alt_en: item.en || '', caption_zh: item.cn || '', caption_en: item.en || '' });
    if (mediaIds.length > 1) {
      content.push(heading('h2', '设备图册', 'Equipment Gallery'));
      content.push({ __component: 'sec.gallery', images: mediaIds, caption_zh: item.cn || '', caption_en: item.en || '' });
    }
  }

  const featuresZh = asArray(item.features_zh);
  const featuresEn = asArray(item.features_en);
  if (featuresZh.length || featuresEn.length) {
    content.push(heading('h2', '性能特点', 'Key Features'));
    content.push(listBlock(featuresZh.length ? featuresZh : featuresEn, featuresEn.length ? featuresEn : featuresZh));
  }

  const specs = asArray(item.specs);
  const tables = asArray(modelTables);
  if (specs.length || tables.length) {
    content.push(heading('h2', '规格表', 'Specifications'));
    if (specs.length) content.push(specTableFromSpecs(specs));
    tables.forEach((t) => content.push(specTableFromModelTable(t)));
  }

  return content;
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const hit = args.find((a) => a.indexOf('--' + name + '=') === 0);
    return hit ? hit.split('=')[1] : null;
  };
  const onlySlug = getArg('slug');
  const force = args.includes('--force');
  const demoImages = args.includes('--demo-images');

  console.log('== 长正文迁移开始 ==');

  const equipmentWin = loadWindowGlobal(path.join('assets', 'equipment-data.js'));
  const tablesWin = loadWindowGlobal(path.join('assets', 'model-tables.js'));
  const devices = asArray(equipmentWin.MinelinkEquipment);
  const tables = tablesWin.MinelinkModelTables || {};
  const targets = onlySlug ? devices.filter((d) => d.id === onlySlug) : devices;
  console.log(`读取设备: ${devices.length} 台；本次处理: ${targets.length} 台（force=${force} demoImages=${demoImages}）`);
  if (onlySlug && !targets.length) {
    console.error('!! 未找到 slug=' + onlySlug + ' 的设备');
    process.exitCode = 1;
    return;
  }

  loadEnvFile(BACKEND_ROOT);
  const strapi = await createStrapi({ appDir: BACKEND_ROOT }).load();

  let ok = 0, skipped = 0, failed = 0;
  const failures = [];

  for (const item of targets) {
    try {
      const found = await strapi.documents('api::equipment.equipment').findFirst({
        filters: { slug: { $eq: item.id } },
        populate: { images: true, content: true },
      });
      if (!found) {
        failed++;
        failures.push(`${item.id}: Strapi 中不存在该设备，请先运行 npm run migrate`);
        continue;
      }
      const existing = asArray(found.content);
      if (existing.length && !force) {
        skipped++;
        console.log(`  跳过（已有正文 ${existing.length} 块）: ${item.id}`);
        continue;
      }

      const mediaIds = asArray(found.images).map((m) => m.id).filter(Boolean);
      const content = buildContent(item, tables[item.id], mediaIds, demoImages);

      await strapi.documents('api::equipment.equipment').update({
        documentId: found.documentId,
        data: { content },
        status: 'published',
      });
      ok++;
      console.log(`  已写入正文 ${content.length} 块: ${item.id}${demoImages ? '（含演示图片块）' : ''}`);
    } catch (err) {
      failed++;
      failures.push(`${item.id || '未知设备'}: ${err && err.message ? err.message : err}`);
    }
  }

  console.log('== 迁移结果 ==');
  console.log(`成功: ${ok} | 跳过: ${skipped} | 失败: ${failed}`);
  failures.forEach((f) => console.log('  失败 -> ' + f));

  /* pg 连接池销毁偶发 aborted 报错（数据已提交），不影响结果 */
  try {
    await strapi.destroy();
  } catch (e) {
    console.warn('关闭 Strapi 连接时出错（不影响已写入数据）: ' + (e && e.message ? e.message : e));
  }

  if (failed > 0) {
    console.error('!! 存在失败项，修复后可重复运行（脚本幂等）');
    process.exitCode = 1;
  } else {
    console.log('✔ 正文迁移完成');
  }
}

/* pg 连接池在 Strapi.destroy() 后偶发 'aborted' rejection（数据已提交，无害），
   吞掉该噪音并按实际迁移结果退出；其他 rejection 照常抛出 */
process.on('unhandledRejection', (err) => {
  const msg = String((err && err.message) || err);
  if (/aborted/.test(msg)) {
    process.exit(process.exitCode || 0);
  }
  throw err;
});

main().catch((err) => {
  console.error('迁移脚本异常: ' + (err && err.stack ? err.stack : err));
  process.exit(1);
});
