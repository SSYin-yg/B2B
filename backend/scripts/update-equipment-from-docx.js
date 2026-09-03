/**
 * 从万仕衡通 docx 文档提取产品介绍，批量更新 Strapi Equipment 的 desc_zh 字段
 *
 * 用法：node scripts/update-equipment-from-docx.js
 *
 * 映射关系：
 *   履带式颚式破碎机.docx        → crawler-jaw
 *   履带式圆锥移动破碎站.docx    → crawler-cone
 *   履带式反击移动破碎站.docx    → crawler-impact-crusher
 *   履带式冲击移动破碎站.docx    → crawler-impact
 *   履带式移动筛分站.docx        → 跳过（Strapi 中无对应 slug）
 */
const mammoth = require('mammoth');
const path = require('path');

const DOCX_DIR = path.resolve('C:/Users/Administrator/Documents/新建文件夹 (2)/独立站/设备技术参数/万仕衡通');
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

// docx → slug 映射
const DOCX_MAP = [
  { file: '履带式颚式破碎机.docx', slug: 'crawler-jaw' },
  { file: '履带式圆锥移动破碎站.docx', slug: 'crawler-cone' },
  { file: '履带式反击移动破碎站.docx', slug: 'crawler-impact-crusher' },
  { file: '履带式冲击移动破碎站.docx', slug: 'crawler-impact' },
  // 履带式移动筛分站.docx → 跳过（无 crawler-screen slug）
];

/** 将 docx 原始文本解析为产品介绍（去掉标题、功能特点、适用物料等段落，只保留产品介绍） */
function extractProductIntro(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // 找到 "产品介绍" 标题和下一个标题之间的内容
  const sectionTitles = ['产品介绍', '工作原理', '功能特点', '适用物料', '应用领域'];
  let introStart = -1;
  let introEnd = lines.length;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '产品介绍') { introStart = i + 1; continue; }
    if (introStart > 0 && sectionTitles.includes(lines[i])) { introEnd = i; break; }
  }

  if (introStart < 0) return null;

  // 过滤掉模板化的营销句子
  const marketing = [
    '将根据您的不同产能需求，为您量身定制。',
    '如果您在小型项目中使用履带式破碎站，我们提供紧凑型履带式移动破碎站。',
    '具体配置主要取决于破碎机。',
    '无论您的规模是小规模还是大规模生产，我们都能满足您的需求。',
  ];

  return lines
    .slice(introStart, introEnd)
    .filter(l => !marketing.includes(l))
    .join('\n');
}

/** 提取功能特点列表（用于 features_zh） */
function extractFeatures(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const sectionTitles = ['产品介绍', '工作原理', '功能特点', '适用物料', '应用领域'];
  let featStart = -1;
  let featEnd = lines.length;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '功能特点' || lines[i] === '应用领域') {
      if (featStart < 0) featStart = i + 1;
      else { featEnd = i; break; }
    }
  }

  if (featStart < 0) return null;

  return lines
    .slice(featStart, featEnd)
    .filter(l => l.length > 0 && !sectionTitles.includes(l))
    .filter(l => !l.startsWith('适用物料'))
    .slice(0, 6); // 最多保留 6 条
}

async function readDocx(filepath) {
  const result = await mammoth.extractRawText({ path: filepath });
  return result.value;
}

async function fetchStrapiEquipments() {
  const res = await fetch(`${STRAPI_URL}/api/equipments?pagination[pageSize]=100`);
  const json = await res.json();
  const map = {};
  for (const item of json.data) {
    map[item.slug] = { id: item.id, documentId: item.documentId, ...item };
  }
  return map;
}

async function updateEquipment(documentId, fields) {
  const res = await fetch(`${STRAPI_URL}/api/equipments/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: fields }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(`  ❌ 更新失败: ${JSON.stringify(json).slice(0, 200)}`);
    return false;
  }
  return true;
}

async function main() {
  console.log('📚 正在从 docx 提取设备介绍...');

  const strapiMap = await fetchStrapiEquipments();
  console.log(`📦 Strapi 中共有 ${Object.keys(strapiMap).length} 台设备`);

  let success = 0, skipped = 0, failed = 0;

  for (const { file, slug } of DOCX_MAP) {
    const fp = path.join(DOCX_DIR, file);
    console.log(`\n🔧 [${slug}] ← ${file}`);

    // 读取 docx
    let raw;
    try {
      raw = await readDocx(fp);
    } catch (err) {
      console.error(`  ❌ 读取 docx 失败: ${err.message}`);
      failed++;
      continue;
    }

    // 解析
    const intro = extractProductIntro(raw);
    const features = extractFeatures(raw);

    if (!intro) {
      console.log('  ⚠️ 未找到产品介绍段落，跳过');
      skipped++;
      continue;
    }

    // 查找 Strapi 设备
    const eq = strapiMap[slug];
    if (!eq) {
      console.log(`  ⚠️ Strapi 中未找到 slug="${slug}"，跳过`);
      skipped++;
      continue;
    }

    // 构造更新数据
    const fields = { desc_zh: intro };
    if (features && features.length > 0) {
      // features_zh 在 Strapi 中是 JSON 类型（数组）
      fields.features_zh = features;
    }

    console.log(`  📝 产品介绍: ${intro.slice(0, 80)}...`);
    if (features) console.log(`  🔑 功能特点: ${features.length} 条`);

    const ok = await updateEquipment(eq.documentId, fields);
    if (ok) {
      console.log(`  ✅ 更新成功`);
      success++;
    } else {
      failed++;
    }
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`完成！成功: ${success}  跳过: ${skipped}  失败: ${failed}`);
}

main().catch(err => { console.error(err); process.exit(1); });
