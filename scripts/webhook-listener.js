'use strict';

/**
 * Webhook 监听服务
 * 接收 Strapi 内容变更 webhook，自动触发前端页面重建
 *
 * 运行：node scripts/webhook-listener.js
 * 端口：1340（避开 Strapi 1337）
 */

const http = require('http');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/* 复用 build-pages.js 的渲染函数（require 不会触发全量构建） */
const builder = require('./build-pages.js');

const PORT = 1340;
const ROOT = path.resolve(__dirname, '..');
const BUILD_SCRIPT = path.join(ROOT, 'scripts', 'build-pages.js');
const LOG_FILE = path.join(ROOT, 'webhook-listener.log');
const STRAPI_INTERNAL = process.env.STRAPI_INTERNAL_URL || 'http://127.0.0.1:1337';
const EQUIPMENT_TEMPLATE = path.join(ROOT, 'equipment', '_template.html');

/* 防抖：同一事件在 3 秒内只触发一次重建 */
let buildPending = false;
let buildTimer = null;

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function triggerBuild() {
  if (buildPending) {
    log('BUILD 跳过：已有构建任务排队中');
    return;
  }
  buildPending = true;

  /* 防抖 3 秒：连续保存只触发一次构建 */
  if (buildTimer) clearTimeout(buildTimer);
  buildTimer = setTimeout(() => {
    log('开始重建前端页面...');
    try {
      const output = execSync(`node ${BUILD_SCRIPT}`, {
        cwd: ROOT,
        timeout: 120000,
        encoding: 'utf8',
        env: { ...process.env, NODE_ENV: 'development' }
      });
      const lines = output.trim().split('\n');
      const lastLines = lines.slice(-5).join(' | ');
      log(`重建完成: ${lastLines}`);
    } catch (err) {
      log(`重建失败: ${err.message}`);
    }
    buildPending = false;
    buildTimer = null;
  }, 3000);
}

/* ================= 草稿预览（Strapi 后台「打开预览」按钮） ================= */

