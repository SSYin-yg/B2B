'use strict';

/**
 * 静态页面生成脚本（中英文双版本）
 * 数据源：Strapi API（Equipment 内容类型）
 * 输出：
 *   1. equipment/{slug}.html         —— 中文设备详情页（URL 保持不变）
 *   2. en/equipment/{slug}.html      —— 英文设备详情页（第二阶段新增）
 *   3. sitemap.xml                   —— 含中文 + 英文设备 URL
 *   4. assets/equipment-data.js     —— 由 Strapi 数据回写
 *   5. assets/model-tables.js       —— 由 Strapi 数据回写
 *
 * 运行：node scripts/build-pages.js [--api-base http://localhost:1337] [--prune]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT, 'equipment', '_template.html');
const EQUIPMENT_DIR = path.join(ROOT, 'equipment');
const EN_EQUIPMENT_DIR = path.join(ROOT, 'en', 'equipment');

/* ---------- 环境配置 ---------- */
function loadEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
    }
  }
}
loadEnvFile();

const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/+$/, '');
const SITE_URL = process.env.SITE_URL || 'https://ssyin-yg.github.io/B2B/';

/* ---------- CLI 参数 ---------- */
const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
}
const API_BASE = getArg('--api-base') || '';
const PRUNE = args.includes('--prune');

