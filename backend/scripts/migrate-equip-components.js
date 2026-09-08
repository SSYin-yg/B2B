'use strict';

/**
 * Equipment JSON → 可视化 Component 迁移脚本（一次性、幂等）
 *
 * 背景：features_zh / features_en / specs / model_tables 已从 JSON 字段改为
 * 可视化 Component（equip.feature / equip.spec / equip.model-table）。
 * Strapi 启动新 Schema 后旧 JSON 列被移除，本脚本从备份文件读取原始数据，
 * 通过 Document Service 写入组件数据（draft 与 published 两个版本都写）。
 *
 * 数据来源：backend/backups/equipment-json-*.json（node scripts/backup-equipment-json.js 生成）
 *
 * 幂等策略：
 *   1. 每台设备迁移成功后记录到 .tmp/equip-components-migrated.json，重跑自动跳过
 *   2. 字段级保护：组件数据已非空的字段跳过，避免覆盖后台人工修改
 *
 * 用法：
 *   cd backend && node scripts/migrate-equip-components.js
 *   node scripts/migrate-equip-components.js --file=backups/equipment-json-xxx.json
 *   node scripts/migrate-equip-components.js --slug=belt-conveyor
 *   node scripts/migrate-equip-components.js --force   # 忽略迁移标记重跑
 */

const fs = require('fs');
const path = require('path');
const { createStrapi } = require('@strapi/core');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const BACKUP_DIR = path.join(BACKEND_ROOT, 'backups');
const MARKER_FILE = path.join(BACKEND_ROOT, '.tmp', 'equip-components-migrated.json');

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

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function str(v) {
  return v === null || v === undefined ? '' : String(v);
}

/* ---------- 旧 JSON → 组件数据转换 ---------- */

/** ["特点", ...] → [{ text: "特点" }, ...]（兼容已是组件形状的数据） */
function toFeatureComponents(value) {
  return asArray(value)
    .map((item) => {
      if (typeof item === 'string') return { text: item.trim() };
      if (item && typeof item === 'object') {
        const text = str(item.text || item.text_zh || item.text_en).trim();
        return text ? { text } : null;
      }
      return null;
    })
    .filter(Boolean);
}

/** [{ k_zh, k_en, v }, ...] → 同形状组件数据（过滤空行） */
function toSpecComponents(value) {
  return asArray(value)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const k_zh = str(item.k_zh).trim();
      const k_en = str(item.k_en).trim();
      const v = str(item.v).trim();
      if (!k_zh && !k_en && !v) return null;
      return { k_zh, k_en, v };
    })
    .filter(Boolean);
}

/**
 * 旧型号表 [{ title_zh, title_en, columns:[{zh,en}], rows:[[cell]], notes? }]
 * → 型号表组件 [{ title_zh, title_en, columns:[{name_zh,name_en}], rows:[{cells:[{value_zh,value_en}]}], notes:[{text_zh,text_en}] }]
 */
function toModelTableComponents(value) {
  return asArray(value)
    .map((t) => {
      if (!t || typeof t !== 'object') return null;
      const columns = asArray(t.columns)
        .map((c) => {
          if (typeof c === 'string') return { name_zh: c, name_en: '' };
          if (!c || typeof c !== 'object') return null;
          const name_zh = str(c.zh || c.name_zh).trim();
          const name_en = str(c.en || c.name_en).trim();
          if (!name_zh && !name_en) return null;
          return { name_zh, name_en };
        })
        .filter(Boolean);

      const rows = asArray(t.rows)
        .map((r) => {
          /* 旧行为数组 ["PS C80","800×510",...]；兼容对象形状 */
          let cells = [];
          if (Array.isArray(r)) {
            cells = r.map((cell) => ({ value_zh: str(cell).trim(), value_en: str(cell).trim() }));
          } else if (r && typeof r === 'object') {
            cells = asArray(r.cells).map((cell) => {
              if (typeof cell === 'string') return { value_zh: cell.trim(), value_en: cell.trim() };
              const v_zh = str(cell && cell.value_zh).trim();
              const v_en = str(cell && (cell.value_en || cell.value_zh)).trim();
              return { value_zh: v_zh, value_en: v_en };
            });
          }
          cells = cells.filter((c) => c.value_zh || c.value_en);
          return cells.length ? { cells } : null;
        })
        .filter(Boolean);

      const notes = asArray(t.notes)
        .map((n) => {
          if (typeof n === 'string') return { text_zh: n.trim(), text_en: '' };
          if (!n || typeof n !== 'object') return null;
          const text_zh = str(n.zh || n.text_zh).trim();
          const text_en = str(n.en || n.text_en).trim();
          return text_zh || text_en ? { text_zh, text_en } : null;
        })
        .filter(Boolean);

      const title_zh = str(t.title_zh).trim();
      const title_en = str(t.title_en).trim();
      if (!title_zh && !title_en && !columns.length && !rows.length) return null;

      return { title_zh, title_en, columns, rows, notes };
    })
    .filter(Boolean);
}

/* 组件数据是否已非空（字段级幂等保护） */
function hasComponentData(value) {
  return Array.isArray(value) && value.length > 0;
}

function findLatestBackup() {
  if (!fs.existsSync(BACKUP_DIR)) return null;
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => /^equipment-json-.*\.json$/.test(f))
    .sort();
  return files.length ? path.join(BACKUP_DIR, files[files.length - 1]) : null;
}

