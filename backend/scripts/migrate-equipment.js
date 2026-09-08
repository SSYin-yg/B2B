'use strict';

/**
 * 一次性数据迁移脚本：equipment-data.js + model-tables.js → Strapi Equipment
 *
 * - 数据源：D:\B2B\assets\equipment-data.js（31 台设备）+ assets\model-tables.js（16 台参数表）
 * - 幂等：按 slug 做 upsert，可重复执行，不会产生重复数据
 * - 运行：cd backend && npm run migrate
 *
 * 输出：读取数量 / 成功 / 新增 / 更新 / 失败（含原因），并校验 Strapi 中总数是否为 31。
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createStrapi } = require('@strapi/core');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(BACKEND_ROOT, '..'); // 站点根目录 D:\B2B

/* Strapi 5 程序化启动不加载 .env，这里手动加载（不覆盖已有环境变量） */
function loadEnvFile(appDir) {
  const envPath = path.join(appDir, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}

/* equipment-data.js / model-tables.js 是浏览器全局脚本（window.X = ...），用 vm 沙箱执行提取 */
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

function buildEntry(item, modelTables) {
  return {
    slug: item.id,
    name_cn: item.cn || '',
    name_en: item.en || '',
    category: item.type,
    images: asArray(item.images),
    desc_zh: item.desc_zh || '',
    desc_en: item.desc_en || '',
    features_zh: asArray(item.features_zh),
    features_en: asArray(item.features_en),
    specs: asArray(item.specs),
    model_tables: asArray(modelTables),
    seo_title_zh: item.cn ? `${item.cn} | 矿联矿机` : '',
    seo_title_en: item.en ? `${item.en} | Minelink Equipment` : '',
    seo_description_zh: item.desc_zh || '',
    seo_description_en: item.desc_en || '',
    og_image: asArray(item.images)[0] || '',
  };
}

async function main() {
  console.log('== 设备数据迁移开始 ==');
  console.log(`项目根目录: ${PROJECT_ROOT}`);

  const equipmentWin = loadWindowGlobal(path.join('assets', 'equipment-data.js'));
  const tablesWin = loadWindowGlobal(path.join('assets', 'model-tables.js'));
  const devices = asArray(equipmentWin.MinelinkEquipment);
  const tables = tablesWin.MinelinkModelTables || {};
  console.log(`读取设备: ${devices.length} 台；含参数表设备: ${Object.keys(tables).length} 台`);

  loadEnvFile(BACKEND_ROOT);
  const strapi = await createStrapi({ appDir: BACKEND_ROOT }).load();

  let ok = 0;
  let created = 0;
  let updated = 0;
  let failed = 0;
  const failures = [];

  for (const item of devices) {
    try {
      const entryData = buildEntry(item, tables[item.id]);
      const found = await strapi.documents('api::equipment.equipment').findFirst({
        filters: { slug: { $eq: item.id } },
      });
      if (found) {
        await strapi.documents('api::equipment.equipment').update({
          documentId: found.documentId,
          data: entryData,
          status: 'published',
        });
        updated++;
      } else {
        await strapi.documents('api::equipment.equipment').create({
          data: entryData,
          status: 'published',
        });
        created++;
      }
      ok++;
    } catch (err) {
      failed++;
      failures.push(`${item.id || item.cn || '未知设备'}: ${err && err.message ? err.message : err}`);
    }
  }

  /* 数量校验 */
  let total = -1;
  try {
    total = await strapi.documents('api::equipment.equipment').count({});
  } catch (err) {
    console.error('总数查询失败: ' + (err && err.message ? err.message : err));
  }

  console.log('== 迁移结果 ==');
  console.log(`读取: ${devices.length} | 成功: ${ok}（新增 ${created} / 更新 ${updated}）| 失败: ${failed}`);
  failures.forEach((f) => console.log('  失败 -> ' + f));
  console.log(`Strapi 中 Equipment 总数: ${total}（期望 ${devices.length}）`);

  await strapi.destroy();

  if (failed > 0 || total !== devices.length) {
    console.error('!! 迁移未完全通过，请根据失败原因修复后重新运行（脚本幂等可重复执行）');
    process.exitCode = 1;
  } else {
    console.log('✔ 迁移完成且数量校验通过');
  }
}

main().catch((err) => {
  console.error('迁移脚本异常: ' + (err && err.stack ? err.stack : err));
  process.exitCode = 1;
});