/* ---------- 工具 ---------- */
const typeZh = { mobile: '移动破碎站', crushing: '破碎制砂', screening: '筛分输送', washing: '洗砂设备', parts: '易损件' };
const typeEn = { mobile: 'Mobile crushing', crushing: 'Crushing & sand', screening: 'Screening & feed', washing: 'Sand washing', parts: 'Wear parts' };

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absUrl(relPath) {
  if (!relPath) return '';
  if (/^https?:\/\//.test(relPath)) return relPath;
  return SITE_URL.replace(/\/+$/, '') + '/' + String(relPath).replace(/^\/+/, '');
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

/** 图片路径前缀：中文页 ..  英文页 ../.. */
function prefixImg(src, rel) {
  if (!src) return src;
  if (/^https?:\/\//.test(src)) return src;
  return rel + '/' + src;
}

async function fetchEquipment() {
  const url = `${STRAPI_URL}/api/equipments?pagination[pageSize]=200&sort=slug:asc`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`获取设备数据失败: HTTP ${res.status}（请确认 Strapi 已启动：${STRAPI_URL}）`);
  }
  const json = await res.json();
  const list = (json && json.data) || [];
  return list.map((e) => (e && e.attributes ? { ...e.attributes, documentId: e.documentId } : e));
}

/* ---------- 静态产品区块 ---------- */
function imgTag(src, alt, rel) {
  var s = rel ? prefixImg(src, rel) : src;
  return '<img src="' + escapeHtml(s) + '" alt="' + escapeHtml(alt || '') + '" loading="lazy" onerror="this.style.display=\'none\';var p=this.nextElementSibling;if(p)p.style.display=\'grid\';" />';
}

function buildStaticHtml(entry, related, lang, rel) {
  var isEn = lang === 'en';
  var name = isEn ? (entry.name_en || entry.slug) : (entry.name_cn || entry.slug);
  var desc = isEn ? (entry.desc_en || '') : (entry.desc_zh || '');
  var features = asArray(isEn ? entry.features_en : entry.features_zh);
  var specs = asArray(entry.specs);
  var images = asArray(entry.images);
  var modelTables = asArray(entry.model_tables);
  var typeMap = isEn ? typeEn : typeZh;

  var mainImg = images[0] || '';
  var thumbs = images
    .map(function (src, i) {
      return '<button type="button" class="' + (i === 0 ? 'active' : '') + '" data-src="' + escapeHtml(src) + '">' +
        imgTag(src, name, rel) + '<span class="thumb-ph" style="display:none"></span></button>';
    })
    .join('');

  var featureHtml = features.map(function (f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('');
  var specsHtml = specs
    .map(function (s) { return '<tr><th>' + escapeHtml(isEn ? (s.k_en || '') : (s.k_zh || '')) + '</th><td>' + escapeHtml(s.v || '') + '</td></tr>'; })
    .join('');

  var modelTablesHtml = modelTables.length
    ? modelTables
        .map(function (t) {
          var head = (t.columns || []).map(function (c) { return '<th>' + escapeHtml(isEn ? (c.en || c.zh) : c.zh) + '</th>'; }).join('');
          var body = (t.rows || [])
            .map(function (row) { return '<tr>' + row.map(function (cell) { return '<td>' + escapeHtml(cell) + '</td>'; }).join('') + '</tr>'; })
            .join('');
          return (
            '<div class="model-table-wrap">' +
            '<div class="block-title">' + escapeHtml(isEn ? (t.title_en || t.title_zh || '') : (t.title_zh || '')) + '</div>' +
            '<div class="model-table-scroll"><table class="model-table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>' +
            '</div>'
          );
        })
        .join('')
    : '';

  var relatedTitle = isEn ? 'Related equipment' : '相关设备';
  var relatedHtml = related.length
    ? '<div class="related"><h2>' + escapeHtml(relatedTitle) + '</h2><div class="related-grid">' +
      related
        .map(function (p) {
          var pName = isEn ? (p.en || p.cn) : p.cn;
          var img = p.img ? imgTag(p.img, pName, rel) + '<span class="ph" style="display:none"></span>' : '<span class="ph"></span>';
          return (
            '<a class="related-card" href="' + encodeURIComponent(p.id) + '.html">' +
            '<div class="rc-art">' + img + '</div>' +
            '<div class="rc-body"><div class="rc-type">' + escapeHtml(typeMap[p.type] || '') + '</div><h3>' + escapeHtml(pName) + '</h3></div></a>'
          );
        })
        .join('') +
      '</div></div>'
    : '';

  var quoteText = isEn ? 'Get a quote' : '获取报价';
  var catLink = isEn ? 'More in this category' : '查看同类设备';
  var featTitle = isEn ? 'Highlights' : '产品特点';
  var specsTitle = isEn ? 'Key parameters' : '主要参数';
  var noteText = isEn
    ? 'Specifications are typical ranges. Final configuration depends on ore, capacity and site conditions. Request a quote for a tailored proposal.'
    : '以上参数为常见配置区间，最终方案需结合矿石、产能与场地条件确定。提交询价后顾问将为您出具专属配置。';

  return (
    '<div class="product-layout">' +
      '<div class="gallery">' +
        '<div class="gallery-main" id="galleryMain">' +
          (mainImg ? imgTag(mainImg, name, rel) + '<div class="placeholder" style="display:none">' + escapeHtml(entry.slug.toUpperCase().slice(0, 6)) + '</div>' : '<div class="placeholder">' + escapeHtml(entry.slug.toUpperCase().slice(0, 6)) + '</div>') +
        '</div>' +
        (thumbs ? '<div class="gallery-thumbs" id="galleryThumbs">' + thumbs + '</div>' : '') +
      '</div>' +
      '<div class="product-info">' +
        '<div class="product-type">' + escapeHtml(typeMap[entry.category] || entry.category || '') + '</div>' +
        '<h1 class="product-title">' + escapeHtml(name) + '</h1>' +
        '<p class="product-desc">' + escapeHtml(desc) + '</p>' +
        '<div class="product-actions">' +
          '<button type="button" class="primary open-modal" id="quoteThis">' + escapeHtml(quoteText) + '</button>' +
          '<a class="ghost" href="' + rel + '/equipment-catalog.html?filter=' + encodeURIComponent(entry.category || '') + '">' + escapeHtml(catLink) + '</a>' +
        '</div>' +
        (featureHtml ? '<div class="block-title">' + escapeHtml(featTitle) + '</div><ul class="feature-list">' + featureHtml + '</ul>' : '') +
        (specsHtml ? '<div class="block-title">' + escapeHtml(specsTitle) + '</div><table class="specs"><tbody>' + specsHtml + '</tbody></table>' : '') +
        '<p class="product-note">' + escapeHtml(noteText) + '</p>' +
      '</div>' +
    '</div>' +
    (modelTablesHtml ? '<div class="model-section">' + modelTablesHtml + '</div>' : '') +
    relatedHtml
  );
}

function buildProductJsonLd(entry, lang) {
  var isEn = lang === 'en';
  var name = isEn ? (entry.name_en || entry.slug) : (entry.name_cn || entry.slug);
  var desc = isEn ? (entry.desc_en || '') : (entry.desc_zh || '');
  var urlPath = isEn ? 'en/equipment/' + entry.slug + '.html' : 'equipment/' + entry.slug + '.html';
  var data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    image: asArray(entry.images).map(function (p) { return absUrl(p); }),
    description: desc,
    url: absUrl(urlPath),
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/* ---------- 单页生成 ---------- */
function renderPage(entry, related, template, lang) {
  var isEn = lang === 'en';
  var rel = isEn ? '../..' : '..';
  var name = isEn ? (entry.name_en || entry.slug) : (entry.name_cn || entry.slug);
  var seoTitle = isEn
    ? (entry.seo_title_en || name + ' | Minelink Equipment')
    : (entry.seo_title_zh || name + ' | 矿联矿机');
  var seoDescription = isEn
    ? (entry.seo_description_en || entry.desc_en || '')
    : (entry.seo_description_zh || entry.desc_zh || '');
  var urlPath = isEn ? 'en/equipment/' + entry.slug + '.html' : 'equipment/' + entry.slug + '.html';
  var canonical = absUrl(urlPath);
  var ogImage = absUrl(entry.og_image || asArray(entry.images)[0] || 'assets/og-cover.jpg');

  /* hreflang 互链（中英文指向一致） */
  var hreflangZh = absUrl('equipment/' + entry.slug + '.html');
  var hreflangEn = absUrl('en/equipment/' + entry.slug + '.html');

  var pageData = {
    product: {
      id: entry.slug,
      en: entry.name_en || '',
      cn: entry.name_cn || '',
      type: entry.category,
      images: asArray(entry.images),
      desc_zh: entry.desc_zh || '',
      desc_en: entry.desc_en || '',
      features_zh: asArray(entry.features_zh),
      features_en: asArray(entry.features_en),
      specs: asArray(entry.specs),
    },
    modelTables: asArray(entry.model_tables),
    related: related,
  };

  var apiBaseScript = API_BASE ? "window.MINELINK_API_BASE='" + API_BASE + "';" : '';
  var langAttr = isEn ? 'en' : 'zh-CN';
  var ogLocale = isEn ? 'en_US' : 'zh_CN';

  return template
    .replace(/\{\{LANG\}\}/g, langAttr)
    .replace(/\{\{REL\}\}/g, rel)
    .replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(seoTitle))
    .replace(/\{\{SEO_DESCRIPTION\}\}/g, escapeHtml(seoDescription))
    .replace(/\{\{CANONICAL\}\}/g, escapeHtml(canonical))
    .replace(/\{\{HREFLANG_ZH\}\}/g, escapeHtml(hreflangZh))
    .replace(/\{\{HREFLANG_EN\}\}/g, escapeHtml(hreflangEn))
    .replace(/\{\{OG_TITLE\}\}/g, escapeHtml(seoTitle))
    .replace(/\{\{OG_DESCRIPTION\}\}/g, escapeHtml(seoDescription))
    .replace(/\{\{OG_LOCALE\}\}/g, ogLocale)
    .replace(/\{\{OG_IMAGE\}\}/g, escapeHtml(ogImage))
    .replace(/\{\{PRODUCT_JSONLD\}\}/g, buildProductJsonLd(entry, lang))
    .replace(/\{\{NAME\}\}/g, escapeHtml(name))
    .replace(/\{\{STATIC_PRODUCT_HTML\}\}/g, buildStaticHtml(entry, related, lang, rel))
    .replace(/\{\{PAGE_DATA_JSON\}\}/g, JSON.stringify(pageData).replace(/</g, '\\u003c'))
    .replace(/\{\{API_BASE_SCRIPT\}\}/g, apiBaseScript)
    .replace(/\{\{SLUG\}\}/g, encodeURIComponent(entry.slug));
}

/* ---------- sitemap ---------- */
var STATIC_SITEMAP_ENTRIES = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: 'index.html', changefreq: 'weekly', priority: '1.0' },
  { path: 'equipment-catalog.html', changefreq: 'weekly', priority: '0.9' },
  { path: 'faq.html', changefreq: 'monthly', priority: '0.7' },
  { path: 'solutions.html', changefreq: 'monthly', priority: '0.8' },
  { path: 'support.html', changefreq: 'monthly', priority: '0.8' },
  { path: 'about.html', changefreq: 'monthly', priority: '0.8' },
];

function writeSitemap(entries) {
  var base = SITE_URL.replace(/\/+$/, '') + '/';
  var urls = [];
  for (var i = 0; i < STATIC_SITEMAP_ENTRIES.length; i++) {
    var s = STATIC_SITEMAP_ENTRIES[i];
    urls.push(
      '  <url>\n    <loc>' + escapeHtml(base + s.path) + '</loc>\n    <changefreq>' + s.changefreq + '</changefreq>\n    <priority>' + s.priority + '</priority>\n  </url>'
    );
  }
  for (var j = 0; j < entries.length; j++) {
    var e = entries[j];
    urls.push(
      '  <url><loc>' + escapeHtml(base + 'equipment/' + e.slug + '.html') + '</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>'
    );
    urls.push(
      '  <url><loc>' + escapeHtml(base + 'en/equipment/' + e.slug + '.html') + '</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>'
    );
  }
  var xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join('\n') +
    '\n</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
}

/* ---------- 数据文件回写 ---------- */
function writeDataFiles(entries) {
  var legacy = entries.map(function (e) {
    return {
      id: e.slug,
      en: e.name_en || '',
      cn: e.name_cn || '',
      type: e.category,
      images: asArray(e.images),
      desc_zh: e.desc_zh || '',
      desc_en: e.desc_en || '',
      features_zh: asArray(e.features_zh),
      features_en: asArray(e.features_en),
      specs: asArray(e.specs),
    };
  });

  var eqData =
    '/**\n * 设备数据中心（由 scripts/build-pages.js 从 Strapi 自动生成，请勿手工编辑）\n * 编辑设备请前往 Strapi 后台 → Equipment，然后重新运行: npm run build-pages\n */\nwindow.MinelinkEquipment = ' +
    JSON.stringify(legacy, null, 2) +
    ';\n';
  fs.writeFileSync(path.join(ROOT, 'assets', 'equipment-data.js'), eqData, 'utf8');

  var tables = {};
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var t = asArray(e.model_tables);
    if (t.length) tables[e.slug] = t;
  }
  var modelTables =
    '/**\n * 型号规格与性能参数表（由 scripts/build-pages.js 从 Strapi 自动生成，请勿手工编辑）\n * 编辑设备请前往 Strapi 后台 → Equipment，然后重新运行: npm run build-pages\n */\nwindow.MinelinkModelTables = ' +
    JSON.stringify(tables, null, 2) +
    ';\n';
  fs.writeFileSync(path.join(ROOT, 'assets', 'model-tables.js'), modelTables, 'utf8');
}