function loadMarker() {
  try {
    return JSON.parse(fs.readFileSync(MARKER_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveMarker(marker) {
  const dir = path.dirname(MARKER_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(MARKER_FILE, JSON.stringify(marker, null, 2), 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const hit = args.find((a) => a.indexOf('--' + name + '=') === 0);
    return hit ? hit.split('=')[1] : null;
  };
  const onlySlug = getArg('slug');
  const force = args.includes('--force');

  const backupFile = getArg('file') || findLatestBackup();
  if (!backupFile || !fs.existsSync(backupFile)) {
    console.error('!! 未找到备份文件，请先运行: node scripts/backup-equipment-json.js');
    process.exit(1);
  }
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  let docs = backup.documents || [];
  if (onlySlug) docs = docs.filter((d) => d.slug === onlySlug);
  if (!docs.length) {
    console.error('!! 备份中没有可迁移的设备数据');
    process.exit(1);
  }

  const marker = force ? {} : loadMarker();

  console.log('== Equipment JSON → 组件迁移 ==');
  console.log(`备份文件: ${backupFile}`);
  console.log(`本次处理: ${docs.length} 台设备（force=${force}）`);

  loadEnvFile(BACKEND_ROOT);
  const strapi = await createStrapi({ appDir: BACKEND_ROOT }).load();

  let created = 0,
    skipped = 0,
    failed = 0;
  const failures = [];

  for (const doc of docs) {
    try {
      if (!force && marker[doc.documentId]) {
        skipped++;
        console.log(`  跳过（已迁移）: ${doc.slug}`);
        continue;
      }

      const found = await strapi.documents('api::equipment.equipment').findFirst({
        filters: { slug: { $eq: doc.slug } },
        populate: {
          features_zh: true,
          features_en: true,
          specs: true,
          model_tables: { populate: { columns: true, rows: { populate: { cells: true } }, notes: true } },
        },
      });
      if (!found) {
        failed++;
        failures.push(`${doc.slug}: Strapi 中不存在该设备`);
        continue;
      }

      /* 组装待写入数据：仅写入当前为空的字段（字段级保护，不覆盖人工修改） */
      const data = {};
      let changed = 0;
      const legacyFeaturesZh = toFeatureComponents(doc.draft && doc.draft.features_zh);
      const legacyFeaturesEn = toFeatureComponents(doc.draft && doc.draft.features_en);
      const legacySpecs = toSpecComponents(doc.draft && doc.draft.specs);
      const legacyTables = toModelTableComponents(doc.draft && doc.draft.model_tables);

      if (!hasComponentData(found.features_zh) && legacyFeaturesZh.length) {
        data.features_zh = legacyFeaturesZh;
        changed++;
      }
      if (!hasComponentData(found.features_en) && legacyFeaturesEn.length) {
        data.features_en = legacyFeaturesEn;
        changed++;
      }
      if (!hasComponentData(found.specs) && legacySpecs.length) {
        data.specs = legacySpecs;
        changed++;
      }
      if (!hasComponentData(found.model_tables) && legacyTables.length) {
        data.model_tables = legacyTables;
        changed++;
      }

      if (!changed) {
        skipped++;
        console.log(`  跳过（组件数据已存在，无需迁移）: ${doc.slug}`);
        marker[doc.documentId] = { slug: doc.slug, migratedAt: new Date().toISOString() };
        saveMarker(marker);
        continue;
      }

      /* 先写草稿，再同步到发布版本（两者都保留迁移结果，避免后台草稿回退覆盖） */
      await strapi.documents('api::equipment.equipment').update({
        documentId: found.documentId,
        data,
        status: 'draft',
      });
      if (doc.published) {
        await strapi.documents('api::equipment.equipment').update({
          documentId: found.documentId,
          data,
          status: 'published',
        });
      }

      created++;
      const parts = [];
      if (data.features_zh) parts.push(`中文特点${data.features_zh.length}条`);
      if (data.features_en) parts.push(`英文特点${data.features_en.length}条`);
      if (data.specs) parts.push(`主要参数${data.specs.length}条`);
      if (data.model_tables) parts.push(`型号表${data.model_tables.length}张`);
      console.log(`  已迁移: ${doc.slug}（${parts.join(' + ')}）`);

      marker[found.documentId] = { slug: doc.slug, migratedAt: new Date().toISOString() };
      saveMarker(marker);
    } catch (err) {
      failed++;
      failures.push(`${doc.slug || '未知设备'}: ${err && err.message ? err.message : err}`);
    }
  }

  console.log('== 迁移结果 ==');
  console.log(`成功: ${created} | 跳过: ${skipped} | 失败: ${failed}`);
  failures.forEach((f) => console.log('  失败 -> ' + f));

  try {
    await strapi.destroy();
  } catch (e) {
    console.warn('关闭 Strapi 连接时出错（不影响已写入数据）: ' + (e && e.message ? e.message : e));
  }

  if (failed > 0) {
    console.error('!! 存在失败项，修复后可重复运行（脚本幂等）');
    process.exitCode = 1;
  } else {
    console.log('✔ 组件迁移完成');
  }
}

/* pg/sqlite 连接在 Strapi.destroy() 后偶发 'aborted' rejection（数据已提交，无害） */
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
