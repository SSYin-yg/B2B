'use strict';

/**
 * model_tables（equip.model-table 组件）→ model_tables_grid（JSON customField）迁移脚本
 *
 * 背景：型号参数表从「组件 + 原生嵌套手风琴 UI」改为「自定义可视化网格编辑器」。
 * 新字段 model_tables_grid 为 JSON（形状与组件数据完全一致），由
 * plugin::equip-editor.model-tables 可视化编辑器读写。
 *
 * 安全策略：
 *   1. 幂等：已迁移（grid 非空）的设备自动跳过；迁移标记记录到 .tmp/
 *   2. 双状态：draft 与 published 两个版本都写入相同数据
 *   3. 冲突保护：若某设备 draft 与 published 的 model_tables 不一致
 *      （后台有未发布修改），跳过该设备并告警，绝不覆盖发布版
 *   4. 只读组件数据，不删除任何旧数据（旧字段由后续手动移除 Schema）
 *
 * 用法：
 *   cd backend && node scripts/migrate-model-tables-grid.js
 *   node scripts/migrate-model-tables-grid.js --slug=belt-conveyor
 *   node scripts/migrate-model-tables-grid.js --force   # 忽略迁移标记重跑（仍受字段级保护）
 */

const fs = require('fs');
const path = require('path');
const { createStrapi } = require('@strapi/core');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const MARKER_FILE = path.join(BACKEND_ROOT, '.tmp', 'model-tables-grid-migrated.json');

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

