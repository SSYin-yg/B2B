/**
 * 从万仕衡通 docx 提取产品介绍，直接通过 Strapi 内核更新 Equipment（绕过 API 鉴权）
 *
 * 用法：cd backend && node scripts/update-equipment-from-docx-direct.js
 *
 * 映射关系：
 *   履带式颚式破碎机.docx        → crawler-jaw
 *   履带式圆锥移动破碎站.docx    → crawler-cone
 *   履带式反击移动破碎站.docx    → crawler-impact-crusher
 *   履带式冲击移动破碎站.docx    → crawler-impact
 */
const mammoth = require('mammoth');
const path = require('path');
const { bootstrap } = require('@strapi/strapi/dist/utils');

const DOCX_DIR = path.resolve('C:/Users/Administrator/Documents/新建文件夹 (2)/独立站/设备技术参数/万仕衡通');

const DOCX_MAP = [
  { file: '履带式颚式破碎机.docx', slug: 'crawler-jaw' },
  { file: '履带式圆锥移动破碎站.docx', slug: 'crawler-cone' },
  { file: '履带式反击移动破碎站.docx', slug: 'crawler-impact-crusher' },
  { file: '履带式冲击移动破碎站.docx', slug: 'crawler-impact' },
];

function extractProductIntro(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const sectionTitles = ['产品介绍', '工作原理', '功能特点', '适用物料', '应用领域'];
  let start = -1, end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '产品介绍') { start = i + 1; continue; }
    if (start > 0 && sectionTitles.includes(lines[i])) { end = i; break; }
  }
  if (start < 0) return null;
  const marketing = ['将根据您的不同产能需求，为您量身定制。', '如果您在小型项目中使用履带式破碎站，我们提供紧凑型履带式移动破碎站。', '具体配置主要取决于破碎机。', '无论您的规模是小规模还是大规模生产，我们都能满足您的需求。'];
  return lines.slice(start, end).filter(l => !marketing.includes(l)).join('\n');
}

function extractFeatures(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  let start = -1, end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '功能特点' || lines[i] === '应用领域') {
      if (start < 0) start = i + 1; else { end = i; break; }
    }
  }
  if (start < 0) return null;
  return lines.slice(start, end).filter(l => l.length > 0 && l !== '适用物料').slice(0, 6);
}

async function main() {
  // 启动 Strapi
  console.log('🚀 启动 Strapi...');
  const app = await bootstrap({ distDir: path.resolve(__dirname, '..') });
  await app.load();

  const items = await strapi.db.query('api::equipment.equipment').findMany();
  const slugMap = {};
  items.forEach(it => { slugMap[it.slug] = it; });
  console.log(`📦 共 ${items.length} 台设备`);

  let success = 0;
  for (const { file, slug } of DOCX_MAP) {
    const fp = path.join(DOCX_DIR, file);
    console.log(`\n🔧 [${slug}] ← ${file}`);

    let raw;
    try { raw = await mammoth.extractRawText({ path: fp }); raw = raw.value; }
    catch (e) { console.error(`  ❌ 读取失败: ${e.message}`); continue; }

    const intro = extractProductIntro(raw);
    const features = extractFeatures(raw);

    if (!intro) { console.log('  ⚠️ 未找到产品介绍'); continue; }

    const eq = slugMap[slug];
    if (!eq) { console.log(`  ⚠️ 无此 slug`); continue; }

    const data = { desc_zh: intro };
    if (features && features.length) data.features_zh = features;

    console.log(`  📝 介绍: ${intro.slice(0, 60)}...`);
    if (features) console.log(`  🔑 特点: ${features.length} 条`);

    await strapi.db.query('api::equipment.equipment').update({
      where: { id: eq.id },
      data,
    });
    console.log(`  ✅ 已更新`);
    success++;
  }

  console.log(`\n✅ 完成！成功更新 ${success} 台设备`);
  await strapi.destroy();
}

main().catch(err => { console.error(err); process.exit(1); });
