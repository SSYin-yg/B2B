/**
 * 使用 better-sqlite3 直接更新 Strapi SQLite 数据库
 * 从 docx 提取设备介绍写入 equipments 表
 *
 * 用法：cd backend && node scripts/update-equipment-sqlite.js
 */
const mammoth = require('mammoth');
const path = require('path');
const Database = require('better-sqlite3');

const DOCX_DIR = path.resolve('C:/Users/Administrator/Documents/新建文件夹 (2)/独立站/设备技术参数/万仕衡通');
const DB_PATH = path.resolve(__dirname, '../.tmp/data.db');

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
  let intro = lines.slice(start, end).join('\n');
  // 移除万仕衡通通用营销模板（可能跨行也可能同行）
  const marketingPatterns = [
    /将根据您的不同产能需求[^。]*。/g,
    /如果您在小型项目中[^。]*。/g,
    /具体配置主要取决于破碎机[^。]*。/g,
    /无论您的规模是小规模还是大规模生产[^。]*。/g,
  ];
  for (const p of marketingPatterns) intro = intro.replace(p, '');
  // 清理多余空行
  return intro.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0).join('\n');
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
  console.log('🗄️ 打开数据库:', DB_PATH);
  const db = new Database(DB_PATH);

  // 先看表结构
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%equipment%'").all();
  console.log('📋 equipment 相关表:', tables.map(t => t.name).join(', '));

  // 找到 equipments 表
  const eqTable = tables.find(t => t.name === 'equipments');
  if (!eqTable) {
    // 可能叫 strapi_components_equipments 之类的
    console.log('正在搜索...');
    const all = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('所有表:', all.map(t => t.name).join(', '));
    db.close();
    return;
  }

  // 看列
  const cols = db.prepare("PRAGMA table_info(equipments)").all();
  console.log('📋 equipments 表列:', cols.map(c => c.name).join(', '));

  // 先查一条看看现有数据
  const sample = db.prepare("SELECT slug, desc_zh, features_zh FROM equipments WHERE slug = ?").get('crawler-jaw');
  console.log('\n📖 crawler-jaw 现有数据:');
  console.log('  desc_zh:', sample?.desc_zh?.slice(0, 60) || '(空)');

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

    const current = db.prepare("SELECT id FROM equipments WHERE slug = ?").get(slug);
    if (!current) { console.log(`  ⚠️ 无此 slug`); continue; }

    const featuresJson = features && features.length ? JSON.stringify(features) : null;

    const tx = db.transaction(() => {
      db.prepare("UPDATE equipments SET desc_zh = ?, features_zh = ? WHERE slug = ?").run(intro, featuresJson, slug);
    });
    tx();

    const updated = db.prepare("SELECT desc_zh, features_zh FROM equipments WHERE slug = ?").get(slug);
    console.log(`  ✅ 已更新`);
    console.log(`  📝 desc_zh: ${updated.desc_zh.slice(0, 60)}...`);
    if (updated.features_zh) console.log(`  🔑 features_zh: ${JSON.parse(updated.features_zh).length} 条`);
    success++;
  }

  console.log(`\n✅ 完成！成功更新 ${success} 台设备`);
  db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
