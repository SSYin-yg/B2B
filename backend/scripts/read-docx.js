/**
 * 读取 docx 文件内容（用于从设备技术参数文档中提取介绍）
 * 用法：node scripts/read-docx.js
 */
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const DOCX_DIR = path.resolve('C:/Users/Administrator/Documents/新建文件夹 (2)/独立站/设备技术参数/万仕衡通');

const files = [
  '履带式颚式破碎机.docx',
  '履带式圆锥移动破碎站.docx',
  '履带式冲击移动破碎站.docx',
  '履带式反击移动破碎站.docx',
  '履带式移动筛分站.docx',
];

async function main() {
  for (const f of files) {
    const fp = path.join(DOCX_DIR, f);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 ${f}`);
    console.log('='.repeat(60));
    try {
      const result = await mammoth.extractRawText({ path: fp });
      // 清理多余空行
      const text = result.value
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .join('\n');
      console.log(text.slice(0, 3000));
      if (text.length > 3000) console.log(`... [共 ${text.length} 字符，截断显示]`);
    } catch (err) {
      console.error(`❌ 读取失败: ${err.message}`);
    }
  }
}

main();