function sendHtml(res, html, status) {
  res.writeHead(status || 200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.end(html);
}

function previewErrorPage(title, msg) {
  return (
    '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex">' +
    '<title>' + title + '</title>' +
    '<style>body{font-family:Arial,"Microsoft YaHei",sans-serif;max-width:640px;margin:90px auto;padding:0 24px;color:#333;line-height:1.7}' +
    'h1{font-size:22px;color:#b8860b}.box{border:1px solid #e0d9c8;background:#fdf8ec;padding:16px 20px;border-radius:8px}' +
    'a{color:#1a5fb4}</style></head><body><h1>' + title + '</h1>' +
    '<div class="box"><p>' + msg + '</p></div>' +
    '<p><a href="javascript:window.close()">关闭此窗口</a></p></body></html>'
  );
}

function draftBanner(lang) {
  var text = lang === 'en'
    ? 'DRAFT PREVIEW — content saved in Strapi but NOT published'
    : '草稿预览 — 当前为后台已保存但【未发布】的内容，线上访客看不到';
  return (
    '<div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#b8860b;color:#fff;' +
    'text-align:center;padding:7px 10px;font:14px/1.6 Arial,\'Microsoft YaHei\',sans-serif;' +
    'box-shadow:0 2px 8px rgba(0,0,0,.35)">' + text + '</div>'
  );
}

/* GET /preview/<slug>.html            → 中文草稿页（与 /equipment/<slug>.html 同级深度）
 * GET /preview/en/<slug>.html         → 英文草稿页（与 /en/equipment/<slug>.html 同级深度）
 * query: doc=<documentId>&token=<admin JWT from cookie jwtToken>
 * 无凭证的请求（如页面内"相关设备"链接）→ 302 跳转已发布静态页 */
async function handlePreview(req, res, urlObj) {
  var m = urlObj.pathname.match(/^\/preview\/(?:(en|zh)\/)?([^\/]+)\.html$/);
  if (!m) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  var lang = m[1] === 'en' ? 'en' : 'zh';
  var slugParam = decodeURIComponent(m[2]);
  var doc = urlObj.searchParams.get('doc') || '';
  var token = urlObj.searchParams.get('token') || '';

  if (!doc || !token) {
    var target = lang === 'en' ? '/en/equipment/' + slugParam + '.html' : '/equipment/' + slugParam + '.html';
    // 有 doc 但没有 token：来自后台原生预览 iframe（token 在浏览器 localStorage 里，
    // 服务端拿不到）。返回引导页，由页面自己取到 admin JWT 后带上 token 重载；
    // 取不到（未登录/非后台环境）则跳回已发布静态页。
    if (doc) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Frame-Options': 'SAMEORIGIN'
      });
      res.end(
        '<!doctype html><meta charset="utf-8"><title>...</title><body>' +
        '<script>' +
        'try{var raw=localStorage.getItem("jwtToken");var t=raw?JSON.parse(raw):"";' +
        'if(t){location.replace(location.pathname+"?doc="+encodeURIComponent(' + JSON.stringify(doc) + ')+"&token="+encodeURIComponent(t));}' +
        'else{location.replace(' + JSON.stringify(target) + ');}}catch(e){location.replace(' + JSON.stringify(target) + ');}' +
        '</script>预览加载中...</body>'
      );
      return;
    }
    res.writeHead(302, { 'Location': target, 'Cache-Control': 'no-store' });
    res.end();
    return;
  }

  /* 1. 用浏览器传来的 admin JWT 拉取草稿（content-manager 与后台编辑页同一接口） */
  var draftRes;
  try {
    draftRes = await fetch(
      STRAPI_INTERNAL +
        '/content-manager/collection-types/api::equipment.equipment/' +
        encodeURIComponent(doc) + '?status=draft',
      { headers: { 'Authorization': 'Bearer ' + token } }
    );
  } catch (e) {
    log('预览: 连接 Strapi 失败: ' + e.message);
    sendHtml(res, previewErrorPage('预览服务暂时不可用', '无法连接 Strapi 内容接口，请稍后重试。<br>错误：' + builder.escapeHtml(e.message)), 502);
    return;
  }

  if (draftRes.status === 401 || draftRes.status === 403) {
    sendHtml(res, previewErrorPage(
      '登录已过期',
      'Strapi 后台登录凭证已失效（约 30 分钟有效）。<br>请回到 Strapi 后台页面刷新 / 重新登录，然后再次点击「打开预览」。'
    ), 403);
    return;
  }
  if (!draftRes.ok) {
    sendHtml(res, previewErrorPage('草稿获取失败', 'Strapi 返回 HTTP ' + draftRes.status + '，请确认该设备存在且已保存。'), 502);
    return;
  }

  var draftJson = await draftRes.json();
  var entry = draftJson.data || draftJson;

  /* 媒体字段规范化（与 build-pages 相同：/uploads/xxx → assets/images/equipment/xxx） */
  entry.images = builder.mediaToPaths(entry.images);
  entry.og_image = builder.mediaToPath(entry.og_image);
  /* 正文 Dynamic Zone 内的媒体同样规范化 */
  entry.content = builder.normalizeContent(entry.content);

  if (!entry.slug) {
    sendHtml(res, previewErrorPage('草稿缺少 slug', '请先在后台填写 slug（URL 别名）并保存，再打开预览。'), 422);
    return;
  }

  /* 2. 已发布列表用于"相关设备"区块（公开接口，无需鉴权；失败不阻塞预览） */
  var published = [];
  try {
    published = await builder.fetchEquipment();
  } catch (e) {
    log('预览: 获取已发布列表失败（相关设备区块将为空）: ' + e.message);
  }
  var related = published
    .filter(function (p) { return p.category === entry.category && p.slug !== entry.slug; })
    .slice(0, 3)
    .map(function (p) {
      return { id: p.slug, en: p.name_en || '', cn: p.name_cn || '', type: p.category, img: builder.asArray(p.images)[0] || '' };
    });

  /* 3. 用与静态页完全相同的模板/函数渲染（不写盘，仅返回 HTML） */
  var template = fs.readFileSync(EQUIPMENT_TEMPLATE, 'utf8');
  var html = builder.renderPage(entry, related, template, lang);

  /* 4. 注入草稿标识条 + noindex + 给 body 留出标识条高度 */
  html = html.replace(/<\/head>/i, '<meta name="robots" content="noindex,nofollow"><style>body{padding-top:38px !important}</style></head>');
  html = html.replace(/<body[^>]*>/i, function (bm) { return bm + draftBanner(lang); });

  /* 5. product-render.js 按 URL 深度计算资源相对路径，预览页需确保加载最新版
        （静态资源可能被浏览器缓存），加版本号强制刷新 */
  html = html.replace(/assets\/product-render\.js/g, 'assets/product-render.js?v=preview' + Date.now());

  sendHtml(res, html, 200);
  log('草稿预览: ' + lang + ' / ' + entry.slug + ' (doc=' + doc + ')');
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url.indexOf('/preview/') === 0) {
    handlePreview(req, res, new URL(req.url, 'http://localhost')).catch(function (err) {
      log('预览渲染失败: ' + (err && err.stack ? err.stack : err));
      try {
        sendHtml(res, previewErrorPage('预览渲染失败', builder.escapeHtml(err && err.message ? err.message : String(err))), 500);
      } catch (e) { /* 响应可能已发出 */ }
    });
  } else if (req.method === 'POST' && req.url === '/rebuild') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      log(`收到 webhook: ${req.headers['content-type'] || 'unknown'}`);

      let event = 'unknown';
      let model = 'unknown';
      try {
        const data = JSON.parse(body);
        event = data.event || 'unknown';
        model = data.model || 'unknown';
      } catch (e) {
        /* 非 JSON body，忽略 */
      }
      log(`事件: ${event} | 模型: ${model}`);

      /* 只对设备(inquiry 也触发，因为设备关联可能变化) 触发重建 */
      if (model === 'api::equipment.equipment' || model === 'equipment' || event.includes('entry') || event.includes('publish')) {
        triggerBuild();
      } else {
        /* 其他内容变更也重建，确保数据一致 */
        triggerBuild();
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, message: 'build triggered' }));
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('webhook-listener running');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  log(`Webhook 监听服务已启动 → http://127.0.0.1:${PORT}/rebuild`);
  log(`健康检查: http://127.0.0.1:${PORT}/health`);
  log(`构建脚本: ${BUILD_SCRIPT}`);
});

process.on('SIGTERM', () => {
  log('收到 SIGTERM，关闭服务...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  log('收到 SIGINT，关闭服务...');
  server.close(() => process.exit(0));
});
