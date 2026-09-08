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
        env('CLIENT_URL', ''),
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
        // 只处理 Equipment 内容类型
        if (uid !== 'api::equipment.equipment') {
          return null;
        }

        // 动态获取前台基础地址：优先从当前请求上下文取 Host（适配任意 IP/端口），
        // 兜底用 CLIENT_URL。这样换 IP/端口无需改任何配置。
        let clientUrl = '';
        try {
          const ctx = strapi.requestContext && strapi.requestContext.get
            ? strapi.requestContext.get()
            : null;
          const host = ctx && ctx.request && ctx.request.host; // 含端口，如 1.2.3.4:8080
          const proto = (ctx && ctx.request && ctx.request.protocol) || 'http';
          if (host) {
            clientUrl = proto + '://' + host;
          }
        } catch (e) {
          // 上下文不可用时走兜底
        }
        if (!clientUrl) {
          clientUrl = env('CLIENT_URL', '').replace(/\/$/, '');
        }

        // 从数据库读取文档获取 slug
        const document = await strapi.documents(uid).findOne({
          documentId,
          populate: null,
          fields: ['slug'],
        });
        if (!document || !document.slug) {
          return null;
        }
        const slug = document.slug;

        // 语言前缀（英文页面在 /en/equipment/ 下）
        const langPrefix = locale === 'en' ? '/en' : '';

        // 已发布：直接返回静态页地址
        if (status !== 'draft') {
          return clientUrl + langPrefix + '/equipment/' + slug + '.html';
        }

        // 草稿：走 webhook-listener 的 /preview/ 渲染真实草稿内容。
        // 不在 URL 里带 token（服务端拿不到浏览器凭证），先返回无 token 地址，
        // 由预览页自身从 localStorage 取 admin JWT 后重载（见 webhook-listener.js handlePreview）。
        if (locale === 'en') {
          return clientUrl + '/preview/en/' + slug + '.html?doc=' + encodeURIComponent(documentId);
        }
        return clientUrl + '/preview/' + slug + '.html?doc=' + encodeURIComponent(documentId);
      },    },
  },
});
