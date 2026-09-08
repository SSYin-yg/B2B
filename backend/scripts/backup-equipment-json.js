'use strict';

/**
 * Equipment JSON 字段备份脚本（一次性迁移前置保障）
 *
 * 背景：features_zh / features_en / specs / model_tables 由 JSON 字段改为
 * 可视化 Component 字段。Strapi 启动时 DB schema 同步会移除旧 JSON 列，
 * 因此必须在启用新 Schema 之前把原始 JSON 数据落盘备份。
 *
 * 支持 SQLite（better-sqlite3）与 PostgreSQL（pg），按 .env 的 DATABASE_CLIENT 自动选择。
 * 不启动 Strapi（旧 Schema 下 4 个字段仍是 JSON 列）。
 * 每台设备按 documentId 聚合 draft / published 两个版本。
 *
 * 输出：backend/backups/equipment-json-<时间戳>.json
 * 运行：cd backend && node scripts/backup-equipment-json.js
 */

const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(BACKEND_ROOT, 'backups');

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

function parseJsonField(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'object') return raw; /* pg JSONB 直接返回对象 */
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { __unparsed: String(raw) };
  }
}

const SELECT_SQL =
  'SELECT id, document_id, slug, published_at, features_zh, features_en, specs, model_tables FROM equipments ORDER BY slug, id';

async function readRowsSqlite() {
  const Database = require('better-sqlite3');
  const DB_PATH = path.join(BACKEND_ROOT, process.env.DATABASE_FILENAME || '.tmp/data.db');
  if (!fs.existsSync(DB_PATH)) {
    console.error('!! 未找到 SQLite 数据库: ' + DB_PATH);
    process.exit(1);
  }
  const db = new Database(DB_PATH, { readonly: true });
  const rows = db.prepare(SELECT_SQL).all().map((r) => ({ ...r, document_id: String(r.document_id) }));
  db.close();
  return { rows, source: DB_PATH };
}

async function readRowsPostgres() {
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  try {
    const res = await pool.query(SELECT_SQL);
    return {
      rows: res.rows.map((r) => ({ ...r, document_id: String(r.document_id) })),
      source: `postgres://${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`,
    };
  } finally {
    try {
      await pool.end();
    } catch (e) {
      /* 连接关闭失败不影响备份结果 */
    }
  }
}

async function main() {
  loadEnvFile(BACKEND_ROOT);
  const client = (process.env.DATABASE_CLIENT || 'sqlite').trim();
  const { rows, source } = client === 'postgres' ? await readRowsPostgres() : await readRowsSqlite();

  /* 按 documentId 聚合 draft / published */
  const docs = new Map();
  for (const r of rows) {
    const docId = r.document_id;
    if (!docs.has(docId)) {
      docs.set(docId, { documentId: docId, slug: r.slug, draft: null, published: null });
    }
    const doc = docs.get(docId);
    const version = {
      slug: r.slug,
      features_zh: parseJsonField(r.features_zh),
      features_en: parseJsonField(r.features_en),
      specs: parseJsonField(r.specs),
      model_tables: parseJsonField(r.model_tables),
    };
    if (r.published_at === null) doc.draft = version;
    else doc.published = version;
  }

  const payload = {
    backupAt: new Date().toISOString(),
    source: source,
    description: 'features_zh/features_en/specs/model_tables JSON 原始数据（改 Component 字段前备份）',
    documents: Array.from(docs.values()),
  };

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outFile = path.join(OUT_DIR, `equipment-json-${ts}.json`);
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8');

  /* 附加保险：SQLite 时整库文件快照 */
  let dbSnapshot = null;
  if (client !== 'postgres') {
    dbSnapshot = path.join(OUT_DIR, `data-db-snapshot-${ts}.db`);
    fs.copyFileSync(source, dbSnapshot);
  }

  /* 摘要 */
  let devCount = docs.size;
  let withFeatures = 0,
    withSpecs = 0,
    withTables = 0,
    rowsWithTables = 0;
  for (const d of docs.values()) {
    for (const v of [d.draft, d.published]) {
      if (!v) continue;
      const fz = Array.isArray(v.features_zh) ? v.features_zh.filter(Boolean).length : 0;
      const fe = Array.isArray(v.features_en) ? v.features_en.filter(Boolean).length : 0;
      const sp = Array.isArray(v.specs) ? v.specs.filter(Boolean).length : 0;
      const tb = Array.isArray(v.model_tables) ? v.model_tables.length : 0;
      if (fz || fe) withFeatures++;
      if (sp) withSpecs++;
      if (tb) {
        withTables++;
        rowsWithTables += tb;
      }
    }
  }
  console.log('== Equipment JSON 字段备份 ==');
  console.log(`数据库类型: ${client} | 行数: ${rows.length}（设备文档 ${devCount} 个）`);
  console.log(`含产品特点的版本: ${withFeatures} | 含规格参数的版本: ${withSpecs} | 含型号表的版本: ${withTables}（共 ${rowsWithTables} 张表）`);
  console.log('备份文件: ' + outFile);
  if (dbSnapshot) console.log('整库快照: ' + dbSnapshot);
}

main().catch((err) => {
  console.error('备份失败: ' + (err && err.stack ? err.stack : err));
  process.exit(1);
});
