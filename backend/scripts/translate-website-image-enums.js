'use strict';

/**
 * 网站图片枚举值翻译脚本（一次性，pg 直写）
 *
 * 顺序：
 *   1) 本脚本把 13 行 page/position/category 英文枚举值改为中文（跳过 Strapi 校验）
 *   2) 替换 schema.json 的 enum 列表为中文
 *   3) 重启 Strapi
 *   4) 跑 configure-website-image-admin.js
 *
 * 数据安全：仅更新三列；总数前后相等（脚本末尾校验）。
 */

const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(process.cwd(), 'node_modules', 'pg'));

const PAGE_MAP = {
  global: '全局', home: '首页', catalog: '设备目录', solutions: '行业方案',
  support: '服务支持', about: '关于我们', faq: '常见问题', contact: '联系页面',
};
const POSITION_MAP = {
  hero_banner: '顶部 Banner', page_header: '页头背景', solutions_area: '行业方案区域',
  sidebar: '侧边栏', product_area: '产品区域', header: '页头', footer: '页脚',
  social_share: '社交分享图', favicon: '网站图标', other: '其他',
};
const CATEGORY_MAP = {
  banner: 'Banner', product: '产品', solution: '行业方案', about: '关于我们',
  support: '服务支持', common: '公共资源', logo: 'Logo', other: '其他',
};

function parseEnv(file) {
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

async function main() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) throw new Error('未找到 backend/.env');
  const env = parseEnv(envPath);
  console.log('数据库: ' + env.DATABASE_CLIENT + ' / ' + env.DATABASE_NAME + '@' + env.DATABASE_HOST + ':' + env.DATABASE_PORT);

  const client = new Client({
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT) || 5432,
    user: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  });
  await client.connect();
  try {
    const { rows: cntRows } = await client.query('SELECT COUNT(*)::int AS total FROM website_images');
    const total = cntRows[0].total;
    console.log('当前 ' + total + ' 行 Website Image');
    if (total === 0) { console.log('无数据，退出'); return; }

    const { rows } = await client.query(
      'SELECT id, key, page::text AS page, position::text AS position, category::text AS category FROM website_images ORDER BY id'
    );

    let translated = 0;
    let unchanged = 0;
    const noMap = [];

    for (const r of rows) {
      const np = PAGE_MAP[r.page];
      const npos = POSITION_MAP[r.position];
      const nc = CATEGORY_MAP[r.category];
      if (!np && r.page && !PAGE_MAP[r.page]) noMap.push({ id: r.id, key: r.key, field: 'page', val: r.page });
      if (!npos && r.position && !POSITION_MAP[r.position]) noMap.push({ id: r.id, key: r.key, field: 'position', val: r.position });
      if (!nc && r.category && !CATEGORY_MAP[r.category]) noMap.push({ id: r.id, key: r.key, field: 'category', val: r.category });

      const sets = [];
      const vals = [];
      let i = 1;
      if (np && np !== r.page) { sets.push('page = $' + i); vals.push(np); i++; }
      if (npos && npos !== r.position) { sets.push('position = $' + i); vals.push(npos); i++; }
      if (nc && nc !== r.category) { sets.push('category = $' + i); vals.push(nc); i++; }
      if (sets.length === 0) { unchanged++; continue; }

      sets.push('id = $' + i); vals.push(r.id);
      await client.query('UPDATE website_images SET ' + sets.join(', ') + ' WHERE ' + sets[sets.length - 1], vals);
      translated++;
      console.log('  ✔ #' + r.id + ' (' + r.key + ')  page:' + r.page + '→' + (np || r.page) +
        ', position:' + r.position + '→' + (npos || r.position) +
        ', category:' + r.category + '→' + (nc || r.category));
    }

    console.log('---');
    console.log('翻译: ' + translated + ' | 无变化: ' + unchanged + ' | 缺映射: ' + noMap.length);
    if (noMap.length) { console.warn('⚠ 缺映射：'); console.table(noMap); }

    const { rows: cntAfter } = await client.query('SELECT COUNT(*)::int AS total FROM website_images');
    if (cntAfter[0].total !== total) throw new Error('总数校验失败：' + total + ' → ' + cntAfter[0].total);
    console.log('✔ 总数校验通过：' + cntAfter[0].total);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error('FATAL:', e.message); console.error(e.stack); process.exit(1); });