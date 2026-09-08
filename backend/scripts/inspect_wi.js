'use strict';
const path = require('path');
const { createStrapi } = require('@strapi/core');
const BACKEND_ROOT = '/var/www/B2B/backend';
const UID = 'api::website-image.website-image';

function loadEnvFile(appDir) {
  const fs = require('fs');
  const envPath = path.join(appDir, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}

async function main() {
  loadEnvFile(BACKEND_ROOT);
  const strapi = await createStrapi({ appDir: BACKEND_ROOT }).load();
  try {
    const svc = strapi.plugin('content-manager').service('content-types');
    const ct = svc.findContentType(UID);
    const cfg = await svc.findConfiguration(ct);
    console.log('=== layouts.list (RAW) ===');
    console.log(JSON.stringify(cfg.layouts ? cfg.layouts.list : null));
    console.log('=== settings ===');
    console.log(JSON.stringify(cfg.settings || {}));
    console.log('=== metadatas.list per field ===');
    const md = cfg.metadatas || {};
    for (const f of ['image', 'name', 'key', 'page', 'position', 'category', 'enabled', 'sort_order']) {
      console.log(f + ' => ' + JSON.stringify(md[f] ? md[f].list : undefined));
    }
    console.log('=== DATA (13 entries) ===');
    const rows = await strapi.db.query(UID).findMany({
      orderBy: { sort_order: 'asc' },
      populate: { image: true },
    });
    console.log('count=' + rows.length);
    for (const r of rows) {
      const img = r.image ? r.image.url : '(no image)';
      console.log([r.key, '|', r.name, '|', 'page=' + r.page, '|', 'pos=' + r.position, '|', 'cat=' + (r.category || '-'), '|', 'en=' + r.enabled, '|', 'sort=' + r.sort_order, '|', img].join(' '));
    }
  } finally {
    try { await strapi.destroy(); } catch (e) {}
  }
}
main().catch((e) => { console.error('ERR', e && e.stack ? e.stack : e); process.exit(1); });