/* ---------- 主流程 ---------- */
async function main() {
  console.log('== 静态页面生成（中英文双版本）==');
  console.log('Strapi: ' + STRAPI_URL + ' | SITE_URL: ' + SITE_URL);

  var template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  var entries = await fetchEquipment();
  if (!entries.length) throw new Error('Strapi 中没有设备数据，请先运行 backend 的 npm run migrate');
  console.log('获取设备: ' + entries.length + ' 台');

  /* 确保英文目录存在 */
  fs.mkdirSync(EN_EQUIPMENT_DIR, { recursive: true });

  var okZh = 0, okEn = 0;
  var failures = [];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    try {
      var related = entries
        .filter(function (p) { return p.category === entry.category && p.slug !== entry.slug; })
        .slice(0, 3)
        .map(function (p) { return { id: p.slug, en: p.name_en || '', cn: p.name_cn || '', type: p.category, img: asArray(p.images)[0] || '' }; });

      /* 中文页 */
      var htmlZh = renderPage(entry, related, template, 'zh');
      fs.writeFileSync(path.join(EQUIPMENT_DIR, entry.slug + '.html'), htmlZh, 'utf8');
      okZh++;

      /* 英文页 */
      var htmlEn = renderPage(entry, related, template, 'en');
      fs.writeFileSync(path.join(EN_EQUIPMENT_DIR, entry.slug + '.html'), htmlEn, 'utf8');
      okEn++;
    } catch (err) {
      failures.push(entry.slug + ': ' + (err && err.message ? err.message : err));
    }
  }

  writeSitemap(entries);
  writeDataFiles(entries);

  console.log('中文页: ' + okZh + ' | 英文页: ' + okEn + ' | 失败: ' + failures.length);
  failures.forEach(function (f) { console.log('  失败 -> ' + f); });
  console.log('sitemap.xml 已生成（静态页 ' + STATIC_SITEMAP_ENTRIES.length + ' + 中文设备 ' + entries.length + ' + 英文设备 ' + entries.length + '）');
  console.log('assets/equipment-data.js 与 assets/model-tables.js 已由 Strapi 数据回写');

  /* 过期页面检测 */
  var slugs = new Set(entries.map(function (e) { return e.slug; }));

  /* 中文目录 */
  var staleZh = fs
    .readdirSync(EQUIPMENT_DIR)
    .filter(function (f) { return f.endsWith('.html') && !f.startsWith('_'); })
    .filter(function (f) { return !slugs.has(f.replace(/\.html$/, '')); });
  if (staleZh.length) {
    var listZh = staleZh.join(', ');
    if (PRUNE) {
      for (var k = 0; k < staleZh.length; k++) fs.unlinkSync(path.join(EQUIPMENT_DIR, staleZh[k]));
      console.log('已清理中文过期设备页 ' + staleZh.length + ' 个: ' + listZh);
    } else {
      console.warn('警告: 中文目录发现 ' + staleZh.length + ' 个过期页面（不影响使用）: ' + listZh);
    }
  }

  /* 英文目录 */
  if (fs.existsSync(EN_EQUIPMENT_DIR)) {
    var staleEn = fs
      .readdirSync(EN_EQUIPMENT_DIR)
      .filter(function (f) { return f.endsWith('.html') && !f.startsWith('_'); })
      .filter(function (f) { return !slugs.has(f.replace(/\.html$/, '')); });
    if (staleEn.length) {
      var listEn = staleEn.join(', ');
      if (PRUNE) {
        for (var m = 0; m < staleEn.length; m++) fs.unlinkSync(path.join(EN_EQUIPMENT_DIR, staleEn[m]));
        console.log('已清理英文过期设备页 ' + staleEn.length + ' 个: ' + listEn);
      } else {
        console.warn('警告: 英文目录发现 ' + staleEn.length + ' 个过期页面（不影响使用）: ' + listEn);
      }
    }
  }

  if (failures.length) {
    process.exitCode = 1;
  } else {
    console.log('✔ 全部生成成功（中文 ' + okZh + ' + 英文 ' + okEn + '）');
  }
}

main().catch(function (err) {
  console.error('生成失败: ' + (err && err.stack ? err.stack : err));
  process.exitCode = 1;
});
