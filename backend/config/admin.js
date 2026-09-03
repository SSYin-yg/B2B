/**
 * Strapi Admin 配置
 *
 * - auth / apiToken / transfer / secrets：安全相关密钥
 * - preview：启用内容预览按钮，让编辑者在发布前预览前端页面
 *   - Equipment 内容类型生成中文和英文两种预览 URL
 *   - 本地开发默认使用 http://localhost:3000（由 scripts/serve.js 提供）
 *   - 生产环境使用 CLIENT_URL
 */
module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
    docLinks: env.bool('FLAG_DOC_LINKS', false),
  },
  telemetry: {
    disabled: true,
  },

  // ========== 预览功能 ==========
  preview: {
    enabled: true,
    config: {
      // 允许访问预览的前端域名（本地开发 + 生产）
      allowedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        env('CLIENT_URL', 'https://ssyin-yg.github.io/B2B'),
      ],

      /**
       * 预览 URL 生成器
       *
       * @param {string} uid 内容类型 UID（如 'api::equipment.equipment'）
       * @param {object} params
       * @param {string} params.documentId 文档 ID
       * @param {string} params.locale 语言（如果启用了 i18n）
       * @param {string} params.status 状态（'draft' | 'published'）
       * @returns {string|null} 预览 URL，无法生成时返回 null
       */
      async handler(uid, { documentId, locale, status }) {
        // 前端基础地址，本地开发用 localhost:3000
        const clientUrl = env('CLIENT_URL', 'http://localhost:3000').replace(/\/$/, '');

        // 只处理 Equipment 内容类型
        if (uid !== 'api::equipment.equipment') {
          return null;
        }

        // 从数据库读取文档获取 slug
        const document = await strapi.documents(uid).findOne({
          documentId,
          populate: null,
          fields: ['slug'],
        });

        if (!document?.slug) {
          return null;
        }

        const { slug } = document;

        // 根据 locale 或 status 返回不同语言的预览 URL
        // 如果 status 是 draft，带上预览参数（未来支持草稿模式）
        const lang = locale || 'zh';
        const langPrefix = lang === 'en' ? '/en' : '';

        let url = `${clientUrl}${langPrefix}/equipment/${slug}.html`;

        // 草稿状态添加预览标记（前端暂未实现草稿模式，仅做标识）
        if (status === 'draft') {
          url += '?preview=draft';
        }

        return url;
      },
    },
  },
});
