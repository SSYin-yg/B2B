const { createStrapi } = require('@strapi/core');
const path = require('path');

const BACKEND_ROOT = path.resolve('/var/www/B2B/backend');

function loadEnvFile(appDir) {
  const fs = require('fs');
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

async function main() {
  loadEnvFile(BACKEND_ROOT);
  const strapi = await createStrapi({ appDir: BACKEND_ROOT }).load();

  const targetKey = process.argv[2] || 'about_side';
  const newFileId = parseInt(process.argv[3], 10);
  if (!newFileId || isNaN(newFileId)) {
    console.error('Usage: node update_about_side_image.js <key> <fileId>');
    await strapi.destroy();
    process.exit(1);
  }

  try {
    const docs = strapi.documents('api::website-image.website-image');
    const entries = await docs.findMany({ filters: { key: targetKey } });
    if (!entries || !entries.length) {
      console.error('未找到 Website Image: ' + targetKey);
      await strapi.destroy();
      process.exit(1);
    }

    const entry = entries[0];
    const oldImage = entry.image;
    console.log('当前条目:', entry.documentId, entry.key, '旧图片=', oldImage ? (oldImage.id || oldImage) : '无');

    await docs.update({
      documentId: entry.documentId,
      data: { image: newFileId }
    });

    const updated = await docs.findOne({ documentId: entry.documentId, populate: ['image'] });
    console.log('更新后图片:', updated.image ? (updated.image.id || updated.image) : '无');
    console.log('✓ 更新成功');
  } catch (e) {
    console.error('更新失败:', e && e.stack ? e.stack : e);
  } finally {
    await strapi.destroy();
  }
}

main();