function loadMarker() {
  try {
    return JSON.parse(fs.readFileSync(MARKER_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveMarker(marker) {
  fs.mkdirSync(path.dirname(MARKER_FILE), { recursive: true });
  fs.writeFileSync(MARKER_FILE, JSON.stringify(marker, null, 2), 'utf8');
}

function str(v) {
  return v === null || v === undefined ? '' : String(v);
}

/** 深度剥离 id 字段：draft 与 published 的组件是独立数据库行，内部 id 必然不同，比较内容时需剔除 */
function stripIds(v) {
  if (Array.isArray(v)) return v.map(stripIds);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (k === 'id' || k === 'documentId' || k === 'strapi_parent' || k === 'strapi_component') continue;
      out[k] = stripIds(val);
    }
    return out;
  }
  return v;
}

/** 组件数据 → 网格编辑器 JSON（形状一致，仅做规整与深拷贝） */
function convertTable(t) {
  return {
    title_zh: str(t && t.title_zh).trim(),
    title_en: str(t && t.title_en).trim(),
    columns: (Array.isArray(t && t.columns) ? t.columns : []).map((c) => ({
      name_zh: str(c && c.name_zh).trim(),
      name_en: str(c && c.name_en).trim(),
    })),
    rows: (Array.isArray(t && t.rows) ? t.rows : []).map((r) => ({
      cells: (r && Array.isArray(r.cells) ? r.cells : []).map((c) => ({
        value_zh: str(c && c.value_zh),
        value_en: str(c && c.value_en),
      })),
    })),
    notes: (Array.isArray(t && t.notes) ? t.notes : []).map((n) => ({
      text_zh: str(n && n.text_zh),
      text_en: str(n && n.text_en),
    })),
  };
}

const POPULATE = {
  model_tables: { populate: { columns: true, rows: { populate: { cells: true } }, notes: true } },
};

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const slugArg = args.find((a) => a.startsWith('--slug='));
  const onlySlug = slugArg ? slugArg.split('=')[1] : null;

  loadEnvFile(BACKEND_ROOT);
  const marker = force ? {} : loadMarker();

  console.log('== model_tables 组件 → model_tables_grid 迁移 ==');
  const strapi = await createStrapi({ appDir: BACKEND_ROOT }).load();
  const docs = strapi.documents('api::equipment.equipment');

  /* 1. 取全部设备（draft），取 slug + documentId + published 状态 */
  const all = await docs.findMany({ limit: 500 });
  const targets = onlySlug ? all.filter((e) => e.slug === onlySlug) : all;
  console.log(`设备总数: ${all.length}，本次处理: ${targets.length}${onlySlug ? `（slug=${onlySlug}）` : ''}`);

  let migrated = 0;
  let skipped = 0;
  let conflicted = 0;
  const failures = [];

  for (const e of targets) {
    const slug = e.slug;
    try {
      if (!force && marker[e.documentId]) {
        skipped++;
        console.log(`  跳过（已迁移）: ${slug}`);
        continue;
      }

      /* 2. 分别读取 draft 与 published 的组件数据 */
      const draft = await docs.findFirst({
        filters: { slug: { $eq: slug } },
        status: 'draft',
        populate: POPULATE,
      });
      const published = await docs.findFirst({
        filters: { slug: { $eq: slug } },
        status: 'published',
        populate: POPULATE,
      });
      if (!draft) {
        skipped++;
        continue;
      }

      const draftTables = Array.isArray(draft.model_tables) ? draft.model_tables : [];
      const pubTables = published && Array.isArray(published.model_tables) ? published.model_tables : [];

      /* 3. 冲突保护：draft 与 published 内容不一致时跳过（剔除内部 id 后比较） */
      if (draftTables.length && pubTables.length && JSON.stringify(stripIds(draftTables)) !== JSON.stringify(stripIds(pubTables))) {
        conflicted++;
        console.warn(`  !! 冲突（draft 与 published 的型号参数表不一致，请先在后台统一后重跑）: ${slug}`);
        failures.push(`${slug}: draft/published 数据不一致`);
        continue;
      }

      const source = draftTables.length ? draftTables : pubTables;
      if (!source.length) {
        skipped++;
        marker[e.documentId] = { slug, migratedAt: new Date().toISOString(), note: 'no-tables' };
        saveMarker(marker);
        continue;
      }

      const grid = source.map(convertTable);

      /* 4. 字段级保护：grid 已有数据则跳过（后台可能已人工编辑） */
      const draftGrid = Array.isArray(draft.model_tables_grid) ? draft.model_tables_grid : [];
      const pubGrid = published && Array.isArray(published.model_tables_grid) ? published.model_tables_grid : [];
      if (draftGrid.length || pubGrid.length) {
        const same = JSON.stringify(draftGrid) === JSON.stringify(grid) && JSON.stringify(pubGrid) === JSON.stringify(grid);
        if (same) {
          skipped++;
          marker[e.documentId] = { slug, migratedAt: new Date().toISOString() };
          saveMarker(marker);
          console.log(`  跳过（grid 数据已一致）: ${slug}`);
        } else {
          skipped++;
          console.warn(`  !! 跳过（grid 已有不同数据，视为人工修改，不覆盖）: ${slug}`);
          failures.push(`${slug}: grid 已有人工数据`);
        }
        continue;
      }

      /* 5. 双状态写入 */
      await docs.update({ documentId: e.documentId, data: { model_tables_grid: grid }, status: 'draft' });
      if (published) {
        await docs.update({ documentId: e.documentId, data: { model_tables_grid: grid }, status: 'published' });
      }

      migrated++;
      marker[e.documentId] = { slug, migratedAt: new Date().toISOString() };
      saveMarker(marker);
      console.log(
        `  ✔ ${slug}: ${grid.length} 张表（行 ${grid.map((t) => t.rows.length).join('/')}，备注 ${grid
          .map((t) => t.notes.length)
          .join('/')}）`
      );
    } catch (err) {
      failures.push(`${slug}: ${err.message}`);
      console.error(`  !! 失败: ${slug} -> ${err.message}`);
    }
  }

  console.log('');
  console.log(`== 迁移完成：成功 ${migrated}，跳过 ${skipped}，冲突 ${conflicted}，失败 ${failures.length} ==`);
  if (failures.length) {
    console.log('失败/冲突明细：');
    failures.forEach((f) => console.log('  - ' + f));
  }

  try {
    await strapi.destroy();
  } catch (e) {
    /* 忽略关闭异常 */
  }
  if (failures.length) process.exitCode = 2;
}

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
