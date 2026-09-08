'use strict';

/**
 * 网站图片枚举值回滚脚本（一次性）
 *
 * 把 page / position / category 从中文翻译回英文（恢复 schema 兼容性）。
 * 配套：translate-website-image-enums.js
 *
 * 数据安全：仅更新三列；总数前后相等。
 */

const fs = require('fs');
const path = require('path');
const { Client } = require(path.join(process.cwd(), 'node_modules', 'pg'));

const PAGE_REVERSE = {
  '全局': 'global', '首页': 'home', '设备目录': 'catalog', '行业方案': 'solutions',
  '服务支持': 'support', '关于我们': 'about', '常见问题': 'faq', '联系页面': 'contact',
};
const POSITION_REVERSE = {
  '顶部 Banner': 'hero_banner', '页头背景': 'page_header', '行业方案区域': 'solutions_area',
  '侧边栏': 'sidebar', '产品区域': 'product_area', '页头': 'header', '页脚': 'footer',
  '社交分享图': 'social_share', '网站图标': 'favicon', '其他': 'other',
};
const CATEGORY_REVERSE = {
  'Banner': 'banner', '产品': 'product', '行业方案': 'solution', '关于我们': 'about',
  '服务支持': 'support', '公共资源': 'common', 'Logo': 'logo', '其他': 'other',
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
  const env = parseEnv(envPath);
  console.log('数据库: ' + env.DATABASE_CLIENT + ' / ' + env.DATABASE_NAME);

  const client = new Client({
    host: env.DATABASE_HOST, port: Number(env.DATABASE_PORT) || 5432,
    user: env.DATABASE_USERNAME, password: env.DATABASE_PASSWORD, database: env.DATABASE_NAME,
  });
  await client.connect();
  try {
    const { rows: cntRows } = await client.query('SELECT COUNT(*)::int AS total FROM website_images');
    const total = cntRows[0].total;
    console.log('当前 ' + total + ' 行');

    const { rows } = await client.query('SELECT id, page::text AS page, position::text AS position, category::text AS category FROM website_images ORDER BY id');
    let updated = 0;
    for (const r of rows) {
      const np = PAGE_REVERSE[r.page];
      const npos = POSITION_REVERSE[r.position];
      const nc = CATEGORY_REVERSE[r.category];
      const sets = [];
      const vals = [];
      let i = 1;
      if (np && np !== r.page) { sets.push('page = $' + i); vals.push(np); i++; }
      if (npos && npos !== r.position) { sets.push('position = $' + i); vals.push(npos); i++; }
      if (nc && nc !== r.category) { sets.push('category = $' + i); vals.push(nc); i++; }
      if (sets.length === 0) continue;
      sets.push('id = $' + i); vals.push(r.id);
      await client.query('UPDATE website_images SET ' + sets.join(', ') + ' WHERE ' + sets[sets.length - 1], vals);
      updated++;
      console.log('  ↻ #' + r.id + '  page:' + r.page + '→' + (np || r.page) + ', position:' + r.position + '→' + (npos || r.position) + ', category:' + r.category + '→' + (nc || r.category));
    }
    console.log('---');
    console.log('回滚: ' + updated);

    const { rows: cntAfter } = await client.query('SELECT COUNT(*)::int AS total FROM website_images');
    if (cntAfter[0].total !== total) throw new Error('总数校验失败：' + total + ' → ' + cntAfter[0].total);
    console.log('✔ 总数校验通过：' + cntAfter[0].total);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });