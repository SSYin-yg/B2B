'use strict';

/**
 * 网站图片（Website Image）初始化 / 修复脚本（幂等，可重复执行）
 *
 * 作用：
 *   1. 把站点上现有的公共图片（首页三张 Banner）登记进 Strapi 媒体库
 *      —— 采用「复制为新文件名 + 登记」的方式，原始文件一律保留，绝不删除或覆盖。
 *   2. 依据 scripts/website-image-slots.js 的槽位定义，在 Strapi 中写入 Website Image 条目。
 *      已存在（按 key 判断）的条目只做补全，不覆盖运营人员后续更换的图片。
 *
 * 用法：cd backend && node scripts/migrate-website-images.js
 *
 * 安全约定：
 *   - 不删除任何现有文件
 *   - 不修改任何 Equipment 数据
 *   - 已存在且已配置图片的槽位保持原样（运营换过的图不会被覆盖）
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createStrapi } = require('@strapi/core');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const SITE_ROOT = path.resolve(BACKEND_ROOT, '..');
/* 站点公共图片目录 = Strapi 上传目录（backend/public/uploads 已 symlink 到这里） */
const UPLOAD_DIR = path.join(SITE_ROOT, 'assets', 'images', 'equipment');
const WEBSITE_IMAGE_UID = 'api::website-image.website-image';

const { SLOTS } = require(path.join(SITE_ROOT, 'scripts', 'website-image-slots.js'));

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

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
};

function rand(len) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
}

/** Strapi 风格的目标文件名：<时间戳>_<6位>_<10位>.<ext> */
function strapiFileName(ext) {
  return Math.floor(Date.now() / 1000) + '_' + rand(6) + '_' + rand(10) + ext;
}

/**
 * 把站点上已存在的图片登记进 Strapi 媒体库。
 * 采用复制方式（原始文件保留），复制后的文件名与 Strapi 现有命名风格一致。
 * @returns {number|null} 媒体文件 id
 */
async function registerExistingFile(strapi, fileName) {
  const src = path.join(UPLOAD_DIR, fileName);
  if (!fs.existsSync(src)) {
    console.warn(`  跳过（源文件不存在）: ${fileName}`);
    return null;
  }

  const ext = path.extname(fileName).toLowerCase();
  const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
  const stat = fs.statSync(src);

  /* 已登记过则直接复用（按原始文件名的 hash 记录，见下方 file_hash 字段） */
  const fileHash = crypto.createHash('sha1').update(fileName).digest('hex').slice(0, 16);
  const existing = await strapi.db
    .query('plugin::upload.file')
    .findMany({ where: { hash: 'wb-' + fileHash }, limit: 1 });
  if (existing && existing.length) {
    console.log(`  媒体库已存在，复用: ${fileName} (id=${existing[0].id})`);
    return existing[0].id;
  }

  const targetName = strapiFileName(ext || '.jpg');
  const target = path.join(UPLOAD_DIR, targetName);
  fs.copyFileSync(src, target);

  const created = await strapi.db.query('plugin::upload.file').create({
    data: {
      name: targetName,
      alternativeText: null,
      caption: null,
      width: null,
      height: null,
      formats: null,
      /* 以 wb- 前缀标记「由本脚本登记的站点既有图片」，避免与正常上传冲突 */
      hash: 'wb-' + fileHash,
      ext: (ext || '.jpg').replace(/^\./, ''),
      mime: mime,
      size: Number((stat.size / 1024).toFixed(2)),
      url: '/uploads/' + targetName,
      provider: 'local',
      folderPath: '/',
      publishedAt: new Date(),
    },
  });

  console.log(`  已登记到媒体库: ${fileName} -> ${targetName} (id=${created.id})`);
  return created.id;
}

async function main() {
  console.log('== 网站图片（Website Image）初始化 ==');
  loadEnvFile(BACKEND_ROOT);
  const strapi = await createStrapi({ appDir: BACKEND_ROOT }).load();

  try {
    /* 0. 前置检查：内容类型是否已存在（需要先重启 Strapi 加载新 schema） */
    if (!strapi.contentTypes[WEBSITE_IMAGE_UID]) {
      console.error('!! 未找到内容类型 ' + WEBSITE_IMAGE_UID);
      console.error('   请确认已创建 backend/src/api/website-image/ 并重启 Strapi。');
      process.exit(1);
    }

    /* 1. 登记现有公共图片 */
    console.log('\n[1/2] 登记站点现有公共图片到媒体库');
    const fileIds = {};
    for (const slot of SLOTS) {
      if (!slot.defaultFile) continue;
      console.log(` · ${slot.key} <- ${slot.defaultFile}`);
      const id = await registerExistingFile(strapi, slot.defaultFile);
      if (id) fileIds[slot.key] = id;
    }

    /* 2. 写入 Website Image 条目 */
    console.log('\n[2/2] 写入 Website Image 条目');
    const docs = strapi.documents(WEBSITE_IMAGE_UID);
    const existingList = await docs.findMany({ limit: 500 });
    const existingByKey = {};
    for (const e of existingList || []) {
      if (e && e.key) existingByKey[e.key] = e;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const slot of SLOTS) {
      const cur = existingByKey[slot.key];
      const baseData = {
        name: slot.name,
        page: slot.page,
        position: slot.position,
        category: slot.category || '其他',
        alt: slot.alt || '',
        caption: slot.caption || '',
        description: slot.description || '',
        enabled: slot.enabled !== false,
        sort_order: typeof slot.sort_order === 'number' ? slot.sort_order : 0,
      };

      if (!cur) {
        const data = { ...baseData, key: slot.key };
        /* 仅当槽位定义了默认文件、且该图片已成功登记时才写入 image */
        if (fileIds[slot.key]) data.image = fileIds[slot.key];
        await docs.create({ data });
        created++;
        console.log(`  + 新建: ${slot.key}（${slot.name}）`);
        continue;
      }

      /* 已存在：补全文本字段（不再覆盖运营人员已更换的 image），但保持 enabled / 文本字段与注册表一致 */
      const needTextUpdate =
        cur.name !== baseData.name ||
        cur.page !== baseData.page ||
        cur.position !== baseData.position ||
        cur.category !== baseData.category ||
        (cur.description || '') !== (baseData.description || '') ||
        (cur.sort_order || 0) !== baseData.sort_order ||
        Boolean(cur.enabled) !== baseData.enabled ||
        (cur.alt || '') !== (baseData.alt || '') ||
        (cur.caption || '') !== (baseData.caption || '');

      const needsImage = !cur.image && fileIds[slot.key];
      if (needTextUpdate || needsImage) {
        const data = {};
        if (needTextUpdate) Object.assign(data, baseData);
        if (needsImage) data.image = fileIds[slot.key];
        await docs.update({ documentId: cur.documentId, data });
        updated++;
        console.log(`  ~ 更新: ${slot.key}${needsImage ? '（补入默认图片）' : ''}`);
      } else {
        skipped++;
      }
    }

    console.log(`\n✔ 完成：新建 ${created} / 更新 ${updated} / 无变化 ${skipped}（共 ${SLOTS.length} 个槽位）`);
  } finally {
    try {
      await strapi.destroy();
    } catch (e) {
      console.warn('关闭 Strapi 连接时出错（数据已写入，不影响结果）: ' + (e && e.message ? e.message : e));
    }
  }
}

process.on('unhandledRejection', (err) => {
  const msg = String((err && err.message) || err);
  if (/aborted/.test(msg)) {
    process.exit(process.exitCode || 0);
  }
  throw err;
});

main().catch((err) => {
  console.error('初始化脚本异常: ' + (err && err.stack ? err.stack : err));
  process.exit(1);
});
